export function mapUpstreamError(status: number, body: unknown): { status: number; message: string } {
  const msg = typeof body === 'object' && body !== null && 'message' in body
    ? String((body as { message: unknown }).message)
    : undefined;

  switch (status) {
    case 400:
      return { status: 400, message: msg ?? 'Invalid request parameters.' };
    case 401:
      return { status: 401, message: 'API key is invalid or missing.' };
    case 403:
      return { status: 403, message: msg ?? 'This feature is not available on your plan.' };
    case 429:
      return { status: 429, message: 'Rate limit exceeded. Please try again later.' };
    case 503:
      return { status: 503, message: 'Weather service temporarily unavailable.' };
    default:
      return { status: status >= 500 ? 500 : status, message: msg ?? 'An unexpected error occurred.' };
  }
}
