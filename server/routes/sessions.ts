import { Router } from 'express';
import { db } from '../db/client.js';
import { scanSessions } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const sessionsRouter = Router();

// POST /api/sessions — create a new scan session
sessionsRouter.post('/', async (_req, res) => {
  try {
    const result = await db.insert(scanSessions).values({}).returning();
    res.status(201).json({ id: result[0].id, createdAt: result[0].createdAt });
  } catch (err) {
    console.error('[Sessions POST Error]', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// PATCH /api/sessions/:id — update session with analysis results or vehicle confirmation
sessionsRouter.patch('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid session ID' });
    return;
  }

  const { imageUrl, warningLightName, warningLightCode, warningLightConfidence,
          vehicleMake, vehicleModel, vehicleYear, severity } = req.body;

  // Build update object with only provided fields
  const updates: Record<string, unknown> = {};
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (warningLightName !== undefined) updates.warningLightName = warningLightName;
  if (warningLightCode !== undefined) updates.warningLightCode = warningLightCode;
  if (warningLightConfidence !== undefined) updates.warningLightConfidence = warningLightConfidence;
  if (vehicleMake !== undefined) updates.vehicleMake = vehicleMake;
  if (vehicleModel !== undefined) updates.vehicleModel = vehicleModel;
  if (vehicleYear !== undefined) updates.vehicleYear = vehicleYear;
  if (severity !== undefined) updates.severity = severity;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  try {
    const result = await db.update(scanSessions)
      .set(updates)
      .where(eq(scanSessions.id, id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json(result[0]);
  } catch (err) {
    console.error('[Sessions PATCH Error]', err);
    res.status(500).json({ error: 'Failed to update session' });
  }
});
