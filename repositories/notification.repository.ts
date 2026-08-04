import { connectDB } from "@/lib/db/connect";
import { NotificationModel, type INotification } from "@/models/Notification";
import type { NotificationType } from "@/constants/notification";

export const notificationRepository = {
  async listForUser(userId: string, limit = 20): Promise<INotification[]> {
    await connectDB();
    return NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(limit).exec();
  },

  async unreadCount(userId: string): Promise<number> {
    await connectDB();
    return NotificationModel.countDocuments({ userId, isRead: false }).exec();
  },

  async create(input: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    meta?: Record<string, string>;
  }): Promise<INotification> {
    await connectDB();
    return NotificationModel.create(input);
  },

  async markRead(id: string, userId: string): Promise<INotification | null> {
    await connectDB();
    return NotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true },
    ).exec();
  },

  async markAllRead(userId: string): Promise<void> {
    await connectDB();
    await NotificationModel.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    ).exec();
  },
};
