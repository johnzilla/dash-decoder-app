import { z } from 'zod';
import { SeveritySchema, VehicleSchema } from './vehicle';

// Individual fix step in numbered 1-2-3 format (per CONTEXT.md)
export const FixStepSchema = z.object({
  step: z.number().min(1),
  instruction: z.string().min(1),
  notes: z.string().optional(), // Additional tips or warnings
});
export type FixStep = z.infer<typeof FixStepSchema>;

// Warning light identification from Vision API
export const WarningLightSchema = z.object({
  name: z.string(), // e.g., "Check Engine Light", "Low Oil Pressure"
  code: z.string().nullable(), // OBD-II code if visible, e.g., "P0420"
  confidence: z.number().min(0).max(1),
});
export type WarningLight = z.infer<typeof WarningLightSchema>;

// Complete diagnosis result
export const DiagnosisSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),

  // What was identified
  warningLight: WarningLightSchema,
  vehicle: VehicleSchema,

  // The diagnosis content (per DIAG-01 through DIAG-05)
  severity: SeveritySchema,
  explanation: z.string(), // Plain English explanation (DIAG-01)
  safetyGuidance: z.string(), // "Can I keep driving?" answer (DIAG-03)
  fixSteps: z.array(FixStepSchema), // DIY instructions (DIAG-04)

  // Original image for display
  imageDataUrl: z.string(),
});
export type Diagnosis = z.infer<typeof DiagnosisSchema>;

// Severity label mappings for UI (traffic light style per CONTEXT.md)
export const SEVERITY_CONFIG = {
  critical: {
    color: 'red',
    bgClass: 'bg-red-500',
    textClass: 'text-red-500',
    label: 'URGENT',
    description: 'Stop driving immediately',
  },
  warning: {
    color: 'yellow',
    bgClass: 'bg-yellow-500',
    textClass: 'text-yellow-500',
    label: 'ATTENTION',
    description: 'Schedule service soon',
  },
  info: {
    color: 'green',
    bgClass: 'bg-green-500',
    textClass: 'text-green-500',
    label: 'LOW PRIORITY',
    description: 'Safe to continue driving',
  },
} as const;
