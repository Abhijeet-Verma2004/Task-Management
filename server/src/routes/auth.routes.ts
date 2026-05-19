import { Router } from "express";
import { login, me, signup } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { loginSchema, signupSchema } from "../validations/auth.validation";

export const authRoutes = Router();

authRoutes.post("/signup", validate(signupSchema), signup);
authRoutes.post("/login", validate(loginSchema), login);
authRoutes.get("/me", requireAuth, me);
