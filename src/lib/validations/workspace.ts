import { z } from "zod";
import { DEFAULT_ACCENT_COLOR } from "@/lib/theme";

export const workspaceSchema = z.object({
  name: z.string().min(2, "Informe um nome para o workspace"),
  type: z.enum(["personal", "business", "family"]),
  currency: z.string().min(3).max(3),
  accent_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Informe uma cor hexadecimal válida")
    .default(DEFAULT_ACCENT_COLOR),
});
export type WorkspaceInput = z.infer<typeof workspaceSchema>;
