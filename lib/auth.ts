import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const PEAK_EMAIL = process.env.PEAK_USER_EMAIL ?? "";
const PEAK_HASH = process.env.PEAK_USER_PASSWORD_HASH ?? "";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 }, // 30 days
  providers: [
    CredentialsProvider({
      name: "Peak",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        if (!PEAK_EMAIL || !PEAK_HASH) {
          throw new Error("Server not configured (PEAK_USER_*)");
        }
        if (credentials.email.toLowerCase() !== PEAK_EMAIL.toLowerCase()) {
          return null;
        }
        const ok = await bcrypt.compare(credentials.password, PEAK_HASH);
        if (!ok) return null;
        return { id: "peak-owner", email: PEAK_EMAIL, name: "Peak" };
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string) ?? PEAK_EMAIL;
      }
      return session;
    },
  },
};

export const OWNER_EMAIL = PEAK_EMAIL;
