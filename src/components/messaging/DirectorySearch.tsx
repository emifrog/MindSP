"use client";

import { useState, useEffect } from "react";
import { Search, Star, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  badge?: string | null;
  role: string;
  phone?: string | null;
  isFavorite?: boolean;
}

interface DirectorySearchProps {
  onSelectUser?: (user: User) => void;
  selectedUserIds?: string[];
  showFavoritesOnly?: boolean;
  onToggleFavorite?: (userId: string) => void;
}

export function DirectorySearch({
  onSelectUser,
  selectedUserIds = [],
  showFavoritesOnly = false,
  onToggleFavorite,
}: DirectorySearchProps) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, showFavoritesOnly]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      if (showFavoritesOnly) {
        params.append("favorites", "true");
      }

      const response = await fetch(`/api/messaging/directory?${params}`);

      if (!response.ok) {
        throw new Error("Erreur de chargement");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const response = await fetch("/api/messaging/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Erreur");
      }

      const data = await response.json();

      // Mettre à jour l'état local
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isFavorite: data.isFavorite } : user
        )
      );

      if (onToggleFavorite) {
        onToggleFavorite(userId);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      SUPER_ADMIN: "Super Admin",
      ADMIN: "Administrateur",
      MANAGER: "Manager",
      USER: "Utilisateur",
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, email ou matricule..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Liste des utilisateurs */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {search ? "Aucun utilisateur trouvé" : "Aucun utilisateur"}
          </div>
        ) : (
          users.map((user) => {
            const isSelected = selectedUserIds.includes(user.id);

            return (
              <button
                key={user.id}
                onClick={() => onSelectUser?.(user)}
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

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    {user.badge && (
                      <Badge variant="outline" className="text-xs">
                        {user.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                </div>

                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleToggleFavorite(user.id, e)}
                    className="shrink-0"
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        user.isFavorite && "fill-yellow-400 text-yellow-400"
                      )}
                    />
                  </Button>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
