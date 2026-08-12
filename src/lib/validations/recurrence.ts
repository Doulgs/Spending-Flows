import { z } from "zod";

export const recurrenceSchema = z.object({
  description: z.string().min(2, "Informe uma descrição"),
  amount: z.coerce.number().positive("O valor deve ser maior que zero"),
  type: z.enum(["income", "expense"]),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  start_date: z.string().min(1, "Informe a data de início"),
  category_id: z.string().optional(),
  account_id: z.string().optional(),
});
export type RecurrenceInput = z.infer<typeof recurrenceSchema>;

export const subscriptionSchema = z.object({
  name: z.string().min(2, "Informe um nome"),
  amount: z.coerce.number().positive("O valor deve ser maior que zero"),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  next_billing_date: z.string().min(1, "Informe a data de cobrança"),
  category_id: z.string().optional(),
  card_id: z.string().optional(),
});
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
