/**
 * Utilitaires pour le calendrier
 */

import { AgendaEventType } from "@prisma/client";

// Couleurs par type d'événement
export const EVENT_COLORS: Record<AgendaEventType, string> = {
  GARDE: "#ef4444", // Rouge
  FMPA: "#f59e0b", // Orange
  FORMATION: "#3b82f6", // Bleu
  PROTOCOLE: "#8b5cf6", // Violet
  ENTRETIEN: "#10b981", // Vert
  PERSONNEL: "#6b7280", // Gris
  REUNION: "#06b6d4", // Cyan
  AUTRE: "#64748b", // Slate
};

// Labels français pour les types
export const EVENT_TYPE_LABELS: Record<AgendaEventType, string> = {
  GARDE: "Garde",
  FMPA: "FMPA",
  FORMATION: "Formation",
  PROTOCOLE: "Protocole",
  ENTRETIEN: "Entretien",
  PERSONNEL: "Personnel",
  REUNION: "Réunion",
  AUTRE: "Autre",
};

// Jours de la semaine
export const DAYS_OF_WEEK = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export const DAYS_OF_WEEK_SHORT = [
  "Lun",
  "Mar",
  "Mer",
  "Jeu",
  "Ven",
  "Sam",
  "Dim",
];

// Mois de l'année
export const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

/**
 * Obtient le nombre de jours dans un mois
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Obtient le premier jour du mois (0 = Dimanche, 1 = Lundi, etc.)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convertir pour que Lundi = 0
  return day === 0 ? 6 : day - 1;
}

/**
 * Génère les jours du calendrier pour un mois donné
 * Inclut les jours du mois précédent et suivant pour remplir la grille
 */
export function getCalendarDays(year: number, month: number) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);

  const days: Array<{
    date: Date;
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Jours du mois précédent
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(year, month - 1, day);
    days.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
    });
  }

  // Jours du mois actuel
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date,
      day,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
    });
  }

  // Jours du mois suivant pour compléter la grille (42 jours = 6 semaines)
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
    });
  }

  return days;
}

/**
 * Formate une date en format court (ex: "25 Oct")
 */
export function formatDateShort(date: Date): string {
  const day = date.getDate();
  const month = MONTHS[date.getMonth()].slice(0, 3);
  return `${day} ${month}`;
}

/**
 * Formate une date en format long (ex: "25 Octobre 2025")
 */
export function formatDateLong(date: Date): string {
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Formate une heure (ex: "14:30")
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formate une plage de dates
 */
export function formatDateRange(start: Date, end: Date): string {
  const sameDay =
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameDay) {
    return `${formatDateLong(start)} • ${formatTime(start)} - ${formatTime(end)}`;
  }

  return `${formatDateShort(start)} ${formatTime(start)} - ${formatDateShort(end)} ${formatTime(end)}`;
}

/**
 * Vérifie si une date est dans une plage
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const time = date.getTime();
  return time >= start.getTime() && time <= end.getTime();
}

/**
 * Obtient le début et la fin d'un mois
 */
export function getMonthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(year, month + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Obtient le début et la fin d'une journée
 */
export function getDayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Vérifie si deux dates sont le même jour
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Ajoute ou soustrait des mois à une date
 */
export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

/**
 * Convertit une date en format ISO pour l'API
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Parse une date ISO depuis l'API
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString);
}
