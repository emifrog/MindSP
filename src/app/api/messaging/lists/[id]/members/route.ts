// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import getServerSession from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addMembersSchema = z.object({
  userIds: z.array(z.string()).min(1),
});

const removeMemberSchema = z.object({
  userId: z.string(),
});

// POST /api/messaging/lists/[id]/members - Ajouter des membres
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que la liste existe et est accessible
    const list = await prisma.mailingList.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
        type: "STATIC", // Seulement pour listes statiques
        createdById: session.user.id, // Seulement le créateur peut ajouter
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: "Liste non trouvée ou accès refusé" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = addMembersSchema.parse(body);

    // Vérifier que les utilisateurs existent et sont du même tenant
    const users = await prisma.user.findMany({
      where: {
        id: { in: data.userIds },
        tenantId: session.user.tenantId,
      },
    });

    if (users.length !== data.userIds.length) {
      return NextResponse.json(
        { error: "Certains utilisateurs n'existent pas" },
        { status: 400 }
      );
    }

    // Ajouter les membres (ignorer les doublons)
    const members = await Promise.all(
      data.userIds.map(async (userId) => {
        try {
          return await prisma.mailingListMember.create({
            data: {
              listId: params.id,
              userId,
              addedById: session.user.id,
            },
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
          });
        } catch (error) {
          // Ignorer si déjà membre (unique constraint)
          return null;
        }
      })
    );

    const addedMembers = members.filter((m) => m !== null);

    return NextResponse.json({
      added: addedMembers.length,
      members: addedMembers,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur POST /api/messaging/lists/[id]/members:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/messaging/lists/[id]/members - Retirer un membre
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que la liste existe et est accessible
    const list = await prisma.mailingList.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
        type: "STATIC",
        createdById: session.user.id,
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: "Liste non trouvée ou accès refusé" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = removeMemberSchema.parse(body);

    await prisma.mailingListMember.deleteMany({
      where: {
        listId: params.id,
        userId: data.userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur DELETE /api/messaging/lists/[id]/members:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
