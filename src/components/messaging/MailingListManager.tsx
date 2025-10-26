"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Edit, Trash2, Lock, Globe } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MailingList {
  id: string;
  name: string;
  description?: string | null;
  type: "STATIC" | "DYNAMIC";
  isPublic: boolean;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    members: number;
  };
}

interface MailingListManagerProps {
  onSelectList?: (list: MailingList) => void;
  selectedListId?: string;
}

export function MailingListManager({
  onSelectList,
  selectedListId,
}: MailingListManagerProps) {
  const { toast } = useToast();
  const [lists, setLists] = useState<MailingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/messaging/lists");

      if (!response.ok) {
        throw new Error("Erreur de chargement");
      }

      const data = await response.json();
      setLists(data.lists || []);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les listes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Attention",
        description: "Le nom de la liste est requis",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/messaging/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          type: "STATIC",
          isPublic: formData.isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création");
      }

      const newList = await response.json();

      toast({
        title: "Succès",
        description: "Liste créée avec succès",
      });

      setLists((prev) => [newList, ...prev]);
      setDialogOpen(false);
      setFormData({ name: "", description: "", isPublic: false });
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la liste",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette liste ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/messaging/lists/${listId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      toast({
        title: "Succès",
        description: "Liste supprimée avec succès",
      });

      setLists((prev) => prev.filter((list) => list.id !== listId));
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la liste",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Listes de diffusion</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle liste
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une liste de diffusion</DialogTitle>
              <DialogDescription>
                Créez une liste pour envoyer des messages à plusieurs personnes
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la liste *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Équipe A"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description de la liste..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Liste publique</Label>
                  <p className="text-sm text-muted-foreground">
                    Visible et utilisable par tous les membres
                  </p>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPublic: checked })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button onClick={handleCreateList} disabled={submitting}>
                {submitting ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des listes */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : lists.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-sm font-semibold">Aucune liste</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Créez votre première liste de diffusion
            </p>
          </div>
        ) : (
          lists.map((list) => {
            const isSelected = selectedListId === list.id;

            return (
              <button
                key={list.id}
                onClick={() => onSelectList?.(list)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                  isSelected && "border-primary bg-primary/5"
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{list.name}</p>
                    {list.isPublic ? (
                      <Globe className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  {list.description && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {list.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {list._count?.members || 0} membre(s)
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {list.type === "STATIC" ? "Statique" : "Dynamique"}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Ouvrir dialog de modification
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
