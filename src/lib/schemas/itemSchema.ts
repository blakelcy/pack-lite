import { z } from 'zod';
import { baseSchema } from '../schemas/baseSchema';

const weightUnitSchema = z.enum(['oz', 'g', 'kg', 'lb']);

export const itemSchema = baseSchema.extend({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  weight: z.string().regex(/^\d*\.?\d{0,2}$/, 'Invalid weight format'),
  weight_unit: weightUnitSchema,
  price: z.string().regex(/^\d*\.?\d{0,2}$/, 'Invalid price format').optional(),
  url: z.string().url().optional().or(z.literal('')),
  image_url: z.string().optional(),
  worn: z.boolean(),
  consumable: z.boolean()
});

export type ItemFormData = z.infer<typeof itemSchema>;
export type WeightUnit = z.infer<typeof weightUnitSchema>;