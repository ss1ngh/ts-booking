import { z } from 'zod';

export const createTheaterSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    location: z.string().trim().optional().nullable(),
});

export const updateTheaterSchema = createTheaterSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided to update"
    });

export type CreateTheaterInput = z.infer<typeof createTheaterSchema>;
export type UpdateTheaterInput = z.infer<typeof updateTheaterSchema>;
