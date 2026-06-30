# HealSpace — Startup V1 (refactor architecture)

Projet React/Vite, directement exécutable.

## Installation

```bash
npm install
npm run dev
```

## Architecture

```text
src/
├── components/
│   ├── common/    Avatar, Button, Modal, EmptyState, PageHeader, ProtectedRoute
│   ├── feed/      Feed, Composer, PostCard, PostList, StoriesRow, PublishModal
│   ├── groups/    GroupCard, GroupList
│   ├── layout/    Topbar, LeftSidebar, RightSidebar, MobileNav
│   ├── messages/  ConversationList, ConversationItem, ChatWindow
│   ├── profile/   ProfileHeader, ProfileStats
│   └── ui/        réservé aux futurs composants atomiques (design system)
├── contexts/      AuthContext, ThemeContext, PostsContext, UIContext
├── hooks/         useAuth, useTheme, usePosts, useUI, useDisclosure
├── layouts/       AppLayout (Topbar + sidebars + MobileNav + <Outlet/>)
├── pages/         une page = une route (Accueil, Groupes, Messages, Journal,
│                  Ressources, Urgence, Profil, Notifications, Paramètres, Login)
├── services/      api.js, authService.js, postsService.js (prêts pour le backend)
├── utils/         constants.js, formatters.js
├── data/          mockData.js (sera remplacé par de vraies requêtes API)
└── styles/        global.css (mode clair + mode sombre préparé)
```

## Prochaines étapes (backend)

- Node.js + Express : exposer les routes consommées par `services/*.js`
- Prisma + PostgreSQL : modèles User, Post, Group, Message, JournalEntry
- Socket.io : remplacer l'état local de `MessagesPage` par du temps réel
- JWT : remplacer `authService` mock par une vraie authentification
