# Configuration de la Base de Données

## PostgreSQL - Configuration Développement

### Option 1 : Installation Locale

#### Windows

1. **Télécharger PostgreSQL 16+**
   - https://www.postgresql.org/download/windows/
   - Installer avec pgAdmin 4

2. **Créer la base de données**

   ```sql
   CREATE DATABASE mindsp;
   CREATE USER mindsp_user WITH PASSWORD 'mindsp_password';
   GRANT ALL PRIVILEGES ON DATABASE mindsp TO mindsp_user;
   ```

3. **Configurer .env.local**
   ```env
   DATABASE_URL="postgresql://mindsp_user:mindsp_password@localhost:5432/mindsp?schema=public"
   ```

### Option 2 : Docker (Recommandé)

1. **Créer docker-compose.yml**

   ```yaml
   version: "3.8"
   services:
     postgres:
       image: postgres:16-alpine
       container_name: mindsp-postgres
       environment:
         POSTGRES_DB: mindsp
         POSTGRES_USER: mindsp_user
         POSTGRES_PASSWORD: mindsp_password
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data

   volumes:
     postgres_data:
   ```

2. **Démarrer le conteneur**

   ```bash
   docker-compose up -d
   ```

3. **Configurer .env.local**
   ```env
   DATABASE_URL="postgresql://mindsp_user:mindsp_password@localhost:5432/mindsp?schema=public"
   ```

### Option 3 : Service Cloud (Production)

#### Supabase (Gratuit)

1. Créer un compte sur https://supabase.com
2. Créer un nouveau projet
3. Copier la connection string depuis Settings > Database
4. Ajouter dans .env.local

#### Railway (Gratuit)

1. Créer un compte sur https://railway.app
2. Créer un nouveau projet PostgreSQL
3. Copier la connection string
4. Ajouter dans .env.local

#### Neon (Gratuit)

1. Créer un compte sur https://neon.tech
2. Créer une nouvelle base de données
3. Copier la connection string
4. Ajouter dans .env.local

## Migrations Prisma

Une fois PostgreSQL configuré :

```bash
# Générer le client Prisma
npm run db:generate

# Créer et appliquer la migration initiale
npm run db:migrate

# (Optionnel) Seed data
npm run db:seed
```

## Vérification

```bash
# Ouvrir Prisma Studio pour visualiser la DB
npm run db:studio
```

## Troubleshooting

### Erreur de connexion

- Vérifier que PostgreSQL est démarré
- Vérifier les credentials dans .env.local
- Vérifier que le port 5432 n'est pas utilisé

### Erreur de migration

```bash
# Reset la base de données (⚠️ Supprime toutes les données)
npx prisma migrate reset
```

## Configuration Minimale pour Tester

Si vous voulez juste tester l'interface sans base de données :

1. Commentez les imports Prisma dans les fichiers
2. Utilisez des données mockées
3. La configuration DB sera nécessaire pour la Phase 2 (Auth)
