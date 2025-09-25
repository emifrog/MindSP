import { PrismaClient, UserRole, FMPAType, FMPAStatus, ParticipationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, addHours, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Nettoyer la base de données
  await cleanDatabase();

  // Créer les tenants
  const tenants = await createTenants();

  // Créer les utilisateurs
  const users = await createUsers(tenants);

  // Créer les FMPA
  const fmpas = await createFMPAs(tenants[0], users.sdis77);

  // Créer les participations
  await createParticipations(fmpas, users.sdis77);

  // Créer les conversations et messages
  await createConversations(tenants[0], users.sdis77);

  // Créer les notifications
  await createNotifications(users.sdis77);

  console.log('✅ Seeding terminé avec succès !');
}

async function cleanDatabase() {
  console.log('🧹 Nettoyage de la base de données...');
  
  // Supprimer dans l'ordre des dépendances
  await prisma.messageRead.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.fMPAParticipation.deleteMany();
  await prisma.fMPA.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.tenant.deleteMany();
}

async function createTenants() {
  console.log('🏢 Création des tenants...');

  const tenants = await Promise.all([
    prisma.tenant.create({
      data: {
        name: 'SDIS 77 - Seine-et-Marne',
        slug: 'sdis77',
        subdomain: 'sdis77',
        features: ['FMPA', 'MESSAGING', 'AGENDA', 'FORMATIONS'],
        maxUsers: 500,
        maxStorage: 10000,
        settings: {
          primaryColor: '#DC143C',
          logo: '/logos/sdis77.png',
          timezone: 'Europe/Paris',
          emailDomain: 'sdis77.fr',
        },
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'SDIS 91 - Essonne',
        slug: 'sdis91',
        subdomain: 'sdis91',
        features: ['FMPA', 'MESSAGING', 'AGENDA'],
        maxUsers: 300,
        maxStorage: 5000,
        settings: {
          primaryColor: '#FF4500',
          logo: '/logos/sdis91.png',
          timezone: 'Europe/Paris',
          emailDomain: 'sdis91.fr',
        },
      },
    }),
  ]);

  // Créer les subscriptions
  for (const tenant of tenants) {
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        plan: 'PROFESSIONAL',
        status: 'ACTIVE',
        currentPeriodEnd: addDays(new Date(), 30),
      },
    });
  }

  console.log(`  ✓ ${tenants.length} tenants créés`);
  return tenants;
}

