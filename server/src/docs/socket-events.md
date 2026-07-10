# HealSpace — Événements Socket.IO

## Authentification

Le client se connecte avec le token JWT :

```js
const socket = io("http://localhost:5000", {
  auth: {
    token: accessToken,
  },
});
```

## Événements serveur → client

| Événement                   | Description                                    |
| --------------------------- | ---------------------------------------------- |
| `connection:ready`          | Connexion Socket.IO authentifiée               |
| `notification:new`          | Nouvelle notification utilisateur              |
| `notification:unread-count` | Nouveau compteur de notifications non lues     |
| `message:new`               | Nouveau message dans une conversation rejointe |
| `message:updated`           | Message modifié                                |
| `message:deleted`           | Message supprimé                               |
| `message:read`              | Message marqué comme lu                        |
| `conversation:typing`       | Un participant est en train d’écrire           |
| `conversation:stop-typing`  | Un participant a arrêté d’écrire               |

## Événements client → serveur

| Événement                  | Payload                       |
| -------------------------- | ----------------------------- |
| `conversation:join`        | `{ "conversationId": "..." }` |
| `conversation:leave`       | `{ "conversationId": "..." }` |
| `conversation:typing`      | `{ "conversationId": "..." }` |
| `conversation:stop-typing` | `{ "conversationId": "..." }` |

## Règle de sécurité

Avant d’ajouter un socket à une room :

```text
conversation:<conversationId>
```

le serveur vérifie que l’utilisateur est participant actif de cette conversation.
