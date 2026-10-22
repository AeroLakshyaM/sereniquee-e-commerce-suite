import { randomUUID } from 'node:crypto';

export function reportApiError(event: string, error: unknown): string {
  const incidentId = randomUUID();
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(JSON.stringify({ event, incidentId, message }));
  return incidentId;
}
