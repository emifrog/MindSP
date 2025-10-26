// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/fmpa/[id]/stats - Statistiques d'une FMPA
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que la FMPA existe
    const fmpa = await prisma.fMPA.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!fmpa) {
      return NextResponse.json({ error: "FMPA introuvable" }, { status: 404 });
    }

    // Récupérer les statistiques
    const [
      totalParticipations,
      registeredCount,
      confirmedCount,
      presentCount,
      absentCount,
      excusedCount,
      cancelledCount,
      mealCount,
    ] = await Promise.all([
      prisma.participation.count({
        where: { fmpaId: params.id },
      }),
      prisma.participation.count({
        where: { fmpaId: params.id, status: "REGISTERED" },
      }),
      prisma.participation.count({
        where: { fmpaId: params.id, status: "CONFIRMED" },
      }),
      prisma.participation.count({
        where: { fmpaId: params.id, status: "PRESENT" },
      }),
      prisma.participation.count({
        where: { fmpaId: params.id, status: "ABSENT" },
      }),
      prisma.participation.count({
        where: { fmpaId: params.id, status: "EXCUSED" },
      }),
      prisma.participation.count({
        where: { fmpaId: params.id, status: "CANCELLED" },
      }),
      prisma.fMPAMealRegistration.count({
        where: {
          participation: {
            fmpaId: params.id,
          },
        },
      }),
    ]);

    // Calculer les taux
    const attendanceRate =
      totalParticipations > 0
        ? ((presentCount / totalParticipations) * 100).toFixed(1)
        : 0;

    const confirmationRate =
      totalParticipations > 0
        ? (
            ((confirmedCount + presentCount) / totalParticipations) *
            100
          ).toFixed(1)
        : 0;

    const mealRate =
      totalParticipations > 0
        ? ((mealCount / totalParticipations) * 100).toFixed(1)
        : 0;

    // Récupérer les inscriptions repas par menu
    const mealsByMenu = await prisma.fMPAMealRegistration.groupBy({
      by: ["menuChoice"],
      where: {
        participation: {
          fmpaId: params.id,
        },
      },
      _count: true,
    });

    return NextResponse.json({
      total: totalParticipations,
      byStatus: {
        registered: registeredCount,
        confirmed: confirmedCount,
        present: presentCount,
        absent: absentCount,
        excused: excusedCount,
        cancelled: cancelledCount,
      },
      meals: {
        total: mealCount,
        byMenu: mealsByMenu.map((m) => ({
          menu: m.menuChoice || "Non spécifié",
          count: m._count,
        })),
      },
      rates: {
        attendance: parseFloat(attendanceRate),
        confirmation: parseFloat(confirmationRate),
        meal: parseFloat(mealRate),
      },
      capacity: {
        max: fmpa.maxParticipants,
        available: fmpa.maxParticipants
          ? fmpa.maxParticipants - totalParticipations
          : null,
        isFull: fmpa.maxParticipants
          ? totalParticipations >= fmpa.maxParticipants
          : false,
      },
    });
  } catch (error) {
    console.error("Erreur GET /api/fmpa/[id]/stats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
