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

## 📋 Prérequis

- Node.js 20+ 
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 16+
- Redis 7+

## 🚀 Installation Rapide

### 1. Cloner le repository
```bash
git clone https://github.com/mindsp/mindsp.git
cd mindsp
```

### 2. Installer les dépendances
```bash
pnpm install
```

### 3. Configuration de l'environnement
```bash
cp apps/web/.env.local.example apps/web/.env.local
# Éditer .env.local avec vos paramètres
```

### 4. Démarrer les services Docker
```bash
docker-compose up -d
```

### 5. Initialiser la base de données
```bash
cd apps/web
pnpm run db:migrate
pnpm run db:seed
```

### 6. Lancer le développement
```bash
pnpm run dev
```

L'application est accessible sur http://localhost:3000

## 📦 Structure du Projet

```
mindsp/
├── apps/
│   ├── web/          # Application Next.js principale
│   ├── admin/        # Dashboard super-admin
│   ├── landing/      # Site vitrine
│   └── mobile/       # PWA mobile
├── packages/
│   ├── ui/           # Composants UI partagés
│   ├── utils/        # Utilitaires communs
│   ├── types/        # Types TypeScript
│   └── constants/    # Constantes partagées
├── services/         # Microservices backend
├── infrastructure/   # Docker, Kubernetes, Terraform
├── docs/            # Documentation
└── tests/           # Tests E2E
```

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

### Infrastructure
- **Containerisation**: Docker
- **Orchestration**: Kubernetes (production)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Storage**: S3/MinIO

## 🔧 Commandes Utiles

### Développement
```bash
pnpm dev              # Démarre tous les services en dev
pnpm build            # Build de production
pnpm test             # Lance les tests
pnpm lint             # Vérifie le code
pnpm typecheck        # Vérifie les types TypeScript
```

### Base de données
```bash
pnpm db:migrate       # Applique les migrations
pnpm db:seed          # Remplit avec données de test
pnpm db:studio        # Ouvre Prisma Studio
```

### Docker
```bash
make docker-up        # Démarre les services
make docker-down      # Arrête les services
make docker-clean     # Nettoie les volumes
```

## 🧪 Tests

```bash
# Tests unitaires
pnpm test

# Tests avec coverage
pnpm test:coverage

# Tests E2E
pnpm test:e2e

# Tests de charge
pnpm test:load
```

## 📱 PWA Installation

### Android
1. Ouvrir Chrome
2. Naviguer vers l'application
3. Menu → "Installer l'application"

### iOS
1. Ouvrir Safari
2. Naviguer vers l'application
3. Partager → "Sur l'écran d'accueil"

## 🚢 Déploiement

### Production avec Docker
```bash
# Build l'image
docker build -t mindsp:latest .

# Run avec docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Déploiement Kubernetes
```bash
# Appliquer les manifests
kubectl apply -f infrastructure/kubernetes/

# Vérifier le déploiement
kubectl get pods -n mindsp
```

## 📊 Monitoring

- **Metrics**: http://localhost:3001 (Prometheus)
- **Dashboard**: http://localhost:3002 (Grafana)
- **Logs**: http://localhost:3003 (Loki)
- **Tracing**: http://localhost:3004 (Jaeger)

## 🔐 Sécurité

- Authentification JWT avec refresh tokens
- Multi-tenancy avec isolation des données
- Rate limiting sur les API
- Content Security Policy (CSP)
- HTTPS obligatoire en production
- Audit logs
- Chiffrement des données sensibles

## 📈 Roadmap

### Phase 1 (Q1 2024) ✅
- [x] Architecture monorepo
- [x] Authentication & Multi-tenancy
- [x] Module FMPA de base
- [x] PWA & Mode offline

### Phase 2 (Q2 2024) 🚧
- [ ] Messagerie temps réel complète
- [ ] Système de notifications push
- [ ] Export TTA automatisé
- [ ] Module formations avancé

### Phase 3 (Q3 2024) 📋
- [ ] Intégration SIRH Antibia
- [ ] Module de statistiques
- [ ] Application mobile native
- [ ] API publique

### Phase 4 (Q4 2024) 🎯
- [ ] IA pour suggestions
- [ ] Module de cartographie
- [ ] Gestion des véhicules
- [ ] Marketplace de modules

## 🤝 Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines de contribution.

## 📝 License

Propriétaire - Tous droits réservés © 2024 MindSP

## 🆘 Support

- Email: support@mindsp.fr
- Documentation: https://docs.mindsp.fr
- Issues: https://github.com/mindsp/mindsp/issues

## 👥 Équipe

- **Lead Developer**: [@johndoe](https://github.com/johndoe)
- **UI/UX Designer**: [@janedoe](https://github.com/janedoe)
- **DevOps**: [@bobsmith](https://github.com/bobsmith)

