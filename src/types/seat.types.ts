import { z } from "zod";

export const SeatTypeEnum = z.enum(["SILVER", "GOLD", "PLATINUM"]);

export const createSeatSchema = z.object({
  row: z.string().trim().min(1, "Row is required"),
  number: z.coerce
    .number()
    .int("Seat number must be an integer")
    .positive("Seat number must be positive"),
  type: SeatTypeEnum,
  screenId: z.string().uuid("Invalid Screen ID format"),
});

export const updateSeatSchema = createSeatSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export type CreateSeatInput = z.infer<typeof createSeatSchema>;
export type UpdateSeatInput = z.infer<typeof updateSeatSchema>;
