# Architecture MindSP

## Vue d'ensemble

MindSP est une plateforme SaaS multi-tenant construite avec Next.js 14, utilisant l'App Router et une architecture moderne.

## Stack Technique

### Frontend

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **Styling**: TailwindCSS + Radix UI (Shadcn)
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Temps réel**: Socket.IO Client

### Backend

- **Runtime**: Node.js 20+
- **Framework**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL 16
- **Cache**: Redis
- **Auth**: NextAuth.js 5
- **Queue**: BullMQ

## Architecture Multi-tenant

Le système utilise une approche de **multi-tenancy au niveau base de données** avec isolation par `tenantId`.

### Stratégie d'isolation

- Chaque tenant a un sous-domaine unique (ex: `sdis13.mindsp.fr`)
- Le middleware extrait le tenant depuis le sous-domaine
- Toutes les requêtes DB sont filtrées par `tenantId`
- Row-Level Security (RLS) via Prisma

### Structure des données

```
Tenant (1) -> (*) Users
Tenant (1) -> (*) FMPA
Tenant (1) -> (*) Messages
...
```

## Sécurité

### Authentification

- JWT tokens avec refresh tokens
- Session management via NextAuth
- Password hashing avec bcrypt

### Protection

- Rate limiting sur les API
- CORS configuré
- CSP headers
- HTTPS obligatoire en production
- Audit logs pour traçabilité

## Modules

### 1. FMPA (Formation, Manœuvre, Présence Active)

Gestion des activités opérationnelles avec inscriptions, QR codes, et émargement.

### 2. Messagerie

Chat temps réel avec Socket.IO, conversations directes et de groupe.

### 3. Formations

Catalogue de formations avec workflow de validation hiérarchique.

### 4. Agenda

Planning des disponibilités et gestion des événements.

### 5. Personnel

Gestion des effectifs, compétences et certifications.

## Déploiement

### Environnements

- **Development**: Local avec SQLite/PostgreSQL
- **Staging**: Vercel/Railway
- **Production**: Kubernetes cluster

### CI/CD

- GitHub Actions pour tests et déploiement
- Tests automatiques avant merge
- Déploiement automatique en staging
- Déploiement manuel en production

## Performance

### Optimisations

- Server Components par défaut
- Code splitting automatique
- Image optimization
- Redis caching
- Database indexes
- Connection pooling

### PWA

- Service Worker pour offline
- IndexedDB pour données locales
- Background sync
- Push notifications

## Monitoring

### Outils

- Sentry pour error tracking
- Prometheus + Grafana pour métriques
- Uptime monitoring
- Performance monitoring

## Évolutivité

### Horizontal Scaling

- Stateless API servers
- Redis pour sessions partagées
- PostgreSQL avec read replicas
- CDN pour assets statiques

### Vertical Scaling

- Database optimization
- Query optimization
- Caching strategy
- Background jobs avec BullMQ
