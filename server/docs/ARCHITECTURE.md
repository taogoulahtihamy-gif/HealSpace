# HealSpace — Software Architecture

Version : 1.0

Auteur : Équipe HealSpace

---

# 1. Objectif

Ce document décrit l'architecture technique de HealSpace.

Son objectif est de garantir que le projet puisse évoluer pendant plusieurs années sans nécessiter une refonte complète.

Toutes les décisions techniques devront respecter cette architecture.

---

# 2. Principes

L'architecture repose sur plusieurs principes fondamentaux :

• Modularité

Chaque partie du projet doit pouvoir évoluer indépendamment.

• Séparation des responsabilités

Chaque composant possède un rôle précis.

• Évolutivité

L'application doit pouvoir accueillir plusieurs centaines de milliers d'utilisateurs.

• Maintenabilité

Le code doit être simple à comprendre.

• Sécurité

La protection des données est une priorité.

---

# 3. Architecture globale

                Internet
                     │
             React Frontend
                     │
                HTTPS API
                     │
           Node.js + Express
                     │
         Services Métier
                     │
            Prisma ORM
                     │
             PostgreSQL

Services complémentaires

Cloudinary

Socket.io

Firebase (plus tard)

OpenAI API

GitHub Actions

---

# 4. Frontend

Technologies

React

Vite

React Router

Context API

CSS

Organisation

src/

components/

pages/

hooks/

contexts/

services/

styles/

utils/

assets/

Le frontend ne communique jamais directement avec la base de données.

Toutes les requêtes passent par l'API.

---

# 5. Backend

Technologies

Node.js

Express

Prisma

JWT

bcrypt

Helmet

Zod

Architecture

Routes

↓

Controllers

↓

Services

↓

Repositories

↓

Prisma

↓

PostgreSQL

Chaque couche possède une responsabilité unique.

---

# 6. Base de données

La base de données est relationnelle.

SGBD

PostgreSQL

ORM

Prisma

Principales entités

Users

Posts

Comments

Likes

Groups

JournalEntries

Messages

Notifications

Media

---

# 7. Authentification

JWT

Refresh Token

bcrypt

Middleware

Permissions

Rôles

Utilisateur

Modérateur

Administrateur

---

# 8. Gestion des médias

Toutes les images seront stockées sur Cloudinary.

La base de données ne conservera que les URL.

---

# 9. Temps réel

Socket.io sera utilisé pour :

messagerie

notifications

statut en ligne

mise à jour du fil d'actualité

---

# 10. Intelligence Artificielle

L'IA ne sera jamais décisionnaire.

Elle assistera uniquement l'utilisateur.

Fonctions prévues

reformulation

suggestions

analyse émotionnelle non médicale

recommandation de ressources

résumé du journal

défis personnalisés

L'IA ne réalisera jamais de diagnostic.

---

# 11. Déploiement

Frontend

Vercel

Backend

Render

Base

Neon PostgreSQL

Images

Cloudinary

CI/CD

GitHub Actions

---

# 12. Sécurité

HTTPS obligatoire

JWT

bcrypt

Validation Zod

Protection CORS

Logs

Sauvegardes

Rate Limiting

Protection XSS

Protection CSRF

Protection SQL Injection

---

# 13. Évolutivité

L'architecture doit permettre :

Application mobile

API publique

Internationalisation

IA

Microservices si nécessaire

---

# 14. Documentation

Chaque nouvelle fonctionnalité devra être accompagnée :

d'une documentation

de tests

d'un changelog

d'une mise à jour des diagrammes

---

# 15. Conclusion

L'architecture de HealSpace est conçue pour accompagner le projet depuis sa première version jusqu'à une plateforme utilisée à grande échelle.

Les choix techniques privilégient la simplicité, la maintenabilité, la sécurité et l'évolutivité.
