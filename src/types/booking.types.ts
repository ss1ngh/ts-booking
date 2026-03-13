import { z } from "zod";

export const createBookingSchema = z.object({
  userId: z.coerce.number().positive("Invalid User ID format"),
  showtimeId: z.uuid("Invalid Showtime ID format"),
  seatIds: z
    .array(z.uuid("Invalid Seat ID format"))
    .min(1, "At least one seat must be selected"),
});

export const updateBookingSchema = z
  .object({
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
