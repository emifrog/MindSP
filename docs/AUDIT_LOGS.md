# 📝 Audit Logs - Documentation Complète

## 📋 Vue d'Ensemble

Le système d'audit logs assure la **traçabilité complète** de toutes les actions critiques dans l'application, essentiel pour :

- ✅ **Conformité RGPD** - Traçabilité des accès et modifications
- ✅ **Sécurité** - Détection d'activités suspectes
- ✅ **Debugging** - Comprendre qui a fait quoi et quand
- ✅ **Audit** - Rapports pour audits internes/externes

---

## 🏗️ Architecture

### Modèle Prisma

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  tenantId    String?
  userId      String?

  // Action
  action      String   // CREATE_FMPA, UPDATE_USER, etc.
  entity      String   // FMPA, User, etc.
  entityId    String?

  // Data
  changes     Json?    // Before/after
  metadata    Json?    // IP, user-agent, etc.

  // Timestamp
  createdAt   DateTime @default(now())

  @@index([tenantId])
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

### Service Centralisé

`src/lib/audit.ts` - 350+ lignes

- 50+ types d'actions
- 9 types d'entités
- Helpers pour logging
- Fonctions de récupération
- Nettoyage automatique

---

## 🎯 Actions Auditées

### FMPA

- `CREATE_FMPA` - Création FMPA
- `UPDATE_FMPA` - Modification FMPA
- `DELETE_FMPA` - Suppression FMPA ✅
- `REGISTER_FMPA` - Inscription participant
- `UNREGISTER_FMPA` - Désinscription
- `VALIDATE_FMPA` - Validation présence
- `EXPORT_FMPA` - Export données

### Personnel

- `CREATE_PERSONNEL` - Création fiche
- `UPDATE_PERSONNEL` - Modification fiche
- `DELETE_PERSONNEL` - Suppression fiche ✅
- `UPDATE_MEDICAL_STATUS` - Modification aptitude
- `ADD_QUALIFICATION` - Ajout qualification
- `DELETE_QUALIFICATION` - Suppression qualification

### Formations

- `CREATE_FORMATION` - Création formation
- `UPDATE_FORMATION` - Modification
- `DELETE_FORMATION` - Suppression
- `REGISTER_FORMATION` - Inscription
- `VALIDATE_FORMATION` - Validation
- `GENERATE_CERTIFICATE` - Génération certificat

### TTA

- `CREATE_TTA` - Saisie heures
- `UPDATE_TTA` - Modification
- `DELETE_TTA` - Suppression
- `VALIDATE_TTA` - Validation chef
- `EXPORT_TTA` - Export SEPA/CSV

### Users

- `CREATE_USER` - Création utilisateur
- `UPDATE_USER` - Modification profil
- `DELETE_USER` - Suppression compte
- `UPDATE_USER_ROLE` - Changement rôle ⚠️
- `UPDATE_USER_STATUS` - Changement statut
- `UPDATE_USER_PERMISSIONS` - Modification permissions

### Auth

- `LOGIN` - Connexion réussie
- `LOGOUT` - Déconnexion
- `FAILED_LOGIN` - Tentative échouée ⚠️
- `PASSWORD_RESET` - Réinitialisation MDP

### Exports

- `EXPORT_DATA` - Export données sensibles
- `BULK_DELETE` - Suppression en masse

---

## 💻 Utilisation

### Logger une Suppression

```typescript
import { logDeletion, AuditEntity } from "@/lib/audit";

// Récupérer les données avant suppression
const fmpa = await prisma.fMPA.findUnique({
  where: { id: fmpaId },
});

// Logger l'audit
await logDeletion(
  session.user.id,
  session.user.tenantId,
  AuditEntity.FMPA,
  fmpaId,
  fmpa // Données avant suppression
);

// Supprimer
await prisma.fMPA.delete({ where: { id: fmpaId } });
```

### Logger une Modification

```typescript
import { logUpdate, AuditEntity } from "@/lib/audit";

// Récupérer état avant
const before = await prisma.user.findUnique({ where: { id: userId } });

// Modifier
const after = await prisma.user.update({
  where: { id: userId },
  data: { role: newRole },
});

// Logger
await logUpdate(
  session.user.id,
  session.user.tenantId,
  AuditEntity.USER,
  userId,
  before,
  after
);
```

### Logger une Création

```typescript
import { logCreation, AuditEntity } from "@/lib/audit";

// Créer
const formation = await prisma.formation.create({ data: {...} });

// Logger
await logCreation(
  session.user.id,
  session.user.tenantId,
  AuditEntity.FORMATION,
  formation.id,
  formation
);
```

### Logger un Changement de Rôle

```typescript
import { logRoleChange } from "@/lib/audit";

await logRoleChange(
  session.user.id, // Admin qui fait le changement
  session.user.tenantId,
  targetUserId, // Utilisateur modifié
  "USER", // Ancien rôle
  "MANAGER" // Nouveau rôle
);
```

### Logger un Export

```typescript
import { logExport } from "@/lib/audit";

await logExport(session.user.id, session.user.tenantId, "TTA_SEPA_XML", {
  month: "2025-10",
  status: "VALIDATED",
});
```

### Logger une Tentative de Connexion Échouée