async function createUsers(tenants: any[]) {
  console.log('👥 Création des utilisateurs...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);
  
  const users = {
    sdis77: [] as any[],
    sdis91: [] as any[],
  };

  // Utilisateurs SDIS 77
  const sdis77Users = [
    {
      email: 'admin@sdis77.fr',
      firstName: 'Jean',
      lastName: 'Dupont',
      role: UserRole.ADMIN,
      permissions: ['*'],
      phone: '0160123456',
    },
    {
      email: 'chef@sdis77.fr',
      firstName: 'Marie',
      lastName: 'Martin',
      role: UserRole.MANAGER,
      permissions: ['VIEW_DASHBOARD', 'MANAGE_FMPA', 'MANAGE_PERSONNEL'],
      phone: '0160123457',
    },
    {
      email: 'pompier1@sdis77.fr',
      firstName: 'Pierre',
      lastName: 'Bernard',
      role: UserRole.USER,
      permissions: ['VIEW_DASHBOARD', 'VIEW_FMPA', 'VIEW_MESSAGES'],
      phone: '0160123458',
    },
    {
      email: 'pompier2@sdis77.fr',
      firstName: 'Sophie',
      lastName: 'Dubois',
      role: UserRole.USER,
      permissions: ['VIEW_DASHBOARD', 'VIEW_FMPA', 'VIEW_MESSAGES'],
      phone: '0160123459',
    },
    {
      email: 'pompier3@sdis77.fr',
      firstName: 'Lucas',
      lastName: 'Moreau',
      role: UserRole.USER,
      permissions: ['VIEW_DASHBOARD', 'VIEW_FMPA', 'VIEW_MESSAGES'],
      phone: '0160123460',
    },
    {
      email: 'formateur@sdis77.fr',
      firstName: 'Thomas',
      lastName: 'Petit',
      role: UserRole.MANAGER,
      permissions: ['VIEW_DASHBOARD', 'MANAGE_FMPA', 'MANAGE_FORMATIONS'],
      phone: '0160123461',
    },
  ];

  for (const userData of sdis77Users) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        tenantId: tenants[0].id,
        emailVerified: new Date(),
        lastLoginAt: subDays(new Date(), Math.floor(Math.random() * 7)),
      },
    });
    users.sdis77.push(user);
  }

  // Utilisateurs SDIS 91
  const sdis91Users = [
    {
      email: 'admin@sdis91.fr',
      firstName: 'Paul',
      lastName: 'Durand',
      role: UserRole.ADMIN,
      permissions: ['*'],
      phone: '0169123456',
    },
    {
      email: 'pompier@sdis91.fr',
      firstName: 'Julie',
      lastName: 'Rousseau',
      role: UserRole.USER,
      permissions: ['VIEW_DASHBOARD', 'VIEW_FMPA', 'VIEW_MESSAGES'],
      phone: '0169123457',
    },
  ];

  for (const userData of sdis91Users) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        tenantId: tenants[1].id,
        emailVerified: new Date(),
      },
    });
    users.sdis91.push(user);
  }

  console.log(`  ✓ ${users.sdis77.length + users.sdis91.length} utilisateurs créés`);
  return users;
}

async function createFMPAs(tenant: any, users: any[]) {
  console.log('📅 Création des FMPA...');

  const admin = users.find(u => u.role === UserRole.ADMIN);
  const manager = users.find(u => u.role === UserRole.MANAGER);

  const fmpas = await Promise.all([
    // FMPA passées
    prisma.fMPA.create({
      data: {
        tenantId: tenant.id,
        title: 'Formation Incendie Niveau 1',
        description: 'Formation de base sur les techniques d\'extinction et la sécurité incendie',
        type: FMPAType.FORMATION,
        status: FMPAStatus.COMPLETED,
        startDate: subDays(new Date(), 7),
        endDate: subDays(new Date(), 7),
        location: 'Centre de Formation Principal',
        address: '123 rue de la Caserne, 77000 Melun',
        maxParticipants: 20,
        requiresValidation: false,
        createdBy: admin.id,
        qrCode: `FMPA-${Date.now()}-001`,
      },
    }),

    // FMPA en cours
    prisma.fMPA.create({
      data: {
        tenantId: tenant.id,
        title: 'Manœuvre mensuelle - Janvier',
        description: 'Exercice pratique avec mise en situation réelle d\'intervention',
        type: FMPAType.MANOEUVRE,
        status: FMPAStatus.IN_PROGRESS,
        startDate: new Date(),
        endDate: addHours(new Date(), 4),
        location: 'Caserne Centrale',
        address: '456 avenue des Pompiers, 77100 Meaux',
        maxParticipants: 30,
        requiresValidation: true,
        createdBy: manager.id,
        qrCode: `FMPA-${Date.now()}-002`,
      },
    }),

    // FMPA futures
    prisma.fMPA.create({
      data: {
        tenantId: tenant.id,
        title: 'Formation PSE2 - Premiers Secours en Équipe',
        description: 'Formation avancée aux premiers secours en équipe niveau 2',
        type: FMPAType.FORMATION,
        status: FMPAStatus.PUBLISHED,
        startDate: addDays(new Date(), 3),
        endDate: addDays(new Date(), 5),
        location: 'Centre de Formation',
        address: '789 rue de la Formation, 77300 Fontainebleau',
        maxParticipants: 16,
        requiresValidation: true,
        allowExternal: false,
        createdBy: manager.id,
        qrCode: `FMPA-${Date.now()}-003`,
      },
    }),

    prisma.fMPA.create({
      data: {
        tenantId: tenant.id,
        title: 'Garde de nuit',
        description: 'Service de garde nocturne',
        type: FMPAType.GARDE,
        status: FMPAStatus.PUBLISHED,
        startDate: addDays(new Date(), 1),
        endDate: addDays(new Date(), 2),
        location: 'Caserne Sud',
        address: '321 boulevard du Sud, 77200 Torcy',
        maxParticipants: 8,
        requiresValidation: false,
        createdBy: admin.id,
        qrCode: `FMPA-${Date.now()}-004`,
      },
    }),

    prisma.fMPA.create({
      data: {
        tenantId: tenant.id,
        title: 'Cérémonie du 14 Juillet',
        description: 'Participation au défilé et cérémonie officielle',
        type: FMPAType.CEREMONIE,
        status: FMPAStatus.DRAFT,
        startDate: addDays(new Date(), 200),
        endDate: addDays(new Date(), 200),
        location: 'Place de la République',
        address: 'Place de la République, 77000 Melun',
        requiresValidation: true,
        createdBy: admin.id,
        qrCode: `FMPA-${Date.now()}-005`,
      },
    }),

    prisma.fMPA.create({
      data: {
        tenantId: tenant.id,
        title: 'Entraînement Sportif Hebdomadaire',
        description: 'Session d\'entraînement physique et parcours sportif',
        type: FMPAType.SPORT,
        status: FMPAStatus.PUBLISHED,
        startDate: addDays(new Date(), 2),
        endDate: addDays(new Date(), 2),
        location: 'Gymnase Municipal',
        address: '555 rue du Sport, 77400 Lagny',
        maxParticipants: 25,
        requiresValidation: false,
        createdBy: manager.id,
        qrCode: `FMPA-${Date.now()}-006`,
      },
    }),
  ]);

  console.log(`  ✓ ${fmpas.length} FMPA créées`);
  return fmpas;
}

