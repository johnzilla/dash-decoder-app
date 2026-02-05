/**
 * OpenAI Vision API integration for warning light analysis
 *
 * Uses GPT-4o Vision model to:
 * - Identify warning lights from dashboard photos
 * - Guess vehicle make/model/year
 * - Generate full diagnosis with severity and fix steps
 */

import { VisionAnalysisResultSchema } from '@/types';
import type { VisionAnalysisResult } from '@/types';
import { SYSTEM_PROMPT, getAnalysisPrompt, getDiagnosisPrompt } from './prompts';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o';

/**
 * Get OpenAI API key from environment
 * Throws descriptive error if missing
 */
function getApiKey(): string {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error(
      'OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env.local file.'
    );
  }

  return apiKey;
}

/**
 * Extract JSON from OpenAI response text
 * Handles cases where model adds extra text around JSON
 */
function extractJSON(text: string): unknown {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Fall back to regex extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  }
}

/**
 * Call OpenAI API with error handling
 */
async function callOpenAI(messages: Array<{ role: string; content: unknown }>): Promise<string> {
  const apiKey = getApiKey();

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 1000,
      temperature: 0.3, // Lower temperature for more consistent structured output
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      (errorData as { error?: { message?: string } }).error?.message || response.statusText;

    if (response.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your configuration.');
    }

    if (response.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.');
    }

    throw new Error(`OpenAI API error: ${errorMessage}`);
  }

  const data = await response.json();

  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('Invalid response format from OpenAI API');
  }

  return content;
}

/**
 * Analyze dashboard photo to identify warning light and guess vehicle
 *
 * @param imageDataUrl - Base64-encoded image data URL (data:image/jpeg;base64,...)
 * @returns VisionAnalysisResult with warning light and vehicle guess
 * @throws Error with user-friendly message on failure
 */
export async function analyzeWarningLight(imageDataUrl: string): Promise<VisionAnalysisResult> {
  try {
    const content = await callOpenAI([
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: getAnalysisPrompt(),
          },
          {
            type: 'image_url',
            image_url: {
              url: imageDataUrl,
            },
          },
        ],
      },
    ]);

    // Extract and parse JSON response
    const rawResponse = extractJSON(content);

    // Validate with Zod schema
    const result = VisionAnalysisResultSchema.parse({
      ...rawResponse,
      rawAnalysis: content, // Store original response for debugging
    });

    return result;
  } catch (error) {
    // Re-throw with user-friendly messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw error; // Already user-friendly
      }
      if (error.message.includes('rate limit')) {
        throw error; // Already user-friendly
      }
      throw new Error(`Failed to analyze image: ${error.message}`);
    }
    throw new Error('Failed to analyze image. Please try again.');
  }
}

/**
 * Generate full diagnosis for confirmed warning light and vehicle
 *
 * @param warningLight - Identified warning light with name, code, confidence
 * @param vehicle - Confirmed vehicle details (make, model, year)
 * @returns Diagnosis with severity, explanation, safety guidance, fix steps
 * @throws Error with user-friendly message on failure
 */
export async function generateDiagnosis(
  warningLight: { name: string; code: string | null; confidence: number },
  vehicle: { make: string; model: string; year: number }
): Promise<{
  severity: 'critical' | 'warning' | 'info';
  explanation: string;
  safetyGuidance: string;
  fixSteps: Array<{ step: number; instruction: string; notes?: string }>;
}> {
  try {
    const content = await callOpenAI([
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: getDiagnosisPrompt(warningLight, vehicle),
      },
    ]);

    // Extract and parse JSON response
    const rawResponse = extractJSON(content);

    // Basic validation (full validation happens when creating Diagnosis object)
    if (
      typeof rawResponse !== 'object' ||
      rawResponse === null ||
      !('severity' in rawResponse) ||
      !('explanation' in rawResponse) ||
      !('safetyGuidance' in rawResponse) ||
      !('fixSteps' in rawResponse)
    ) {
      throw new Error('Invalid diagnosis format from API');
    }

    return rawResponse as {
      severity: 'critical' | 'warning' | 'info';
      explanation: string;
      safetyGuidance: string;
      fixSteps: Array<{ step: number; instruction: string; notes?: string }>;
    };
  } catch (error) {
    // Re-throw with user-friendly messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw error; // Already user-friendly
      }
      if (error.message.includes('rate limit')) {
        throw error; // Already user-friendly
      }
      throw new Error(`Failed to generate diagnosis: ${error.message}`);
    }
    throw new Error('Failed to generate diagnosis. Please try again.');
  }
}
