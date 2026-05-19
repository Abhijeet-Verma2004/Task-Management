import { Role } from "@prisma/client";
import { z } from "zod";

export const projectIdSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    description: z.string().max(800).optional().nullable()
  })
});

export const updateProjectSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    description: z.string().max(800).optional().nullable()
  })
});

export const memberSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    email: z.string().email().toLowerCase(),
    role: z.nativeEnum(Role).default(Role.MEMBER)
  })
});

export const removeMemberSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    userId: z.string().min(1)
  })
});