```typescript
import { logFailedLogin } from "@/lib/audit";

await logFailedLogin("user@example.com", "sdis13");
```

---

## 🔍 Récupération des Logs

### API Route

```typescript
// GET /api/audit
// Query params:
//   - userId: string (optionnel)
//   - limit: number (défaut: 50)

// Tous les logs du tenant (admin uniquement)
const response = await fetch("/api/audit?limit=100");

// Logs d'un utilisateur spécifique
const response = await fetch("/api/audit?userId=xxx&limit=50");
```

### Fonctions Directes

```typescript
import {
  getUserAuditLogs,
  getTenantAuditLogs,
  getEntityAuditLogs,
} from "@/lib/audit";

// Logs d'un utilisateur
const userLogs = await getUserAuditLogs(userId, 50);

// Logs du tenant
const tenantLogs = await getTenantAuditLogs(tenantId, 100);

// Logs d'une entité spécifique
const fmpaLogs = await getEntityAuditLogs(AuditEntity.FMPA, fmpaId, 50);
```

---

## 🗑️ Nettoyage Automatique (RGPD)

### Conservation Limitée

Par défaut : **365 jours** (1 an)

```typescript
import { cleanOldAuditLogs } from "@/lib/audit";

// Supprimer logs > 1 an
const deletedCount = await cleanOldAuditLogs(365);

// Supprimer logs > 90 jours
const deletedCount = await cleanOldAuditLogs(90);
```

### Cron Job Recommandé

```typescript
// Exécuter tous les mois
import { cleanOldAuditLogs } from "@/lib/audit";

export async function cleanupAuditLogs() {
  const deleted = await cleanOldAuditLogs(365);
  console.log(`Nettoyage audit logs: ${deleted} entrées supprimées`);
}
```

---

## 📊 Structure des Logs

### Exemple de Log

```json
{
  "id": "uuid",
  "tenantId": "tenant-uuid",
  "userId": "user-uuid",
  "action": "DELETE_FMPA",
  "entity": "FMPA",
  "entityId": "fmpa-uuid",
  "changes": {
    "before": {
      "title": "Formation Incendie",
      "type": "FORMATION",
      "startDate": "2025-11-15T09:00:00Z",
      "participations": [...]
    },
    "after": null
  },
  "metadata": {
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "timestamp": "2025-10-30T19:00:00Z"
  },
  "createdAt": "2025-10-30T19:00:00Z"
}
```

---

## 🔐 Sécurité

### Permissions

- **USER** : Peut voir ses propres logs uniquement
- **MANAGER** : Peut voir ses propres logs uniquement
- **ADMIN** : Peut voir tous les logs du tenant
- **SUPER_ADMIN** : Peut voir tous les logs

### Protection

- ✅ Logs immuables (pas de modification/suppression manuelle)
- ✅ Isolation par tenant
- ✅ Capture IP et User-Agent
- ✅ Timestamp précis
- ✅ Données before/after pour traçabilité

---

## 📈 Cas d'Usage

### 1. Audit Interne

```sql
-- Qui a supprimé cette FMPA ?
SELECT * FROM audit_logs
WHERE action = 'DELETE_FMPA'
AND entityId = 'fmpa-uuid';
```

### 2. Détection Fraude

```sql
-- Tentatives de connexion échouées répétées
SELECT metadata->>'ipAddress', COUNT(*)
FROM audit_logs
WHERE action = 'FAILED_LOGIN'
AND createdAt > NOW() - INTERVAL '1 hour'
GROUP BY metadata->>'ipAddress'
HAVING COUNT(*) > 5;
```

### 3. Rapport RGPD

```sql
-- Toutes les actions sur les données d'un utilisateur
SELECT * FROM audit_logs
WHERE entity = 'PERSONNEL'
AND entityId = 'personnel-uuid'
ORDER BY createdAt DESC;
```

### 4. Activité Utilisateur

```sql
-- Actions d'un admin dans les 7 derniers jours
SELECT action, entity, createdAt
FROM audit_logs
WHERE userId = 'admin-uuid'
AND createdAt > NOW() - INTERVAL '7 days'
ORDER BY createdAt DESC;
```

---

## ✅ Checklist Implémentation

### Routes Auditées

- [x] DELETE `/api/fmpa/[id]`
- [x] DELETE `/api/personnel/files/[id]`
- [ ] DELETE `/api/formations/[id]`
- [ ] DELETE `/api/users/[id]`
- [ ] PATCH `/api/users/[id]` (changement rôle)
- [ ] POST `/api/tta/export`
- [ ] POST `/api/fmpa/[id]/export`

### À Faire

- [ ] Page admin pour consulter les logs
- [ ] Filtres avancés (date, action, utilisateur)
- [ ] Export logs (CSV)
- [ ] Alertes sur actions suspectes
- [ ] Cron job nettoyage automatique

---

## 🎯 Prochaines Étapes

1. ✅ Appliquer sur toutes les DELETE routes
2. ✅ Appliquer sur changements de rôles
3. ✅ Appliquer sur exports sensibles
4. ⏳ Créer page admin audit logs
5. ⏳ Configurer cron job nettoyage
6. ⏳ Alertes email sur actions critiques

---

**Dernière mise à jour** : 30 Octobre 2025
