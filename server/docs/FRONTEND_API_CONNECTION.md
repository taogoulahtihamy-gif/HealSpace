# HealSpace — Phase 12 Connexion frontend React au backend Render

## Objectif

Connecter le frontend React/Vite au backend Render :

```text
https://healspace-523w.onrender.com/api
```

## Fichiers ajoutés

```text
src/config/api.config.js
src/services/api/
src/hooks/useApiHealth.js
src/components/ApiStatusBadge.jsx
```

## Variables frontend

Créer `.env.local` à la racine du frontend :

```env
VITE_API_BASE_URL=https://healspace-523w.onrender.com/api
VITE_SOCKET_URL=https://healspace-523w.onrender.com
```

## Important

Ne jamais mettre ces valeurs dans le frontend :

```text
DATABASE_URL
JWT_SECRET
CLOUDINARY_API_SECRET
SMTP_PASSWORD
```

## Test rapide

Dans `App.jsx` :

```jsx
import { ApiStatusBadge } from "./components/ApiStatusBadge.jsx";

export default function App() {
  return <ApiStatusBadge />;
}
```

Résultat attendu :

```text
API : en ligne
```

## Après validation

On pourra connecter les vrais écrans :

```text
Login
Register
Profil
Posts
Upload média
Messagerie
Notifications Socket.IO
```
