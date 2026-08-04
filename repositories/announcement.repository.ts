import { connectDB } from "@/lib/db/connect";
import { AnnouncementModel, type IAnnouncement } from "@/models/Announcement";
import { toPaginatedResult } from "./pagination.util";
import type { AnnouncementAudience } from "@/constants/announcement";
import type { PaginatedResult } from "@/types";

export const announcementRepository = {
  async listForAudience(
    audience: AnnouncementAudience,
    classId: string | undefined,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<IAnnouncement>> {
    await connectDB();
    const filter: Record<string, unknown> = {
      $or: [{ audience: "all" }, { audience }],
      $and: [{ $or: [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }] }],
    };
    if (audience === "class" && classId) {
      filter.$or = [{ audience: "all" }, { audience: "class", classId }];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      AnnouncementModel.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).exec(),
      AnnouncementModel.countDocuments(filter).exec(),
    ]);

    return toPaginatedResult(items, page, limit, total);
  },

  async create(input: {
    title: string;
    body: string;
    audience: AnnouncementAudience;
    classId?: string | null;
    authorId: string;
    expiresAt?: Date | null;
  }): Promise<IAnnouncement> {
    await connectDB();
    return AnnouncementModel.create(input);
  },

  async delete(id: string): Promise<void> {
    await connectDB();
    await AnnouncementModel.findByIdAndDelete(id).exec();
  },
};
