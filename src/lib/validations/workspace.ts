import { z } from "zod";

export const workspaceSchema = z.object({
  name: z.string().min(2, "Informe um nome para o workspace"),
  type: z.enum(["personal", "business", "family"]),
  currency: z.string().min(3).max(3),
});
export type WorkspaceInput = z.infer<typeof workspaceSchema>;
