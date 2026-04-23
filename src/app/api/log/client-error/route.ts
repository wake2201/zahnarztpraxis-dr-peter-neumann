import { logger } from "@/lib/logger";
import { getClientIp, isTrustedClientIpError } from "@/lib/client-ip";
import { checkRateLimitDb } from "@/lib/rate-limit";
import { clientErrorLogSchema, ERROR_MESSAGES } from "@/lib/schemas";

const CLIENT_ERROR_RATE_LIMIT_MAX_REQUESTS = 10;
const CLIENT_ERROR_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const ip = await getClientIp();

    const allowed = await checkRateLimitDb(`client-error:${ip}`, {
      maxRequests: CLIENT_ERROR_RATE_LIMIT_MAX_REQUESTS,
      windowMs: CLIENT_ERROR_RATE_LIMIT_WINDOW_MS,
    });

    if (!allowed) {
      return Response.json({ error: ERROR_MESSAGES.unexpectedError }, { status: 429 });
    }
  } catch (error) {
    if (isTrustedClientIpError(error)) {
      return new Response(null, { status: 503 });
    }

    return Response.json({ error: ERROR_MESSAGES.unexpectedError }, { status: 500 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: ERROR_MESSAGES.invalidInput }, { status: 400 });
  }

  const parsed = clientErrorLogSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: ERROR_MESSAGES.invalidInput }, { status: 400 });
  }

  logger.warn(
    {
      action: "clientGlobalError",
      digest: parsed.data.digest,
      pathname: parsed.data.pathname,
    },
    "[clientGlobalError] Client-Fehler empfangen",
  );

  return new Response(null, { status: 204 });
}
