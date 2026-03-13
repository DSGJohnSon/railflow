# Guide pratique: convertir l'API RailFlow en API REST avec Hono

Ce document est ecrit comme un support de cours.
Le but n'est pas seulement de "faire marcher" la refonte, mais de te faire comprendre:

- ce qu'est une API REST
- pourquoi ton API actuelle pose probleme
- dans quel ordre faire les changements
- quels fichiers modifier
- a quoi doit ressembler le resultat final

Important: on garde la structure du projet par features.
On ne va pas tout deplacer dans `app/api`.
Le code restera organise dans:

```txt
features/
  auth/
  organizations/
  projects/
lib/
app/
prisma/
```

La vraie transformation concerne le contrat HTTP, les middlewares, les routes, les reponses JSON et la facon dont le front appelle l'API.

---

## 1. Ton point de depart dans ce projet

Voici les fichiers les plus importants pour cette migration:

```txt
app/api/[[...route]]/route.ts

features/organizations/server/route.ts
features/organizations/schemas.ts
features/organizations/api/use-create-organization.ts
features/organizations/api/use-get-organizations-by-user-id.ts

features/projects/server/route.ts
features/projects/schemas.ts
features/projects/components/api/use-create-project.ts
features/projects/components/api/use-get-projects-by-organization.ts
features/projects/components/api/use-get-projects-by-user-id.ts

lib/middlewares/session-middleware.ts
lib/middlewares/admin-session-middleware.ts
lib/middlewares/organization-session-middleware.ts

lib/rpc.ts
prisma/schema.prisma
app/(docs)/api-docs/page.tsx
```

Ce que fait deja bien ton projet:

- Hono est deja branche a Next via `app/api/[[...route]]/route.ts`
- les features sont deja separees
- Prisma est deja en place
- le client Hono type (`hc<AppType>`) est deja present
- le front consomme deja l'API via des hooks

Ce qui pose probleme aujourd'hui:

- certaines routes ne sont pas vraiment REST
- le contexte de l'organisation est parfois dans l'URL, parfois dans la query, parfois dans un header
- certains middlewares font trop de choses
- certaines routes ont des problemes d'autorisation
- les reponses ne sont pas encore bien stabilisees

---

## 2. REST explique tres simplement

Si tu retiens seulement 5 idees, retiens celles-ci:

### 2.1 Une route REST parle d'une ressource

Une ressource est une chose metier:

- une organisation
- un projet
- un membre

Les URLs doivent surtout contenir des noms de ressources, pas des verbes techniques.

Bon exemple:

```txt
GET /api/organizations/acme/projects
```

Moins bon exemple:

```txt
GET /api/projects/organization?organizationSlug=acme
```

Dans le bon exemple, on comprend tout de suite:

- on parle des projets
- qui appartiennent a une organisation
- identifiee par son slug

### 2.2 Le chemin de l'URL identifie la ressource

La regle pedagogique simple:

- `param` dans l'URL = identite de la ressource
- `query` = filtrage, pagination, options de lecture
- `body` = donnees a creer ou modifier
- `headers` = metadata technique de transport

Donc:

- `organizationSlug` dans un header custom pour creer un projet: non
- `organizationSlug` dans l'URL: oui

Exemple:

```txt
POST /api/organizations/acme/projects
```

Body:

```json
{
  "name": "RailFlow Core",
  "slug": "railflow-core",
  "description": "Projet principal"
}
```

### 2.3 Le verbe HTTP dit l'intention

- `GET`: lire
- `POST`: creer
- `PATCH`: modifier partiellement
- `PUT`: remplacer
- `DELETE`: supprimer

### 2.4 Les codes HTTP racontent le resultat

Garde cette petite table pres de toi:

| Code | Signification | Quand l'utiliser |
| --- | --- | --- |
| `200` | OK | lecture ou mise a jour reussie |
| `201` | Created | creation reussie |
| `400` | Bad Request | requete invalide |
| `401` | Unauthorized | pas connecte |
| `403` | Forbidden | connecte mais pas autorise |
| `404` | Not Found | ressource absente |
| `409` | Conflict | doublon metier, par ex. slug deja pris |
| `500` | Server Error | bug non gere |

### 2.5 REST ne t'oblige pas a changer ta structure de dossiers

Tu peux avoir:

- une URL tres REST
- et un code interne range par feature

Exemple:

- URL: `POST /api/organizations/:organizationSlug/projects`
- code: logique dans `features/projects/server/...`

