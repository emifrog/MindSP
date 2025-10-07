"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    type: "OTHER",
    color: "#3b82f6",
    allDay: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users.filter((u: User) => u.id !== user?.id));
      }
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          participantIds: selectedParticipants,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Événement créé",
          description: "L'événement a été ajouté au calendrier",
        });
        router.push("/agenda");
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de créer l'événement",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur création événement:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantToggle = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/agenda">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nouvel événement</h1>
          <p className="text-muted-foreground">
            Créez un événement dans le calendrier
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informations principales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
              <CardDescription>Détails de l&apos;événement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: Réunion d'équipe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Description de l'événement..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Ex: Caserne centrale"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FMPA">FMPA</SelectItem>
                    <SelectItem value="FORMATION">Formation</SelectItem>
                    <SelectItem value="MEETING">Réunion</SelectItem>
                    <SelectItem value="INTERVENTION">Intervention</SelectItem>
                    <SelectItem value="GARDE">Garde</SelectItem>
                    <SelectItem value="ASTREINTE">Astreinte</SelectItem>
                    <SelectItem value="OTHER">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Dates et participants */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dates</CardTitle>
                <CardDescription>Période de l&apos;événement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allDay"
                    checked={formData.allDay}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, allDay: checked as boolean })
                    }
                  />
                  <Label htmlFor="allDay" className="cursor-pointer">
                    Toute la journée
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Participants ({selectedParticipants.length})
                </CardTitle>
                <CardDescription>Sélectionnez les participants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center space-x-2 rounded-lg border p-2 hover:bg-accent"
                    >
                      <Checkbox
                        id={u.id}
                        checked={selectedParticipants.includes(u.id)}
                        onCheckedChange={() => handleParticipantToggle(u.id)}
                      />
                      <Label
                        htmlFor={u.id}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {u.firstName} {u.lastName}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/agenda">Annuler</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Créer l&apos;événement
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
