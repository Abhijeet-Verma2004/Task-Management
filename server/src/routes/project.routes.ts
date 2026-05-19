import { Router } from "express";
import {
  addMember,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  removeMember,
  updateProject
} from "../controllers/project.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createProjectSchema,
  memberSchema,
  projectIdSchema,
  removeMemberSchema,
  updateProjectSchema
} from "../validations/project.validation";

export const projectRoutes = Router();

projectRoutes.use(requireAuth);
projectRoutes.post("/", validate(createProjectSchema), createProject);
projectRoutes.get("/", listProjects);
projectRoutes.get("/:id", validate(projectIdSchema), getProject);
projectRoutes.put("/:id", validate(updateProjectSchema), updateProject);
projectRoutes.delete("/:id", validate(projectIdSchema), deleteProject);
projectRoutes.post("/:id/members", validate(memberSchema), addMember);
projectRoutes.delete("/:id/members/:userId", validate(removeMemberSchema), removeMember);