L'URL raconte la relation entre les ressources.
Les dossiers racontent ou vit le code dans ton projet.
Les deux ne sont pas obliges d'etre identiques.

---

## 3. La cible que je te recommande

### 3.1 Les routes cibles

Je te recommande ce contrat HTTP:

| Role | Route cible | Description |
| --- | --- | --- |
| creer une organisation | `POST /api/organizations` | creation d'une organisation |
| lister toutes les orgas | `GET /api/organizations` | reserve super-admin |
| lire une orga | `GET /api/organizations/:organizationSlug` | reserve aux membres |
| lister mes orgas | `GET /api/users/me/organizations` | l'utilisateur courant |
| creer un projet dans une orga | `POST /api/organizations/:organizationSlug/projects` | reserve admin/owner de l'orga |
| lister les projets d'une orga | `GET /api/organizations/:organizationSlug/projects` | reserve aux membres |
| lister mes projets | `GET /api/users/me/projects` | l'utilisateur courant |

### 3.2 Correspondance entre l'existant et la cible

| Aujourd'hui | Demain | Pourquoi |
| --- | --- | --- |
| `POST /api/organizations` | `POST /api/organizations` | deja bon |
| `GET /api/organizations` | `GET /api/organizations` | deja bon, a stabiliser |
| `GET /api/organizations/me` | `GET /api/users/me/organizations` | plus clair, on parle des ressources de l'utilisateur courant |
| `GET /api/organizations/:organizationSlug` | `GET /api/organizations/:organizationSlug` | deja bon, a corriger |
| `POST /api/projects` + header `x-organization-slug` | `POST /api/organizations/:organizationSlug/projects` | beaucoup plus REST |
| `GET /api/projects/organization?organizationSlug=...` | `GET /api/organizations/:organizationSlug/projects` | beaucoup plus REST |
| `GET /api/projects/me` | `GET /api/users/me/projects` | plus clair |

### 3.3 Ce qu'on garde dans la structure du projet

Je te conseille cette organisation cible:

```txt
features/
  organizations/
    api/
    components/
    hooks/
    server/
      route.ts
      me-route.ts
      serializers.ts
    schemas.ts

  projects/
    api/
    components/
    hooks/
    server/
      route.ts
      me-route.ts
      serializers.ts
    schemas.ts

lib/
  middlewares/
    app-context.ts
    require-auth.ts
    require-super-admin.ts
    load-organization.ts
    require-organization-member.ts
    require-organization-admin.ts
```

Remarque importante:

- `features/organizations/server/route.ts` pourra continuer a gerer `/organizations`
- `features/projects/server/route.ts` pourra gerer les routes imbriquees sous `/organizations/:organizationSlug/projects`
- `features/*/server/me-route.ts` servira pour les routes `/users/me/...`

Si tu preferes limiter le nombre de fichiers au debut, tu peux garder moins de fichiers et extraire plus tard.
Mais pedagogiquement, cette separation est tres saine.

---

## 4. L'ordre de migration que je te recommande

Ne change pas tout d'un coup.
Fais la migration dans cet ordre:

1. fixer le contrat HTTP cible
2. nettoyer les middlewares et les types de contexte
3. corriger les routes organizations
4. refondre les routes projects en routes imbriquees sous organization
5. stabiliser les DTO / reponses JSON
6. mettre a jour les hooks front
7. mettre a jour Prisma
8. mettre a jour la doc interne
9. tester manuellement tout le flux

Pourquoi cet ordre est bon:

- tu clarifies d'abord la cible
- tu mets ensuite une base middleware propre
- tu changes d'abord les ressources les plus simples
- tu refactores ensuite la ressource la plus imbriquee: `projects`
- tu finis par la base de donnees et les appels clients

---

## 5. Etape 1 - Ecrire noir sur blanc le contrat de ton API

### Objectif

Avant de coder, tu dois savoir exactement:

- quelles routes existent
- quel est leur role
- quels middlewares elles utilisent
- quelle est la forme de leur requete
- quelle est la forme de leur reponse

### Fichiers a toucher

- `app/(docs)/api-docs/page.tsx`
- ce guide peut aussi servir de source de verite pendant la migration

### Ce que tu dois faire

Pour chaque route cible, decris:

1. la methode HTTP
2. l'URL
3. les middlewares
4. le body ou la query
5. la reponse JSON
6. les codes d'erreur possibles

### Exemple cible

```txt
POST /api/organizations/:organizationSlug/projects
```

Body:

```json
{
  "name": "RailFlow Core",
  "slug": "railflow-core",
  "description": "Projet principal"
}
```

