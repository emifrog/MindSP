import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/chat/channels - Liste des canaux
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // PUBLIC, PRIVATE, DIRECT

    const where: any = {
      tenantId: session.user.tenantId,
      archivedAt: null,
    };

    if (type) {
      where.type = type;
    }

    // Récupérer les canaux dont l'utilisateur est membre
    const channels = await prisma.chatChannel.findMany({
      where: {
        ...where,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                presence: true,
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
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Calculer les messages non lus pour chaque canal
    const channelsWithUnread = await Promise.all(
      channels.map(async (channel) => {
        const membership = channel.members.find(
          (m) => m.userId === session.user.id
        );

        const unreadCount = membership?.lastReadAt
          ? await prisma.chatMessage.count({
              where: {
                channelId: channel.id,
                createdAt: {
                  gt: membership.lastReadAt,
                },
                userId: {
                  not: session.user.id,
                },
              },
            })
          : await prisma.chatMessage.count({
              where: {
                channelId: channel.id,
                userId: {
                  not: session.user.id,
                },
              },
            });

        return {
          ...channel,
          lastMessage: channel.messages[0] || null,
          unreadCount,
        };
      })
    );

    return NextResponse.json({ channels: channelsWithUnread });
  } catch (error) {
    console.error("Erreur GET /api/chat/channels:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des canaux" },
      { status: 500 }
    );
  }
}

// POST /api/chat/channels - Créer un canal
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type, icon, color, memberIds } = body;

    // Validation
    if (!name || !type) {
      return NextResponse.json(
        { error: "Nom et type requis" },
        { status: 400 }
      );
    }

    // Créer le canal
    const channel = await prisma.chatChannel.create({
      data: {
        name,
        description,
        type,
        icon,
        color,
        tenantId: session.user.tenantId,
        createdById: session.user.id,
        members: {
          create: [
            // Créateur comme OWNER
            {
              userId: session.user.id,
              role: "OWNER",
            },
            // Autres membres
            ...(memberIds || []).map((userId: string) => ({
              userId,
              role: "MEMBER" as const,
            })),
          ],
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    });

    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/chat/channels:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du canal" },
      { status: 500 }
    );
  }
}
