# HealSpace — Phase 10 Qualité de code / SonarQube

## Installation rapide

Copier dans `server/` :

```text
eslint.config.js
.prettierrc.json
.prettierignore
sonar-project.properties
.gitlab-ci.yml
scripts/quality-check.js
docs/QUALITY.md
```

Remplacer :

```text
server/package.json
```

par :

```text
integration/package.json
```

Puis :

```bash
npm install
```

## Vérifier

```bash
npm run quality:config
npm run lint
npm run format
npm run quality:check
```

## GitLab CI

Le pipeline contient maintenant :

```text
quality
sonarqube
```

en plus des jobs déjà présents.

## Fichier caché

`.gitlab-ci.yml` est caché sous Linux.
Utiliser `Ctrl + H` dans l'explorateur Ubuntu ou :

```bash
ls -la
```