Succes:

```json
{
  "data": {
    "id": "clx123",
    "name": "RailFlow Core",
    "slug": "railflow-core",
    "description": "Projet principal",
    "organizationId": "org_123",
    "ownerId": "user_123"
  }
}
```

Erreurs possibles:

- `401` si non connecte
- `403` si membre mais pas admin
- `404` si l'organisation n'existe pas
- `409` si le slug existe deja dans cette organisation

### Definition of done

Tu peux passer a l'etape suivante quand:

- tu sais nommer toutes les routes finales
- tu sais ou ira chaque route dans la structure `features/*`
- tu sais quelles routes vont disparaitre

---

## 6. Etape 2 - Nettoyer les middlewares avant de toucher les routes

### Pourquoi il faut commencer par la

Aujourd'hui, tes middlewares melangent plusieurs responsabilites.
Quand un middleware fait trop de choses, les routes deviennent confuses.

Tu veux obtenir une chaine simple:

```txt
requireAuth
-> loadOrganization
-> requireOrganizationMember
-> requireOrganizationAdmin
```

Chaque middleware doit faire une seule chose.

### Fichiers a toucher

- `lib/middlewares/session-middleware.ts`
- `lib/middlewares/admin-session-middleware.ts`
- `lib/middlewares/organization-session-middleware.ts`

Et je te recommande de creer:

- `lib/middlewares/app-context.ts`
- `lib/middlewares/require-auth.ts`
- `lib/middlewares/require-super-admin.ts`
- `lib/middlewares/load-organization.ts`
- `lib/middlewares/require-organization-member.ts`
- `lib/middlewares/require-organization-admin.ts`

### Ce que tu dois apprendre ici

Un bon middleware:

- lit le contexte
- valide une condition
- enrichit le contexte
- ou bloque la requete

Mais il ne doit pas:

- refaire des requetes deja faites par un autre middleware
- revalider 3 fois la meme chose
- dependre d'un header custom si l'URL suffit

### Le vrai probleme actuel

Ton middleware d'organisation lit:

- `id`
- `slug`
- `x-organization-id`
- `x-organization-slug`
- `organizationId`
- `organizationSlug`

Ca veut dire qu'une meme information metier peut venir de plusieurs endroits.
En REST, c'est une source de confusion.

### Ce que je te recommande

#### 6.1 Cree un type de contexte partage

But: ne plus dupliquer `AdditionalContext` dans 3 fichiers.

Exemple:

```ts
// lib/middlewares/app-context.ts
import type { Organization, Role } from "@prisma/client";

export type AppVariables = {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    isSuperAdmin: boolean;
  };
  session: {
    id: string;
    expiresAt: Date;
  };
  organization: Organization;
  organizationRole: Role;
};

export type AppEnv = {
  Variables: AppVariables;
};
```

#### 6.2 Remplace `sessionMiddleware` par `requireAuth`

Responsabilite:

- verifier la session
- mettre `user` et `session` dans `c`

Il ne doit pas:

- resoudre une organisation
- verifier les droits admin

#### 6.3 Remplace `adminSessionMiddleware` par `requireSuperAdmin`

Responsabilite:

- verifier `c.get("user").isSuperAdmin`

#### 6.4 Decoupe `organizationSessionMiddleware`

Au lieu d'un gros middleware, fais deux briques:

- `loadOrganization`: lit seulement `organizationSlug` depuis `c.req.param("organizationSlug")`, charge l'organisation, la stocke dans `c`
- `requireOrganizationMember`: verifie que l'utilisateur courant est membre, puis stocke `organizationRole`

#### 6.5 Fais de `requireOrganizationAdmin` un middleware tres simple

Il ne doit pas refaire une requete Prisma si `organizationRole` existe deja.

Exemple:

```ts
const role = c.get("organizationRole");

if (!role || !["ADMIN", "OWNER"].includes(role)) {
  return c.json({ error: "Forbidden" }, 403);
}
```

### Definition of done

Tu peux passer a l'etape suivante quand:

- chaque middleware a une responsabilite unique
- l'organisation est resolue uniquement depuis le param `organizationSlug`
- aucune route n'a besoin d'un header `x-organization-*`

---

## 7. Etape 3 - Refactorer les routes organizations

### Fichiers a toucher

- `features/organizations/server/route.ts`
- `features/organizations/server/me-route.ts` a creer
- `features/organizations/server/serializers.ts` a creer
- `features/organizations/schemas.ts`

### Ce que cette feature doit gerer a la fin

