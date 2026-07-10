import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";

import {
  getSessions,
  revokeOtherSessions,
  revokeSession,
} from "./session.controller.js";

import { validateSessionIdParam } from "./session.validator.js";

const router = Router();

router.get("/sessions", authMiddleware, getSessions);

router.delete("/sessions/others", authMiddleware, revokeOtherSessions);

router.delete(
  "/sessions/:sessionId",
  authMiddleware,
  validateSessionIdParam,
  revokeSession,
);

export default router;
