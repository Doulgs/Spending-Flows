import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
});
export type LoginInput = z.infer<typeof loginSchema>;
