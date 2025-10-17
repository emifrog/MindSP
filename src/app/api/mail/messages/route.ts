import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/lib/notification-service";

// POST /api/mail/messages - Envoyer un nouveau message
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const {
      subject,
      bodyContent,
      to,
      cc,
      bcc,
      isDraft,
      isImportant,
      attachments,
    } = body;

    // Validation
    if (!subject || !bodyContent) {
      return NextResponse.json(
        { error: "Sujet et contenu requis" },
        { status: 400 }
      );
    }

    if (!isDraft && (!to || to.length === 0)) {
      return NextResponse.json(
        { error: "Au moins un destinataire requis" },
        { status: 400 }
      );
    }

    // Créer le message
    const message = await prisma.mailMessage.create({
      data: {
        subject,
        body: bodyContent,
        fromId: session.user.id,
        tenantId: session.user.tenantId,
        isDraft: isDraft || false,
        isImportant: isImportant || false,
        recipients: {
          create: [
            // Destinataires TO
            ...(to || []).map((userId: string) => ({
              userId,
              type: "TO" as const,
              folder: "INBOX" as const,
            })),
            // Destinataires CC
            ...(cc || []).map((userId: string) => ({
              userId,
              type: "CC" as const,
              folder: "INBOX" as const,
            })),
            // Destinataires BCC
            ...(bcc || []).map((userId: string) => ({
              userId,
              type: "BCC" as const,
              folder: "INBOX" as const,
            })),
          ],
        },
        attachments: attachments
          ? {
              create: attachments,
            }
          : undefined,
      },
      include: {
        from: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
        recipients: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                email: true,
              },
            },
          },
        },
        attachments: true,
        _count: {
          select: {
            recipients: true,
            attachments: true,
          },
        },
      },
    });

    // Envoyer notifications aux destinataires (sauf si brouillon)
    if (!isDraft && message.recipients.length > 0) {
      const recipientIds = message.recipients.map((r) => r.userId);

      await NotificationService.notifyMailReceived(
        session.user.tenantId,
        message.id,
        session.user.id,
        `${message.from.firstName} ${message.from.lastName}`,
        subject,
        recipientIds,
        isImportant || false
      );
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/mail/messages:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
