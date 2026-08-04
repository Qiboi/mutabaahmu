import bcrypt from "bcryptjs";
import { userRepository } from "@/repositories/user.repository";
import { activityLogRepository } from "@/repositories/activity-log.repository";
import { toUserDTO, type UserDTO } from "./user.dto";
import type { CreateUserInput, ListUserQuery, UpdateUserInput } from "../schemas/user.schema";
import type { PaginatedResult } from "@/types";

const SALT_ROUNDS = 12;

export class UserAlreadyExistsError extends Error {}
export class UserNotFoundError extends Error {}

export const userService = {
  async list(query: ListUserQuery): Promise<PaginatedResult<UserDTO>> {
    const result = await userRepository.list(query);
    return { ...result, items: result.items.map(toUserDTO) };
  },

  async create(input: CreateUserInput, actorId: string): Promise<UserDTO> {
    const exists = await userRepository.existsByEmail(input.email);
    if (exists) throw new UserAlreadyExistsError("Email sudah terdaftar.");

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      phone: input.phone,
    });

    await activityLogRepository.record({
      actorId,
      action: "create",
      entityType: "User",
      entityId: user._id.toString(),
      description: `Membuat akun ${input.role === "teacher" ? "guru" : "orang tua"} baru: "${user.name}"`,
    });

    return toUserDTO(user);
  },

  async update(id: string, input: UpdateUserInput, actorId: string): Promise<UserDTO | null> {
    const existing = await userRepository.findById(id);
    if (!existing) throw new UserNotFoundError("Akun tidak ditemukan");

    if (input.email && input.email !== existing.email) {
      const emailTaken = await userRepository.existsByEmail(input.email);
      if (emailTaken) throw new UserAlreadyExistsError("Email sudah dipakai akun lain.");
    }

    const { password, ...rest } = input;
    const updatePayload: Parameters<typeof userRepository.update>[1] = { ...rest };
    if (password) {
      updatePayload.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const user = await userRepository.update(id, updatePayload);
    if (user) {
      await activityLogRepository.record({
        actorId,
        action: "update",
        entityType: "User",
        entityId: user._id.toString(),
        description: `Memperbarui akun "${user.name}"${password ? " (termasuk reset password)" : ""}${
          input.status ? ` (status: ${input.status})` : ""
        }`,
      });
    }
    return user ? toUserDTO(user) : null;
  },
};
