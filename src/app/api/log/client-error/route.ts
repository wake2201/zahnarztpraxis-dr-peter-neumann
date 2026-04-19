import { logger } from "@/lib/logger";
import { clientErrorLogSchema, ERROR_MESSAGES } from "@/lib/schemas";

export async function POST(request: Request) {
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

  const error = new Error(parsed.data.message);
  if (parsed.data.stack) {
    error.stack = parsed.data.stack;
  }

  logger.error(
    {
      err: error,
      action: "clientGlobalError",
      digest: parsed.data.digest,
      pathname: parsed.data.pathname,
      userAgent: request.headers.get("user-agent") || "unknown",
    },
    "[clientGlobalError] Client-Fehler empfangen",
  );

  return new Response(null, { status: 204 });
}
