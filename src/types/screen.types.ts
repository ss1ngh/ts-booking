import { z } from "zod";

export const createScreenSchema = z.object({
  number: z.coerce
    .number()
    .int("Screen number must be an integer")
    .positive("Screen number must be positive"),
  theaterId: z.string().uuid("Invalid Theater ID format"),
});

export const updateScreenSchema = createScreenSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export type CreateScreenInput = z.infer<typeof createScreenSchema>;
export type UpdateScreenInput = z.infer<typeof updateScreenSchema>;
