import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seeding...");

  // Nettoyer la base de données
  console.log("🧹 Nettoyage de la base de données...");
  await prisma.participation.deleteMany();
  await prisma.fMPA.deleteMany();
  await prisma.messageRead.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.formationRegistration.deleteMany();
  await prisma.formation.deleteMany();
  await prisma.eventParticipation.deleteMany();
  await prisma.event.deleteMany();
  await prisma.document.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Créer les tenants
  console.log("🏢 Création des tenants...");
  const tenant1 = await prisma.tenant.create({
    data: {
      slug: "sdis13",
      name: "SDIS des Bouches-du-Rhône",
      domain: "sdis13.mindsp.fr",
      status: "ACTIVE",
      primaryColor: "#1e40af",
      config: {
        features: {
          fmpa: true,
          messaging: true,
          formations: true,
          agenda: true,
        },
      },
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      slug: "sdis06",
      name: "SDIS des Alpes-Maritimes",
      domain: "sdis06.mindsp.fr",
      status: "ACTIVE",
      primaryColor: "#059669",
      config: {
        features: {
          fmpa: true,
          messaging: true,
          formations: true,
          agenda: true,
        },
      },
    },
  });

  console.log(`✅ Tenants créés: ${tenant1.name}, ${tenant2.name}`);

  // Hash du mot de passe par défaut
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Créer les utilisateurs pour SDIS13
  console.log("👥 Création des utilisateurs SDIS13...");
  const admin1 = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      email: "admin@sdis13.fr",
      passwordHash,
      firstName: "Jean",
      lastName: "Dupont",
      role: "ADMIN",
      status: "ACTIVE",
      badge: "ADM-001",
      permissions: ["all"],
    },
  });

  const manager1 = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      email: "manager@sdis13.fr",
      passwordHash,
      firstName: "Marie",
      lastName: "Martin",
      role: "MANAGER",
      status: "ACTIVE",
      badge: "MGR-001",
      permissions: ["fmpa.manage", "formations.manage"],
    },
  });

  const users1 = await Promise.all([
    prisma.user.create({
      data: {
        tenantId: tenant1.id,
        email: "pierre.bernard@sdis13.fr",
        passwordHash,
        firstName: "Pierre",
        lastName: "Bernard",
        role: "USER",
        status: "ACTIVE",
        badge: "SPV-001",
        permissions: ["fmpa.view", "formations.view"],
      },
    }),
    prisma.user.create({
      data: {
        tenantId: tenant1.id,
        email: "sophie.dubois@sdis13.fr",
        passwordHash,
        firstName: "Sophie",
        lastName: "Dubois",
        role: "USER",
        status: "ACTIVE",
        badge: "SPV-002",
        permissions: ["fmpa.view", "formations.view"],
      },
    }),
    prisma.user.create({
      data: {
        tenantId: tenant1.id,
        email: "luc.petit@sdis13.fr",
        passwordHash,
        firstName: "Luc",
        lastName: "Petit",
        role: "USER",
        status: "ACTIVE",
        badge: "SPV-003",
        permissions: ["fmpa.view"],
      },
    }),
  ]);

  // Créer les utilisateurs pour SDIS06
  console.log("👥 Création des utilisateurs SDIS06...");
  const admin2 = await prisma.user.create({
    data: {
      tenantId: tenant2.id,
      email: "admin@sdis06.fr",
      passwordHash,
      firstName: "Paul",
      lastName: "Moreau",
      role: "ADMIN",
      status: "ACTIVE",
      badge: "ADM-001",
      permissions: ["all"],
    },
  });

  const users2 = await Promise.all([
    prisma.user.create({
      data: {
        tenantId: tenant2.id,
        email: "claire.laurent@sdis06.fr",
        passwordHash,
        firstName: "Claire",
        lastName: "Laurent",
        role: "USER",
        status: "ACTIVE",
        badge: "SPV-001",
        permissions: ["fmpa.view", "formations.view"],
      },
    }),
    prisma.user.create({
      data: {
        tenantId: tenant2.id,
        email: "thomas.simon@sdis06.fr",
        passwordHash,
        firstName: "Thomas",
        lastName: "Simon",
        role: "USER",
        status: "ACTIVE",
        badge: "SPV-002",
        permissions: ["fmpa.view"],
      },
    }),
  ]);

  console.log(`✅ ${5 + 3} utilisateurs créés`);

  // Créer des FMPA pour SDIS13
  console.log("📅 Création des FMPA...");
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const fmpa1 = await prisma.fMPA.create({
    data: {
      tenantId: tenant1.id,
      type: "MANOEUVRE",
      title: "Manœuvre incendie - Feu de véhicule",
      description: "Exercice pratique sur feu de véhicule avec ARI",
      startDate: tomorrow,
      endDate: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000), // +3h
      location: "Centre de formation SDIS13",
      maxParticipants: 12,
      status: "PUBLISHED",
      createdById: admin1.id,
      qrCode: "FMPA-2025-001",
    },
  });

  const fmpa2 = await prisma.fMPA.create({
    data: {
      tenantId: tenant1.id,
      type: "FORMATION",
      title: "Formation premiers secours PSE1",
      description: "Formation initiale aux premiers secours en équipe niveau 1",
      startDate: nextWeek,
      endDate: new Date(nextWeek.getTime() + 35 * 60 * 60 * 1000), // +35h (5 jours)
      location: "Centre de formation SDIS13",
      maxParticipants: 10,
      requiresApproval: true,
      status: "PUBLISHED",
      createdById: manager1.id,
      qrCode: "FMPA-2025-002",
    },
  });

  const fmpa3 = await prisma.fMPA.create({
    data: {
      tenantId: tenant1.id,
      type: "PRESENCE_ACTIVE",
      title: "Présence active - Garde 24h",
      description: "Garde 24h au centre de secours principal",
      startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // +2 jours
      endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // +3 jours
      location: "CIS Marseille Centre",
      maxParticipants: 8,
      status: "PUBLISHED",
      createdById: admin1.id,
      qrCode: "FMPA-2025-003",
    },
  });

  // FMPA pour SDIS06
  const fmpa4 = await prisma.fMPA.create({
    data: {
      tenantId: tenant2.id,
      type: "MANOEUVRE",
      title: "Manœuvre sauvetage aquatique",
      description: "Exercice de sauvetage en milieu aquatique",
      startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(
        now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
      ),
      location: "Plage du Larvotto",
      maxParticipants: 15,
      status: "PUBLISHED",
      createdById: admin2.id,
      qrCode: "FMPA-2025-004",
    },
  });

  console.log(`✅ 4 FMPA créés`);

  // Créer des participations
  console.log("✍️ Création des participations...");
  await Promise.all([
    // Participations FMPA1
    prisma.participation.create({
      data: {
        fmpaId: fmpa1.id,
        userId: users1[0].id,
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    }),
    prisma.participation.create({
      data: {
        fmpaId: fmpa1.id,
        userId: users1[1].id,
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    }),
    prisma.participation.create({
      data: {
        fmpaId: fmpa1.id,
        userId: users1[2].id,
        status: "REGISTERED",
      },
    }),
    // Participations FMPA2
    prisma.participation.create({
      data: {
        fmpaId: fmpa2.id,
        userId: users1[0].id,
        status: "REGISTERED",
      },
    }),
    prisma.participation.create({
      data: {
        fmpaId: fmpa2.id,
        userId: users1[1].id,
        status: "REGISTERED",
      },
    }),
    // Participations FMPA3
    prisma.participation.create({
      data: {
        fmpaId: fmpa3.id,
        userId: manager1.id,
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    }),
    prisma.participation.create({
      data: {
        fmpaId: fmpa3.id,
        userId: users1[2].id,
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    }),
    // Participations FMPA4
    prisma.participation.create({
      data: {
        fmpaId: fmpa4.id,
        userId: users2[0].id,
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    }),
    prisma.participation.create({
      data: {
        fmpaId: fmpa4.id,
        userId: users2[1].id,
        status: "REGISTERED",
      },
    }),
  ]);

  console.log(`✅ 9 participations créées`);

  // Créer des formations
  console.log("🎓 Création des formations...");
  await prisma.formation.create({
    data: {
      tenantId: tenant1.id,
      code: "FOR-2025-001",
      title: "Formation Chef d'Agrès",
      description: "Formation pour devenir chef d'agrès tout engin",
      startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      location: "ENSOSP Aix-en-Provence",
      maxParticipants: 12,
      minParticipants: 6,
      price: 0,
      instructor: "Commandant Durand",
      status: "OPEN",
      createdById: admin1.id,
    },
  });

  console.log(`✅ Formations créées`);

  console.log("\n🎉 Seeding terminé avec succès !");
  console.log("\n📊 Résumé:");
  console.log(`   - 2 tenants (SDIS13, SDIS06)`);
  console.log(`   - 8 utilisateurs (2 admins, 1 manager, 5 users)`);
  console.log(`   - 4 FMPA`);
  console.log(`   - 9 participations`);
  console.log(`   - 1 formation`);
  console.log("\n🔐 Identifiants de connexion:");
  console.log(`   SDIS13 Admin: admin@sdis13.fr / Password123!`);
  console.log(`   SDIS06 Admin: admin@sdis06.fr / Password123!`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
