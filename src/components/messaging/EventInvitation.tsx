"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, Check, X, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  formatDateRange,
  EVENT_TYPE_LABELS,
  EVENT_COLORS,
} from "@/lib/calendar-utils";
import type { AgendaEventType } from "@prisma/client";

interface EventInvitationProps {
  invitationId: string;
  event: {
    id: string;
    title: string;
    description?: string | null;
    startDate: string;
    endDate: string;
    location?: string | null;
    type: AgendaEventType;
    allDay: boolean;
  };
  currentResponse?: "ACCEPTED" | "DECLINED" | "TENTATIVE" | null;
  onResponseChange?: (status: "ACCEPTED" | "DECLINED" | "TENTATIVE") => void;
}

export function EventInvitation({
  invitationId,
  event,
  currentResponse,
  onResponseChange,
}: EventInvitationProps) {
  const { toast } = useToast();
  const [responding, setResponding] = useState(false);
  const [response, setResponse] = useState(currentResponse);

  const handleResponse = async (
    status: "ACCEPTED" | "DECLINED" | "TENTATIVE"
  ) => {
    try {
      setResponding(true);

      // Appeler l'API pour enregistrer la réponse
      const res = await fetch(
        `/api/messaging/invitations/${invitationId}/respond`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        throw new Error("Erreur lors de la réponse");
      }

      setResponse(status);

      // Si accepté, ajouter automatiquement au calendrier
      if (status === "ACCEPTED") {
        await addToCalendar();
      }

      toast({
        title: "Réponse enregistrée",
        description: getResponseMessage(status),
      });

      if (onResponseChange) {
        onResponseChange(status);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre réponse",
        variant: "destructive",
      });
    } finally {
      setResponding(false);
    }
  };

  const addToCalendar = async () => {
    try {
      // Ajouter l'utilisateur comme participant à l'événement
      const res = await fetch(`/api/agenda/events/${event.id}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "ACCEPTED",
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'ajout au calendrier");
      }

      toast({
        title: "Ajouté au calendrier",
        description: "L'événement a été ajouté à votre agenda",
      });
    } catch (error) {
      console.error("Erreur:", error);
      // Ne pas bloquer si l'ajout au calendrier échoue
    }
  };

  const getResponseMessage = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "Vous avez accepté l'invitation. L'événement a été ajouté à votre calendrier.";
      case "DECLINED":
        return "Vous avez décliné l'invitation.";
      case "TENTATIVE":
        return 'Vous avez marqué cette invitation comme "Peut-être".';
      default:
        return "";
    }
  };

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const eventColor = EVENT_COLORS[event.type];

  return (
    <Card className="border-l-4" style={{ borderLeftColor: eventColor }}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {event.title}
            </CardTitle>
            <CardDescription>Invitation à un événement</CardDescription>
          </div>
          <Badge
            style={{
              backgroundColor: `${eventColor}20`,
              color: eventColor,
              borderColor: eventColor,
            }}
            className="border"
          >
            {EVENT_TYPE_LABELS[event.type]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Détails de l'événement */}
        <div className="space-y-2">
          {event.description && (
            <p className="text-sm text-muted-foreground">{event.description}</p>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatDateRange(startDate, endDate)}</span>
            {event.allDay && (
              <Badge variant="secondary" className="text-xs">
                Toute la journée
              </Badge>
            )}
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {/* Boutons de réponse */}
        {response ? (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium">
              {response === "ACCEPTED" &&
                "✓ Vous avez accepté cette invitation"}
              {response === "DECLINED" &&
                "✗ Vous avez décliné cette invitation"}
              {response === "TENTATIVE" && '? Vous avez répondu "Peut-être"'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Vous pouvez modifier votre réponse ci-dessous
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Merci de répondre à cette invitation
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant={response === "ACCEPTED" ? "default" : "outline"}
            className="flex-1"
            onClick={() => handleResponse("ACCEPTED")}
            disabled={responding}
          >
            <Check className="mr-2 h-4 w-4" />
            Accepter
          </Button>
          <Button
            variant={response === "TENTATIVE" ? "default" : "outline"}
            className="flex-1"
            onClick={() => handleResponse("TENTATIVE")}
            disabled={responding}
          >
            <Clock3 className="mr-2 h-4 w-4" />
            Peut-être
          </Button>
          <Button
            variant={response === "DECLINED" ? "destructive" : "outline"}
            className="flex-1"
            onClick={() => handleResponse("DECLINED")}
            disabled={responding}
          >
            <X className="mr-2 h-4 w-4" />
            Refuser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
