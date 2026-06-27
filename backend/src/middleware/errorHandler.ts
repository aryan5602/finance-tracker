import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error & { status?: number; statusCode?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
    return;
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    res.status(409).json({ error: 'A record with that value already exists' });
    return;
  }
  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    res.status(400).json({ error: 'Related record not found or constraint violated' });
    return;
  }

  console.error(err);
  const status = err.statusCode ?? err.status ?? 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}
