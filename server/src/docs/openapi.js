import { commonParameters } from "./components/parameters.js";
import { commonResponses } from "./components/responses.js";
import { commonSchemas } from "./components/schemas.js";
import { securitySchemes } from "./components/security.js";

import { administrationPaths } from "./paths/administration.paths.js";
import { aiPaths } from "./paths/ai.paths.js";
import { authPaths } from "./paths/auth.paths.js";
import { friendshipsPaths } from "./paths/friendships.paths.js";
import { groupsPaths } from "./paths/groups.paths.js";
import { journalPaths } from "./paths/journal.paths.js";
import { mediaPaths } from "./paths/media.paths.js";
import { messagesPaths } from "./paths/messages.paths.js";
import { notificationsPaths } from "./paths/notifications.paths.js";
import { postsPaths } from "./paths/posts.paths.js";
import { reportsPaths } from "./paths/reports.paths.js";
import { supportPaths } from "./paths/support.paths.js";
import { usersPaths } from "./paths/users.paths.js";

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "HealSpace API",
    version: "1.0.0",
    description:
      "Documentation OpenAPI du backend HealSpace : authentification, utilisateurs, publications, messagerie, groupes, soutien, modération, administration et sécurité.",
    contact: {
      name: "HealSpace Backend",
    },
  },
  servers: [
    {
      url: "http://localhost:5000/api",
      description: "Développement local",
    },
  ],
  tags: [
    {
      name: "System",
      description: "Santé et disponibilité de l’API.",
    },
    {
      name: "Auth",
      description:
        "Inscription, connexion, refresh, mot de passe oublié et vérification email.",
    },
    {
      name: "Sessions",
      description: "Gestion avancée des sessions et appareils.",
    },
    {
      name: "Users",
      description:
        "Profils, confidentialité et recherche d’utilisateurs.",
    },
    {
      name: "Posts",
      description: "Publications émotionnelles.",
    },
    {
      name: "Comments",
      description: "Commentaires de publications.",
    },
    {
      name: "Reactions",
      description: "Réactions de soutien.",
    },
    {
      name: "Conversations",
      description: "Conversations directes et de groupe.",
    },
    {
      name: "Messages",
      description: "Messages et accusés de lecture.",
    },
    {
      name: "Media",
      description: "Médias et upload Cloudinary.",
    },
    {
      name: "Groups",
      description: "Groupes publics et privés.",
    },
    {
      name: "Group Invitations",
      description: "Invitations aux groupes privés.",
    },
    {
      name: "Journal",
      description: "Journal émotionnel personnel.",
    },
    {
      name: "Notifications",
      description: "Notifications API et temps réel.",
    },
    {
      name: "Supports",
      description: "Demandes d’écoute, conseils et encouragements.",
    },
    {
      name: "AI",
      description: "Analyse d’humeur et génération de messages.",
    },
    {
      name: "Reports",
      description: "Signalements utilisateur.",
    },
    {
      name: "Moderation",
      description: "Traitement des signalements par les modérateurs.",
    },
    {
      name: "Friendships",
      description: "Demandes d’amitié et liste d’amis.",
    },
    {
      name: "Administration",
      description: "Supervision administrative.",
    },
  ],
  externalDocs: {
    description:
      "Événements Socket.IO documentés dans src/docs/socket-events.md",
  },
  components: {
    securitySchemes,
    schemas: commonSchemas,
    responses: commonResponses,
    parameters: commonParameters,
  },
  paths: {
    ...authPaths,
    ...usersPaths,
    ...postsPaths,
    ...messagesPaths,
    ...mediaPaths,
    ...groupsPaths,
    ...journalPaths,
    ...notificationsPaths,
    ...supportPaths,
    ...aiPaths,
    ...reportsPaths,
    ...friendshipsPaths,
    ...administrationPaths,
  },
};
