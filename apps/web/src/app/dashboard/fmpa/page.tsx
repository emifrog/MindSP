'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Calendar, 
  Filter, 
  Download,
  Search,
  MoreVertical,
  Users,
  MapPin,
  Clock
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const fmpaList = [
  {
    id: '1',
    title: 'Formation Incendie Niveau 2',
    type: 'FORMATION',
    status: 'PUBLISHED',
    startDate: '2024-01-15',
    endDate: '2024-01-15',
    startTime: '09:00',
    endTime: '17:00',
    location: 'Centre de formation',
    address: '123 rue de la Formation, 75000 Paris',
    participants: 24,
    maxParticipants: 30,
    description: 'Formation théorique et pratique sur les techniques d'extinction',
  },
  {
    id: '2',
    title: 'Manœuvre mensuelle',
    type: 'MANOEUVRE',
    status: 'IN_PROGRESS',
    startDate: '2024-01-16',
    endDate: '2024-01-16',
    startTime: '14:00',
    endTime: '18:00',
    location: 'Caserne principale',
    participants: 32,
    maxParticipants: 40,
    description: 'Exercice pratique avec mise en situation réelle',
  },
  {
    id: '3',
    title: 'Réunion de service',
    type: 'REUNION',
    status: 'DRAFT',
    startDate: '2024-01-17',
    endDate: '2024-01-17',
    startTime: '18:00',
    endTime: '20:00',
    location: 'Salle de réunion',
    participants: 15,
    maxParticipants: 50,
    description: 'Réunion mensuelle du service',
  },
];

const typeColors = {
  FORMATION: 'bg-blue-100 text-blue-800',
  MANOEUVRE: 'bg-green-100 text-green-800',
  REUNION: 'bg-purple-100 text-purple-800',
  GARDE: 'bg-orange-100 text-orange-800',
  INTERVENTION: 'bg-red-100 text-red-800',
  CEREMONIE: 'bg-pink-100 text-pink-800',
  SPORT: 'bg-yellow-100 text-yellow-800',
  AUTRE: 'bg-gray-100 text-gray-800',
};

const statusColors = {
  DRAFT: 'secondary',
  PUBLISHED: 'default',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELED: 'destructive',
} as const;

export default function FMPAListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FMPA</h1>
          <p className="text-muted-foreground">
            Gestion des formations, manœuvres et présences actives
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/fmpa/create">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle FMPA
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher une FMPA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="FORMATION">Formation</SelectItem>
                <SelectItem value="MANOEUVRE">Manœuvre</SelectItem>
                <SelectItem value="REUNION">Réunion</SelectItem>
                <SelectItem value="GARDE">Garde</SelectItem>
                <SelectItem value="CEREMONIE">Cérémonie</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
                <SelectItem value="PUBLISHED">Publié</SelectItem>
                <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                <SelectItem value="COMPLETED">Terminé</SelectItem>
                <SelectItem value="CANCELED">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Plus de filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FMPA List */}
      <div className="space-y-4">
        {fmpaList.map((fmpa) => (
          <Card key={fmpa.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{fmpa.title}</h3>
                    <Badge className={typeColors[fmpa.type]}>
                      {fmpa.type}
                    </Badge>
                    <Badge variant={statusColors[fmpa.status]}>
                      {fmpa.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {fmpa.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {fmpa.startDate} {fmpa.startTime} - {fmpa.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {fmpa.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {fmpa.participants}/{fmpa.maxParticipants || '∞'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/fmpa/${fmpa.id}`}>
                      Voir détails
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href={`/dashboard/fmpa/${fmpa.id}/edit`}>
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Dupliquer
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Exporter liste
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Annuler
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Affichage de 1 à 3 sur 3 résultats
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Précédent
          </Button>
          <Button variant="outline" size="sm" disabled>
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}