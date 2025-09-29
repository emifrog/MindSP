### Cahier Des Charges MindSP

## Stack Technique :
# Frontend
•	Framework : Next.js avec App Router
•	UI Library : React
•	Langage : TypeScript
•	Styling : TailwindCSS
•	Temps réel : Socket.IO-client
•	HTTP Client : Axios
•	Forms : React Hook Form
•	Validation : Zod

# Backend
•	Runtime : Node.js
•	Framework : Express.js
•	Temps réel : Socket.IO
•	ORM : Prisma
•	Base de données : PostgreSQL
•	Cache : Redis
•	Authentification : JWT avec refresh tokens

# IA/NLP
•	Service IA : OpenRouter API (alternative à OpenAI) 
•	Traitement : Service personnalisé (pas Langchain)
•	Context : Stockage en session Redis 

# Intégration SIRH (plus tard)
•	Authentification : JWT + SSO Antibia
•	Mode développement : Service Mock complet
•	Webhooks : Support notifications temps réel
•	API Antibia : REST (GraphQL ready)

## Organisation du Projet
# Structure Globale du Repository

mindsp/
├── .github/                     # Configuration GitHub
│   ├── workflows/               # GitHub Actions CI/CD
│   │   ├── ci.yml              # Tests et build
│   │   ├── deploy-staging.yml  # Déploiement staging
│   │   ├── deploy-prod.yml     # Déploiement production
│   │   └── security.yml        # Scans de sécurité
│   ├── ISSUE_TEMPLATE/         # Templates d'issues
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
│
├── apps/                        # Applications (Monorepo)
│   ├── web/                    # Application web principale (Next.js)
│   ├── mobile/                 # PWA mobile spécifique
│   ├── admin/                  # Dashboard super-admin SaaS
│   └── landing/                # Site vitrine marketing
│
├── packages/                    # Packages partagés (Monorepo)
│   ├── ui/                     # Composants UI partagés
│   ├── config-typescript/      # Configuration TypeScript
│   ├── config-eslint/          # Configuration ESLint
│   ├── config-tailwind/        # Configuration Tailwind
│   ├── utils/                  # Utilitaires communs
│   ├── types/                  # Types TypeScript partagés
│   └── constants/              # Constantes partagées
│
├── services/                    # Microservices backend
│   ├── api-gateway/            # Kong/Traefik API Gateway
│   ├── auth-service/           # Service authentification
│   ├── tenant-service/         # Gestion multi-tenancy
│   ├── notification-service/   # Service notifications
│   ├── export-service/         # Service exports (TTA, PDF)
│   ├── sync-service/           # Service synchronisation
│   └── ai-service/             # Service IA/ML  
│
├── docs/                        # Documentation
│   ├── api/                    # Documentation API
│   ├── architecture/           # Diagrammes d'architecture
│   ├── guides/                 # Guides utilisateur
│   └── deployment/             # Guide de déploiement
│
├── tests/                       # Tests E2E globaux
│   ├── e2e/                    # Tests Cypress
│   ├── load/                   # Tests de charge K6
│   └── security/               # Tests sécurité
│
└── tools/                       # Outils de développement
    ├── scripts/                 # Scripts utilitaires
    ├── generators/              # Générateurs de code
    └── migrations/              # Scripts de migration

# Structure Détaillée - Application Web (apps/web)

apps/web/
├── src/
│   ├── app/                    # App Router Next.js 14
│   │   ├── (auth)/             # Routes authentification
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── (dashboard)/        # Routes application principale
│   │   │   ├── layout.tsx      # Layout avec sidebar
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── fmpa/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   └── create/
│   │   │   ├── messages/
│   │   │   ├── agenda/
│   │   │   ├── personnel/
│   │   │   ├── formations/
│   │   │   └── settings/
│   │   │
│   │   ├── api/                # API Routes
│   │   │   ├── auth/
│   │   │   ├── fmpa/
│   │   │   ├── webhooks/
│   │   │   └── trpc/
│   │   │
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── manifest.json       # PWA manifest
│   │   └── service-worker.ts   # Service Worker
│   │
│   ├── components/              # Composants React
│   │   ├── ui/                 # Composants UI de base
│   │   │   ├── button/
│   │   │   ├── card/
│   │   │   ├── dialog/
│   │   │   ├── form/
│   │   │   └── table/
│   │   │
│   │   ├── features/           # Composants métier
│   │   │   ├── fmpa/
│   │   │   │   ├── FMPACalendar.tsx
│   │   │   │   ├── FMPAForm.tsx
│   │   │   │   └── FMPAList.tsx
│   │   │   ├── messages/
│   │   │   ├── agenda/
│   │   │   └── notifications/
│   │   │
│   │   ├── layouts/            # Composants de layout
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   └── shared/             # Composants partagés
│   │       ├── DataTable.tsx
│   │       ├── SearchBar.tsx
│   │       └── UserAvatar.tsx
│   │
│   ├── hooks/                   # Hooks React personnalisés
│   │   ├── useAuth.ts
│   │   ├── useWebSocket.ts
│   │   ├── useOffline.ts
│   │   ├── useNotifications.ts
│   │   └── useTenant.ts
│   │
│   ├── lib/                     # Bibliothèques et utilitaires
│   │   ├── api/                # Clients API
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   └── endpoints/
│   │   ├── db/                 # Prisma client
│   │   │   └── prisma.ts
│   │   ├── cache/              # Gestion cache
│   │   ├── socket/             # Socket.IO client
│   │   └── utils/              # Fonctions utilitaires
│   │
│   ├── stores/                  # State management (Zustand)
│   │   ├── auth.store.ts
│   │   ├── tenant.store.ts
│   │   ├── ui.store.ts
│   │   └── offline.store.ts
│   │
│   ├── services/                # Services métier
│   │   ├── fmpa.service.ts
│   │   ├── message.service.ts
│   │   ├── export.service.ts
│   │   └── sync.service.ts
│   │
│   ├── styles/                  # Styles globaux
│   │   ├── globals.css
│   │   └── themes/
│   │
│   ├── types/                   # Types TypeScript
│   │   ├── models/
│   │   ├── api/
│   │   └── index.ts
│   │
│   └── config/                  # Configuration
│       ├── constants.ts
│       ├── permissions.ts
│       └── navigation.ts
│
├── public/                      # Assets statiques
│   ├── icons/
│   ├── images/
│   ├── fonts/
│   └── locales/               # Traductions i18n
│
├── prisma/                      # Schema Prisma
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── tests/                       # Tests
│   ├── unit/
│   ├── integration/
│   └── components/
│
└── next.config.js              # Configuration Next.js