Dans `features/organizations`, tu veux:

- `POST /api/organizations`
- `GET /api/organizations`
- `GET /api/organizations/:organizationSlug`
- `GET /api/users/me/organizations`

### 7.1 Garde `POST /organizations`, mais rends-la propre

Objectif:

- `201` au lieu de `200`
- payload stable
- gestion propre du conflit de slug

Exemple de logique:

```ts
.post(
  "/",
  requireAuth,
  zValidator("json", createOrganizationSchema),
  async (c) => {
    const user = c.get("user");
    const { name, slug } = c.req.valid("json");

    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        ownerId: user.id,
        organizationMembers: {
          create: {
            role: "OWNER",
            userId: user.id,
          },
        },
      },
    });

    return c.json({ data: serializeOrganization(organization) }, 201);
  }
)
```

### 7.2 Garde `GET /organizations` pour le super-admin

Mais ajoute au minimum:

- une reponse stable
- idealement une pagination plus tard

Pour cette premiere migration, si tu veux aller vite:

- garde `findMany()`
- mais pense a ajouter plus tard `page`, `limit`, `total`

### 7.3 Corrige `GET /organizations/:organizationSlug`

Cette route doit devenir propre:

- `requireAuth`
- `loadOrganization`
- `requireOrganizationMember`
- `zValidator("query", getOrganizationQuerySchema)`

Puis dans le handler:

- tu recuperes l'organisation depuis `c.get("organization")`
- tu ne refais pas un `findUnique` inutile

Exemple de squelette:

```ts
.get(
  "/:organizationSlug",
  requireAuth,
  loadOrganization,
  requireOrganizationMember,
  zValidator("query", getOrganizationQuerySchema),
  async (c) => {
    const organization = c.get("organization");
    const { includeOwner } = c.req.valid("query");

    return c.json({
      data: serializeOrganizationDetail(organization, { includeOwner }),
    });
  }
)
```

### 7.4 Cree `GET /users/me/organizations`

Je te conseille de le sortir dans:

- `features/organizations/server/me-route.ts`

Pourquoi:

- la route concerne "les organisations de l'utilisateur courant"
- elle ne vit pas naturellement sous `/organizations/:slug`
- elle sera plus lisible si elle est isolee

Tu peux retourner:

```json
{
  "data": [
    {
      "role": "OWNER",
      "organization": {
        "id": "org_1",
        "name": "Acme",
        "slug": "acme"
      }
    }
  ]
}
```

Tu peux aussi aplatir plus tard si tu preferes:

```json
{
  "data": [
    {
      "id": "org_1",
      "name": "Acme",
      "slug": "acme",
      "role": "OWNER"
    }
  ]
}
```

Pour un debutant, je te conseille de garder la forme actuelle au debut, puis d'aplatir plus tard si besoin.

### 7.5 Corrige le schema `includeOwner`

Aujourd'hui, `includeOwner` est traite comme optionnel dans le code mais obligatoire dans le schema.

Je te recommande:

```ts
export const getOrganizationQuerySchema = z.object({
  includeOwner: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => v === true || v === "true"),
});
```

Encore mieux si tu veux quelque chose de plus net:

```ts
export const getOrganizationQuerySchema = z.object({
  includeOwner: z.coerce.boolean().optional().default(false),
});
```

### 7.6 Attention a la fuite de donnees

Si tu fais `include: { owner: true }`, Prisma renvoie tout l'objet `User`.

Dans ton schema Prisma, `User` contient aussi:

- `email`
- `emailVerified`
- `isSuperAdmin`

Tu ne veux probablement pas exposer ca.

Donc, quand `includeOwner = true`, selectionne seulement:

- `id`
- `name`
- `image`

### Definition of done

Tu peux passer a l'etape suivante quand:

- toutes les routes organizations fonctionnent sans header custom
- `GET /organizations/:organizationSlug` n'a plus de requete Prisma inutile
- `includeOwner` est bien optionnel
- le owner ne fuite pas les champs sensibles

---

## 8. Etape 4 - Refondre les routes projects en vraies routes REST

### Fichiers a toucher

- `features/projects/server/route.ts`
- `features/projects/server/me-route.ts` a creer
- `features/projects/server/serializers.ts` a creer
- `features/projects/schemas.ts`

### La logique metier a garder en tete

Un projet appartient a une organisation.

Donc, en REST, les routes qui parlent des projets d'une organisation doivent etre imbriquees sous l'organisation.

Le bon modele mental est:

```txt
organization -> projects
```

