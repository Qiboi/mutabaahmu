import type { NextAuthConfig } from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { authService, AuthError, RateLimitError } from "@/features/auth/services/auth.service";

/**
 * Auth.js only forwards a generic "CredentialsSignin" error to the client by default (by design,
 * to avoid leaking whether an account exists). We still want to tell the user *specifically* when
 * they've been rate-limited or their account is inactive, so we throw distinct `code` values via
 * these subclasses — the client reads `result.code` (see useLoginForm) to show a tailored message.
 */
class RateLimitedSignin extends CredentialsSignin {
  override code = "rate_limited";
}
class AccountInactiveSignin extends CredentialsSignin {
  override code = "account_inactive";
}

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8h session
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        try {
          const user = await authService.verifyCredentials(parsed.data);
          return user ?? null;
        } catch (err) {
          if (err instanceof RateLimitError) throw new RateLimitedSignin();
          if (err instanceof AuthError) throw new AccountInactiveSignin();
          throw err;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as unknown as import("@/types").SessionUser;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as (typeof session)["user"];
      }
      return session;
    },
  },
};
