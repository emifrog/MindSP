# 🚀 Optimisation N+1 Queries - Documentation

**Date de création** : 30 Octobre 2025  
**Statut** : ✅ Complété

---

## 📋 Vue d'Ensemble

Les problèmes N+1 surviennent quand on exécute 1 query principale + N queries supplémentaires dans une boucle, au lieu d'une seule query optimisée.

### Impact Performance

- **Avant** : 1 + N queries (ex: 1 + 50 = 51 queries)
- **Après** : 1-3 queries groupées
- **Amélioration** : **-90% à -95% queries DB** 🚀

---

## 🔍 Problèmes Identifiés et Résolus

### 1. ✅ Chat Channels - Unread Count (CRITIQUE)

**Fichier** : `src/app/api/chat/channels/route.ts`

#### Avant (N+1 Problem)

```typescript
// ❌ Pour chaque canal, une query séparée
const channelsWithUnread = await Promise.all(
  channels.map(async (channel) => {
    const unreadCount = await prisma.chatMessage.count({
      where: { channelId: channel.id, ... }
    });
    return { ...channel, unreadCount };
  })
);
// Résultat: 1 query channels + 50 queries count = 51 queries
```

#### Après (Optimisé)

```typescript
// ✅ Une seule query groupée pour tous les canaux
const channelIds = channels.map((c) => c.id);
const unreadCounts = await prisma.chatMessage.groupBy({
  by: ["channelId"],
  where: { channelId: { in: channelIds }, ... },
  _count: { id: true },
});

const unreadCountMap = new Map(
  unreadCounts.map((item) => [item.channelId, item._count.id])
);

const channelsWithUnread = channels.map((channel) => ({
  ...channel,
  unreadCount: unreadCountMap.get(channel.id) || 0,
}));
// Résultat: 1 query channels + 1 query groupBy = 2 queries
```

**Amélioration** : **-96% queries** (51 → 2)

---

### 2. ✅ FMPA Stats - Status Counts (IMPORTANT)

**Fichier** : `src/app/api/fmpa/[id]/stats/route.ts`

#### Avant (Multiple Counts)

```typescript
// ❌ 7 queries count séparées
const [
  totalParticipations,
  registeredCount,
  confirmedCount,
  presentCount,
  absentCount,
  excusedCount,
  cancelledCount,
] = await Promise.all([
  prisma.participation.count({ where: { fmpaId, status: "REGISTERED" } }),
  prisma.participation.count({ where: { fmpaId, status: "CONFIRMED" } }),
  // ... 5 autres counts
]);
// Résultat: 7 queries count
```

#### Après (Optimisé)

```typescript
// ✅ Une seule query groupBy
const participationsByStatus = await prisma.participation.groupBy({
  by: ["status"],
  where: { fmpaId: params.id },
  _count: true,
});

const statusMap = new Map(
  participationsByStatus.map((item) => [item.status, item._count])
);

const registeredCount = statusMap.get("REGISTERED") || 0;
const confirmedCount = statusMap.get("CONFIRMED") || 0;
// ... extraire les autres counts
// Résultat: 1 query groupBy
```

**Amélioration** : **-86% queries** (7 → 1)

---

### 3. ✅ FMPA Statistics - User Participation (CRITIQUE)

**Fichier** : `src/app/api/fmpa/statistics/route.ts`

#### Avant (N+1 Problem)

```typescript
// ❌ Pour chaque user, 2 queries séparées
const userParticipationRates = await Promise.all(
  participationsByUser.map(async (userStat) => {
    const user = await prisma.user.findUnique({
      where: { id: userStat.userId },
    });
    const presentCount = await prisma.participation.count({
      where: { userId: userStat.userId, status: "PRESENT" },
    });
    return { user, presentCount };
  })
);
// Résultat: 1 + (N * 2) queries = 1 + 100 = 101 queries
```

#### Après (Optimisé)

```typescript
// ✅ Queries groupées
const [participationsByUser, presentByUser] = await Promise.all([
  prisma.participation.groupBy({ by: ["userId"], ... }),
  prisma.participation.groupBy({ by: ["userId"], where: { status: "PRESENT" }, ... }),
]);

const userIds = participationsByUser.map((p) => p.userId);
const users = await prisma.user.findMany({
  where: { id: { in: userIds } },
});

const userMap = new Map(users.map((u) => [u.id, u]));
const presentMap = new Map(presentByUser.map((p) => [p.userId, p._count.id]));

const userParticipationRates = participationsByUser.map((userStat) => ({
  user: userMap.get(userStat.userId),
  presentCount: presentMap.get(userStat.userId) || 0,
}));
// Résultat: 3 queries (2 groupBy + 1 findMany)
```

**Amélioration** : **-97% queries** (101 → 3)

---

## 📊 Impact Global

### Queries Réduites

| Route                      | Avant       | Après     | Amélioration |
| -------------------------- | ----------- | --------- | ------------ |
| GET `/api/chat/channels`   | 51 queries  | 2 queries | **-96%**     |
| GET `/api/fmpa/[id]/stats` | 7 queries   | 1 query   | **-86%**     |
| GET `/api/fmpa/statistics` | 101 queries | 3 queries | **-97%**     |

