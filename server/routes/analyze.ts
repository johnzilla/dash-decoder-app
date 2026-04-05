import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';
import { uploadToSpaces } from '../lib/spaces.js';
import { callOpenAIWithLogging } from '../lib/openai.js';
import { SYSTEM_PROMPT, getAnalysisPrompt, getDiagnosisPrompt } from '../lib/prompts.js';
import { db } from '../db/client.js';
import { scanSessions } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const analyzeRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    // Only accept image MIME types (T-04-05: reject non-image uploads)
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * Extract JSON from OpenAI response text.
 * Handles cases where model adds extra text around JSON.
 */
function extractJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }
    return JSON.parse(jsonMatch[0]);
  }
}

// POST /api/analyze — analyze a dashboard image OR generate diagnosis
analyzeRouter.post('/', upload.single('image'), async (req, res) => {
  try {
    const type = req.body.type || 'analyze';

    if (type === 'analyze') {
      // === Vision analysis: image upload + AI identification ===
      if (!req.file) {
        res.status(400).json({ error: 'Image file is required for analysis' });
        return;
      }

      // D-06: Resize to ~1200px wide before storing
      const resized = await sharp(req.file.buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Upload to DO Spaces
      const key = `uploads/${Date.now()}-${crypto.randomUUID()}.jpg`;
      const imageUrl = await uploadToSpaces(resized, key, 'image/jpeg');

      // Create session and store image URL
      const sessionResult = await db.insert(scanSessions)
        .values({ imageUrl })
        .returning();
      const sessionId = sessionResult[0].id;

      // D-07: Send CDN URL to OpenAI (not base64)
      const aiResult = await callOpenAIWithLogging(
        sessionId,
        [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: getAnalysisPrompt() },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ]
      );

      const parsed = extractJSON(aiResult.content);

      // Update session with analysis results
      const analysis = parsed as { warningLight?: { name?: string; code?: string; confidence?: number }; vehicleGuess?: { make?: string; model?: string; year?: number } };
      await db.update(scanSessions)
        .set({
          warningLightName: analysis.warningLight?.name ?? null,
          warningLightCode: analysis.warningLight?.code ?? null,
          warningLightConfidence: analysis.warningLight?.confidence ?? null,
          vehicleMake: analysis.vehicleGuess?.make ?? null,
          vehicleModel: analysis.vehicleGuess?.model ?? null,
          vehicleYear: analysis.vehicleGuess?.year ?? null,
        })
        .where(eq(scanSessions.id, sessionId));

      res.json({
        sessionId,
        imageUrl,
        ...(parsed as Record<string, unknown>),
        rawAnalysis: aiResult.content,
      });

    } else if (type === 'diagnose') {
      // === Diagnosis generation: text-only, no image ===
      const { sessionId, warningLight, vehicle } = req.body;

      if (!warningLight || !vehicle) {
        res.status(400).json({ error: 'warningLight and vehicle are required for diagnosis' });
        return;
      }

      const aiResult = await callOpenAIWithLogging(
        sessionId ? parseInt(sessionId, 10) : null,
        [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: getDiagnosisPrompt(warningLight, vehicle) },
        ]
      );

      const parsed = extractJSON(aiResult.content);

      // Update session with severity if sessionId provided
      if (sessionId) {
        const diagnosis = parsed as { severity?: string };
        await db.update(scanSessions)
          .set({ severity: diagnosis.severity ?? null })
          .where(eq(scanSessions.id, parseInt(sessionId, 10)));
      }

      res.json(parsed);

    } else {
      res.status(400).json({ error: `Unknown type: ${type}. Use "analyze" or "diagnose".` });
    }
  } catch (err) {
    console.error('[Analyze Route Error]', err);
    // T-04-09: return generic user-friendly messages, full errors logged server-side only
    const message = err instanceof Error ? err.message : 'Analysis failed';

    // D-09: structured JSON error responses with user-friendly messages
    if (message.includes('timeout') || message.includes('Timeout')) {
      res.status(504).json({ error: 'AI analysis timed out. Please try again.' });
      return;
    }

    res.status(500).json({ error: 'Failed to analyze image. Please try again.' });
  }
});
