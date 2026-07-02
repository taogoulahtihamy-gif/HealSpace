# HealSpace — Database Design

Version : 1.0  
Statut : Préparation backend

---

## 1. Objectif

Ce document décrit le modèle de données cible de HealSpace.

La base de données doit permettre de gérer :

- les utilisateurs ;
- les publications ;
- les commentaires ;
- les soutiens ;
- les groupes ;
- le journal émotionnel ;
- les messages ;
- les notifications ;
- les médias ;
- les paramètres utilisateur ;
- les futures fonctionnalités IA.

La base choisie est **PostgreSQL**, avec **Prisma ORM**.

---

## 2. Principes de conception

Le modèle de données doit respecter les principes suivants :

### Cohérence

Chaque table possède une responsabilité claire.

### Sécurité

Les données sensibles doivent être protégées.

### Évolutivité

Le modèle doit pouvoir évoluer vers une application mobile, une IA et un système temps réel.

### Traçabilité

Les entités importantes doivent contenir :

```text
createdAt
updatedAt