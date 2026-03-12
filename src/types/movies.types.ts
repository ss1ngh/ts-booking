import { z } from 'zod';

export const createMovieSchema = z.object({
    title : z.string().trim().min(1, "Title is required"),
    description : z.string().trim().min(1, "Description is required"),
    duration : z.coerce.number().positive(),
    releaseDate : z.coerce.date()
})

export const updateMovieSchema = createMovieSchema
                                    .partial()
                                    .refine((data) => Object.keys(data).length > 0, {
                                        message : "At least one field must be provided to update"
                                    });

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;