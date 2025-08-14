import { z } from "zod";

export const createBookingSchema = z.object({
  origin: z.string().min(3, "Origin is required"),
  destination: z.string().min(3, "Destination is required"),
  pieces: z.number().min(1, "At least 1 piece"),
  weight_kg: z.number().min(1, "Weight must be greater than 0"),
  flightIds: z.array(z.string()).nonempty("Select at least one flight"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
