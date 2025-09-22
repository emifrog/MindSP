'use client';

import { 
  Calendar, 
  Users, 
  GraduationCap, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import Link from 'next/link';

const stats = [
  {
    name: 'FMPA ce mois',
    value: '12',
    change: '+2.5%',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    name: 'Personnel actif',
    value: '248',
    change: '+4.1%',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    name: 'Formations prévues',
    value: '8',
    change: '+12.5%',
    icon: GraduationCap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    name: 'Taux de présence',
    value: '94%',
    change: '+1.2%',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

const upcomingFMPA = [
  {
    id: '1',
    title: 'Formation Incendie Niveau 2',
    type: 'FORMATION',
    date: '2024-01-15',
    time: '09:00',
    location: 'Centre de formation',
    participants: 24,
    status: 'PUBLISHED',
  },
  {
    id: '2',
    title: 'Manœuvre mensuelle',
    type: 'MANOEUVRE',
    date: '2024-01-16',
    time: '14:00',
    location: 'Caserne principale',
    participants: 32,
    status: 'PUBLISHED',
  },
  {
    id: '3',
    title: 'Réunion de service',
    type: 'REUNION',
    date: '2024-01-17',
    time: '18:00',
    location: 'Salle de réunion',
    participants: 15,
    status: 'DRAFT',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre activité
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> depuis le mois dernier
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming FMPA */}
        <Card>
          <CardHeader>
            <CardTitle>Prochaines FMPA</CardTitle>
            <CardDescription>
              Vos prochains événements planifiés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingFMPA.map((fmpa) => (
                <div
                  key={fmpa.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{fmpa.title}</p>
                      <Badge variant={fmpa.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {fmpa.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {fmpa.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {fmpa.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {fmpa.participants}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/fmpa/${fmpa.id}`}>
                      Voir
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline" asChild>
              <Link href="/dashboard/fmpa">
                Voir toutes les FMPA
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Dernières actions sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    Formation PSE1 complétée
                  </p>
                  <p className="text-xs text-muted-foreground">
                    24 participants - Il y a 2 heures
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    Nouvelle FMPA créée
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Manœuvre du 20/01 - Il y a 5 heures
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    Rappel: Formation demain
                  </p>
                  <p className="text-xs text-muted-foreground">
                    8 personnes inscrites - Il y a 1 jour
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    FMPA annulée
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Garde du 18/01 - Il y a 2 jours
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}