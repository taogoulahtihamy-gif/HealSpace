import { fakeLatency } from "./api.js";

// Compte de démonstration. Sera remplacé par un vrai appel
// POST /api/auth/login vers Express + Prisma + PostgreSQL.
const DEMO_USER = {
  id: "user_demo_ezekiel",
  name: "Ezekiel",
  initial: "E",
  status: "En reconstruction",
  email: "ezekiel@healspace.app",
  bio: "Je reconstruis ma vie un jour à la fois. Ici pour parler, écouter et avancer.",
};

export const authService = {
  async login(/* email, password */) {
    await fakeLatency(300);
    return { user: DEMO_USER, token: "demo-token" };
  },

  async logout() {
    await fakeLatency(100);
    return true;
  },
};
