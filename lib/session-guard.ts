/**
 * Single-user app — no auth gate. The "owner" identifier exists only to keep
 * the data layer schema-compatible in case it's ever ported elsewhere.
 */
export const OWNER = process.env.PEAK_OWNER ?? "peak";

export async function requireUser(): Promise<{ email: string }> {
  return { email: OWNER };
}
