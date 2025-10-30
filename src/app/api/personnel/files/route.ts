// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import getServerSession from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createFileSchema = z.object({
  userId: z.string(),
  engagementDate: z.string(),
  reengagementDate: z.string().optional(),
  currentGrade: z.string(),
  gradeDate: z.string(),
});

// GET /api/personnel/files - Liste des fiches personnel
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Si userId spécifié, retourner une fiche spécifique
    if (userId) {
      const file = await prisma.personnelFile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              badge: true,
              avatar: true,
              role: true,
            },
          },
          medicalStatus: true,
          qualifications: {
            orderBy: { validUntil: "asc" },
          },
          equipments: {
            where: { status: "ASSIGNED" },
            orderBy: { assignedDate: "desc" },
          },
          gradeHistory: {
            orderBy: { effectiveDate: "desc" },
          },
          medals: {
            orderBy: { awardDate: "desc" },
          },
        },
      });

      return NextResponse.json({ file });
    }

    // Sinon, retourner toutes les fiches (admin/manager only)
    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const files = await prisma.personnelFile.findMany({
      where: { tenantId: session.user.tenantId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            badge: true,
            avatar: true,
            role: true,
            status: true,
          },
        },
        medicalStatus: true,
        _count: {
          select: {
            qualifications: true,
            equipments: true,
            medals: true,
          },
        },
      },
      orderBy: { user: { lastName: "asc" } },
    });

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Erreur GET /api/personnel/files:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/personnel/files - Créer une fiche personnel
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const data = createFileSchema.parse(body);

    // Vérifier que l'utilisateur n'a pas déjà une fiche
    const existing = await prisma.personnelFile.findUnique({
      where: { userId: data.userId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Une fiche existe déjà pour cet utilisateur" },
        { status: 400 }
      );
    }

    const file = await prisma.personnelFile.create({
      data: {
        userId: data.userId,
        tenantId: session.user.tenantId,
        engagementDate: new Date(data.engagementDate),
        reengagementDate: data.reengagementDate
          ? new Date(data.reengagementDate)
          : null,
        currentGrade: data.currentGrade,
        gradeDate: new Date(data.gradeDate),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            badge: true,
          },
        },
      },
    });

    return NextResponse.json({ file }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur POST /api/personnel/files:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
