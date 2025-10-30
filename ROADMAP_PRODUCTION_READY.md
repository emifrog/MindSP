# 🚀 ROADMAP PRODUCTION READY - MindSP

**Objectif** : Transformer MindSP en plateforme SaaS production-ready  
**Durée estimée** : 6-8 semaines  
**Date de début** : 30 Octobre 2025

---

## 📊 Vue d'Ensemble

### État Actuel

- ✅ **Architecture** : 9/10 - Multi-tenant exemplaire
- ✅ **Code Quality** : 8/10 - TypeScript strict
- ⚠️ **Sécurité** : 6/10 - Gaps critiques
- ⚠️ **Performance** : 5/10 - N+1 queries
- 🔴 **Tests** : 0/10 - AUCUN test
- 🔴 **DevOps** : 3/10 - Pas de CI/CD

### Objectif Production

- 🎯 **Sécurité** : 9/10
- 🎯 **Performance** : 8/10
- 🎯 **Tests** : 8/10 (70%+ coverage)
- 🎯 **DevOps** : 9/10
- 🎯 **Note Globale** : 9/10

---

## 🔴 PHASE 1 : SÉCURITÉ CRITIQUE (Semaine 1-2)

### 1.1 Rate Limiting - URGENT 🔴

**Priorité** : CRITIQUE  
**Effort** : 2-3 jours  
**Blocage Production** : OUI

#### Tâches

- [ ] Installer Upstash Rate Limit

```bash
npm install @upstash/ratelimit @upstash/redis
```

- [ ] Créer middleware rate limiting

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10s"),
  analytics: true,
});
```

- [ ] Appliquer sur routes critiques
  - `/api/auth/login` - 5 tentatives / 15 min
  - `/api/auth/register` - 3 créations / heure
  - `/api/*` - 100 requêtes / minute (global)

#### Fichiers à modifier

- `src/lib/rate-limit.ts` (nouveau)
- `src/middleware.ts` (ajouter rate limiting)
- `src/app/api/auth/*/route.ts` (appliquer limites)

---

### 1.2 Audit Logs Système

**Priorité** : CRITIQUE  
**Effort** : 3-4 jours

#### Tâches

- [ ] Activer le modèle AuditLog existant
- [ ] Créer service d'audit centralisé

```typescript
// src/lib/audit.ts
export async function logAudit({
  userId,
  action,
  resource,
  details,
}: AuditLogInput) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resource,
      details,
      ipAddress: headers().get("x-forwarded-for"),
      userAgent: headers().get("user-agent"),
    },
  });
}
```

- [ ] Logger actions critiques
  - Suppression FMPA, Formations, Personnel
  - Changement de rôles utilisateur
  - Modifications tenant
  - Exports de données

#### Fichiers à modifier

- `src/lib/audit.ts` (nouveau)
- `src/app/api/fmpa/[id]/route.ts` (DELETE)
- `src/app/api/users/[id]/route.ts` (PATCH role)
- `src/app/api/personnel/files/[id]/route.ts` (DELETE)

---

### 1.3 Renforcer CORS & CSP

**Priorité** : ÉLEVÉE  
**Effort** : 1 jour

#### Tâches

- [ ] Configurer CSP strict

```javascript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://utfs.io;
  font-src 'self';
  connect-src 'self' https://api.uploadthing.com;
  frame-ancestors 'none';
`;
```

- [ ] Restreindre CORS Socket.IO

```typescript
// server.js
cors: {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
}
```

- [ ] Supprimer fallbacks dangereux

```typescript
// ❌ AVANT
const host = process.env.REDIS_HOST || "localhost";

// ✅ APRÈS
const host = process.env.REDIS_HOST;
if (!host) throw new Error("REDIS_HOST required");
```

#### Fichiers à modifier

- `next.config.js`
- `server.js`
- `src/lib/queue/index.ts`

---

### 1.4 Validation Input Stricte

**Priorité** : ÉLEVÉE  
**Effort** : 2 jours

#### Tâches

- [ ] Ajouter validation Zod sur toutes les routes API sans validation
- [ ] Sanitiser contenus HTML (descriptions, messages)