Donc:

- pas de header `x-organization-slug`
- pas de `GET /projects/organization?...`
- oui a `GET /organizations/:organizationSlug/projects`
- oui a `POST /organizations/:organizationSlug/projects`

### 8.1 La route de creation cible

Route cible:

```txt
POST /api/organizations/:organizationSlug/projects
```

Middlewares:

- `requireAuth`
- `loadOrganization`
- `requireOrganizationMember`
- `requireOrganizationAdmin`
- `zValidator("json", createProjectSchema)`

Handler:

- lire `user` depuis le contexte
- lire `organization` depuis le contexte
- creer le projet dans cette organisation
- retourner `201`

### 8.2 La route de lecture cible

Route cible:

```txt
GET /api/organizations/:organizationSlug/projects
```

Middlewares:

- `requireAuth`
- `loadOrganization`
- `requireOrganizationMember`

Important: cette route doit etre reservee aux membres de l'organisation.

Ton code actuel a une faille ici: un utilisateur authentifie peut lire les projets d'une organisation s'il connait son slug.

### 8.3 La route "mes projets"

Cree:

```txt
GET /api/users/me/projects
```

Je te conseille de la mettre dans:

- `features/projects/server/me-route.ts`

### 8.4 Exemple de squelette pour la route projects

```ts
const app = new Hono()
  .get(
    "/",
    requireAuth,
    loadOrganization,
    requireOrganizationMember,
    async (c) => {
      const organization = c.get("organization");

      const projects = await prisma.project.findMany({
        where: {
          organizationId: organization.id,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          organizationId: true,
        },
      });

      return c.json({ data: projects.map(serializeProjectSummary) });
    }
  )
  .post(
    "/",
    requireAuth,
    loadOrganization,
    requireOrganizationMember,
    requireOrganizationAdmin,
    zValidator("json", createProjectSchema),
    async (c) => {
      const user = c.get("user");
      const organization = c.get("organization");
      const { name, slug, description } = c.req.valid("json");

      const project = await prisma.project.create({
        data: {
          name,
          slug,
          description: description ?? "",
          ownerId: user.id,
          organizationId: organization.id,
          projectMembers: {
            create: {
              role: "OWNER",
              userId: user.id,
            },
          },
        },
      });

      return c.json({ data: serializeProjectDetail(project) }, 201);
    }
  );
```

### 8.5 Ou monter cette route dans Hono

Tu as deux options.

#### Option recommandee

Monter `features/projects/server/route.ts` sous:

```txt
/organizations/:organizationSlug/projects
```

Exemple dans `app/api/[[...route]]/route.ts`:

```ts
const routes = app
  .route("/organizations", organizationsRoutes)
  .route("/organizations/:organizationSlug/projects", organizationProjectsRoutes)
  .route("/users/me/organizations", myOrganizationsRoutes)
  .route("/users/me/projects", myProjectsRoutes);
```

#### Option de secours

Si Hono te donne du fil a retordre avec un prefixe dynamique:

- garde l'URL REST
- mais definis provisoirement ces endpoints dans `features/organizations/server/route.ts`
- en important la logique metier depuis `features/projects/server/...`

L'important est l'URL.
Le rangement exact peut venir juste apres.

### 8.6 Corrige le schema projects

Ton schema actuel:

```ts
export const getProjectsByOrganizationSchema = z.object({
  organizationSlug: z.string().min(3).max(100).optional(),
  organizationId: z.string().min(3).max(100).optional(),
});
```

Avec une vraie route REST imbriquee, ce schema n'a plus lieu d'etre.
Tu peux le supprimer quand tu n'utilises plus `GET /projects/organization`.

### Definition of done

Tu peux passer a l'etape suivante quand:

- `POST /projects` n'existe plus
- `GET /projects/organization` n'existe plus
- les projets d'une organisation sont lus et crees via `organizations/:organizationSlug/projects`
- plus aucun header `x-organization-slug` n'est necessaire

---

## 9. Etape 5 - Stabiliser les reponses avec des serializers

### Pourquoi c'est important

Quand tu renvoies directement des objets Prisma:

- tu exposes parfois trop de champs
- le contrat HTTP devient fragile
- un changement Prisma peut casser le front

La bonne habitude:

- Prisma sert a lire les donnees
- les serializers servent a construire la reponse HTTP

### Fichiers a creer

- `features/organizations/server/serializers.ts`
- `features/projects/server/serializers.ts`

### Exemple simple

