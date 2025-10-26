"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { EVENT_TYPE_LABELS, EVENT_COLORS } from "@/lib/calendar-utils";
import { Loader2 } from "lucide-react";
import type { AgendaEventType, AgendaEventStatus } from "@prisma/client";

const eventFormSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(100, "Maximum 100 caractères"),
  description: z.string().optional(),
  startDate: z.string().min(1, "La date de début est requise"),
  startTime: z.string().min(1, "L'heure de début est requise"),
  endDate: z.string().min(1, "La date de fin est requise"),
  endTime: z.string().min(1, "L'heure de fin est requise"),
  allDay: z.boolean().default(false),
  type: z.enum([
    "GARDE",
    "FMPA",
    "FORMATION",
    "PROTOCOLE",
    "ENTRETIEN",
    "PERSONNEL",
    "REUNION",
    "AUTRE",
  ]),
  status: z
    .enum(["SCHEDULED", "CONFIRMED", "CANCELLED", "COMPLETED"])
    .default("SCHEDULED"),
  location: z.string().optional(),
  color: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  initialData?: {
    id?: string;
    title: string;
    description?: string | null;
    startDate: Date;
    endDate: Date;
    allDay?: boolean;
    type: AgendaEventType;
    status?: AgendaEventStatus;
    location?: string | null;
    color?: string | null;
  };
  onSuccess?: () => void;
}

export function EventForm({ initialData, onSuccess }: EventFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData?.id;

  // Préparer les valeurs par défaut
  const defaultValues: Partial<EventFormValues> = initialData
    ? {
        title: initialData.title,
        description: initialData.description || "",
        startDate: initialData.startDate.toISOString().split("T")[0],
        startTime: initialData.startDate.toTimeString().slice(0, 5),
        endDate: initialData.endDate.toISOString().split("T")[0],
        endTime: initialData.endDate.toTimeString().slice(0, 5),
        allDay: initialData.allDay || false,
        type: initialData.type,
        status: initialData.status || "SCHEDULED",
        location: initialData.location || "",
        color: initialData.color || EVENT_COLORS[initialData.type],
      }
    : {
        title: "",
        description: "",
        startDate: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endDate: new Date().toISOString().split("T")[0],
        endTime: "10:00",
        allDay: false,
        type: "AUTRE",
        status: "SCHEDULED",
        location: "",
      };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });

  const selectedType = form.watch("type");
  const allDay = form.watch("allDay");

  // Mettre à jour la couleur quand le type change
  const handleTypeChange = (type: AgendaEventType) => {
    form.setValue("type", type);
    if (!initialData?.color) {
      form.setValue("color", EVENT_COLORS[type]);
    }
  };

  const onSubmit = async (values: EventFormValues) => {
    try {
      setIsSubmitting(true);

      // Construire les dates ISO
      const startDateTime = allDay
        ? `${values.startDate}T00:00:00.000Z`
        : `${values.startDate}T${values.startTime}:00.000Z`;

      const endDateTime = allDay
        ? `${values.endDate}T23:59:59.999Z`
        : `${values.endDate}T${values.endTime}:00.000Z`;

      const payload = {
        title: values.title,
        description: values.description || undefined,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: values.allDay,
        type: values.type,
        status: values.status,
        location: values.location || undefined,
        color: values.color || undefined,
      };

      const url = isEditing
        ? `/api/agenda/events/${initialData.id}`
        : "/api/agenda/events";

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'enregistrement");
      }

      const data = await response.json();

      toast({
        title: "Succès",
        description: isEditing
          ? "Événement modifié avec succès"
          : "Événement créé avec succès",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/agenda/${data.id}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Titre */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Garde Équipe A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Détails de l'événement..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type et Statut */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select
                  onValueChange={handleTypeChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor:
                                EVENT_COLORS[key as AgendaEventType],
                            }}
                          />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Planifié</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                    <SelectItem value="CANCELLED">Annulé</SelectItem>
                    <SelectItem value="COMPLETED">Terminé</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Toute la journée */}
        <FormField
          control={form.control}
          name="allDay"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Toute la journée</FormLabel>
                <FormDescription>
                  L&apos;événement dure toute la journée
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Dates et heures */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de début *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!allDay && (
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de début *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de fin *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!allDay && (
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de fin *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Lieu */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lieu</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Caserne Centrale" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Boutons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Modifier" : "Créer"} l&apos;événement
          </Button>
        </div>
      </form>
    </Form>
  );
}
