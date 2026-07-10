# HealSpace — Phase 11 Render

## À copier

Dans `server/` :

```text
scripts/render-start.sh
scripts/render-health-check.js
.env.production.example
docs/DEPLOY_RENDER.md
integration/package.json
```

Puis remplacer :

```text
server/package.json
```

par :

```text
integration/package.json
```

À la racine du projet `HealSpace_Startup/` :

```text
render-root/render.yaml → render.yaml
```

## Commandes Render

Build Command :

```bash
npm ci && npx prisma generate
```

Start Command :

```bash
sh scripts/render-start.sh
```

Health Check Path :

```text
/api/health
```

## Après copie

Depuis `server` :

```bash
chmod +x scripts/render-start.sh
npm install
```

Vérifier :

```bash
npm run | grep render
```

## Documentation

Lire :

```text
server/docs/DEPLOY_RENDER.md
```