```ts
// features/projects/server/serializers.ts
export function serializeProjectSummary(project: {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  organizationId: string;
}) {
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    description: project.description ?? "",
    organizationId: project.organizationId,
  };
}
```

### Pour `Organization`

Je te conseille au moins deux formes:

- `serializeOrganizationSummary`
- `serializeOrganizationDetail`

Et pour le detail avec owner:

- ne jamais exposer tout `User`
- construire un owner DTO limite

Exemple:

```ts
owner: includeOwner && organization.owner
  ? {
      id: organization.owner.id,
      name: organization.owner.name,
      image: organization.owner.image,
    }
  : undefined
```

### Definition of done

Tu peux passer a l'etape suivante quand:

- aucune route ne renvoie un objet Prisma brut sans tri
- tu controles explicitement les champs exposes

---

## 10. Etape 6 - Uniformiser les erreurs et les status codes

### Fichiers a toucher

- `app/api/[[...route]]/route.ts`
- eventuellement `lib/http/responses.ts` a creer
- eventuellement `lib/http/errors.ts` a creer

### Pourquoi c'est important

Une API agreable a maintenir:

- renvoie toujours des erreurs dans le meme format
- utilise les bons status codes
- n'oblige pas le front a deviner

### Option simple pour debuter

Garde cette convention:

Succes:

```json
{
  "data": {}
}
```

Erreur:

```json
{
  "error": "Message lisible"
}
```

Ce n'est pas parfait, mais deja coherent.

### Option un peu plus propre

Tu peux aller vers:

```json
{
  "error": {
    "code": "ORGANIZATION_NOT_FOUND",
    "message": "Organisation non trouvee"
  }
}
```

### Ce que je te recommande dans Hono

Ajoute au moins:

```ts
app.notFound((c) => {
  return c.json({ error: "Route non trouvee" }, 404);
});

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Erreur serveur" }, 500);
});
```

Puis, dans les handlers:

- `201` sur les creations
- `409` sur les slugs deja pris
- `403` pour les problemes de droits
- `401` si la session est absente ou invalide

### Definition of done

Tu peux passer a l'etape suivante quand:

- toutes les creations renvoient `201`
- tous les doublons de slug renvoient `409`
- tu as un `notFound` et un `onError` globaux

---

## 11. Etape 7 - Mettre a jour Prisma pour coller au nouveau contrat

### Fichier a toucher

- `prisma/schema.prisma`

### Le point tres important

Ton API et ta base doivent raconter la meme verite metier.

Si ton API dit:

- un utilisateur ne doit etre membre qu'une seule fois d'une organisation

Alors ta base doit l'imposer.

### 11.1 Ajoute une unicite sur les memberships

Pour `OrganizationMember`:

```prisma
@@unique([organizationId, userId])
```

Pour `ProjectMember`:

```prisma
@@unique([projectId, userId])
```

### 11.2 Reflechis a l'unicite du slug projet

Aujourd'hui:

```prisma
slug String @unique
```

Si ton URL finale est:

```txt
/org/:organizationSlug/:projectSlug
```

Alors il est souvent plus logique d'autoriser:

- le meme `projectSlug` dans deux organisations differentes

Dans ce cas, ton modele devient:

```prisma
slug String

@@unique([organizationId, slug])
```

### 11.3 Ne commence pas par cette migration si tu es stress

Si tu debutes, fais d'abord:

- les routes
- les middlewares
- le front

Puis seulement ensuite:

- la migration Prisma

Comme ca, tu comprends mieux pourquoi tu changes le schema.

### Definition of done

Tu peux passer a l'etape suivante quand:

- les memberships sont proteges contre les doublons
- ta regle d'unicite sur le slug projet est claire

---

## 12. Etape 8 - Mettre a jour le client Hono et les hooks front

### Fichiers a toucher

- `lib/rpc.ts`
- `features/organizations/api/use-create-organization.ts`
- `features/organizations/api/use-get-organizations-by-user-id.ts`
- `features/projects/components/api/use-create-project.ts`
- `features/projects/components/api/use-get-projects-by-organization.ts`
- `features/projects/components/api/use-get-projects-by-user-id.ts`
- `features/projects/components/project-admin-list.tsx`
- `features/projects/components/forms/create-project-form.tsx`
- `features/organizations/components/select-organization.tsx`

### Bonne nouvelle

`lib/rpc.ts` ne changera probablement presque pas:

```ts
export const client = hc<AppType>(process.env.NEXT_PUBLIC_API_URL!);
```

Ce qui change, c'est `AppType`, donc les chemins types du client Hono.

