# Authentification - MindSP

## Vue d'ensemble

MindSP utilise **NextAuth.js v5** pour gérer l'authentification avec une stratégie JWT et un système multi-tenant.

## Configuration

### Variables d'environnement

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-genere-avec-openssl"
```

Générer un secret :

```bash
openssl rand -base64 32
```

## Fonctionnalités

### 1. Authentification par Credentials

- Email + Mot de passe
- Sélection du tenant (organisation)
- Hash bcrypt pour les mots de passe
- JWT tokens avec refresh

### 2. Multi-tenancy

- Isolation par `tenantId`
- Extraction du tenant depuis le slug
- Vérification de l'appartenance au tenant
- Support des sous-domaines (production)

### 3. Gestion des Sessions

- Session JWT (30 jours)
- Refresh automatique
- Déconnexion sécurisée

## Utilisation

### Côté Client

#### Hook useAuth

```typescript
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, isAuthenticated, isAdmin, tenantSlug } = useAuth();

  if (!isAuthenticated) {
    return <div>Non connecté</div>;
  }

  return <div>Bonjour {user.name}</div>;
}
```

#### Hook useSession (NextAuth)

```typescript
import { useSession, signOut } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/login" });
  };
}
```

### Côté Serveur

#### Obtenir l'utilisateur courant

```typescript
import { getCurrentUser } from "@/lib/session";

export default async function MyPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <div>Bonjour {user.name}</div>;
}
```

#### Protéger une route

```typescript
import { requireAuth } from "@/lib/session";

export default async function ProtectedPage() {
  const session = await requireAuth();
  // L'utilisateur est forcément connecté ici

  return <div>Page protégée</div>;
}
```

#### Vérifier un rôle

```typescript
import { requireRole } from "@/lib/session";

export default async function AdminPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  // L'utilisateur est forcément admin ici

  return <div>Page admin</div>;
}
```

## Routes

### Pages d'authentification

- **Login** : `/auth/login`
- **Register** : `/auth/register`
- **Error** : `/auth/error`

### API Routes

- **NextAuth** : `/api/auth/[...nextauth]`
- **Register** : `POST /api/auth/register`

## Middleware

Le middleware protège automatiquement toutes les routes sauf :

- `/auth/*` - Pages d'authentification
- `/_next/*` - Fichiers Next.js
- `/api/auth/*` - API d'authentification
- Fichiers statiques

### Fonctionnalités du middleware

1. **Protection des routes**
   - Redirection vers `/auth/login` si non authentifié
   - Redirection vers `/` si authentifié sur page de login

2. **Multi-tenancy**
   - Extraction du tenant depuis le sous-domaine
   - Vérification de l'appartenance
   - Redirection si mauvais sous-domaine

3. **Headers personnalisés**
   - `x-tenant-id` : ID du tenant
   - `x-tenant-slug` : Slug du tenant
   - `x-user-id` : ID de l'utilisateur
   - `x-user-role` : Rôle de l'utilisateur

## Rôles et Permissions

### Rôles disponibles

- **SUPER_ADMIN** : Accès total, gestion multi-tenant
- **ADMIN** : Administration du tenant
- **MANAGER** : Gestion opérationnelle
- **USER** : Utilisateur standard

### Permissions

Les permissions sont stockées dans un array `permissions` :

```typescript
// Exemples de permissions
[
  "fmpa.view",
  "fmpa.create",
  "fmpa.manage",
  "formations.view",
  "formations.manage",
  "users.manage",
  "all", // Super admin
];
```

## Sécurité

### Bonnes pratiques implémentées

1. **Mots de passe**
   - Hash bcrypt (10 rounds)
   - Minimum 8 caractères
   - Validation côté client et serveur

2. **Tokens JWT**
   - Secret fort (32+ caractères)
   - Expiration 30 jours
   - Refresh automatique

3. **Protection CSRF**
   - NextAuth gère automatiquement
   - Tokens CSRF sur les formulaires

4. **Rate Limiting**
   - À implémenter en Phase 3
   - Recommandé : 5 tentatives / 15 minutes

## Comptes de Test

### SDIS13

- **Admin** : admin@sdis13.fr / Password123!
- **Manager** : manager@sdis13.fr / Password123!
- **User** : pierre.bernard@sdis13.fr / Password123!

### SDIS06

- **Admin** : admin@sdis06.fr / Password123!
- **User** : claire.laurent@sdis06.fr / Password123!

## Troubleshooting

### Erreur "Configuration"

- Vérifier que `NEXTAUTH_SECRET` est défini
- Vérifier que `NEXTAUTH_URL` correspond à l'URL

### Erreur "AccessDenied"

- Vérifier le rôle de l'utilisateur
- Vérifier les permissions

### Session non persistante

- Vérifier que le SessionProvider est dans le layout
- Vérifier les cookies du navigateur

### Redirection infinie

- Vérifier le middleware matcher
- Vérifier les routes publiques

## Évolutions Futures

### Phase 3+

- OAuth providers (Google, Microsoft)
- 2FA / MFA
- Rate limiting
- Audit logs détaillés
- Session management avancé
- Password reset par email