async function createParticipations(fmpas: any[], users: any[]) {
  console.log('✋ Création des participations...');

  const participations = [];

  // Ajouter des participations pour les FMPA
  for (const fmpa of fmpas) {
    // Ne pas créer de participations pour les brouillons
    if (fmpa.status === FMPAStatus.DRAFT) continue;

    // Sélectionner des utilisateurs aléatoires
    const participantCount = Math.min(
      Math.floor(Math.random() * 5) + 3,
      users.length
    );
    
    const selectedUsers = [...users]
      .sort(() => Math.random() - 0.5)
      .slice(0, participantCount);

    for (const user of selectedUsers) {
      let status: ParticipationStatus = ParticipationStatus.APPROVED;
      let checkedInAt = null;
      let checkedOutAt = null;

      // Pour les FMPA terminées, marquer comme présent/absent
      if (fmpa.status === FMPAStatus.COMPLETED) {
        const isPresent = Math.random() > 0.2; // 80% de présence
        status = isPresent ? ParticipationStatus.PRESENT : ParticipationStatus.ABSENT;
        if (isPresent) {
          checkedInAt = fmpa.startDate;
          checkedOutAt = fmpa.endDate;
        }
      } else if (fmpa.status === FMPAStatus.IN_PROGRESS) {
        // Pour les FMPA en cours, certains sont déjà checkés
        if (Math.random() > 0.5) {
          checkedInAt = fmpa.startDate;
          status = ParticipationStatus.PRESENT;
        }
      } else {
        // Pour les FMPA futures, mélange de statuts
        const rand = Math.random();
        if (rand < 0.1) {
          status = ParticipationStatus.PENDING;
        } else if (rand < 0.15) {
          status = ParticipationStatus.REJECTED;
        }
      }

      const participation = await prisma.fMPAParticipation.create({
        data: {
          fmpaId: fmpa.id,
          userId: user.id,
          status,
          validatedBy: status === ParticipationStatus.APPROVED ? users[0].id : null,
          validatedAt: status === ParticipationStatus.APPROVED ? subDays(new Date(), 1) : null,
          checkedInAt,
          checkedOutAt,
        },
      });
      participations.push(participation);
    }
  }

  console.log(`  ✓ ${participations.length} participations créées`);
  return participations;
}

