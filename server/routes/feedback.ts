import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/client.js';
import { feedback, scanSessions } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const feedbackRouter = Router();

const feedbackSchema = z.object({
  accuracyRating: z.enum(['yes', 'no', 'unsure']),
  usefulnessRating: z.number().min(1).max(5),
  nextAction: z.enum(['fix-myself', 'mechanic', 'ignore', 'other']),
  comment: z.string().max(500).optional(),
});

// POST /api/sessions/:id/feedback
feedbackRouter.post('/:id/feedback', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid session ID' });
    return;
  }

  const parsed = feedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
    return;
  }

  try {
    // Verify session exists
    const session = await db.select().from(scanSessions).where(eq(scanSessions.id, id));
    if (session.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const { accuracyRating, usefulnessRating, nextAction, comment } = parsed.data;

    const result = await db.insert(feedback).values({
      sessionId: id,
      accuracyRating,
      usefulnessRating,
      nextAction,
      comment: comment ?? null,
    }).returning();

    res.status(201).json({
      id: result[0].id,
      sessionId: result[0].sessionId,
      createdAt: result[0].createdAt,
    });
  } catch (err) {
    console.error('[Feedback POST Error]', err);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});
