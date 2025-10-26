import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

/**
 * Générer une feuille d'émargement pour une FMPA
 */
export async function generateAttendanceSheet(fmpaId: string) {
  const fmpa = await prisma.fMPA.findUnique({
    where: { id: fmpaId },
    include: {
      participations: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              badge: true,
              email: true,
            },
          },
        },
        orderBy: {
          user: {
            lastName: "asc",
          },
        },
      },
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!fmpa) {
    throw new Error("FMPA introuvable");
  }

  // Données pour le PDF
  return {
    title: fmpa.title,
    type: fmpa.type,
    date: new Date(fmpa.startDate).toLocaleDateString("fr-FR"),
    startTime: new Date(fmpa.startDate).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    endTime: new Date(fmpa.endDate).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    location: fmpa.location,
    organizer: `${fmpa.createdBy.firstName} ${fmpa.createdBy.lastName}`,
    participants: fmpa.participations.map((p) => ({
      name: `${p.user.firstName} ${p.user.lastName}`,
      badge: p.user.badge || "N/A",
      status: p.status,
      signature: "", // Espace pour signature
    })),
    objectives: fmpa.objectives,
    equipment: fmpa.equipment,
  };
}

/**
 * Exporter la liste des participants en Excel
 */
export async function exportParticipantsToExcel(fmpaId: string) {
  const fmpa = await prisma.fMPA.findUnique({
    where: { id: fmpaId },
    include: {
      participations: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              badge: true,
              email: true,
              phone: true,
            },
          },
          mealRegistration: true,
        },
        orderBy: {
          user: {
            lastName: "asc",
          },
        },
      },
    },
  });

  if (!fmpa) {
    throw new Error("FMPA introuvable");
  }

  // Préparer les données
  const data = fmpa.participations.map((p) => ({
    Nom: p.user.lastName,
    Prénom: p.user.firstName,
    Badge: p.user.badge || "",
    Email: p.user.email,
    Téléphone: p.user.phone || "",
    Statut: p.status,
    "Inscrit le": new Date(p.registeredAt).toLocaleDateString("fr-FR"),
    Repas: p.mealRegistration ? "Oui" : "Non",
    Menu: p.mealRegistration?.menuChoice || "",
    "Régime spécial": p.mealRegistration?.dietaryRestrictions || "",
  }));

  // Créer le workbook
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Participants");

  // Ajouter les informations de la FMPA
  const infoWs = XLSX.utils.json_to_sheet([
    { Info: "Titre", Valeur: fmpa.title },
    { Info: "Type", Valeur: fmpa.type },
    {
      Info: "Date",
      Valeur: new Date(fmpa.startDate).toLocaleDateString("fr-FR"),
    },
    { Info: "Lieu", Valeur: fmpa.location },
    { Info: "Participants", Valeur: fmpa.participations.length },
  ]);
  XLSX.utils.book_append_sheet(wb, infoWs, "Informations");

  return wb;
}

/**
 * Générer un rapport de manœuvre
 */
export async function generateManeuverReport(fmpaId: string) {
  const fmpa = await prisma.fMPA.findUnique({
    where: { id: fmpaId },
    include: {
      participations: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              badge: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!fmpa) {
    throw new Error("FMPA introuvable");
  }

  const presentCount = fmpa.participations.filter(
    (p) => p.status === "PRESENT"
  ).length;
  const absentCount = fmpa.participations.filter(
    (p) => p.status === "ABSENT"
  ).length;
  const excusedCount = fmpa.participations.filter(
    (p) => p.status === "EXCUSED"
  ).length;

  const duration = Math.round(
    (new Date(fmpa.endDate).getTime() - new Date(fmpa.startDate).getTime()) /
      (1000 * 60 * 60)
  );

  return {
    header: {
      title: fmpa.title,
      type: fmpa.type,
      date: new Date(fmpa.startDate).toLocaleDateString("fr-FR"),
      location: fmpa.location,
      organizer: `${fmpa.createdBy.firstName} ${fmpa.createdBy.lastName}`,
      duration: `${duration}h`,
    },
    objectives: fmpa.objectives,
    equipment: fmpa.equipment,
    statistics: {
      totalParticipants: fmpa.participations.length,
      present: presentCount,
      absent: absentCount,
      excused: excusedCount,
      attendanceRate:
        fmpa.participations.length > 0
          ? Math.round((presentCount / fmpa.participations.length) * 100)
          : 0,
    },
    participants: {
      present: fmpa.participations
        .filter((p) => p.status === "PRESENT")
        .map((p) => ({
          name: `${p.user.firstName} ${p.user.lastName}`,
          badge: p.user.badge,
        })),
      absent: fmpa.participations
        .filter((p) => p.status === "ABSENT")
        .map((p) => ({
          name: `${p.user.firstName} ${p.user.lastName}`,
          badge: p.user.badge,
        })),
      excused: fmpa.participations
        .filter((p) => p.status === "EXCUSED")
        .map((p) => ({
          name: `${p.user.firstName} ${p.user.lastName}`,
          badge: p.user.badge,
          reason: p.excuseReason,
        })),
    },
  };
}

/**
 * Générer les statistiques d'équipe en Excel
 */
export async function exportTeamStatistics(
  tenantId: string,
  period: "month" | "year"
) {
  const now = new Date();
  let startDate: Date;

  if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  const fmpas = await prisma.fMPA.findMany({
    where: {
      tenantId,
      status: "COMPLETED",
      startDate: {
        gte: startDate,
      },
    },
    include: {
      participations: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              badge: true,
            },
          },
        },
      },
    },
  });

  // Calculer les stats par utilisateur
  const userStats = new Map();

  fmpas.forEach((fmpa) => {
    fmpa.participations.forEach((p) => {
      const key = p.userId;
      if (!userStats.has(key)) {
        userStats.set(key, {
          name: `${p.user.firstName} ${p.user.lastName}`,
          badge: p.user.badge,
          total: 0,
          present: 0,
          formations: 0,
          manoeuvres: 0,
          hours: 0,
        });
      }

      const stats = userStats.get(key);
      stats.total++;
      if (p.status === "PRESENT") {
        stats.present++;
        const hours = Math.round(
          (new Date(fmpa.endDate).getTime() -
            new Date(fmpa.startDate).getTime()) /
            (1000 * 60 * 60)
        );
        stats.hours += hours;

        if (fmpa.type === "FORMATION") stats.formations++;
        if (fmpa.type === "MANOEUVRE") stats.manoeuvres++;
      }
    });
  });

  const data = Array.from(userStats.values()).map((stats) => ({
    Nom: stats.name,
    Badge: stats.badge || "",
    "Total participations": stats.total,
    Présences: stats.present,
    "Taux présence":
      stats.total > 0
        ? `${Math.round((stats.present / stats.total) * 100)}%`
        : "0%",
    Formations: stats.formations,
    Manœuvres: stats.manoeuvres,
    "Heures totales": stats.hours,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Statistiques Équipe");

  return wb;
}
