import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/news - Liste des actualités
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const portalId = searchParams.get("portalId");
    const published = searchParams.get("published");

    const where: any = {
      tenantId: session.user.tenantId,
    };

    if (category) {
      where.category = category;
    }

    if (portalId) {
      where.portalId = portalId;
    }

    if (published === "true") {
      where.isPublished = true;
    }

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          portal: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.newsArticle.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur GET /api/news:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des actualités" },
      { status: 500 }
    );
  }
}

// POST /api/news - Créer une actualité
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      images,
      category,
      tags,
      portalId,
      isPublished,
      isPinned,
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Titre, slug et contenu requis" },
        { status: 400 }
      );
    }

    const article = await prisma.newsArticle.create({
      data: {
        tenantId: session.user.tenantId,
        authorId: session.user.id,
        title,
        slug,
        content,
        excerpt,
        coverImage,
        images,
        category: category || "GENERAL",
        tags: tags || [],
        portalId,
        isPublished: isPublished ?? false,
        isPinned: isPinned ?? false,
        publishedAt: isPublished ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST /api/news:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Une actualité avec ce slug existe déjà" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de l'actualité" },
      { status: 500 }
    );
  }
}