```typescript
import DOMPurify from "isomorphic-dompurify";

const sanitized = DOMPurify.sanitize(input);
```

- [ ] Valider strictement les tableaux d'IDs

```typescript
const memberIdsSchema = z.array(z.string().uuid()).min(1).max(50);
```

#### Fichiers à vérifier

- `src/app/api/conversations/route.ts`
- `src/app/api/chat/channels/route.ts`
- Toutes les routes POST/PATCH

---

## 🔴 PHASE 2 : TESTS (Semaine 2-3)

### 2.1 Configuration Tests

**Priorité** : CRITIQUE  
**Effort** : 1 jour

#### Tâches

- [ ] Installer dépendances

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
npm install -D @vitest/coverage-v8
```

- [ ] Configurer Vitest

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/types/"],
    },
  },
});
```

- [ ] Configurer Playwright

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
  },
});
```

---

### 2.2 Tests Unitaires API Routes

**Priorité** : CRITIQUE  
**Effort** : 5-7 jours  
**Objectif** : 70% coverage

#### Tâches

- [ ] Tests Auth
  - `tests/api/auth/login.test.ts`
  - `tests/api/auth/register.test.ts`
- [ ] Tests FMPA
  - `tests/api/fmpa/create.test.ts`
  - `tests/api/fmpa/register.test.ts`
  - `tests/api/fmpa/delete.test.ts`

- [ ] Tests Personnel
  - `tests/api/personnel/files.test.ts`
  - `tests/api/personnel/alerts.test.ts`

- [ ] Tests TTA
  - `tests/api/tta/entries.test.ts`
  - `tests/api/tta/validate.test.ts`

#### Exemple Test

```typescript
// tests/api/fmpa/create.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "@/app/api/fmpa/route";

