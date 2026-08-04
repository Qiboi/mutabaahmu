import { connectDB } from "@/lib/db/connect";
import { UserModel, type IUser } from "@/models/User";
import { toPaginatedResult } from "./pagination.util";
import type { Role, UserStatus } from "@/constants/roles";
import type { PaginatedResult } from "@/types";

/**
 * Repository Pattern: the only module allowed to talk to Mongoose directly
 * for the User collection. Services depend on this, never on the model.
 */
export const userRepository = {
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    await connectDB();
    return UserModel.findOne({ email: email.toLowerCase() }).select("+passwordHash").exec();
  },

  async findById(id: string): Promise<IUser | null> {
    await connectDB();
    return UserModel.findById(id).exec();
  },

  async findByEmail(email: string): Promise<IUser | null> {
    await connectDB();
    return UserModel.findOne({ email: email.toLowerCase() }).exec();
  },

  async list(query: {
    role?: Role;
    search?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedResult<IUser>> {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (query.role) filter.role = query.role;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
      ];
    }

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      UserModel.find(filter).sort({ name: 1 }).skip(skip).limit(query.limit).exec(),
      UserModel.countDocuments(filter).exec(),
    ]);

    return toPaginatedResult(items, query.page, query.limit, total);
  },

  async create(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    phone?: string;
    schoolId?: string | null;
  }): Promise<IUser> {
    await connectDB();
    return UserModel.create(input);
  },

  async update(
    id: string,
    input: { name?: string; email?: string; phone?: string; status?: UserStatus; passwordHash?: string },
  ): Promise<IUser | null> {
    await connectDB();
    return UserModel.findByIdAndUpdate(id, { $set: input }, { new: true }).exec();
  },

  async updateLastLogin(id: string): Promise<void> {
    await connectDB();
    await UserModel.updateOne({ _id: id }, { $set: { lastLoginAt: new Date() } }).exec();
  },

  async existsByEmail(email: string): Promise<boolean> {
    await connectDB();
    const count = await UserModel.countDocuments({ email: email.toLowerCase() }).exec();
    return count > 0;
  },
};
