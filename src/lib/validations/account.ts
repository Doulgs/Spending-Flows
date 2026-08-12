import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(2, "Informe um nome para a conta"),
  type: z.enum(["checking", "savings", "cash", "investment", "other"]),
  initial_balance: z.coerce.number(),
  color: z.string().optional(),
});
export type AccountInput = z.infer<typeof accountSchema>;
