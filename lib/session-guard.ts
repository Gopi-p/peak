import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function requireUser(): Promise<{ email: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return { email: session.user.email };
}
