/**
 * Générateur de fichiers CSV pour l'export TTA
 */

interface TTAEntryForExport {
  id: string;
  date: Date;
  activityType: string;
  description: string | null;
  hours: number;
  nightHours: number | null;
  sundayHours: number | null;
  holidayHours: number | null;
  baseAmount: number;
  nightBonus: number | null;
  sundayBonus: number | null;
  holidayBonus: number | null;
  totalAmount: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    badge: string | null;
  };
}

export function generateCSV(entries: TTAEntryForExport[]): string {
  // En-têtes CSV
  const headers = [
    "Matricule",
    "Nom",
    "Prénom",
    "Email",
    "Date",
    "Type Activité",
    "Description",
    "Heures Normales",
    "Heures Nuit",
    "Heures Dimanche",
    "Heures Férié",
    "Montant Base",
    "Bonus Nuit",
    "Bonus Dimanche",
    "Bonus Férié",
    "Total",
  ];

  // Convertir les entrées en lignes CSV
  const rows = entries.map((entry) => {
    return [
      entry.user.badge || "",
      entry.user.lastName,
      entry.user.firstName,
      entry.user.email,
      new Date(entry.date).toLocaleDateString("fr-FR"),
      entry.activityType,
      entry.description || "",
      entry.hours.toString(),
      (entry.nightHours || 0).toString(),
      (entry.sundayHours || 0).toString(),
      (entry.holidayHours || 0).toString(),
      entry.baseAmount.toFixed(2),
      (entry.nightBonus || 0).toFixed(2),
      (entry.sundayBonus || 0).toFixed(2),
      (entry.holidayBonus || 0).toFixed(2),
      entry.totalAmount.toFixed(2),
    ];
  });

  // Construire le CSV
  const csvContent = [
    headers.join(";"),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")
    ),
  ].join("\n");

  // Ajouter le BOM UTF-8 pour Excel
  return "\uFEFF" + csvContent;
}

export function generateExcel(entries: TTAEntryForExport[]): string {
  // Pour une vraie implémentation Excel, utiliser une bibliothèque comme xlsx
  // Pour l'instant, retourner du CSV qui s'ouvre dans Excel
  return generateCSV(entries);
}
