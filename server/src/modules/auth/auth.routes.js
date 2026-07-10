import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";

import {
  login,
  logout,
  logoutAll,
  me,
  refresh,
  register,
} from "./auth.controller.js";
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from "./auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/refresh", validate(refreshTokenSchema), refresh);

router.post("/logout", authMiddleware, logout);

router.post("/logout-all", authMiddleware, logoutAll);

router.get("/me", authMiddleware, me);

export default router;
