import { pgTable, integer, varchar, text, boolean, timestamp, real } from 'drizzle-orm/pg-core';

export const scanSessions = pgTable('scan_sessions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  imageUrl: text('image_url'),
  warningLightName: text('warning_light_name'),
  warningLightCode: text('warning_light_code'),
  warningLightConfidence: real('warning_light_confidence'),
  vehicleMake: varchar('vehicle_make', { length: 100 }),
  vehicleModel: varchar('vehicle_model', { length: 100 }),
  vehicleYear: integer('vehicle_year'),
  severity: varchar('severity', { length: 20 }),
});

export const feedback = pgTable('feedback', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: integer('session_id').notNull().references(() => scanSessions.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  rating: integer('rating'),
  comment: text('comment'),
});

export const aiCalls = pgTable('ai_calls', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: integer('session_id').references(() => scanSessions.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  model: varchar('model', { length: 50 }).notNull(),
  promptTokens: integer('prompt_tokens'),
  completionTokens: integer('completion_tokens'),
  latencyMs: integer('latency_ms'),
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
});
