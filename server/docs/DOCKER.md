# HealSpace — Docker Phase 8

## Objectif

Cette phase ajoute un environnement Docker propre pour lancer :

- l’API Node.js / Express ;
- PostgreSQL ;
- Prisma generate ;
- Prisma migrate deploy ;
- les tests API, secondaires, temps réel et Swagger.

## Fichiers ajoutés

```text
Dockerfile
docker-compose.yml
docker-compose.dev.yml
.dockerignore
.env.docker
.env.docker.example
scripts/docker-entrypoint.sh
scripts/docker-test-check.sh
docs/DOCKER.md
```

## Installation

Copier les fichiers du package à la racine du dossier :

```text
server/
```

Structure attendue :

```text
server/
├── Dockerfile
├── docker-compose.yml
├── docker-compose.dev.yml
├── .dockerignore
├── .env.docker
├── package.json
├── prisma/
├── scripts/
└── src/
```

## Démarrer

Depuis le dossier `server` :

```bash
docker compose up --build
```

L’API sera disponible ici :

```text
http://localhost:5000/api/health
http://localhost:5000/api/docs
```

PostgreSQL sera exposé sur le port hôte :

```text
localhost:5433
```

Dans le réseau Docker, l’API utilise :

```text
db:5432
```

## Tester

Dans un deuxième terminal, depuis `server` :

```bash
docker compose exec api npm run test:api
docker compose exec api npm run test:secondary
docker compose exec api npm run test:realtime
docker compose exec api npm run test:docs
```

Ou :

```bash
./scripts/docker-test-check.sh
```

## Test de sécurité

Le fichier `.env.docker` met volontairement :

```env
RATE_LIMIT_ENABLED=false
```

Cela évite les erreurs `429` pendant les tests métier.

Le test de sécurité force lui-même les variables nécessaires :

```bash
docker compose exec api npm run test:security
```

## Activer les tests Cloudinary

Dans `.env.docker`, renseigner :

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RUN_CLOUDINARY_TESTS=true
```

Puis :

```bash
docker compose restart api
docker compose exec api npm run test:api
```

## Développement avec volume

Pour synchroniser le code local dans le conteneur :

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Commandes utiles

Voir les logs :

```bash
docker compose logs -f api
docker compose logs -f db
```

Ouvrir un shell dans l’API :

```bash
docker compose exec api sh
```

Exécuter Prisma Studio :

```bash
docker compose exec api npx prisma studio --hostname 0.0.0.0
```

Réinitialiser la base Docker :

```bash
docker compose exec api npx prisma migrate reset --force
```

Tout arrêter :

```bash
docker compose down
```

Tout arrêter et supprimer la base Docker :

```bash
docker compose down -v
```

## Production

Ce Dockerfile est adapté au développement et à la préproduction locale.

Avant production :

- remplacer `JWT_SECRET` ;
- ne pas utiliser `postgres/postgres` ;
- mettre `NODE_ENV=production` ;
- mettre `EXPOSE_ERROR_DETAILS=false` ;
- mettre `RATE_LIMIT_ENABLED=true` ;
- configurer un SMTP réel ;
- configurer Cloudinary avec de nouvelles clés ;
- utiliser un reverse proxy HTTPS ;
- utiliser une base PostgreSQL managée ou sécurisée ;
- utiliser un store Redis pour le rate limit si plusieurs instances API sont lancées.

## Dépannage

### Port PostgreSQL déjà occupé

Le compose expose PostgreSQL sur :

```text
5433:5432
```

Donc il ne bloque pas ton PostgreSQL local sur `5432`.

### Prisma échoue au démarrage

Vérifier les logs :

```bash
docker compose logs -f api
docker compose logs -f db
```

Puis réinitialiser la base Docker :

```bash
docker compose down -v
docker compose up --build
```

### Erreur 429 dans les tests métier

Dans `.env.docker` :

```env
RATE_LIMIT_ENABLED=false
```

Puis :

```bash
docker compose restart api
```

### Swagger

Ouvrir :

```text
http://localhost:5000/api/docs
```
