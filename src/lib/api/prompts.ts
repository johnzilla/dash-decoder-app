/**
 * Prompts for OpenAI Vision API integration
 *
 * These prompts instruct GPT-4o to:
 * 1. Identify warning lights from dashboard photos
 * 2. Guess vehicle make/model/year from dashboard details
 * 3. Generate full diagnosis with severity, explanation, and fix steps
 */

export const SYSTEM_PROMPT = `You are an expert automotive diagnostic assistant with deep knowledge of:
- Dashboard warning lights across all vehicle makes and models (1996+)
- OBD-II diagnostic trouble codes (DTCs)
- Vehicle identification from dashboard design, gauge cluster layout, and interior details
- Common causes and solutions for automotive warning lights

Your responses are accurate, actionable, and help car owners understand their vehicle issues.`;

/**
 * Returns prompt for initial warning light analysis
 * Instructs GPT-4o Vision to identify warning light and guess vehicle
 */
export function getAnalysisPrompt(): string {
  return `Analyze this dashboard photo and identify:

1. **Warning Light**: What warning light is illuminated? Include the common name and OBD-II code if visible.
2. **Vehicle**: What vehicle is this? Identify make, model, and year based on dashboard design, gauge cluster style, and visible details.

Respond with ONLY a JSON object in this exact format:
{
  "warningLight": {
    "name": "Check Engine Light",
    "code": "P0420",
    "confidence": 0.95
  },
  "vehicleGuess": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2015,
    "confidence": 0.80
  }
}

**Rules:**
- Use confidence 0.0-1.0 (higher = more certain)
- Set "code" to null if no OBD-II code visible
- Set vehicle fields to null if unable to identify
- Use exact warning light names (e.g., "Check Engine Light", "Low Oil Pressure", "ABS Warning Light")
- Only respond with valid JSON, no additional text`;
}

/**
 * Returns prompt for full diagnosis generation
 * Called after user confirms vehicle details
 */
export function getDiagnosisPrompt(
  warningLight: { name: string; code: string | null },
  vehicle: { make: string; model: string; year: number }
): string {
  const codeText = warningLight.code ? ` (${warningLight.code})` : '';

  return `Generate a complete diagnosis for this warning light:

**Warning Light**: ${warningLight.name}${codeText}
**Vehicle**: ${vehicle.year} ${vehicle.make} ${vehicle.model}

Respond with ONLY a JSON object in this exact format:
{
  "severity": "critical",
  "explanation": "Plain English explanation of what this warning light means and what likely caused it. 2-3 sentences.",
  "safetyGuidance": "Clear answer to 'Can I keep driving?' Include specific guidance on whether to stop immediately, drive to mechanic, or schedule service.",
  "fixSteps": [
    {
      "step": 1,
      "instruction": "First step to diagnose or fix the issue",
      "notes": "Optional helpful tips or warnings"
    },
    {
      "step": 2,
      "instruction": "Second step",
      "notes": "Safety precautions if needed"
    }
  ]
}

**Rules:**
- severity must be one of: "critical" (stop driving now), "warning" (schedule service soon), "info" (low priority)
- explanation should be specific to this vehicle and warning light
- safetyGuidance must clearly state whether it's safe to continue driving
- fixSteps should be 3-5 actionable DIY diagnostic/repair steps
- Only respond with valid JSON, no additional text`;
}