describe("POST /api/fmpa", () => {
  it("should create FMPA with valid data", async () => {
    const request = new Request("http://localhost/api/fmpa", {
      method: "POST",
      body: JSON.stringify({
        title: "Test FMPA",
        type: "FORMATION",
        startDate: new Date(),
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it("should reject invalid data", async () => {
    const request = new Request("http://localhost/api/fmpa", {
      method: "POST",
      body: JSON.stringify({ title: "" }), // Invalid
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

---

### 2.3 Tests Intégration

**Priorité** : ÉLEVÉE  
**Effort** : 3-4 jours

#### Tâches

- [ ] Flow Auth complet (register → login → session)
- [ ] Flow FMPA (create → register → validate → export)
- [ ] Flow TTA (create → validate → export)
- [ ] Flow Personnel (create → alerts → update)
- [ ] Flow Formations (create → register → certificate)

---

### 2.4 Tests E2E

**Priorité** : MOYENNE  
**Effort** : 3-4 jours  
**Objectif** : 10 scénarios critiques

#### Scénarios

- [ ] Connexion utilisateur
- [ ] Création FMPA et inscription
- [ ] Saisie TTA et validation
- [ ] Création fiche personnel
- [ ] Envoi message chat
- [ ] Upload document
- [ ] Recherche globale
- [ ] Export PDF FMPA
- [ ] Gestion notifications
- [ ] Workflow formation complète

---

## ⚡ PHASE 3 : PERFORMANCE (Semaine 4-5)

### 3.1 Pagination Universelle

**Priorité** : CRITIQUE  
**Effort** : 3-4 jours

#### Tâches

- [ ] Créer helper pagination

```typescript
// src/lib/pagination.ts
export function paginate<T>(query: any, page: number = 1, limit: number = 50) {
  return {
    ...query,
    skip: (page - 1) * limit,
    take: limit,
  };
}
```

- [ ] Appliquer sur toutes les listes
  - `/api/fmpa` - Liste FMPA
  - `/api/formations` - Liste formations
  - `/api/personnel/files` - Liste personnel
  - `/api/conversations` - Liste conversations
  - `/api/notifications` - Liste notifications

#### Fichiers à modifier

- `src/lib/pagination.ts` (nouveau)
- `src/app/api/fmpa/route.ts`
- `src/app/api/formations/route.ts`
- `src/app/api/personnel/files/route.ts`
- `src/app/api/conversations/route.ts`

---

### 3.2 Cache Redis

**Priorité** : ÉLEVÉE  
**Effort** : 3-4 jours

#### Tâches

- [ ] Configurer Redis client

```typescript
// src/lib/redis.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const data = await fetcher();
  await redis.setex(key, ttl, data);
  return data;
}
```

- [ ] Cacher données fréquentes
  - Sessions utilisateur (30 min)
  - Liste FMPA actifs (5 min)
  - Statistiques dashboard (10 min)
  - Notifications non lues (1 min)

---

### 3.3 Optimiser Queries N+1

**Priorité** : CRITIQUE  
**Effort** : 4-5 jours

#### Tâches

- [ ] Identifier toutes les queries N+1

```bash
# Activer Prisma query logging
DATABASE_URL="...?connection_limit=1" # Force les problèmes
```

- [ ] Refactorer conversations

```typescript
// ❌ AVANT - N+1
const conversations = await prisma.conversation.findMany({
  include: {
    members: { include: { user: true } },
    messages: { take: 1, include: { sender: true } },
  },
});

// ✅ APRÈS - 1 query
const conversations = await prisma.$queryRaw`
  SELECT 
    c.*,
    json_agg(DISTINCT jsonb_build_object(
      'id', u.id,
      'firstName', u."firstName",
      'lastName', u."lastName"
    )) as members,
    (SELECT json_build_object(
      'id', m.id,
      'content', m.content,
      'createdAt', m."createdAt"
    ) FROM "Message" m 
    WHERE m."conversationId" = c.id 
    ORDER BY m."createdAt" DESC LIMIT 1) as lastMessage
  FROM "Conversation" c
  LEFT JOIN "ConversationMember" cm ON c.id = cm."conversationId"
  LEFT JOIN "User" u ON cm."userId" = u.id
  GROUP BY c.id
`;
```

- [ ] Refactorer FMPA participations
- [ ] Refactorer Personnel avec relations

---

### 3.4 Indexes Composés

**Priorité** : ÉLEVÉE  
**Effort** : 1 jour

#### Tâches

- [ ] Ajouter indexes manquants

```prisma
// prisma/schema.prisma

model Participation {
  // ... champs existants

  @@index([fmpaId, status])
  @@index([userId, status])
  @@index([fmpaId, userId])
}

model Notification {
  // ... champs existants

  @@index([createdAt, read])
  @@index([userId, read, createdAt])
}

model TTAEntry {
  // ... champs existants

  @@index([userId, date])
  @@index([status, date])
}
```

- [ ] Créer migration

```bash
npx prisma migrate dev --name add_composite_indexes
```

---

### 3.5 Lazy Loading & Code Splitting

**Priorité** : MOYENNE  
**Effort** : 2 jours

#### Tâches

- [ ] Dynamic imports composants lourds

```typescript
// ❌ AVANT
import { FormationsCalendar } from '@/components/formations/FormationsCalendar';

// ✅ APRÈS
const FormationsCalendar = dynamic(
  () => import('@/components/formations/FormationsCalendar'),
  { loading: () => <Skeleton /> }
);
```

- [ ] Lazy load par route
  - Chat (Socket.IO client)
  - Calendriers (date-fns)
  - PDF exports (jsPDF)

---

## 📊 PHASE 4 : MONITORING (Semaine 6)

### 4.1 Sentry Error Tracking

**Priorité** : CRITIQUE  
**Effort** : 1 jour

#### Tâches

- [ ] Installer Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

- [ ] Configurer Sentry

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

- [ ] Ajouter Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
'use client';

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export function ErrorBoundary({ error }: { error: Error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>Une erreur est survenue</h2>
      <button onClick={() => window.location.reload()}>
        Recharger la page
      </button>
    </div>
  );
}
```

---

### 4.2 Structured Logging

**Priorité** : ÉLEVÉE  
**Effort** : 2 jours

#### Tâches

- [ ] Installer Pino

```bash
npm install pino pino-pretty
```

- [ ] Créer logger centralisé

```typescript
// src/lib/logger.ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export function logError(error: Error, context?: Record<string, any>) {
  logger.error({
    err: error,
    context,
    stack: error.stack,
  });
}
```

- [ ] Remplacer tous les console.error

```typescript
// ❌ AVANT
console.error("Erreur:", error);

// ✅ APRÈS
logger.error({ err: error, userId, action: "create_fmpa" });
```

---

### 4.3 Uptime Monitoring

**Priorité** : MOYENNE  
**Effort** : 1 jour

#### Tâches

- [ ] Configurer Better Stack (ou UptimeRobot)
- [ ] Créer health check endpoint

```typescript
// src/app/api/health/route.ts
export async function GET() {
  try {
    // Check DB
    await prisma.$queryRaw`SELECT 1`;

    // Check Redis
    await redis.ping();

    return Response.json({ status: "ok" });
  } catch (error) {
    return Response.json({ status: "error" }, { status: 500 });
  }
}
```

- [ ] Monitorer endpoints critiques
  - `/api/health`
  - `/api/auth/login`
  - `/`

---

### 4.4 Prisma Query Analytics

**Priorité** : MOYENNE  
**Effort** : 1 jour

#### Tâches

- [ ] Activer Prisma logging

```typescript
// src/lib/prisma.ts
const prisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "error", emit: "event" },
  ],
});

prisma.$on("query", (e) => {
  if (e.duration > 1000) {
    logger.warn({
      type: "slow_query",
      query: e.query,
      duration: e.duration,
    });
  }
});
```

- [ ] Dashboard queries lentes (admin)

---

## 🚀 PHASE 5 : CI/CD (Semaine 7)

### 5.1 GitHub Actions Pipeline

**Priorité** : CRITIQUE  
**Effort** : 2 jours

#### Tâches

- [ ] Créer workflow CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Tests
        run: npm run test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Build
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

- [ ] Créer workflow Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```

---

### 5.2 Environnements

**Priorité** : ÉLEVÉE  
**Effort** : 1 jour

#### Tâches

- [ ] Configurer environnements
  - **Development** : `localhost:3000`
  - **Staging** : `staging.mindsp.app`
  - **Production** : `app.mindsp.fr`

- [ ] Variables d'environnement par env

```env
# .env.development
DATABASE_URL="postgresql://localhost:5432/mindsp_dev"
NEXTAUTH_URL="http://localhost:3000"

# .env.staging
DATABASE_URL="postgresql://staging.db/mindsp"
NEXTAUTH_URL="https://staging.mindsp.app"

# .env.production
DATABASE_URL="postgresql://prod.db/mindsp"
NEXTAUTH_URL="https://app.mindsp.fr"
```

---

## 🎯 PHASE 6 : AMÉLIORATIONS (Semaine 8)

### 6.1 Accessibilité WCAG 2.1 AA

**Priorité** : MOYENNE  
**Effort** : 3-4 jours

#### Tâches

- [ ] Audit axe-core

```bash
npm install -D @axe-core/react
```

- [ ] Ajouter ARIA labels

```typescript
<button aria-label="Fermer le dialogue">
  <X className="h-4 w-4" />
</button>
```

- [ ] Keyboard navigation

```typescript
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick();
    }
  }}
>
```

- [ ] Vérifier contrastes couleurs

---

### 6.2 Soft Deletes

**Priorité** : MOYENNE  
**Effort** : 2 jours

#### Tâches

- [ ] Ajouter champs deletedAt

```prisma
model FMPA {
  // ... champs existants
  deletedAt DateTime?
  deletedBy String?

  @@index([deletedAt])
}
```

- [ ] Middleware Prisma global

```typescript
// src/lib/prisma.ts
prisma.$use(async (params, next) => {
  if (params.action === "delete") {
    params.action = "update";
    params.args.data = { deletedAt: new Date() };
  }

  if (params.action === "findMany") {
    params.args.where = {
      ...params.args.where,
      deletedAt: null,
    };
  }

  return next(params);
});
```

---

### 6.3 Documentation API (OpenAPI)

**Priorité** : FAIBLE  
**Effort** : 2-3 jours

#### Tâches

- [ ] Installer Swagger

```bash
npm install swagger-jsdoc swagger-ui-react
```

- [ ] Documenter routes API

```typescript
/**
 * @swagger
 * /api/fmpa:
 *   get:
 *     summary: Liste des FMPA
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste paginée
 */
export async function GET(request: Request) {
  // ...
}
```

- [ ] Page `/api/docs`

---

## 📅 PLANNING DÉTAILLÉ

### Semaine 1 (4-8 Nov)

- ✅ Lundi-Mardi : Rate Limiting
- ✅ Mercredi-Jeudi : Audit Logs
- ✅ Vendredi : CORS/CSP + Validation

### Semaine 2 (11-15 Nov)

- ✅ Lundi : Config Tests
- ✅ Mardi-Vendredi : Tests Unitaires API

### Semaine 3 (18-22 Nov)

- ✅ Lundi-Mercredi : Tests Intégration
- ✅ Jeudi-Vendredi : Tests E2E

### Semaine 4 (25-29 Nov)

- ✅ Lundi-Mardi : Pagination
- ✅ Mercredi-Jeudi : Cache Redis
- ✅ Vendredi : Indexes

### Semaine 5 (2-6 Déc)

- ✅ Lundi-Jeudi : Optimiser N+1 Queries
- ✅ Vendredi : Lazy Loading

### Semaine 6 (9-13 Déc)

- ✅ Lundi : Sentry
- ✅ Mardi-Mercredi : Structured Logging
- ✅ Jeudi : Uptime Monitoring
- ✅ Vendredi : Prisma Analytics

### Semaine 7 (16-20 Déc)

- ✅ Lundi-Mardi : CI/CD Pipeline
- ✅ Mercredi : Environnements
- ✅ Jeudi-Vendredi : Tests finaux

### Semaine 8 (23-27 Déc)

- ✅ Lundi-Mercredi : Accessibilité
- ✅ Jeudi : Soft Deletes
- ✅ Vendredi : Documentation

---

## ✅ CRITÈRES DE VALIDATION

### Production Ready si :

- ✅ Tests coverage > 70%
- ✅ Rate limiting actif
- ✅ Monitoring opérationnel (Sentry + logs)
- ✅ CI/CD pipeline fonctionnel
- ✅ Audit logs complets
- ✅ Performance optimisée (pagination + cache)
- ✅ Sécurité renforcée (CORS + CSP + validation)

### Métriques Cibles

- **Tests** : 70%+ coverage
- **Performance** : < 500ms temps réponse API
- **Sécurité** : 0 vulnérabilité critique
- **Disponibilité** : 99.9% uptime
- **Erreurs** : < 0.1% taux d'erreur

---

## 🎯 RÉSUMÉ EXÉCUTIF

### Effort Total : 6-8 semaines

- **Semaine 1-2** : Sécurité (CRITIQUE)
- **Semaine 2-3** : Tests (CRITIQUE)
- **Semaine 4-5** : Performance (CRITIQUE)
- **Semaine 6** : Monitoring (CRITIQUE)
- **Semaine 7** : CI/CD (CRITIQUE)
- **Semaine 8** : Améliorations (IMPORTANT)

### Budget Estimé

- **Développement** : 6-8 semaines × 1 dev senior
- **Infrastructure** :
  - Upstash Redis : $10-50/mois
  - Sentry : $26/mois (Team plan)
  - Better Stack : $20/mois
  - Vercel Pro : $20/mois
- **Total mensuel** : ~$100-150/mois

### ROI

- ✅ Réduction bugs production : -80%
- ✅ Temps debugging : -60%
- ✅ Performance utilisateur : +50%
- ✅ Confiance client : +100%
- ✅ Conformité légale : ✅

---

## 🚀 PROCHAINES ÉTAPES IMMÉDIATES

### Cette semaine

1. ✅ Installer Upstash Rate Limit
2. ✅ Implémenter rate limiting sur /api/auth/\*
3. ✅ Créer service audit logs
4. ✅ Logger actions critiques

### Semaine prochaine

1. ✅ Configurer Vitest + Testing Library
2. ✅ Écrire premiers tests API auth
3. ✅ Écrire tests API FMPA
4. ✅ Atteindre 30% coverage

---

**🎉 Avec ce roadmap, MindSP sera production-ready en 6-8 semaines !**