async function createConversations(tenant: any, users: any[]) {
  console.log('💬 Création des conversations...');

  // Conversation de groupe
  const groupConversation = await prisma.conversation.create({
    data: {
      tenantId: tenant.id,
      type: 'GROUP',
      name: 'Équipe Alpha',
      lastMessageAt: new Date(),
    },
  });

  // Ajouter les membres
  for (const user of users.slice(0, 4)) {
    await prisma.conversationMember.create({
      data: {
        conversationId: groupConversation.id,
        userId: user.id,
        role: user.role === UserRole.ADMIN ? 'ADMIN' : 'MEMBER',
      },
    });
  }

  // Créer quelques messages
  const messages = [
    { content: 'Bonjour l\'équipe !', senderId: users[0].id },
    { content: 'Salut, prêt pour la manœuvre de demain ?', senderId: users[1].id },
    { content: 'Oui, j\'ai préparé tout le matériel', senderId: users[2].id },
    { content: 'Parfait, RDV à 9h à la caserne', senderId: users[0].id },
    { content: 'N\'oubliez pas vos EPI complets', senderId: users[1].id },
  ];

  for (const [index, messageData] of messages.entries()) {
    const message = await prisma.message.create({
      data: {
        conversationId: groupConversation.id,
        ...messageData,
        type: 'TEXT',
        createdAt: subDays(new Date(), messages.length - index),
      },
    });

    // Marquer comme lu pour certains utilisateurs
    for (const user of users.slice(0, Math.floor(Math.random() * 3) + 1)) {
      if (user.id !== messageData.senderId) {
        await prisma.messageRead.create({
          data: {
            messageId: message.id,
            userId: user.id,
          },
        });
      }
    }
  }

  // Conversation directe
  const directConversation = await prisma.conversation.create({
    data: {
      tenantId: tenant.id,
      type: 'DIRECT',
      lastMessageAt: subDays(new Date(), 1),
    },
  });

  await prisma.conversationMember.create({
    data: {
      conversationId: directConversation.id,
      userId: users[0].id,
      role: 'MEMBER',
    },
  });

  await prisma.conversationMember.create({
    data: {
      conversationId: directConversation.id,
      userId: users[1].id,
      role: 'MEMBER',
    },
  });

  await prisma.message.create({
    data: {
      conversationId: directConversation.id,
      senderId: users[1].id,
      content: 'Tu as les planning de la semaine prochaine ?',
      type: 'TEXT',
    },
  });

  console.log('  ✓ Conversations et messages créés');
}

async function createNotifications(users: any[]) {
  console.log('🔔 Création des notifications...');

  const notifications = [];

  for (const user of users.slice(0, 3)) {
    // Notification non lue
    notifications.push(
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'FMPA_INVITATION',
          title: 'Nouvelle invitation FMPA',
          message: 'Vous êtes invité à participer à la Formation PSE2',
          actionUrl: '/dashboard/fmpa/3',
          data: { fmpaId: '3' },
        },
      })
    );

    // Notification lue
    notifications.push(
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'FMPA_REMINDER',
          title: 'Rappel: Manœuvre demain',
          message: 'N\'oubliez pas la manœuvre mensuelle demain à 9h',
          actionUrl: '/dashboard/fmpa/2',
          data: { fmpaId: '2' },
          readAt: subDays(new Date(), 1),
        },
      })
    );

    if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
      notifications.push(
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'SYSTEM_UPDATE',
            title: 'Mise à jour système',
            message: 'Une nouvelle version de MindSP est disponible',
            readAt: subDays(new Date(), 2),
          },
        })
      );
    }
  }

  console.log(`  ✓ ${notifications.length} notifications créées`);
  return notifications;
}

// Exécuter le seed
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erreur lors du seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
