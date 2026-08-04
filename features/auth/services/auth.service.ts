import bcrypt from "bcryptjs";
import { userRepository } from "@/repositories/user.repository";
import { activityLogRepository } from "@/repositories/activity-log.repository";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { toSessionUser } from "./user.dto";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema";
import { USER_STATUS } from "@/constants/roles";
import type { SessionUser } from "@/types";

const SALT_ROUNDS = 12;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export class AuthError extends Error {}
export class RateLimitError extends Error {}

export const authService = {
  /** Used by the Auth.js Credentials provider. Returns null on any failure (never throws to the caller). */
  async verifyCredentials(input: LoginInput): Promise<SessionUser | null> {
    const rateLimitKey = `login:${input.email}`;
    const { allowed } = checkRateLimit(rateLimitKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
    if (!allowed) {
      throw new RateLimitError(
        "Terlalu banyak percobaan login gagal. Silakan coba lagi dalam beberapa menit.",
      );
    }

    const user = await userRepository.findByEmailWithPassword(input.email);
    if (!user) return null;

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) return null;

    if (user.status !== USER_STATUS.ACTIVE) {
      throw new AuthError("Akun Anda tidak aktif. Hubungi admin sekolah.");
    }

    // Successful login clears the failed-attempt counter for this email.
    resetRateLimit(rateLimitKey);

    await userRepository.updateLastLogin(user._id.toString());
    await activityLogRepository.record({
      actorId: user._id.toString(),
      action: "login",
      entityType: "User",
      entityId: user._id.toString(),
      description: `${user.name} masuk ke sistem`,
    });
    return toSessionUser(user);
  },

  async register(input: RegisterInput, clientIp: string): Promise<SessionUser> {
    const { allowed } = checkRateLimit(`register:${clientIp}`, 5, 60 * 60 * 1000); // 5/hour per IP
    if (!allowed) {
      throw new RateLimitError("Terlalu banyak percobaan registrasi. Silakan coba lagi nanti.");
    }

    const alreadyExists = await userRepository.existsByEmail(input.email);
    if (alreadyExists) {
      throw new AuthError("Email sudah terdaftar.");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role as SessionUser["role"],
      phone: input.phone,
    });

    return toSessionUser(user);
  },
};
