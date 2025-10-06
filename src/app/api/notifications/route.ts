import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { getUserNotifications } from "@/lib/notifications";

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

    const notifications = await getUserNotifications(session.user.id, {
      unreadOnly,
      limit,
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Erreur GET /api/notifications:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des notifications" },
      { status: 500 }
    );
  }
}
