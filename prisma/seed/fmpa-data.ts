import { PrismaClient, FMPAType, FMPAStatus } from "@prisma/client";

/**
 * Seed des FMPA (Formations, Manœuvres, Présence Active)
 * 30 FMPA réalistes pour pompiers
 */
export async function seedFMPA(
  prisma: PrismaClient,
  tenantId: string,
  createdById: string
) {
  console.log("🔥 Création des FMPA...");

  const fmpaData = [
    // ============================================
    // 🎓 FORMATIONS (15)
    // ============================================
    {
      type: FMPAType.FORMATION,
      title: "Formation PSE1 - Session Automne 2025",
      description:
        "Formation initiale aux premiers secours en équipe. Acquisition des compétences nécessaires pour intervenir en tant que équipier secouriste. Programme : RCP, défibrillation, hémorragies, traumatismes, malaises.",
      location: "Centre de formation SDIS - Salle 3",
      startDate: new Date("2025-11-15T08:00:00Z"),
      endDate: new Date("2025-11-19T17:00:00Z"),
      maxParticipants: 12,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.FORMATION,
      title: "Formation PSE2 - Équipier Secouriste",
      description:
        "Formation avancée aux premiers secours. Techniques d'immobilisation, relevage, brancardage. Gestion des détresses vitales, traumatismes complexes. Prérequis : PSE1 à jour.",
      location: "Centre de formation SDIS - Plateau technique",
      startDate: new Date("2025-12-01T08:00:00Z"),
      endDate: new Date("2025-12-05T17:00:00Z"),
      maxParticipants: 10,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.FORMATION,
      title: "Recyclage PSE1/PSE2 - Maintien des acquis",
      description:
        "Formation continue obligatoire pour le maintien des compétences de secouriste. Révision des gestes essentiels, mise à jour des protocoles, cas pratiques.",
      location: "CIS Principal",
      startDate: new Date("2025-10-20T09:00:00Z"),
      endDate: new Date("2025-10-20T17:00:00Z"),
      maxParticipants: 15,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.FORMATION,
      title: "Formation Chef d'Agrès Tout Engin",
      description:
        "Formation au commandement d'un engin de secours. Techniques de commandement, procédures opérationnelles, gestion d'équipe, radio, cartographie. Module théorique et pratique.",
      location: "Centre de formation départemental",
      startDate: new Date("2025-11-08T08:30:00Z"),
      endDate: new Date("2025-11-12T17:00:00Z"),
      maxParticipants: 8,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.FORMATION,
      title: "FDF - Formation de base Incendie",
      description:
        "Formation initiale à la lutte contre l'incendie. Technique de lance, reconnaissance, sauvetage, établissement des lignes. Port de l'ARI. Certification FDF1.",
      location: "Terrain de manœuvre - Zone feu",
      startDate: new Date("2025-10-25T08:00:00Z"),
      endDate: new Date("2025-10-27T17:00:00Z"),
      maxParticipants: 10,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.FORMATION,
      title: "Conduite de VSAV et CCFM",
      description:
        "Formation à la conduite d'engins de secours. Code de la route spécifique, conduite d'urgence, utilisation des avertisseurs, maniabilité, sécurité routière.",
      location: "Piste de manœuvre + voies publiques",
      startDate: new Date("2025-11-18T08:00:00Z"),
      endDate: new Date("2025-11-20T17:00:00Z"),
      maxParticipants: 6,
      status: FMPAStatus.DRAFT,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.FORMATION,
      title: "Formation Plongée SAV - Niveau 1",
      description:
        "Formation initiale à la plongée en sauvetage aquatique et submersion. Techniques de plongée en eaux troubles, sécurité, matériel, procédures d'intervention.",
      location: "Piscine municipale + Plan d'eau",
      startDate: new Date("2025-12-10T08:00:00Z"),
      endDate: new Date("2025-12-14T17:00:00Z"),
      maxParticipants: 6,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.FORMATION,
      title: "Formation Risques Chimiques et Radiologiques",
      description:
        "Reconnaissance et gestion des risques NRBC. Port de la tenue étanche, détection, décontamination, zonage, procédures d'urgence. Habilitation RCH1.",
      location: "Site NRBC départemental",
      startDate: new Date("2025-11-22T08:00:00Z"),
      endDate: new Date("2025-11-24T17:00:00Z"),
      maxParticipants: 8,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.FORMATION,
      title: "Formation SAV - Sauvetage Déblaiement",
      description:
        "Techniques de sauvetage en milieu urbain. Étayage, déblaiement, recherche de victimes, cynotechnie, matériel hydraulique et pneumatique.",
      location: "Zone d'effondrement simulé",
      startDate: new Date("2025-12-05T08:00:00Z"),
      endDate: new Date("2025-12-07T17:00:00Z"),
      maxParticipants: 10,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.FORMATION,
      title: "Formation FDF - Feux de Forêts",
      description:
        "Lutte contre les feux de végétation et de forêt. Tactique, utilisation du CCF, création de points d'eau, coordination, sécurité en milieu naturel.",
      location: "Massif forestier départemental",
      startDate: new Date("2025-10-28T08:00:00Z"),
      endDate: new Date("2025-10-30T17:00:00Z"),
      maxParticipants: 12,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.FORMATION,
      title: "Formation VOP - Ventilation Opérationnelle",
      description:
        "Techniques de ventilation dans le cadre d'interventions incendie. Surpression, extraction, désenfumage, stratégie d'attaque, sécurité.",
      location: "Maison à feu départementale",
      startDate: new Date("2025-11-25T09:00:00Z"),
      endDate: new Date("2025-11-25T17:00:00Z"),
      maxParticipants: 8,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.FORMATION,
      title: "Formation IMP - Sauvetage en Hauteur",
      description:
        "Techniques de sauvetage en hauteur et en milieu vertical. Corde, harnais, mouflage, points d'ancrage, sauvetage sur pylône et falaise.",
      location: "Tour d'entraînement + site naturel",
      startDate: new Date("2025-12-15T08:00:00Z"),
      endDate: new Date("2025-12-19T17:00:00Z"),
      maxParticipants: 6,
      status: FMPAStatus.DRAFT,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.FORMATION,
      title: "Formation Maître-Chien de Recherche",
      description:
        "Formation à la recherche de victimes avec chien. Dressage, techniques de recherche, communication avec l'animal, procédures opérationnelles.",
      location: "Centre cynotechnique régional",
      startDate: new Date("2025-11-10T08:00:00Z"),
      endDate: new Date("2025-11-14T17:00:00Z"),
      maxParticipants: 4,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.FORMATION,
      title: "Formation Radio et Transmissions",
      description:
        "Utilisation des moyens de communication radio. Procédures ANTARES, codes, phonétique, gestion des communications en intervention.",
      location: "Salle informatique CIS",
      startDate: new Date("2025-10-22T09:00:00Z"),
      endDate: new Date("2025-10-22T17:00:00Z"),
      maxParticipants: 12,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.FORMATION,
      title: "Formation de Formateur - Module 1",
      description:
        "Devenir formateur SDIS. Pédagogie, conception de séquences, animation de groupes, évaluation, outils numériques pédagogiques.",
      location: "Centre de formation SDIS",
      startDate: new Date("2025-12-08T08:30:00Z"),
      endDate: new Date("2025-12-12T17:00:00Z"),
      maxParticipants: 10,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },

    // ============================================
    // 🔥 MANOEUVRES (10)
    // ============================================
    {
      type: FMPAType.MANOEUVRE,
      title: "Manœuvre Incendie Appartement",
      description:
        "Exercice d'intervention sur feu d'habitation. Reconnaissance, établissement des lances, ventilation, sauvetage, extincteurs. Mise en situation réaliste.",
      location: "Maison à feu - Centre de formation",
      startDate: new Date("2025-10-10T14:00:00Z"),
      endDate: new Date("2025-10-10T18:00:00Z"),
      maxParticipants: 15,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.MANOEUVRE,
      title: "Exercice Sauvetage en Milieu Aquatique",
      description:
        "Simulation de noyade avec victime en mer. Utilisation du bateau, plongée, premiers secours, coordination équipes terrestres et nautiques.",
      location: "Plage du Prado",
      startDate: new Date("2025-10-15T09:00:00Z"),
      endDate: new Date("2025-10-15T12:00:00Z"),
      maxParticipants: 12,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.MANOEUVRE,
      title: "Manœuvre Désincarcération VL",
      description:
        "Exercice d'extraction de victimes suite à AVP. Utilisation du matériel hydraulique, découpe, dégagement, techniques de relevage.",
      location: "Zone technique - Parking CIS",
      startDate: new Date("2025-10-18T14:00:00Z"),
      endDate: new Date("2025-10-18T17:00:00Z"),
      maxParticipants: 10,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.MANOEUVRE,
      title: "Exercice Grande Échelle - Feu de Forêt",
      description:
        "Simulation d'un feu de végétation avec plusieurs moyens engagés. Coordination CCF, points d'eau, tactique d'attaque, sécurité du personnel.",
      location: "Massif de l'Étoile",
      startDate: new Date("2025-10-25T08:00:00Z"),
      endDate: new Date("2025-10-25T16:00:00Z"),
      maxParticipants: 25,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.MANOEUVRE,
      title: "Exercice IMP - Sauvetage sur Pylône",
      description:
        "Mise en situation de sauvetage d'une victime coincée en hauteur. Montage de cordes, mouflage, descente sécurisée.",
      location: "Tour d'entraînement 30m",
      startDate: new Date("2025-10-20T13:00:00Z"),
      endDate: new Date("2025-10-20T17:00:00Z"),
      maxParticipants: 8,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.MANOEUVRE,
      title: "Exercice Risque Chimique - Fuite de Gaz",
      description:
        "Simulation d'une fuite de matière dangereuse. Reconnaissance, zonage, décontamination, évacuation, coordination avec cellule mobile.",
      location: "Zone industrielle - Site désaffecté",
      startDate: new Date("2025-11-05T09:00:00Z"),
      endDate: new Date("2025-11-05T16:00:00Z"),
      maxParticipants: 20,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.MANOEUVRE,
      title: "Manœuvre SR - Accident Multi-Véhicules",
      description:
        "Exercice complexe avec 3 véhicules et 5 victimes. Triage, désincarcération, coordination VSAV, balisage, gestion de crise.",
      location: "Autoroute A7 - Section neutralisée",
      startDate: new Date("2025-11-12T06:00:00Z"),
      endDate: new Date("2025-11-12T10:00:00Z"),
      maxParticipants: 18,
      status: FMPAStatus.DRAFT,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.MANOEUVRE,
      title: "Exercice SAP Complexe - Victime Barricadée",
      description:
        "Simulation d'intervention SAP avec victime retranchée. Évaluation de la situation, techniques d'ouverture, prise en charge médicale.",
      location: "Immeuble résidentiel rue de Rome",
      startDate: new Date("2025-10-28T14:00:00Z"),
      endDate: new Date("2025-10-28T17:00:00Z"),
      maxParticipants: 12,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.MANOEUVRE,
      title: "Exercice Grande Échelle - Plan Rouge",
      description:
        "Simulation d'événement majeur avec nombreuses victimes. Déploiement PMA, évacuation, tri, coordination multi-services (SAMU, Police).",
      location: "Stade Vélodrome",
      startDate: new Date("2025-11-20T08:00:00Z"),
      endDate: new Date("2025-11-20T18:00:00Z"),
      maxParticipants: 50,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.MANOEUVRE,
      title: "Exercice Port de l'ARI - Fumées Toxiques",
      description:
        "Entraînement au port prolongé de l'appareil respiratoire isolant. Parcours en ambiance fumée, reconnaissance, victimes multiples.",
      location: "Caisson fumée - Centre formation",
      startDate: new Date("2025-10-30T13:30:00Z"),
      endDate: new Date("2025-10-30T17:00:00Z"),
      maxParticipants: 12,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },

    // ============================================
    // 🚨 PRÉSENCE ACTIVE (5)
    // ============================================
    {
      type: FMPAType.PRESENCE_ACTIVE,
      title: "Garde 24h - CIS Marseille Centre",
      description:
        "Garde opérationnelle 24h au centre de secours principal. Disponibilité immédiate pour toutes interventions secteur centre-ville. Équipage VSAV + FPT.",
      location: "CIS Marseille Centre - 32 rue Dragon",
      startDate: new Date("2025-10-12T08:00:00Z"),
      endDate: new Date("2025-10-13T08:00:00Z"),
      maxParticipants: 8,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.PRESENCE_ACTIVE,
      title: "Garde 12h Jour - CIS Nord",
      description:
        "Permanence opérationnelle en journée. Interventions SAP, incendie, SR sur secteur nord. 2 équipages disponibles.",
      location: "CIS Nord - Avenue de la Libération",
      startDate: new Date("2025-10-15T08:00:00Z"),
      endDate: new Date("2025-10-15T20:00:00Z"),
      maxParticipants: 6,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.PRESENCE_ACTIVE,
      title: "Garde 12h Nuit - CIS Est",
      description:
        "Permanence opérationnelle de nuit. Couverture du secteur est avec 1 VSAV et 1 FPT. Astreinte renforcée week-end.",
      location: "CIS Est - Boulevard des Belges",
      startDate: new Date("2025-10-20T20:00:00Z"),
      endDate: new Date("2025-10-21T08:00:00Z"),
      maxParticipants: 6,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.PRESENCE_ACTIVE,
      title: "Astreinte Sauvetage Aquatique - Week-end",
      description:
        "Astreinte spécialisée sauvetage aquatique pour le week-end estival. Rappel possible sous 15min. Équipe plongeurs + embarcation.",
      location: "À domicile - Secteur littoral",
      startDate: new Date("2025-10-18T08:00:00Z"),
      endDate: new Date("2025-10-20T20:00:00Z"),
      maxParticipants: 4,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
    {
      type: FMPAType.PRESENCE_ACTIVE,
      title: "Renfort Feux de Forêt - Saison Estivale",
      description:
        "Renfort opérationnel durant la période à risque incendie. Garde 12h avec CCF pré-positionné sur point haut. Surveillance et intervention rapide.",
      location: "Poste avancé - Massif du Garlaban",
      startDate: new Date("2025-10-22T08:00:00Z"),
      endDate: new Date("2025-10-22T20:00:00Z"),
      maxParticipants: 5,
      status: FMPAStatus.PUBLISHED,
      createdById,
      qrCode: `FMPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
    },
  ];

  // Création des FMPA
  const createdFMPA = [];
  for (const fmpa of fmpaData) {
    const created = await prisma.fMPA.create({
      data: fmpa,
    });
    createdFMPA.push(created);
  }

  console.log(`✅ ${createdFMPA.length} FMPA créées avec succès`);
  console.log(
    `   - ${fmpaData.filter((f) => f.type === FMPAType.FORMATION).length} Formations`
  );
  console.log(
    `   - ${fmpaData.filter((f) => f.type === FMPAType.MANOEUVRE).length} Manœuvres`
  );
  console.log(
    `   - ${fmpaData.filter((f) => f.type === FMPAType.PRESENCE_ACTIVE).length} Présences Actives`
  );

  return createdFMPA;
}
