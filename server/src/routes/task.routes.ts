import { Router } from "express";
import { createTask, deleteTask, getTask, listTasks, updateTask } from "../controllers/task.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createTaskSchema, taskIdSchema, taskQuerySchema, updateTaskSchema } from "../validations/task.validation";

export const taskRoutes = Router();

taskRoutes.use(requireAuth);
taskRoutes.post("/", validate(createTaskSchema), createTask);
taskRoutes.get("/", validate(taskQuerySchema), listTasks);
taskRoutes.get("/:id", validate(taskIdSchema), getTask);
taskRoutes.put("/:id", validate(updateTaskSchema), updateTask);
taskRoutes.delete("/:id", validate(taskIdSchema), deleteTask);
