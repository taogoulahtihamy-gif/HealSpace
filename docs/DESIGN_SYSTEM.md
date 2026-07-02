# HealSpace — Design System

Version : 1.0

Statut : Officiel

Dernière mise à jour : Juillet 2026

---

# 1. Objectif

Le Design System de HealSpace définit l'ensemble des règles de conception graphique et ergonomique de la plateforme.

Il garantit :

- une interface cohérente ;
- une expérience utilisateur homogène ;
- une meilleure collaboration entre designers et développeurs ;
- une maintenance simplifiée ;
- une identité visuelle forte.

Aucun composant ne devra être développé sans respecter ce document.

---

# 2. Philosophie du Design

HealSpace n'est pas un réseau social classique.

L'interface doit transmettre :

- le calme ;
- la sécurité ;
- la simplicité ;
- la bienveillance ;
- la confiance.

L'utilisateur ne doit jamais se sentir agressé par l'interface.

Chaque élément graphique doit réduire la charge mentale.

---

# 3. Les cinq piliers UX

## Simplicité

Une interface compréhensible en quelques secondes.

## Bienveillance

Aucun élément ne doit encourager la comparaison sociale.

## Accessibilité

L'application doit être utilisable par le plus grand nombre.

## Fluidité

Chaque interaction doit sembler naturelle.

## Confiance

Les actions importantes doivent toujours être explicites.

---

# 4. Identité visuelle

HealSpace repose sur une identité moderne, douce et rassurante.

Les couleurs saturées sont limitées.

Les contrastes agressifs sont évités.

Les animations restent discrètes.

---

# 5. Palette de couleurs

## Couleurs principales

Primary

```text
#2F80ED
```

Utilisation :

- boutons principaux
- liens
- éléments actifs

---

Secondary

```text
#27AE60
```

Utilisation :

- succès
- validation
- encouragement

---

Accent

```text
#F2994A
```

Utilisation :

- alertes légères
- défis
- nouveautés

---

Danger

```text
#EB5757
```

Utilisation :

- suppression
- erreurs
- signalements

---

Background Light

```text
#F8FAFC
```

---

Background Dark

```text
#0F172A
```

---

Surface Light

```text
#FFFFFF
```

---

Surface Dark

```text
#1E293B
```

---

Text Primary

```text
#111827
```

---

Text Secondary

```text
#6B7280
```

---

# 6. Typographie

Police principale

```text
Inter
```

Police secondaire

```text
Poppins
```

Police monospace

```text
JetBrains Mono
```

---

# 7. Hiérarchie des titres

H1

48 px

Bold

---

H2

36 px

Bold

---

H3

28 px

SemiBold

---

H4

24 px

Medium

---

H5

20 px

Medium

---

Texte

16 px

Regular

---

Petit texte

14 px

Regular

---

Caption

12 px

---

# 8. Espacements

Utiliser une grille de 8 pixels.

```text
4

8

16

24

32

40

48

64
```

Tous les composants devront respecter cette grille.

---

# 9. Rayons

Petits éléments

8 px

---

Cards

16 px

---

Fenêtres

24 px

---

Boutons principaux

14 px

---

# 10. Ombres

Shadow XS

Très légère.

Shadow SM

Cards.

Shadow MD

Menus.

Shadow LG

Dialogues.

Les ombres doivent rester discrètes.

---

# 11. Boutons

## Primary

Fond bleu.

Texte blanc.

Hover plus sombre.

Loader intégré.

Icône optionnelle.

---

Secondary

Contour uniquement.

---

Ghost

Fond transparent.

---

Danger

Rouge.

---

Success

Vert.

---

# 12. Champs de formulaire

États :

- normal
- focus
- erreur
- succès
- désactivé

Chaque champ doit afficher clairement son état.

---

# 13. Cards

Les cards représentent l'élément principal de HealSpace.

Une card contient :

Avatar

Nom

Temps

Contenu

Image

Actions

Commentaires

Espacement intérieur :

24 px

Coins :

16 px

---

# 14. Navigation

Navigation inférieure sur mobile.

Sidebar sur desktop.

Header fixe.

Transitions douces.

---

# 15. Icônes

Bibliothèque :

Lucide Icons.

Taille :

20 px

24 px

32 px

Les icônes doivent toujours être accompagnées d'un texte lorsqu'elles représentent une action importante.

---

# 16. Animations

Durée :

150 ms

200 ms

250 ms

Jamais plus de 300 ms pour une interaction courante.

Les animations doivent améliorer la compréhension, jamais distraire.

---

# 17. Responsive

Mobile First.

Breakpoints :

```text
480

768

1024

1280

1536
```

---

# 18. Accessibilité

Contraste WCAG AA minimum.

Navigation clavier complète.

Focus visible.

ARIA labels.

Images avec texte alternatif.

Ne jamais utiliser uniquement une couleur pour transmettre une information.

---

# 19. Dark Mode

Le mode sombre est une fonctionnalité officielle.

Il ne s'agit pas simplement d'inverser les couleurs.

Les contrastes doivent être adaptés.

Les textes doivent rester parfaitement lisibles.

Les icônes doivent conserver une visibilité optimale.

---

# 20. Expérience émotionnelle

HealSpace manipule des émotions.

L'interface doit toujours inspirer :

- le calme ;
- la confiance ;
- la sécurité ;
- l'espoir.

Le design ne doit jamais provoquer d'anxiété.

---

# 21. Règles de développement

Avant de créer un composant, vérifier :

- respecte-t-il la grille ?
- respecte-t-il la palette ?
- respecte-t-il l'accessibilité ?
- est-il responsive ?
- est-il cohérent avec les autres composants ?

---

# 22. Composants officiels

Les composants standards du projet sont :

- Button
- Card
- Avatar
- Badge
- Modal
- Dialog
- Toast
- Alert
- Input
- TextArea
- Select
- Checkbox
- Radio
- Switch
- Tabs
- Navbar
- Sidebar
- Bottom Navigation
- Notification Panel
- Profile Header
- Journal Card
- Mood Selector
- Support Button
- Group Card
- Chat Bubble
- Loading Skeleton
- Empty State
- Error State

Tous ces composants devront être réutilisables.

---

# 23. Règle d'or

Chaque élément de l'interface doit répondre à une question :

> Cette interface aide-t-elle réellement l'utilisateur à se sentir mieux ?

Si la réponse est non, elle doit être repensée.

---

# 24. Conclusion

Le Design System est la référence officielle pour toutes les futures interfaces de HealSpace.

Il garantit une identité visuelle forte, une expérience cohérente et une évolutivité du produit à long terme.