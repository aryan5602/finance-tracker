import { z } from 'zod';

export const transactionSchema = z.object({
  categoryId: z.number().int().positive('categoryId must be a positive integer'),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  description: z.string().max(500).optional().nullable(),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