### 12.1 Mise a jour de la creation de projet

Aujourd'hui:

- tu envoies `organizationSlug` dans un header

Demain:

- tu l'envoies dans `param`

Exemple cible:

```ts
const response = await client.api.organizations[":organizationSlug"].projects.$post({
  param: { organizationSlug },
  json,
});
```

### 12.2 Mise a jour de la lecture des projets d'une organisation

Exemple cible:

```ts
const response =
  await client.api.organizations[":organizationSlug"].projects.$get({
    param: { organizationSlug },
  });
```

### 12.3 Mise a jour des routes `/users/me/...`

Pour les orgas:

```ts
await client.api.users.me.organizations.$get();
```

Pour les projets:

```ts
await client.api.users.me.projects.$get();
```

### 12.4 Nettoyages front que je te conseille

#### a. Supprimer les faux arguments `userId`

Dans tes hooks:

- `useGetOrganizationsByUserId`
- `useGetProjectsByUserId`

le `userId` n'est pas vraiment utilise par l'API, car l'API lit deja la session courante.

Donc renomme plutot:

- `useGetMyOrganizations`
- `useGetMyProjects`

#### b. Remplacer `pathname.split("/")[2]`

Dans `project-admin-list.tsx`, tu recuperes le slug de l'organisation via `usePathname()` puis `split`.

Je te conseille plutot:

```ts
const params = useParams();
const organizationSlug = params.organizationSlug as string;
```

Plus lisible, moins fragile.

#### c. Corriger la redirection apres creation d'un projet

Aujourd'hui, ton hook pousse:

```ts
router.push(`/org/${response.data.slug}/`);
```

Le probleme:

- `response.data.slug` est le slug du projet
- pas celui de l'organisation

Si ton URL front finale est:

```txt
/org/:organizationSlug/:projectSlug
```

alors la redirection devrait ressembler a:

```ts
router.push(`/org/${organizationSlug}/${response.data.slug}`);
```

### Definition of done

Tu peux passer a l'etape suivante quand:

- plus aucun hook n'utilise `x-organization-slug`
- les hooks `/me` ne prennent plus de `userId` inutile
- la navigation apres creation d'un projet est correcte

---

## 13. Etape 9 - Mettre a jour le routeur Hono principal

### Fichier a toucher

- `app/api/[[...route]]/route.ts`

### Ce que ce fichier doit faire

Ce fichier ne doit pas contenir de logique metier.
Il doit seulement:

- creer l'app Hono principale
- monter les sous-routes
- exporter les handlers HTTP
- brancher les gestionnaires globaux d'erreur

### Exemple cible

```ts
import { Hono } from "hono";
import { handle } from "hono/vercel";

import organizationsRoutes from "@/features/organizations/server/route";
import myOrganizationsRoutes from "@/features/organizations/server/me-route";
import organizationProjectsRoutes from "@/features/projects/server/route";
import myProjectsRoutes from "@/features/projects/server/me-route";

const app = new Hono().basePath("/api");

app.notFound((c) => c.json({ error: "Route non trouvee" }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Erreur serveur" }, 500);
});

const routes = app
  .route("/organizations", organizationsRoutes)
  .route("/organizations/:organizationSlug/projects", organizationProjectsRoutes)
  .route("/users/me/organizations", myOrganizationsRoutes)
  .route("/users/me/projects", myProjectsRoutes);

export const GET = handle(routes);
export const POST = handle(routes);
export const PUT = handle(routes);
export const PATCH = handle(routes);
export const DELETE = handle(routes);

export type AppType = typeof routes;
```

### Definition of done

Tu peux passer a l'etape suivante quand:

- `route.ts` principal ne fait que de l'orchestration
- toutes les sous-routes montent correctement
- `AppType` continue a typer le client Hono

---

## 14. Etape 10 - Mettre a jour la documentation interne

### Fichier a toucher

- `app/(docs)/api-docs/page.tsx`

### Pourquoi c'est indispensable

Une doc fausse est pire qu'une absence de doc.

Actuellement, ta doc et ton serveur ne racontent pas exactement la meme chose.
Pendant la migration, corrige-la en meme temps.

### Ce que tu dois faire

Mettre a jour:

- les URLs
- les middlewares
- les query params
- les structures de body
- les structures de reponse

### Exemples de corrections

#### Avant

- la doc de creation de projet parle d'un body avec `organizationSlug`
- le serveur attend un header custom

#### Apres

- la doc de creation de projet doit montrer:

```txt
POST /api/organizations/:organizationSlug/projects
```

