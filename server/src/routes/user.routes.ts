import { Router } from "express";
import { deleteUser, listUsers } from "../controllers/user.controller";
import { requireAccountAdmin, requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { userIdSchema } from "../validations/user.validation";

export const userRoutes = Router();

userRoutes.use(requireAuth, requireAccountAdmin);
userRoutes.get("/", listUsers);
userRoutes.delete("/:id", validate(userIdSchema), deleteUser);
