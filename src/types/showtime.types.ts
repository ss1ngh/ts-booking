import { z } from "zod";

export const createShowtimeSchema = z
  .object({
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    movieId: z.uuid("Invalid Movie ID format"),
    screenId: z.uuid("Invalid Screen ID format"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "endTime must be strictly after startTime",
    path: ["endTime"],
  });

export const updateShowtimeSchema = z
  .object({
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    movieId: z.uuid("Invalid Movie ID format").optional(),
    screenId: z.uuid("Invalid Screen ID format").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export type CreateShowtimeInput = z.infer<typeof createShowtimeSchema>;
export type UpdateShowtimeInput = z.infer<typeof updateShowtimeSchema>;