# Structure Service Backend Type (services/auth-service)

services/auth-service/
├── src/
│   ├── api/                    # Couche API
│   │   ├── controllers/        # Contrôleurs
│   │   │   ├── auth.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── routes/             # Routes Express
│   │   │   ├── auth.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── middlewares/        # Middlewares
│   │   │   ├── auth.middleware.ts
│   │   │   ├── tenant.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   └── validators/         # Schémas de validation
│   │       ├── auth.validator.ts
│   │       └── user.validator.ts
│   │
│   ├── core/                   # Logique métier
│   │   ├── services/          # Services
│   │   │   ├── auth.service.ts
│   │   │   ├── token.service.ts
│   │   │   └── user.service.ts
│   │   ├── repositories/      # Repositories
│   │   │   └── user.repository.ts
│   │   ├── entities/          # Entités métier
│   │   │   └── user.entity.ts
│   │   └── use-cases/         # Cas d'usage
│   │       ├── login.use-case.ts
│   │       └── register.use-case.ts
│   │
│   ├── infrastructure/         # Infrastructure
│   │   ├── database/          # Base de données
│   │   │   ├── prisma/
│   │   │   └── migrations/
│   │   ├── cache/             # Redis
│   │   │   └── redis.client.ts
│   │   ├── queue/             # Bull Queue
│   │   │   └── auth.queue.ts
│   │   └── external/          # Services externes
│   │       ├── ldap.client.ts
│   │       └── oauth.client.ts
│   │
│   ├── shared/                 # Code partagé
│   │   ├── errors/            # Gestion erreurs
│   │   ├── constants/         # Constantes
│   │   ├── types/            # Types TypeScript
│   │   └── utils/            # Utilitaires
│   │
│   ├── config/                # Configuration
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   │
│   ├── events/                # Event-driven
│   │   ├── publishers/
│   │   └── subscribers/
│   │
│   ├── app.ts                 # Application Express
│   └── server.ts              # Point d'entrée
│
├── tests/                      # Tests
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── package.json
└── tsconfig.json

# Structure Package UI Partagé (packages/ui)

packages/ui/
├── src/
│   ├── components/            # Composants réutilisables
│   │   ├── buttons/
│   │   │   ├── Button.tsx
│   │   │   ├── IconButton.tsx
│   │   │   └── index.ts
│   │   ├── forms/
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   └── Form.tsx
│   │   ├── feedback/
│   │   │   ├── Alert.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── layout/
│   │   │   ├── Container.tsx
│   │   │   ├── Grid.tsx
│   │   │   └── Stack.tsx
│   │   └── data-display/
│   │       ├── Table.tsx
│   │       ├── Card.tsx
│   │       └── Badge.tsx
│   │
│   ├── hooks/                 # Hooks partagés
│   │   ├── useMediaQuery.ts
│   │   ├── useClickOutside.ts
│   │   └── useDebounce.ts
│   │
│   ├── themes/                # Thèmes et design tokens
│   │   ├── tokens/
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   └── typography.ts
│   │   ├── sdis-theme.ts
│   │   └── dark-theme.ts
│   │
│   ├── utils/                 # Utilitaires UI
│   │   ├── cn.ts             # Class names utility
│   │   └── responsive.ts
│   │
│   └── index.ts              # Export principal
│
├── stories/                   # Storybook
│   ├── Button.stories.tsx
│   └── Form.stories.tsx
│
├── package.json
└── tsconfig.json

# Configuration Monorepo (racine)

Mindsp/
├── package.json                 # Workspace configuration
├── turbo.json                  # Turborepo config
├── .gitignore
├── .env.example
├── .nvmrc                      # Node version
├── commitlint.config.js        # Commit conventions
├── .husky/                     # Git hooks
│   ├── pre-commit
│   └── commit-msg
├── .vscode/                    # VSCode settings
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
└── README.md
