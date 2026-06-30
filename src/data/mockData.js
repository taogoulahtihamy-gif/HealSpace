export const posts = [
  {
    id: 1,
    author: "Anonyme #4821",
    avatar: "A",
    group: "Rupture récente",
    time: "12 min",
    mood: "💔",
    content:
      "Aujourd’hui j’ai eu envie de lui écrire, mais j’ai choisi d’écrire ici à la place. Je ne vais pas laisser une émotion décider pour moi.",
    support: "1,2k",
    comments: 248,
    shares: 38,
  },
  {
    id: 2,
    author: "Aïcha",
    avatar: "A",
    group: "Reconstruction personnelle",
    time: "36 min",
    mood: "🌱",
    content:
      "Petit progrès du jour : j’ai marché 20 minutes, j’ai mangé correctement et je n’ai pas regardé son profil. C’est peu, mais c’est réel.",
    support: "843",
    comments: 91,
    shares: 12,
  },
  {
    id: 3,
    author: "Mamadou",
    avatar: "M",
    group: "Motivation quotidienne",
    time: "1 h",
    mood: "✨",
    content:
      "Rappel : guérir ne veut pas dire oublier quelqu’un. Guérir veut dire reprendre sa vie, son calme et son respect de soi.",
    support: "2,8k",
    comments: 412,
    shares: 104,
  },
];

export const groups = [
  {
    icon: "💔",
    name: "Rupture récente",
    members: "12,4k membres",
    description: "Pour celles et ceux qui traversent une rupture, à leur rythme.",
    lastActivity: "Actif il y a 4 min",
    activeNow: 38,
  },
  {
    icon: "🌙",
    name: "Dépression & solitude",
    members: "8,9k membres",
    description: "Un espace calme pour parler des jours difficiles, sans jugement.",
    lastActivity: "Actif il y a 12 min",
    activeNow: 21,
  },
  {
    icon: "🌱",
    name: "Reconstruction personnelle",
    members: "15,1k membres",
    description: "Avancer pas à pas vers une version plus solide de soi-même.",
    lastActivity: "Actif il y a 2 min",
    activeNow: 54,
  },
  {
    icon: "🎓",
    name: "Étudiants sous pression",
    members: "6,7k membres",
    description: "Stress des examens, charge mentale, et solidarité entre étudiants.",
    lastActivity: "Actif il y a 27 min",
    activeNow: 9,
  },
];

export const journalQuotes = [
  "Chaque petit pas compte, même quand il paraît invisible.",
  "Tu n’as pas à guérir vite. Tu as juste à continuer.",
  "Ressentir, c’est déjà avancer.",
  "Ce que tu traverses ne définit pas qui tu es.",
];

export const conversations = [
  {
    id: "conv_1",
    name: "Awa",
    lastMessage: "Merci pour ton commentaire, ça m’a aidée.",
    time: "2 min",
    thread: [
      { id: 1, from: "them", text: "Salut, j’ai vu ton message dans le groupe Rupture.", time: "10:02" },
      { id: 2, from: "me", text: "Salut Awa, comment tu te sens aujourd’hui ?", time: "10:05" },
      { id: 3, from: "them", text: "Merci pour ton commentaire, ça m’a aidée.", time: "10:12" },
    ],
  },
  {
    id: "conv_2",
    name: "Anonyme #1038",
    lastMessage: "Je traverse presque la même chose.",
    time: "9 min",
    thread: [
      { id: 1, from: "them", text: "Je traverse presque la même chose.", time: "09:50" },
    ],
  },
  {
    id: "conv_3",
    name: "Groupe Rupture",
    lastMessage: "Nouveau message dans le salon soutien.",
    time: "18 min",
    thread: [
      { id: 1, from: "them", text: "Nouveau message dans le salon soutien.", time: "09:40" },
    ],
  },
];

export const notifications = [
  {
    id: "notif_1",
    icon: "💙",
    text: "Mamadou a soutenu ta publication.",
    time: "5 min",
    unread: true,
  },
  {
    id: "notif_2",
    icon: "💬",
    text: "Aïcha a commenté dans Reconstruction personnelle.",
    time: "32 min",
    unread: true,
  },
  {
    id: "notif_3",
    icon: "🌱",
    text: "Ton défi du jour est disponible.",
    time: "1 h",
    unread: false,
  },
];

export const journalEntries = [
  { id: "journal_1", date: "Aujourd’hui", mood: "🌱", note: "Petite victoire : j’ai dit non sans culpabiliser." },
  { id: "journal_2", date: "Hier", mood: "😶", note: "Journée plate, mais je n’ai pas reculé sur mes habitudes." },
  { id: "journal_3", date: "Il y a 2 jours", mood: "💪", note: "J’ai repris le sport, ça m’a vidé la tête." },
];

export const resources = [
  {
    id: "res_1",
    title: "Comprendre les phases du deuil affectif",
    type: "Article",
    duration: "6 min de lecture",
  },
  {
    id: "res_2",
    title: "Exercice de respiration 4-7-8",
    type: "Audio guidé",
    duration: "8 min",
  },
  {
    id: "res_3",
    title: "Sortir de la rumination mentale",
    type: "Vidéo",
    duration: "12 min",
  },
];

export const emergencyContacts = [
  { id: "em_1", label: "SOS Amitié", value: "09 72 39 40 50", available: "24h/24" },
  { id: "em_2", label: "Ligne d’écoute HealSpace", value: "Chat en direct", available: "24h/24" },
];

export const trustedContact = {
  name: "Maman",
  relation: "Contact de confiance",
  phone: "06 12 34 56 78",
};

