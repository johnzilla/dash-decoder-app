import OpenAI from 'openai';
import { db } from '../db/client.js';
import { aiCalls } from '../db/schema.js';

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 30_000,  // D-09: 30s timeout
  maxRetries: 0,
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface OpenAIResult {
  content: string;
  promptTokens: number | null;
  completionTokens: number | null;
}

/**
 * Call OpenAI and log to ai_calls table.
 * Per D-10: buffered response (not streaming).
 * Per D-11: every call logged with model, tokens, latency, success/failure.
 *
 * IMPORTANT: The ai_calls insert is wrapped in its own try/catch.
 * If logging fails, it logs to console but does NOT fail the API response.
 * Logging is observability, not critical path (per Research pitfall 4).
 */
export async function callOpenAIWithLogging(
  sessionId: number | null,
  messages: ChatMessage[],
  model: string = 'gpt-4o'
): Promise<OpenAIResult> {
  const start = Date.now();
  let success = false;
  let errorMessage: string | undefined;
  let promptTokens: number | null = null;
  let completionTokens: number | null = null;
  let resultContent = '';

  try {
    const response = await openaiClient.chat.completions.create({
      model,
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.3,
    });

    success = true;
    resultContent = response.choices[0]?.message?.content ?? '';
    promptTokens = response.usage?.prompt_tokens ?? null;
    completionTokens = response.usage?.completion_tokens ?? null;

    return { content: resultContent, promptTokens, completionTokens };
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'unknown';
    throw err;
  } finally {
    // Log to ai_calls — never let logging failure break the response
    try {
      await db.insert(aiCalls).values({
        sessionId,
        model,
        promptTokens,
        completionTokens,
        latencyMs: Date.now() - start,
        success,
        errorMessage: errorMessage ?? null,
      });
    } catch (logErr) {
      console.error('[AI Call Logging] Failed to log ai_call:', logErr);
    }
  }
}