### Temps de Réponse Estimé

| Route                      | Avant  | Après  | Gain     |
| -------------------------- | ------ | ------ | -------- |
| GET `/api/chat/channels`   | ~2.5s  | ~150ms | **-94%** |
| GET `/api/fmpa/[id]/stats` | ~800ms | ~100ms | **-87%** |
| GET `/api/fmpa/statistics` | ~5.0s  | ~200ms | **-96%** |

---

## 🎯 Techniques d'Optimisation Utilisées

### 1. groupBy() au lieu de count() multiples

**Avant** :

```typescript
const count1 = await prisma.model.count({ where: { status: "A" } });
const count2 = await prisma.model.count({ where: { status: "B" } });
// N queries
```

**Après** :

```typescript
const grouped = await prisma.model.groupBy({
  by: ["status"],
  _count: true,
});
// 1 query
```

### 2. findMany({ in: [...] }) au lieu de findUnique() en boucle

**Avant** :

```typescript
const items = await Promise.all(
  ids.map((id) => prisma.model.findUnique({ where: { id } }))
);
// N queries
```

**Après** :

```typescript
const items = await prisma.model.findMany({
  where: { id: { in: ids } },
});
// 1 query
```

### 3. Maps pour Lookup Rapide

```typescript
// Créer un map pour accès O(1)
const itemMap = new Map(items.map((item) => [item.id, item]));

// Utiliser dans une boucle sans query
const enriched = data.map((d) => ({
  ...d,
  item: itemMap.get(d.itemId), // O(1) lookup
}));
```

### 4. include() Prisma pour Relations

**Avant** :

```typescript
const users = await prisma.user.findMany();
const profiles = await Promise.all(
  users.map((u) => prisma.profile.findUnique({ where: { userId: u.id } }))
);
// N+1 queries
```

**Après** :

```typescript
const users = await prisma.user.findMany({
  include: { profile: true },
});
// 1 query avec JOIN
```

---

## 🚨 Comment Détecter les N+1

### 1. Logs Prisma

```typescript
// Dans .env
DATABASE_URL = "...";
DEBUG = "prisma:query";
```

### 2. Patterns à Surveiller

❌ **Mauvais patterns** :

```typescript
// map() avec await prisma
items.map(async (item) => await prisma...)

// forEach() avec await prisma
items.forEach(async (item) => await prisma...)

// for...of avec await prisma
for (const item of items) {
  await prisma...
}
```

✅ **Bons patterns** :

```typescript
// groupBy pour aggregations
await prisma.model.groupBy({ by: [...], _count: true })

// findMany avec in
await prisma.model.findMany({ where: { id: { in: ids } } })

// include pour relations
await prisma.model.findMany({ include: { relation: true } })
```

---

## 📈 Checklist Optimisation

### Avant de Déployer une Route

- [ ] Vérifier les boucles avec `await prisma`
- [ ] Utiliser `groupBy()` pour les aggregations
- [ ] Utiliser `findMany({ in: [...] })` pour batch queries
- [ ] Utiliser `include` pour les relations
- [ ] Créer des Maps pour lookups rapides
- [ ] Tester avec un dataset réaliste (50-100 items)
- [ ] Vérifier les logs Prisma en dev

### Routes Vérifiées ✅

- [x] GET `/api/chat/channels` - Optimisé
- [x] GET `/api/fmpa/[id]/stats` - Optimisé
- [x] GET `/api/fmpa/statistics` - Optimisé
- [x] GET `/api/conversations` - Déjà optimisé (include)
- [x] GET `/api/fmpa/[id]` - Déjà optimisé (include)
- [x] GET `/api/personnel/files` - Déjà optimisé (include)

---

## 🎯 Prochaines Optimisations Possibles

### 1. Raw Queries pour Cas Complexes

Pour des aggregations très complexes, utiliser des raw queries SQL :

```typescript
const result = await prisma.$queryRaw`
  SELECT 
    channel_id,
    COUNT(*) as unread_count
  FROM chat_messages
  WHERE channel_id IN (${channelIds})
    AND created_at > ${lastReadAt}
  GROUP BY channel_id
`;
```

### 2. DataLoader Pattern

Pour des cas très complexes avec beaucoup de relations :

```typescript
import DataLoader from "dataloader";

const userLoader = new DataLoader(async (ids) => {
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
  });
  return ids.map((id) => users.find((u) => u.id === id));
});
```

### 3. Materialized Views

Pour des stats complexes calculées fréquemment :

```sql
CREATE MATERIALIZED VIEW fmpa_stats AS
SELECT
  fmpa_id,
  COUNT(*) as total_participations,
  COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present_count
FROM participations
GROUP BY fmpa_id;
```

---

## 📚 Ressources

- [Prisma Performance Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [N+1 Query Problem Explained](https://stackoverflow.com/questions/97197/what-is-the-n1-selects-problem)
- [DataLoader Pattern](https://github.com/graphql/dataloader)

---

**Dernière mise à jour** : 30 Octobre 2025 - 21:40
