import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// DELETE /api/tta/entries/[id] - Supprimer une entrée
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const entry = await prisma.tTAEntry.findUnique({
      where: { id: params.id },
    });

    if (!entry || entry.tenantId !== session.user.tenantId) {
      return NextResponse.json(
        { error: "Entrée introuvable" },
        { status: 404 }
      );
    }

    // Vérifier les permissions (propriétaire ou admin)
    if (
      entry.userId !== session.user.id &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { error: "Permissions insuffisantes" },
        { status: 403 }
      );
    }

    // Ne peut supprimer que si en attente
    if (entry.status !== "PENDING") {
      return NextResponse.json(
        { error: "Impossible de supprimer une entrée validée ou exportée" },
        { status: 400 }
      );
    }

    await prisma.tTAEntry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/tta/entries/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
