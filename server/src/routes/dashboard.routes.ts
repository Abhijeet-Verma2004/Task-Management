import { Router } from "express";
import { dashboardStats } from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth";

export const dashboardRoutes = Router();

dashboardRoutes.get("/stats", requireAuth, dashboardStats);
