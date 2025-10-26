"use client";

import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EVENT_TYPE_LABELS, EVENT_COLORS } from "@/lib/calendar-utils";
import type { AgendaEventType, AgendaEventStatus } from "@prisma/client";

interface EventFiltersProps {
  filters: {
    type?: AgendaEventType;
    status?: AgendaEventStatus;
  };
  onFiltersChange: (filters: {
    type?: AgendaEventType;
    status?: AgendaEventStatus;
  }) => void;
}

const STATUS_LABELS: Record<AgendaEventStatus, string> = {
  SCHEDULED: "Planifié",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
};

export function EventFilters({ filters, onFiltersChange }: EventFiltersProps) {
  const hasActiveFilters = filters.type || filters.status;
  const activeFilterCount = [filters.type, filters.status].filter(
    Boolean
  ).length;

  const handleTypeChange = (value: string) => {
    if (value === "all") {
      const { type, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({
        ...filters,
        type: value as AgendaEventType,
      });
    }
  };

  const handleStatusChange = (value: string) => {
    if (value === "all") {
      const { status, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({
        ...filters,
        status: value as AgendaEventStatus,
      });
    }
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filtres
          {activeFilterCount > 0 && (
            <Badge
              variant="destructive"
              className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtres</SheetTitle>
          <SheetDescription>
            Filtrez les événements par type et statut
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Filtres actifs */}
          {hasActiveFilters && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Filtres actifs</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="mr-1 h-3 w-3" />
                  Tout effacer
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.type && (
                  <Badge
                    variant="secondary"
                    className="gap-1"
                    style={{
                      backgroundColor: `${EVENT_COLORS[filters.type]}20`,
                      color: EVENT_COLORS[filters.type],
                      borderColor: EVENT_COLORS[filters.type],
                    }}
                  >
                    {EVENT_TYPE_LABELS[filters.type]}
                    <button
                      onClick={() => handleTypeChange("all")}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.status && (
                  <Badge variant="secondary" className="gap-1">
                    {STATUS_LABELS[filters.status]}
                    <button
                      onClick={() => handleStatusChange("all")}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Filtre par type */}
          <div className="space-y-2">
            <Label htmlFor="type-filter">Type d&apos;événement</Label>
            <Select
              value={filters.type || "all"}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: EVENT_COLORS[key as AgendaEventType],
                        }}
                      />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par statut */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Statut</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info */}
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p>
              Les filtres s&apos;appliquent uniquement aux événements du mois en
              cours.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
