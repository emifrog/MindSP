# 🔒 Configuration Rate Limiting - Guide Complet

## 📋 Vue d'Ensemble

Le rate limiting protège l'application contre :

- ✅ Attaques brute-force (login, register)
- ✅ Abus d'API
- ✅ DDoS basiques
- ✅ Scraping excessif

**Solution** : Upstash Redis + @upstash/ratelimit

---

## 🚀 Configuration Upstash

### Étape 1 : Créer un Compte

1. Aller sur https://console.upstash.com
2. Se connecter avec GitHub/Google
3. Créer un compte gratuit (10,000 commandes/jour)

### Étape 2 : Créer une Base Redis

1. Cliquer sur **"Create Database"**
2. Configurer :
   - **Name** : `mindsp-ratelimit`
   - **Type** : Regional
   - **Region** : Choisir la plus proche (ex: `eu-west-1` pour Europe)
3. Cliquer sur **"Create"**

### Étape 3 : Récupérer les Credentials

1. Dans le dashboard de votre base Redis
2. Onglet **"REST API"**
3. Copier les deux valeurs

### Étape 4 : Configurer les Variables

Ajouter dans `.env.local` :

```env
UPSTASH_REDIS_REST_URL="https://your-redis-xxxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXXXXxxxxx..."
```

---

## ✅ Limiters Configurés

### 1. API Global (100 req/min)

- Appliqué sur toutes les routes `/api/*`
- Via middleware
- Par IP

### 2. Register (3 req/heure)

- Route `/api/auth/register`
- Par IP
- Bloque inscriptions multiples

### 3. Auth (5 req/15min)

- Pour login (à implémenter)
- Par IP
- Protection brute-force

### 4. Sensitive (10 req/min)

- Actions critiques
- Par userId
- Suppressions, exports

---

## 🧪 Tester

```bash
# Test register (devrait bloquer après 3 tentatives)
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$i'@test.com","password":"test1234","firstName":"Test","lastName":"User","tenantSlug":"sdis13"}'
  echo ""
done

# Test API global (devrait bloquer après 100 requêtes)
for i in {1..105}; do
  curl http://localhost:3000/api/fmpa
done
```

---

## 📊 Monitoring

Dashboard Upstash : https://console.upstash.com

- Voir les commandes/jour
- Analytics rate limiting
- Logs des blocages

---

## 🔧 Personnalisation

Modifier dans `src/lib/rate-limit.ts` :

```typescript
// Augmenter limite API
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, "1m"), // 200 au lieu de 100
});

// Limite par utilisateur au lieu d'IP
const identifier = userId || getIdentifier(request);
```

---

## ⚠️ Important

- **Ne jamais commit** les tokens dans Git
- **Utiliser** `.env.local` en développement
- **Configurer** variables sur Vercel/serveur en production
- **Monitorer** l'usage Upstash régulièrement
