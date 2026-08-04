import { connectDB } from "@/lib/db/connect";
import { ActivityLogModel, type IActivityLog } from "@/models/ActivityLog";
import { toPaginatedResult } from "./pagination.util";
import type { ActivityAction } from "@/constants/activity-log";
import type { PaginatedResult } from "@/types";

export const activityLogRepository = {
  /** Fire-and-forget audit write; callers should not await-block user-facing responses on this. */
  async record(input: {
    actorId: string;
    action: ActivityAction;
    entityType: string;
    entityId?: string;
    description: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await connectDB();
    await ActivityLogModel.create(input);
  },

  /** Global recent-activity feed across the whole school, for the admin Activity Timeline page. */
  async listRecent(options: {
    page: number;
    limit: number;
    entityType?: string;
    action?: ActivityAction;
  }): Promise<PaginatedResult<IActivityLog>> {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (options.entityType) filter.entityType = options.entityType;
    if (options.action) filter.action = options.action;

    const skip = (options.page - 1) * options.limit;
    const [items, total] = await Promise.all([
      ActivityLogModel.find(filter)
        .populate("actorId", "name role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(options.limit)
        .exec(),
      ActivityLogModel.countDocuments(filter).exec(),
    ]);

    return toPaginatedResult(items, options.page, options.limit, total);
  },
};
