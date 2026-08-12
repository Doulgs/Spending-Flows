import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Informe um nome para a categoria"),
  type: z.enum(["income", "expense"]),
  color: z.string().optional(),
  icon: z.string().optional(),
});
export type CategoryInput = z.infer<typeof categorySchema>;
