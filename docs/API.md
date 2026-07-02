# HealSpace — API Specification

Version : 1.0

Statut : Préparation Backend

---

# 1. Objectif

Ce document décrit toutes les routes de l'API HealSpace.

L'objectif est de :

- standardiser les échanges entre le frontend et le backend ;
- faciliter le développement ;
- documenter chaque endpoint ;
- préparer l'intégration avec l'application mobile.

Toutes les réponses seront au format JSON.

---

# 2. URL de base

Développement

```
http://localhost:5000/api
```

Production

```
https://api.healspace.app/api
```

---

# 3. Authentification

Toutes les routes protégées utilisent :

```
Authorization: Bearer JWT_TOKEN
```

---

# 4. Codes HTTP

| Code | Signification |
|------|---------------|
|200|Succès|
|201|Créé|
|204|Supprimé|
|400|Requête invalide|
|401|Non authentifié|
|403|Interdit|
|404|Introuvable|
|409|Conflit|
|422|Erreur de validation|
|500|Erreur serveur|

---

# 5. Auth API

## POST /auth/register

Créer un compte.

Body

```json
{
  "username":"ezekiel",
  "email":"user@email.com",
  "password":"password"
}
```

Réponse

```json
{
  "token":"JWT",
  "user":{}
}
```

---

## POST /auth/login

Connexion.

Body

```json
{
  "email":"user@email.com",
  "password":"password"
}
```

Réponse

```json
{
  "token":"JWT"
}
```

---

## POST /auth/logout

Déconnexion.

---

## GET /auth/me

Retourne le profil connecté.

---

## PATCH /auth/change-password

Modifier le mot de passe.

---

# 6. Users API

## GET /users/me

Profil connecté.

---

## GET /users/:id

Profil public.

---

## PATCH /users/me

Modifier le profil.

---

## DELETE /users/me

Supprimer son compte.

---

## PATCH /users/avatar

Changer la photo.

---

## PATCH /users/settings

Modifier les préférences.

---

# 7. Posts API

## GET /posts

Liste des publications.

Filtres possibles :

- humeur
- groupe
- auteur
- date

---

## GET /posts/:id

Retourne une publication.

---

## POST /posts

Créer une publication.

Body

```json
{
  "content":"",
  "mood":"hope",
  "anonymous":false
}
```

---

## PATCH /posts/:id

Modifier.

---

## DELETE /posts/:id

Supprimer.

---

## POST /posts/:id/support

Apporter un soutien.

---

## DELETE /posts/:id/support

Retirer son soutien.

---

# 8. Comments API

## GET /posts/:id/comments

Liste des commentaires.

---

## POST /comments

Créer un commentaire.

---

## PATCH /comments/:id

Modifier.

---

## DELETE /comments/:id

Supprimer.

---

# 9. Groups API

## GET /groups

Tous les groupes.

---

## GET /groups/:id

Détail.

---

## POST /groups

Créer.

---

## PATCH /groups/:id

Modifier.

---

## DELETE /groups/:id

Supprimer.

---

## POST /groups/:id/join

Rejoindre.

---

## DELETE /groups/:id/leave

Quitter.

---

# 10. Journal API

## GET /journal

Historique.

---

## POST /journal

Créer une entrée.

---

## PATCH /journal/:id

Modifier.

---

## DELETE /journal/:id

Supprimer.

---

## GET /journal/stats

Statistiques.

---

# 11. Mood API

## POST /moods

Enregistrer une humeur.

---

## GET /moods/history

Historique.

---

## GET /moods/chart

Graphique.

---

# 12. Notifications API

## GET /notifications

Toutes.

---

## PATCH /notifications/:id/read

Marquer comme lue.

---

## PATCH /notifications/read-all

Tout lire.

---

# 13. Messages API

## GET /conversations

Conversations.

---

## POST /conversations

Créer.

---

## GET /messages/:conversationId

Messages.

---

## POST /messages

Envoyer.

---

# 14. Media API

## POST /media/upload

Upload image.

---

## DELETE /media/:id

Supprimer.

---

# 15. Challenge API

## GET /challenges

Tous.

---

## POST /user-challenges

Commencer.

---

## PATCH /user-challenges/:id

Terminer.

---

# 16. IA API

## POST /ai/suggestion

Suggestion.

---

## POST /ai/rewrite

Reformuler.

---

## POST /ai/journal-analysis

Analyse.

---

## POST /ai/challenge

Défi personnalisé.

---

# 17. Admin API

## GET /admin/users

Tous les utilisateurs.

---

## GET /admin/reports

Signalements.

---

## PATCH /admin/reports/:id

Traiter.

---

## DELETE /admin/posts/:id

Supprimer un contenu.

---

# 18. Format des erreurs

Toutes les erreurs doivent respecter ce format.

```json
{
  "success":false,
  "message":"Validation failed",
  "errors":[]
}
```

---

# 19. Pagination

Toutes les listes utiliseront :

```
?page=1

&limit=20
```

---

# 20. Recherche

Toutes les recherches utiliseront :

```
?q=mot
```

---

# 21. Tri

```
?sort=createdAt

?order=desc
```

---

# 22. Versionnement

Toutes les futures versions utiliseront :

```
/api/v1/

/api/v2/
```

---

# 23. Documentation

L'API sera documentée automatiquement avec Swagger/OpenAPI.

---

# 24. Conclusion

Cette spécification constitue le contrat entre le frontend, le backend et les futures applications mobiles.

Aucune route ne devra être développée sans être documentée dans ce fichier.