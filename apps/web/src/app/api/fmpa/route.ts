import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db/prisma';
import { verifyAuth } from '../../../lib/auth';
import { z } from 'zod';

const createFMPASchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  type: z.enum(['FORMATION', 'MANOEUVRE', 'REUNION', 'GARDE', 'INTERVENTION', 'CEREMONIE', 'SPORT', 'AUTRE']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string(),
  address: z.string().optional(),
  maxParticipants: z.number().optional(),
  requiresValidation: z.boolean().default(false),
  allowExternal: z.boolean().default(false),
});

// GET /api/fmpa
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: any = {
      tenantId: auth.tenantId,
    };

    if (type) where.type = type;
    if (status) where.status = status;

    const [fmpas, total] = await Promise.all([
      prisma.fMPA.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startDate: 'desc' },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: { participants: true },
          },
        },
      }),
      prisma.fMPA.count({ where }),
    ]);

    return NextResponse.json({
      data: fmpas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get FMPA error:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/fmpa
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const data = createFMPASchema.parse(body);

    // Generate QR code
    const qrCode = `FMPA-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const fmpa = await prisma.fMPA.create({
      data: {
        ...data,
        tenantId: auth.tenantId,
        createdBy: auth.userId,
        qrCode,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
      include: {
        organizer: true,
      },
    });

    return NextResponse.json(fmpa, { status: 201 });
  } catch (error) {
    console.error('Create FMPA error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}