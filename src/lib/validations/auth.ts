import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signUpSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Informe seu nome"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const invitationSchema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido"),
  role: z.enum(["editor", "viewer"]),
  workspaceId: z.string().uuid(),
});
