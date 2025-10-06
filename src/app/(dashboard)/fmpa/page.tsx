"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

interface FMPA {
  id: string;
  type: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number | null;
  status: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  _count: {
    participations: number;
  };
}

export default function FMPAPage() {
  const { isAdmin, isManager } = useAuth();
  const [fmpas, setFmpas] = useState<FMPA[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchFMPAs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      const response = await fetch(`/api/fmpa?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        // Filtrer localement par recherche
        let filteredFmpas = data.fmpas;
        if (searchQuery) {
          filteredFmpas = filteredFmpas.filter(
            (fmpa: FMPA) =>
              fmpa.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              fmpa.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (fmpa.description &&
                fmpa.description
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()))
          );
        }
        setFmpas(filteredFmpas);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des FMPA:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    fetchFMPAs();
  }, [fetchFMPAs]);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      FORMATION: "bg-blue-100 text-blue-800",
      MANOEUVRE: "bg-orange-100 text-orange-800",
      PRESENCE_ACTIVE: "bg-green-100 text-green-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-800",
      PUBLISHED: "bg-green-100 text-green-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-purple-100 text-purple-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FORMATION: "Formation",
      MANOEUVRE: "Manœuvre",
      PRESENCE_ACTIVE: "Présence Active",
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: "Brouillon",
      PUBLISHED: "Publié",
      IN_PROGRESS: "En cours",
      COMPLETED: "Terminé",
      CANCELLED: "Annulé",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FMPA</h1>
          <p className="text-muted-foreground">
            Formations, Manœuvres et Présences Actives
          </p>
        </div>
        {(isAdmin || isManager) && (
          <Button asChild>
            <Link href="/fmpa/new">
              <Plus className="mr-2 h-4 w-4" />
              Créer une FMPA
            </Link>
          </Button>
        )}
      </div>

      {/* Barre de recherche et filtres */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, lieu ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="DRAFT">Brouillon</option>
                    <option value="PUBLISHED">Publié</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="COMPLETED">Terminé</option>
                    <option value="CANCELLED">Annulé</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="all">Tous les types</option>
                    <option value="FORMATION">Formation</option>
                    <option value="MANOEUVRE">Manœuvre</option>
                    <option value="PRESENCE_ACTIVE">Présence Active</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setTypeFilter("all");
                    setSearchQuery("");
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtres rapides par statut */}
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Toutes
          </Button>
          <Button
            variant={statusFilter === "PUBLISHED" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("PUBLISHED")}
          >
            Publiées
          </Button>
          <Button
            variant={statusFilter === "IN_PROGRESS" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("IN_PROGRESS")}
          >
            En cours
          </Button>
          <Button
            variant={statusFilter === "COMPLETED" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("COMPLETED")}
          >
            Terminées
          </Button>
        </div>
      </div>

      {/* Liste des FMPA */}
      {loading ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : fmpas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucune FMPA trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fmpas.map((fmpa) => (
            <Card key={fmpa.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-2">{fmpa.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {fmpa.description || "Aucune description"}
                    </CardDescription>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <Badge className={getTypeColor(fmpa.type)}>
                    {getTypeLabel(fmpa.type)}
                  </Badge>
                  <Badge className={getStatusColor(fmpa.status)}>
                    {getStatusLabel(fmpa.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(new Date(fmpa.startDate), "PPP", { locale: fr })}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {format(new Date(fmpa.startDate), "HH:mm")} -{" "}
                  {format(new Date(fmpa.endDate), "HH:mm")}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {fmpa.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  {fmpa._count.participations}
                  {fmpa.maxParticipants && ` / ${fmpa.maxParticipants}`}{" "}
                  participants
                </div>

                <div className="pt-3">
                  <Button asChild className="w-full">
                    <Link href={`/fmpa/${fmpa.id}`}>Voir les détails</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
