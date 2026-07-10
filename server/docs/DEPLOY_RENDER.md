# HealSpace — Phase 11 Déploiement Render

## Objectif

Déployer le backend HealSpace sur Render avec :

- Web Service Node.js ;
- PostgreSQL managé Render ;
- Prisma generate ;
- Prisma migrate deploy ;
- variables d’environnement de production ;
- healthcheck `/api/health` ;
- Swagger disponible sur `/api/docs`.

## Référence Render

Render permet de créer un Web Service Node/Express depuis un repository Git, avec des variables d’environnement dans le dashboard. Render Blueprints utilisent un fichier `render.yaml` à la racine du dépôt pour définir services et bases de données. Render recommande aussi une étape de migration Prisma via Pre-Deploy Command ou mécanisme équivalent pour appliquer les migrations avant l’exécution applicative.

## Fichiers à copier

Dans `server/` :

```text
scripts/render-start.sh
scripts/render-health-check.js
.env.production.example
docs/DEPLOY_RENDER.md
integration/package.json
```

À la racine du repository `HealSpace_Startup/` :

```text
render.yaml
```

Le fichier Render est dans le package ici :

```text
render-root/render.yaml
```

Une copie visible est aussi fournie :

```text
render-root/render.visible.yaml
```

## Installation locale

Depuis `server` :

```bash
chmod +x scripts/render-start.sh
npm install
```

Vérifier que les scripts existent :

```bash
npm run | grep render
```

## Déploiement avec Blueprint

Structure attendue :

```text
HealSpace_Startup/
├── render.yaml
└── server/
    ├── package.json
    ├── prisma/
    ├── scripts/render-start.sh
    └── src/
```

Ensuite :

1. Pousser le repository sur GitLab ou GitHub.
2. Aller sur Render.
3. New → Blueprint.
4. Choisir le repository.
5. Render lit `render.yaml`.
6. Renseigner les variables `sync: false`.
7. Lancer le déploiement.

## Déploiement manuel sans Blueprint

Créer d’abord une base PostgreSQL Render.

Puis créer un Web Service :

```text
Runtime: Node
Root Directory: server
Build Command: npm ci && npx prisma generate
Start Command: sh scripts/render-start.sh
Health Check Path: /api/health
```

Mettre `DATABASE_URL` avec l’Internal Database URL du PostgreSQL Render.

## Variables importantes

### Obligatoires

```text
NODE_ENV=production
PORT=10000
DATABASE_URL=<Render Postgres Internal Database URL>
JWT_SECRET=<long secret>
CLIENT_URL=<frontend URL>
CORS_ALLOWED_ORIGINS=<frontend URL>,<api URL>
RATE_LIMIT_ENABLED=true
EXPOSE_ERROR_DETAILS=false
```

### Email

Pour la production :

```text
MAIL_TRANSPORT=smtp
SMTP_HOST=<smtp host>
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<smtp user>
SMTP_PASSWORD=<smtp password>
MAIL_FROM_ADDRESS=no-reply@domain.com
```

En test temporaire, on peut mettre :

```text
MAIL_TRANSPORT=json
```

Mais ce n’est pas adapté à une vraie production.

### Cloudinary

```text
CLOUDINARY_CLOUD_NAME=<cloud name>
CLOUDINARY_API_KEY=<api key>
CLOUDINARY_API_SECRET=<api secret>
CLOUDINARY_MEDIA_FOLDER=healspace/media
RUN_CLOUDINARY_TESTS=false
```

Ne jamais pousser ces valeurs dans Git.

## Démarrage Render

`scripts/render-start.sh` exécute :

```text
npx prisma generate
npx prisma migrate deploy
npm run start
```

Cela garantit que le client Prisma est généré et que les migrations sont appliquées.

## Vérifications après déploiement

Ouvrir :

```text
https://<service>.onrender.com/api/health
https://<service>.onrender.com/api/docs
```

Puis tester :

```bash
API_BASE_URL=https://<service>.onrender.com npm run render:health
```

## Problèmes fréquents

### DATABASE_URL absent

Vérifier que le Web Service a bien une variable `DATABASE_URL`.

Pour Render Postgres, utiliser l’Internal Database URL quand l’API et la base sont dans le même compte/région.

### Migration Prisma échoue

Vérifier les logs Render.

Commande utile :

```bash
npx prisma migrate status
```

### CORS bloque le frontend

Vérifier :

```text
CLIENT_URL
CORS_ALLOWED_ORIGINS
```

Ajouter l’URL réelle du frontend.

### Email verification ne marche pas

Vérifier :

```text
MAIL_TRANSPORT
SMTP_HOST
SMTP_USER
SMTP_PASSWORD
EMAIL_VERIFICATION_URL
```

### Upload Cloudinary échoue

Vérifier :

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

## Checklist avant production réelle

- `NODE_ENV=production`
- `EXPOSE_ERROR_DETAILS=false`
- `RATE_LIMIT_ENABLED=true`
- `JWT_SECRET` long et unique
- `DATABASE_URL` Render interne
- SMTP configuré
- Cloudinary configuré avec de nouvelles clés
- Frontend ajouté dans `CORS_ALLOWED_ORIGINS`
- `/api/health` OK
- `/api/docs` OK
- test login/register OK
- test upload média OK
- logs Render propres
