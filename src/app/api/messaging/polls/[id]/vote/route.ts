// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import getServerSession from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const voteSchema = z.object({
  optionIds: z.array(z.string()).min(1),
});

// POST /api/messaging/polls/[id]/vote - Voter à un sondage
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const data = voteSchema.parse(body);

    // Vérifier que le sondage existe
    const poll = await prisma.messagePoll.findUnique({
      where: { id: params.id },
      include: {
        options: true,
        message: {
          include: {
            from: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Sondage non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si le sondage est fermé
    if (
      poll.closed ||
      (poll.closesAt && new Date(poll.closesAt) < new Date())
    ) {
      return NextResponse.json(
        { error: "Le sondage est fermé" },
        { status: 400 }
      );
    }

    // Vérifier le choix multiple
    if (!poll.multipleChoice && data.optionIds.length > 1) {
      return NextResponse.json(
        { error: "Ce sondage n'autorise qu'une seule réponse" },
        { status: 400 }
      );
    }

    // Vérifier que toutes les options existent
    const validOptions = poll.options.map((o) => o.id);
    const invalidOptions = data.optionIds.filter(
      (id) => !validOptions.includes(id)
    );
    if (invalidOptions.length > 0) {
      return NextResponse.json({ error: "Options invalides" }, { status: 400 });
    }

    // Supprimer les anciennes réponses de l'utilisateur
    await prisma.pollResponse.deleteMany({
      where: {
        userId: session.user.id,
        option: {
          pollId: params.id,
        },
      },
    });

    // Créer les nouvelles réponses
    const responses = await Promise.all(
      data.optionIds.map((optionId) =>
        prisma.pollResponse.create({
          data: {
            optionId,
            userId: session.user.id,
          },
        })
      )
    );

    // Créer une notification pour l'organisateur (sauf si anonyme)
    if (!poll.anonymous) {
      await prisma.notification.create({
        data: {
          userId: poll.message.from.id,
          tenantId: session.user.tenantId,
          type: "POLL_RESPONSE",
          title: `Nouvelle réponse - ${poll.question}`,
          message: `${session.user.firstName} ${session.user.lastName} a répondu au sondage`,
          linkUrl: `/messaging/polls/${params.id}`,
          priority: "LOW",
        },
      });
    }

    return NextResponse.json({ responses, count: responses.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur POST /api/messaging/polls/[id]/vote:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// GET /api/messaging/polls/[id]/results - Obtenir les résultats
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const poll = await prisma.messagePoll.findUnique({
      where: { id: params.id },
      include: {
        options: {
          include: {
            responses: {
              include: poll.anonymous
                ? {}
                : {
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
          },
        },
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Sondage non trouvé" },
        { status: 404 }
      );
    }

    const results = poll.options.map((option) => ({
      id: option.id,
      text: option.text,
      count: option.responses.length,
      responses: poll.anonymous
        ? []
        : option.responses.map((r) => ({
            user: r.user,
            respondedAt: r.respondedAt,
          })),
    }));

    const totalVotes = results.reduce((sum, r) => sum + r.count, 0);

    return NextResponse.json({
      poll: {
        id: poll.id,
        question: poll.question,
        description: poll.description,
        multipleChoice: poll.multipleChoice,
        anonymous: poll.anonymous,
        closed: poll.closed,
        closesAt: poll.closesAt,
      },
      results,
      totalVotes,
    });
  } catch (error) {
    console.error("Erreur GET /api/messaging/polls/[id]/results:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
