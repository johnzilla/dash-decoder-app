import { z } from 'zod';

// Severity matches traffic light pattern from CONTEXT.md
export const SeveritySchema = z.enum(['critical', 'warning', 'info']);
export type Severity = z.infer<typeof SeveritySchema>;

// Vehicle data - OBD-II era vehicles only (1996+)
export const VehicleSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1996).max(new Date().getFullYear() + 1),
});
export type Vehicle = z.infer<typeof VehicleSchema>;

// AI's vehicle guess with confidence
export const VehicleGuessSchema = z.object({
  make: z.string().nullable(),
  model: z.string().nullable(),
  year: z.number().nullable(),
  confidence: z.number().min(0).max(1),
});
export type VehicleGuess = z.infer<typeof VehicleGuessSchema>;

// Stored vehicle in localStorage (includes timestamp for expiry)
export const StoredVehicleSchema = VehicleSchema.extend({
  timestamp: z.number(),
});
export type StoredVehicle = z.infer<typeof StoredVehicleSchema>;
