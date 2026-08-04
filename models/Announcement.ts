import { Schema, model, models, type Document, type Model, type Types } from "mongoose";
import { ANNOUNCEMENT_AUDIENCES, type AnnouncementAudience } from "@/constants/announcement";

export interface IAnnouncement extends Document {
  _id: Types.ObjectId;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  classId?: Types.ObjectId | null; // required when audience === "class"
  authorId: Types.ObjectId;
  publishedAt: Date;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    audience: { type: String, enum: ANNOUNCEMENT_AUDIENCES, required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: "ClassRoom", default: null },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

announcementSchema.index({ audience: 1, publishedAt: -1 });

export const AnnouncementModel: Model<IAnnouncement> =
  models.Announcement ?? model<IAnnouncement>("Announcement", announcementSchema);
