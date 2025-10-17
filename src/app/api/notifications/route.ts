import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { NotificationService } from "@/lib/notification-service";

// GET /api/notifications - Liste des notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const types = searchParams.get("types")?.split(",");

    const result = await NotificationService.getUserNotifications(
      session.user.id,
      {
        unreadOnly,
        limit,
        offset,
        types: types as any,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur GET /api/notifications:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications/mark-all-read - Marquer toutes comme lues
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await NotificationService.markAllAsRead(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur POST /api/notifications:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des notifications" },
      { status: 500 }
    );
  }
}
