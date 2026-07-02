# HealSpace — Security & Privacy Policy

Version : 1.0  
Statut : Préparation backend

---

## 1. Objectif

Ce document définit les principes de sécurité, de confidentialité et de protection des données de HealSpace.

HealSpace n'est pas une application sociale classique. Elle traite des données potentiellement sensibles liées au bien-être émotionnel, aux messages privés, au journal personnel et à la progression psychologique des utilisateurs.

La sécurité doit donc être considérée comme une exigence centrale du projet.

---

## 2. Principes fondamentaux

### Confidentialité par défaut

Les données privées doivent rester privées par défaut.

### Moindre privilège

Un utilisateur ou un service ne doit accéder qu’aux données strictement nécessaires.

### Transparence

L’utilisateur doit comprendre quelles données sont collectées et pourquoi.

### Sécurité dès la conception

Les mécanismes de sécurité doivent être intégrés dès le début, pas ajoutés après coup.

### Responsabilité

HealSpace ne doit jamais se présenter comme un service médical ou de diagnostic.

---

## 3. Données sensibles

Les données suivantes doivent être considérées comme sensibles :

- entrées du journal émotionnel ;
- humeur quotidienne ;
- messages privés ;
- publications anonymes ;
- données de progression ;
- données liées à l’IA ;
- contacts d’urgence ;
- signalements ;
- informations de profil.

---

## 4. Authentification

L’authentification sera basée sur :

- email ;
- mot de passe ;
- JWT ;
- refresh token ;
- bcrypt.

### Règles

- Le mot de passe ne doit jamais être stocké en clair.
- Les tokens doivent avoir une durée de vie limitée.
- Les refresh tokens doivent pouvoir être révoqués.
- Les routes sensibles doivent être protégées par middleware.

---

## 5. Autorisations

HealSpace utilisera plusieurs rôles :

```text
USER
MODERATOR
ADMIN