Body:

```json
{
  "name": "string",
  "slug": "string",
  "description": "string?"
}
```

### Definition of done

Tu peux considerer la migration comme quasi terminee quand:

- la doc correspond exactement au code
- chaque route y apparait avec le bon contrat

---

## 15. Etape 11 - Verification manuelle complete

Voici ton plan de test manuel.

Fais-le dans cet ordre.

### 15.1 Organizations

1. creer une organisation
2. verifier que la reponse est en `201`
3. verifier que le slug est bien enregistre
4. appeler `GET /api/users/me/organizations`
5. verifier que l'organisation creee apparait
6. appeler `GET /api/organizations/:organizationSlug`
7. verifier que seuls les membres y ont acces

### 15.2 Projects

1. depuis une organisation valide, creer un projet
2. verifier que la reponse est en `201`
3. verifier que le projet est bien lie a la bonne organisation
4. appeler `GET /api/organizations/:organizationSlug/projects`
5. verifier que la liste contient le projet
6. verifier qu'un non-membre recoit `403`

### 15.3 Erreurs

Teste aussi:

- creation avec slug deja pris
- `organizationSlug` inconnu
- absence de session
- membre simple qui essaie de creer un projet

Tu dois obtenir respectivement:

- `409`
- `404`
- `401`
- `403`

---

## 16. Bonus - Les ameliorations que tu peux garder pour apres

Ne te surcharge pas.
Voici ce que tu peux faire dans un second temps:

- pagination sur `GET /organizations`
- pagination sur `GET /organizations/:organizationSlug/projects`
- route detail projet: `GET /api/organizations/:organizationSlug/projects/:projectSlug`
- `PATCH` et `DELETE` sur organization/project
- helpers de reponse `ok()` et `fail()`
- tests automatises d'integration
- vraie couche service si la logique Prisma grossit

---

## 17. Plan de commits que je te recommande

Si tu veux apprendre proprement, fais plusieurs petits commits:

1. `refactor(api): normalize middleware responsibilities`
2. `refactor(organizations): move current-user organization routes to /users/me`
3. `refactor(projects): move organization project routes under /organizations/:organizationSlug/projects`
4. `refactor(api): add serializers and uniform error handling`
5. `refactor(client): update hono hooks to new REST routes`
6. `refactor(prisma): add membership uniqueness and project slug strategy`
7. `docs(api): update internal API docs`

Avec ce decoupage, tu apprends mieux et tu identifies plus facilement ce qui casse.

---

## 18. Les erreurs classiques a eviter

Quand tu feras la migration, fais attention a ne pas:

- remettre `organizationSlug` dans un header custom
- utiliser la query pour identifier une ressource principale
- refaire une requete Prisma alors qu'un middleware a deja charge la donnee
- renvoyer un objet Prisma `User` complet
- melanger `401` et `403`
- garder des noms de hooks mensongers comme `useGetOrganizationsByUserId` si l'API utilise la session

---

## 19. Si tu veux aller encore plus propre

Quand cette migration sera finie, tu pourras viser cette philosophie:

- les middlewares gerent auth et contexte
- les routes gerent HTTP
- Prisma lit la base
- les serializers construisent les DTO
- les hooks front ne font qu'appeler l'API et gerer React Query

C'est une tres bonne base fullstack.

---

## 20. Resume ultra court

Si je te donnais la migration en une phrase:

> Fais sortir le contexte d'organisation des headers/query et mets-le dans l'URL, puis nettoie les middlewares autour de cette decision.

Et si je te donnais les 3 priorites absolues:

1. remplace `POST /projects` par `POST /organizations/:organizationSlug/projects`
2. remplace `GET /projects/organization` par `GET /organizations/:organizationSlug/projects`
3. decoupe les middlewares pour que chacun fasse une seule chose

---

## 21. Comment utiliser ce guide avec moi

Le plus efficace maintenant, c'est de faire la migration avec moi par petites etapes.

Je te conseille de proceder ainsi:

1. tu choisis une etape de ce guide
2. tu me demandes de la faire avec toi
3. je t'explique le pourquoi
4. on modifie les fichiers ensemble
5. on verifie que tout fonctionne

Le meilleur ordre pour commencer avec moi est:

1. etape 2: middlewares
2. etape 3: organizations
3. etape 4: projects
4. etape 8: hooks front
5. etape 9: routeur Hono principal

Si tu bloques, ce n'est pas grave du tout.
Cette migration est un excellent cas d'apprentissage fullstack.
