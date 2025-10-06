import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { createFMPASchema } from "@/lib/validations/fmpa";

// GET /api/fmpa - Liste des FMPA
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {
      tenantId: session.user.tenantId,
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [fmpas, total] = await Promise.all([
      prisma.fMPA.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              participations: true,
            },
          },
        },
        orderBy: {
          startDate: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.fMPA.count({ where }),
    ]);

    return NextResponse.json({
      fmpas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur GET /api/fmpa:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des FMPA" },
      { status: 500 }
    );
  }
}

// POST /api/fmpa - Créer une FMPA
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createFMPASchema.parse(body);

    // Générer un QR code unique
    const qrCode = `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const fmpa = await prisma.fMPA.create({
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        tenantId: session.user.tenantId,
        createdById: session.user.id,
        qrCode,
        status: "DRAFT",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(fmpa, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST /api/fmpa:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de la FMPA" },
      { status: 500 }
    );
  }
}
