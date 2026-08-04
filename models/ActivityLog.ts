import { Schema, model, models, type Document, type Model, type Types } from "mongoose";
import { ACTIVITY_ACTIONS, type ActivityAction } from "@/constants/activity-log";

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  actorId: Types.ObjectId; // the user who performed the action
  action: ActivityAction;
  entityType: string; // e.g. "Student", "DailyReport", "ClassRoom"
  entityId?: Types.ObjectId | null;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, enum: ACTIVITY_ACTIONS, required: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, default: null },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

activityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const ActivityLogModel: Model<IActivityLog> =
  models.ActivityLog ?? model<IActivityLog>("ActivityLog", activityLogSchema);
