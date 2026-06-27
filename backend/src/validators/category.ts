import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['income', 'expense'], { required_error: 'Type must be income or expense' }),
});

export type CategoryInput = z.infer<typeof categorySchema>;
