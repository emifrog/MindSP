// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import getServerSession from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/messaging/directory - Annuaire RH avec recherche intelligente
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const onlyFavorites = searchParams.get("favorites") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {
      tenantId: session.user.tenantId,
      status: "ACTIVE",
      id: { not: session.user.id }, // Exclure l'utilisateur actuel
    };

    // Recherche intelligente (nom, email, badge)
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { badge: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filtre par rôle
    if (role) {
      where.role = role;
    }

    let users;

    if (onlyFavorites) {
      // Récupérer uniquement les favoris
      const favorites = await prisma.userFavorite.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          favorite: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              badge: true,
              role: true,
              phone: true,
            },
          },
        },
        take: limit,
      });

      users = favorites.map((f) => ({
        ...f.favorite,
        isFavorite: true,
      }));
    } else {
      // Récupérer tous les utilisateurs
      users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          badge: true,
          role: true,
          phone: true,
        },
        take: limit,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      });

      // Ajouter le statut favori
      const favoriteIds = await prisma.userFavorite.findMany({
        where: {
          userId: session.user.id,
          favoriteId: { in: users.map((u) => u.id) },
        },
        select: {
          favoriteId: true,
        },
      });

      const favoriteSet = new Set(favoriteIds.map((f) => f.favoriteId));

      users = users.map((user) => ({
        ...user,
        isFavorite: favoriteSet.has(user.id),
      }));
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Erreur GET /api/messaging/directory:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
