import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  description: z.string().min(2, "Informe uma descrição"),
  amount: z.coerce.number().positive("O valor deve ser maior que zero"),
  date: z.string().min(1, "Informe a data"),
  account_id: z.string().optional(),
  transfer_account_id: z.string().optional(),
  category_id: z.string().optional(),
  card_id: z.string().optional(),
  status: z.enum(["pending", "completed", "scheduled"]),
  notes: z.string().optional(),
});
export type TransactionInput = z.infer<typeof transactionSchema>;
