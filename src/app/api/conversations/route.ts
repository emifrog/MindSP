import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/conversations - Liste des conversations
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        tenantId: session.user.tenantId,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Erreur GET /api/conversations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des conversations" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Créer une conversation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { type, name, memberIds } = body;

    // Validation
    if (!type || !memberIds || memberIds.length === 0) {
      return NextResponse.json(
        { error: "Type et membres requis" },
        { status: 400 }
      );
    }

    // Pour les conversations directes, vérifier qu'il n'y a que 2 membres
    if (type === "DIRECT" && memberIds.length !== 1) {
      return NextResponse.json(
        {
          error: "Une conversation directe nécessite exactement 1 autre membre",
        },
        { status: 400 }
      );
    }

    // Pour les conversations directes, vérifier si elle existe déjà
    if (type === "DIRECT") {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          tenantId: session.user.tenantId,
          type: "DIRECT",
          members: {
            every: {
              userId: {
                in: [session.user.id, memberIds[0]],
              },
            },
          },
        },
        include: {
          members: true,
        },
      });

      if (existingConversation && existingConversation.members.length === 2) {
        return NextResponse.json({ conversation: existingConversation });
      }
    }

    // Créer la conversation
    const conversation = await prisma.conversation.create({
      data: {
        tenantId: session.user.tenantId,
        type,
        name: type === "DIRECT" ? null : name,
        members: {
          create: [
            {
              userId: session.user.id,
              role: "OWNER",
            },
            ...memberIds.map((userId: string) => ({
              userId,
              role: "MEMBER" as const,
            })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/conversations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la conversation" },
      { status: 500 }
    );
  }
}
