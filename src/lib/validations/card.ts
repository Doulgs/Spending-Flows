import { z } from "zod";

export const cardSchema = z.object({
  name: z.string().min(2, "Informe um nome para o cartão"),
  brand: z.enum(["visa", "mastercard", "amex", "elo", "other"]),
  limit_amount: z.coerce.number().nonnegative(),
  closing_day: z.coerce.number().min(1).max(31),
  due_day: z.coerce.number().min(1).max(31),
  color: z.string().optional(),
});
export type CardInput = z.infer<typeof cardSchema>;
