"use client";

import { Calendar, MapPin, Users, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FMPACardProps {
  fmpa: {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    location: string;
    maxParticipants?: number | null;
    mealAvailable: boolean;
    _count?: {
      participations: number;
    };
    createdBy: {
      firstName: string;
      lastName: string;
    };
  };
  userParticipation?: {
    status: string;
  } | null;
}

const FMPA_TYPE_LABELS: Record<string, string> = {
  FORMATION: "Formation",
  MANOEUVRE: "Manœuvre",
  EXERCICE: "Exercice",
  PRESENCE_ACTIVE: "Présence Active",
  CEREMONIE: "Cérémonie",
  REUNION: "Réunion",
  AUTRE: "Autre",
};

const FMPA_TYPE_COLORS: Record<string, string> = {
  FORMATION: "bg-blue-500",
  MANOEUVRE: "bg-red-500",
  EXERCICE: "bg-orange-500",
  PRESENCE_ACTIVE: "bg-green-500",
  CEREMONIE: "bg-purple-500",
  REUNION: "bg-yellow-500",
  AUTRE: "bg-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publiée",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-500",
  PUBLISHED: "bg-green-500",
  IN_PROGRESS: "bg-blue-500",
  COMPLETED: "bg-purple-500",
  CANCELLED: "bg-red-500",
};

export function FMPACard({ fmpa, userParticipation }: FMPACardProps) {
  const startDate = new Date(fmpa.startDate);
  const endDate = new Date(fmpa.endDate);
  const participationCount = fmpa._count?.participations || 0;
  const isFull =
    fmpa.maxParticipants && participationCount >= fmpa.maxParticipants;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-3 w-3 rounded-full",
                  FMPA_TYPE_COLORS[fmpa.type] || "bg-gray-500"
                )}
              />
              <CardTitle className="text-lg">{fmpa.title}</CardTitle>
            </div>
            <CardDescription className="line-clamp-2">
              {fmpa.description || "Aucune description"}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant="secondary"
              className={cn("text-white", STATUS_COLORS[fmpa.status])}
            >
              {STATUS_LABELS[fmpa.status]}
            </Badge>
            {userParticipation && (
              <Badge variant="outline" className="text-xs">
                <CheckCircle className="mr-1 h-3 w-3" />
                Inscrit
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(startDate)} - {formatDate(endDate)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {formatTime(startDate)} - {formatTime(endDate)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{fmpa.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>
            {participationCount} participant(s)
            {fmpa.maxParticipants && ` / ${fmpa.maxParticipants}`}
          </span>
          {isFull && (
            <Badge variant="destructive" className="text-xs">
              Complet
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {FMPA_TYPE_LABELS[fmpa.type] || fmpa.type}
          </Badge>
          {fmpa.mealAvailable && (
            <Badge variant="outline" className="text-xs">
              🍽️ Repas
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Organisé par {fmpa.createdBy.firstName} {fmpa.createdBy.lastName}
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/fmpa/${fmpa.id}`}>Voir les détails</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
