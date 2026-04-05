/**
 * API client for DashDecoder Express backend
 *
 * All AI calls are proxied through the Express server.
 * No OpenAI API key or direct OpenAI calls in the frontend.
 */

import { VisionAnalysisResultSchema } from '@/types';
import type { VisionAnalysisResult } from '@/types';

/**
 * Analyze a dashboard photo to identify warning light and guess vehicle.
 * Sends the image as multipart/form-data to the Express proxy.
 *
 * @param imageFile - Image File object from camera capture or file picker
 * @returns VisionAnalysisResult with warning light and vehicle guess
 */
export async function analyzeWarningLight(imageFile: File): Promise<VisionAnalysisResult & { sessionId?: number }> {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('type', 'analyze');

  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type header — browser sets it with boundary for multipart
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = (errorData as { error?: string }).error || 'Failed to analyze image';
    throw new Error(msg);
  }

  const data = await response.json();

  // Validate response matches expected schema
  const result = VisionAnalysisResultSchema.parse({
    warningLight: data.warningLight,
    vehicleGuess: data.vehicleGuess,
    rawAnalysis: data.rawAnalysis,
  });

  return { ...result, sessionId: data.sessionId as number | undefined };
}

/**
 * Generate full diagnosis for confirmed warning light and vehicle.
 * Sends JSON to Express proxy (no image needed).
 *
 * @param warningLight - Identified warning light
 * @param vehicle - Confirmed vehicle details
 * @param sessionId - Session ID from analysis step (optional)
 */
export async function generateDiagnosis(
  warningLight: { name: string; code: string | null; confidence: number },
  vehicle: { make: string; model: string; year: number },
  sessionId?: number
): Promise<{
  severity: 'critical' | 'warning' | 'info';
  explanation: string;
  safetyGuidance: string;
  fixSteps: Array<{ step: number; instruction: string; notes?: string }>;
}> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'diagnose',
      sessionId,
      warningLight: { name: warningLight.name, code: warningLight.code },
      vehicle,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = (errorData as { error?: string }).error || 'Failed to generate diagnosis';
    throw new Error(msg);
  }

  return response.json();
}
