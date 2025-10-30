# 🚀 Redis Cache - Documentation

**Date de création** : 30 Octobre 2025  
**Statut** : ✅ Opérationnel

---

## 📋 Vue d'Ensemble

Le système de cache Redis utilise **Upstash Redis** pour améliorer les performances de l'application en réduisant les requêtes à la base de données.

### Objectifs

- ✅ Réduire le temps de réponse des API de **80%**
- ✅ Diminuer la charge sur PostgreSQL
- ✅ Améliorer l'expérience utilisateur
- ✅ Cache hit rate cible : **> 80%**

---

## 🔧 Configuration

### Variables d'Environnement

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### Service Cache

Le service de cache est disponible dans `src/lib/cache.ts` et fournit :

- **CacheService** - Service principal avec méthodes CRUD
- **Helpers spécifiques** - Pour FMPA, formations, utilisateurs, stats

---

## 📊 Stratégie de Cache

### TTL (Time To Live)

| Type de Données               | TTL   | Raison                                   |
| ----------------------------- | ----- | ---------------------------------------- |
| **Sessions**                  | 1h    | Fréquemment accédées, peu de changements |
| **Profils utilisateur**       | 30min | Modérément modifiés                      |
| **Listes (FMPA, formations)** | 5min  | Changements fréquents                    |
| **Stats dashboard**           | 15min | Calculs coûteux, changements modérés     |
| **Données statiques**         | 24h   | Rarement modifiées                       |

### Préfixes de Clés

```typescript
session:     // Sessions utilisateur
user:        // Profils et données utilisateur
fmpa:        // Listes et détails FMPA
formation:   // Listes et détails formations
personnel:   // Fiches personnel
conversation: // Conversations et messages
notification: // Notifications
tta:         // Entrées TTA
stats:       // Statistiques et dashboard
chat:        // Canaux et messages chat
```

---

## 💻 Utilisation

### 1. Cache-Aside Pattern (Recommandé)

```typescript
import { getCachedFMPAList, cacheFMPAList } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const session = await auth();
  const filters = { status: "ACTIVE", page: 1, limit: 50 };

  // 1. Essayer de récupérer du cache
  const cached = await getCachedFMPAList(session.user.tenantId, filters);
  if (cached) {
    return NextResponse.json(cached);
  }

  // 2. Si pas en cache, récupérer de la DB
  const [fmpas, total] = await Promise.all([
    prisma.fMPA.findMany({ where: filters }),
    prisma.fMPA.count({ where: filters }),
  ]);

  const response = {
    fmpas,
    pagination: createPaginationMeta(page, limit, total),
  };

  // 3. Mettre en cache
  await cacheFMPAList(session.user.tenantId, filters, response);

  return NextResponse.json(response);
}
```

### 2. Invalidation du Cache

```typescript
import { invalidateFMPACache } from "@/lib/cache";

export async function POST(request: NextRequest) {
  const session = await auth();

  // Créer/modifier la ressource
  const fmpa = await prisma.fMPA.create({ data: ... });

  // Invalider le cache pour ce tenant
  await invalidateFMPACache(session.user.tenantId);

  return NextResponse.json(fmpa);
}
```

### 3. Utilisation Directe du CacheService

```typescript
import { CacheService, CACHE_TTL, CACHE_PREFIX } from "@/lib/cache";

// GET
const data = await CacheService.get<MyType>("my-key");

// SET avec TTL personnalisé
await CacheService.set("my-key", data, { ttl: CACHE_TTL.LIST_SHORT });

// DELETE
await CacheService.delete("my-key");

// DELETE par pattern
await CacheService.deletePattern("fmpa:*:tenant123:*");

// GET or SET (cache-aside automatique)
const data = await CacheService.getOrSet(
  "my-key",
  async () => await fetchFromDB(),
  { ttl: CACHE_TTL.LIST_SHORT }
);
```

---

## 🎯 Routes Cachées

### ✅ Implémentées (2/7)

| Route                 | Cache Key                             | TTL  | Invalidation                      |
| --------------------- | ------------------------------------- | ---- | --------------------------------- |
| GET `/api/fmpa`       | `fmpa:list:{tenantId}:{filters}`      | 5min | POST/PUT/DELETE `/api/fmpa`       |
| GET `/api/formations` | `formation:list:{tenantId}:{filters}` | 5min | POST/PUT/DELETE `/api/formations` |

### ⏳ À Implémenter (5/7)

- [ ] GET `/api/personnel/files`
- [ ] GET `/api/conversations`
- [ ] GET `/api/notifications`
- [ ] GET `/api/tta/entries`
- [ ] GET `/api/chat/channels`

---

