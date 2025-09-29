# 🚒 MindSP - Plateforme SaaS de Gestion SDIS

Solution SaaS complète pour la gestion des Services Départementaux d'Incendie et de Secours (SDIS).

## Images



## 🎯 Fonctionnalités Principales

### ✅ Modules Disponibles
- **FMPA** (Formation, Manœuvre, Présence Active) - Gestion complète des activités
- **Messagerie** - Communication temps réel entre agents
- **Agenda** - Planning et gestion des disponibilités
- **Personnel** - Gestion des effectifs et compétences
- **Formations** - Suivi des formations et certifications
- **Multi-tenancy** - Isolation complète par SDIS

### 🚀 Caractéristiques Techniques
- **PWA** - Application installable sur mobile
- **Mode Offline** - Fonctionne sans connexion
- **Temps Réel** - WebSocket pour notifications instantanées
- **Multi-tenant** - Architecture SaaS avec isolation des données
- **Responsive** - Interface adaptative desktop/tablet/mobile
- **Sécurisé** - JWT, HTTPS, CSP, Rate limiting


## 🛠️ Stack Technique

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **Styling**: TailwindCSS + Radix UI
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Temps réel**: Socket.IO Client
- **PWA**: next-pwa

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Cache**: Redis
- **Auth**: JWT + Refresh Tokens
- **Temps réel**: Socket.IO


## 🔐 Sécurité

- Authentification JWT avec refresh tokens
- Multi-tenancy avec isolation des données
- Rate limiting sur les API
- Content Security Policy (CSP)
- HTTPS obligatoire en production
- Audit logs
- Chiffrement des données sensibles


