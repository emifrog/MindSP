"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MessageSquare, GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user, tenantSlug } = useAuth();
  const stats = [
    {
      title: "FMPA à venir",
      value: "12",
      description: "Ce mois-ci",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Personnel actif",
      value: "156",
      description: "Agents disponibles",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Messages",
      value: "8",
      description: "Non lus",
      icon: MessageSquare,
      color: "text-orange-600",
    },
    {
      title: "Formations",
      value: "5",
      description: "En cours",
      icon: GraduationCap,
      color: "text-purple-600",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "FMPA",
      title: "Manœuvre incendie",
      date: "Aujourd'hui à 14h00",
      status: "PUBLISHED",
    },
    {
      id: 2,
      type: "Formation",
      title: "Formation premiers secours",
      date: "Demain à 09h00",
      status: "OPEN",
    },
    {
      id: 3,
      type: "Message",
      title: "Nouveau message de Jean Dupont",
      date: "Il y a 2 heures",
      status: "NEW",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue {user?.name} - {tenantSlug?.toUpperCase()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
            <CardDescription>
              Vos dernières activités et événements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{activity.type}</Badge>
                      <p className="text-sm font-medium">{activity.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activity.date}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Voir
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accès rapide aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Créer une FMPA
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Nouveau message
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <GraduationCap className="mr-2 h-4 w-4" />
                Créer une formation
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Gérer le personnel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎉 Phase 1 - Foundation
          </CardTitle>
          <CardDescription>
            L&apos;interface de base est maintenant opérationnelle !
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les composants UI sont créés, le layout principal est en place.
            Prochaine étape : configuration de la base de données et
            authentification.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