## 📈 Métriques et Monitoring

### Avant Cache

| Route                 | Temps Réponse | Queries DB |
| --------------------- | ------------- | ---------- |
| GET `/api/fmpa`       | ~1.2s         | 2-3        |
| GET `/api/formations` | ~1.5s         | 2-3        |

### Après Cache (Estimé)

| Route                 | Cache Hit | Cache Miss | Amélioration |
| --------------------- | --------- | ---------- | ------------ |
| GET `/api/fmpa`       | ~50ms     | ~1.2s      | **-96%**     |
| GET `/api/formations` | ~40ms     | ~1.5s      | **-97%**     |

### Cache Hit Rate Attendu

- **Première semaine** : 60-70%
- **Après optimisation** : 80-90%
- **Objectif** : > 80%

---

## 🔄 Patterns d'Invalidation

### 1. Invalidation Immédiate (Actuel)

```typescript
// Sur mutation, invalider immédiatement
await prisma.fMPA.create({ data });
await invalidateFMPACache(tenantId);
```

**Avantages** : Simple, cohérence garantie  
**Inconvénients** : Perte du cache à chaque mutation

### 2. Invalidation Sélective (Future)

```typescript
// Invalider uniquement les clés affectées
await invalidateFMPAByStatus(tenantId, "ACTIVE");
```

**Avantages** : Meilleur cache hit rate  
**Inconvénients** : Plus complexe

### 3. Write-Through (Future)

```typescript
// Mettre à jour le cache en même temps que la DB
const fmpa = await prisma.fMPA.create({ data });
await updateFMPACache(tenantId, fmpa);
```

**Avantages** : Pas de cache miss après mutation  
**Inconvénients** : Complexe, risque d'incohérence

---

## 🛠️ Helpers Disponibles

### FMPA

```typescript
getCachedFMPAList(tenantId, filters);
cacheFMPAList(tenantId, filters, data);
invalidateFMPACache(tenantId);
```

### Formations

```typescript
getCachedFormationList(tenantId, filters);
cacheFormationList(tenantId, filters, data);
invalidateFormationCache(tenantId);
```

### Utilisateurs

```typescript
getCachedUserProfile(userId);
cacheUserProfile(userId, data);
invalidateUserCache(userId);
```

### Stats

```typescript
getCachedStats(tenantId, type);
cacheStats(tenantId, type, data);
invalidateStatsCache(tenantId);
```

---

## 🚨 Bonnes Pratiques

### ✅ À Faire

1. **Toujours invalider le cache** après mutations (POST/PUT/DELETE)
2. **Utiliser des clés descriptives** avec préfixes
3. **Définir un TTL approprié** selon la fréquence de modification
4. **Gérer les erreurs** - Si Redis échoue, continuer sans cache
5. **Monitorer le cache hit rate** régulièrement

### ❌ À Éviter

1. **Ne pas cacher les données sensibles** sans chiffrement
2. **Ne pas utiliser de TTL trop long** pour données fréquemment modifiées
3. **Ne pas oublier l'invalidation** après mutations
4. **Ne pas cacher les erreurs** ou données invalides
5. **Ne pas dépendre uniquement du cache** - Toujours avoir un fallback

---

## 🔍 Debugging

### Vérifier une Clé

```typescript
const exists = await CacheService.exists("fmpa:list:tenant123:...");
console.log("Cache exists:", exists);
```

### Voir le Contenu

```typescript
const data = await CacheService.get("my-key");
console.log("Cached data:", data);
```

### Supprimer Manuellement

```typescript
await CacheService.delete("my-key");
// ou
await CacheService.deletePattern("fmpa:*");
```

---

## 📊 Progression Phase 3.2

- [x] Créer service cache `src/lib/cache.ts`
- [x] Implémenter helpers FMPA
- [x] Implémenter helpers formations
- [x] Implémenter helpers utilisateurs
- [x] Implémenter helpers stats
- [x] Appliquer cache sur GET `/api/fmpa`
- [x] Appliquer cache sur GET `/api/formations`
- [ ] Appliquer cache sur 5 routes restantes
- [ ] Monitoring et métriques
- [ ] Optimisation cache hit rate

**Progression** : 🟡 40% (7/17 tâches)

---

## 🎯 Prochaines Étapes

1. Appliquer cache sur routes restantes (personnel, conversations, notifications, TTA, chat)
2. Implémenter monitoring du cache hit rate
3. Optimiser les clés de cache pour meilleur hit rate
4. Ajouter cache sur routes individuelles (GET `/api/fmpa/[id]`)
5. Implémenter invalidation sélective

---

**Dernière mise à jour** : 30 Octobre 2025 - 21:15
