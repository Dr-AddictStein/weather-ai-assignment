import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const status = (err as { status?: number }).status ?? 500;
  const message = err instanceof Error ? err.message : 'Internal server error';
  const retryAfter = (err as { retryAfter?: string }).retryAfter;

  const body: Record<string, unknown> = { error: message, status };
  if (retryAfter) body.retryAfter = retryAfter;

  res.status(status).json(body);
}
