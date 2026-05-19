import { z } from "zod";
import { Role } from "@prisma/client";

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(100),
    role: z.nativeEnum(Role).default(Role.MEMBER)
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1)
  })
});
