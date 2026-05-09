import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

/**
 * Parse a JSON request body against a Zod schema and return typed data, or a
 * 400-response with a human-readable message. Always check the result with
 * `instanceof NextResponse` and return early.
 */
export async function parseJson<T>(
  req: Request,
  schema: ZodSchema<T>,
): Promise<T | NextResponse> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const message =
      result.error.issues
        .map((i) => `${i.path.join(".") || "value"}: ${i.message}`)
        .join("; ") || "Validation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return result.data;
}
