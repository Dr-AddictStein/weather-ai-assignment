import { env } from '../../config/env.js';
import { mapUpstreamError } from '../../utils/errors.js';

const UPSTREAM_TIMEOUT = 30_000;

async function upstreamFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);

  try {
    const url = `${env.weatherAiBaseUrl}${path}`;
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.weatherAiApiKey}`,
        ...options.headers,
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function weatherAiGet(path: string): Promise<{ data: unknown; status: number; headers: Headers }> {
  const res = await upstreamFetch(path);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const mapped = mapUpstreamError(res.status, data);
    const err = new Error(mapped.message) as Error & { status: number; retryAfter?: string };
    err.status = mapped.status;
    const retryAfter = res.headers.get('retry-after');
    if (retryAfter) err.retryAfter = retryAfter;
    throw err;
  }
  return { data, status: res.status, headers: res.headers };
}

export async function weatherAiPostMultipart(
  path: string,
  formData: FormData
): Promise<{ data: unknown; status: number }> {
  const res = await upstreamFetch(path, { method: 'POST', body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const mapped = mapUpstreamError(res.status, data);
    const err = new Error(mapped.message) as Error & { status: number };
    err.status = mapped.status;
    throw err;
  }
  return { data, status: res.status };
}

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) qs.set(k, String(v));
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}
