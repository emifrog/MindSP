"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Icons } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CreateChannelDialogProps {
  onChannelCreated?: () => void;
}

export function CreateChannelDialog({
  onChannelCreated,
}: CreateChannelDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "PUBLIC" as "PUBLIC" | "PRIVATE" | "DIRECT",
    icon: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/chat/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la création du canal");
      }

      toast({
        title: "Canal créé !",
        description: `Le canal ${formData.name} a été créé avec succès.`,
      });

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        description: "",
        type: "PUBLIC",
        icon: "",
      });

      setOpen(false);
      onChannelCreated?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le canal. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const iconOptions = [
    { value: "none", label: "Aucune icône" },
    { value: "fluent-emoji:speech-balloon", label: "💬 Bulle" },
    { value: "fluent-emoji:fire", label: "🔥 Feu" },
    { value: "fluent-emoji:rocket", label: "🚀 Fusée" },
    { value: "fluent-emoji:star", label: "⭐ Étoile" },
    { value: "fluent-emoji:party-popper", label: "🎉 Fête" },
    { value: "fluent-emoji:laptop", label: "💻 Ordinateur" },
    { value: "fluent-emoji:books", label: "📚 Livres" },
    { value: "fluent-emoji:megaphone", label: "📣 Mégaphone" },
    { value: "fluent-emoji:light-bulb", label: "💡 Ampoule" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <Icon name={Icons.action.add} size="sm" className="mr-2" />
          Nouveau canal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="fluent-emoji:speech-balloon" size="lg" />
              Créer un nouveau canal
            </DialogTitle>
            <DialogDescription>
              Créez un canal pour organiser vos conversations par thème ou
              projet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nom du canal */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nom du canal <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="général, pompiers, admin..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Le nom sera automatiquement préfixé par #
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="De quoi parle ce canal ?"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                maxLength={200}
              />
            </div>

            {/* Type de canal */}
            <div className="space-y-2">
              <Label htmlFor="type">Type de canal</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">
                    <div className="flex items-center gap-2">
                      <Icon name="fluent-emoji:speech-balloon" size="sm" />
                      <div>
                        <p className="font-medium">Public</p>
                        <p className="text-xs text-muted-foreground">
                          Tout le monde peut voir et rejoindre
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="PRIVATE">
                    <div className="flex items-center gap-2">
                      <Icon name="fluent-emoji:locked" size="sm" />
                      <div>
                        <p className="font-medium">Privé</p>
                        <p className="text-xs text-muted-foreground">
                          Uniquement sur invitation
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Icône */}
            <div className="space-y-2">
              <Label htmlFor="icon">Icône (optionnel)</Label>
              <Select
                value={formData.icon || undefined}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    icon: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une icône" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !formData.name}>
              {loading ? (
                <>
                  <Icon
                    name={Icons.ui.menu}
                    size="sm"
                    className="mr-2 animate-spin"
                  />
                  Création...
                </>
              ) : (
                <>
                  <Icon name={Icons.action.add} size="sm" className="mr-2" />
                  Créer le canal
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
