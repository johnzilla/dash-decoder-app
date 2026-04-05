import { z } from 'zod';
import { WarningLightSchema } from './diagnosis.ts';
import { VehicleGuessSchema } from './vehicle.ts';

// Image quality validation result (client-side)
export const ImageQualityResultSchema = z.object({
  isValid: z.boolean(),
  blurScore: z.number(),
  brightness: z.number(),
  issues: z.array(z.string()),
});
export type ImageQualityResult = z.infer<typeof ImageQualityResultSchema>;

// Vision API analysis result (before user confirms vehicle)
export const VisionAnalysisResultSchema = z.object({
  warningLight: WarningLightSchema,
  vehicleGuess: VehicleGuessSchema,
  rawAnalysis: z.string(), // Original AI response for debugging
});
export type VisionAnalysisResult = z.infer<typeof VisionAnalysisResultSchema>;

// Diagnosis generation request (after user confirms vehicle)
export const DiagnosisRequestSchema = z.object({
  warningLight: WarningLightSchema,
  vehicle: z.object({
    make: z.string(),
    model: z.string(),
    year: z.number(),
  }),
  sessionId: z.number().optional(),
});
export type DiagnosisRequest = z.infer<typeof DiagnosisRequestSchema>;

// Scan flow state machine
export type ScanFlowState =
  | { step: 'idle' }
  | { step: 'capturing' }
  | { step: 'validating'; imageFile: File }
  | { step: 'analyzing'; imageFile: File }
  | { step: 'confirming-vehicle'; imageFile: File; analysis: VisionAnalysisResult }
  | { step: 'generating-diagnosis'; imageFile: File; vehicle: { make: string; model: string; year: number }; warningLight: { name: string; code: string | null; confidence: number } }
  | { step: 'complete'; diagnosis: import('./diagnosis.ts').Diagnosis }
  | { step: 'error'; message: string; canRetry: boolean };
