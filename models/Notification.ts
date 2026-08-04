import { Schema, model, models, type Document, type Model, type Types } from "mongoose";
import { NOTIFICATION_TYPES, type NotificationType } from "@/constants/notification";

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId; // recipient
  type: NotificationType;
  title: string;
  body: string;
  /** Optional deep-link target, e.g. { reportId } or { achievementId }. */
  meta?: Record<string, string>;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 500 },
    meta: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const NotificationModel: Model<INotification> =
  models.Notification ?? model<INotification>("Notification", notificationSchema);
