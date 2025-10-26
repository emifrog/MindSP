"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
}

interface ParticipantSelectorProps {
  eventId: string;
  existingParticipantIds: string[];
  onParticipantsAdded: () => void;
}

export function ParticipantSelector({
  eventId,
  existingParticipantIds,
  onParticipantsAdded,
}: ParticipantSelectorProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");

      if (!response.ok) {
        throw new Error("Erreur de chargement");
      }

      const data = await response.json();
      // Filtrer les utilisateurs déjà participants
      const availableUsers = data.users.filter(
        (user: User) => !existingParticipantIds.includes(user.id)
      );
      setUsers(availableUsers);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (selectedUserIds.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner au moins un participant",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/agenda/events/${eventId}/participants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userIds: selectedUserIds,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'ajout");
      }

      toast({
        title: "Succès",
        description: `${selectedUserIds.length} participant(s) ajouté(s)`,
      });

      setOpen(false);
      setSelectedUserIds([]);
      onParticipantsAdded();
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'ajouter les participants",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter des participants</DialogTitle>
          <DialogDescription>
            Sélectionnez les personnes à inviter à cet événement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Liste des utilisateurs */}
          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {search
                  ? "Aucun utilisateur trouvé"
                  : "Tous les utilisateurs sont déjà participants"}
              </p>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => handleToggleUser(user.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                      isSelected && "border-primary bg-primary/5"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-primary" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Compteur sélection */}
          {selectedUserIds.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedUserIds.length} participant(s) sélectionné(s)
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || selectedUserIds.length === 0}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ajouter{" "}
            {selectedUserIds.length > 0 && `(${selectedUserIds.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
