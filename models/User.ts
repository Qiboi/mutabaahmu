import { Schema, model, models, type Document, type Model, type Types } from "mongoose";
import { ALL_ROLES, USER_STATUS, type Role, type UserStatus } from "@/constants/roles";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  schoolId?: Types.ObjectId | null;
  phone?: string;
  avatarUrl?: string | null;
  /** Only meaningful when role === "teacher": classes assigned. */
  classIds?: Types.ObjectId[];
  /** Only meaningful when role === "parent": linked children. */
  studentIds?: Types.ObjectId[];
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ALL_ROLES, required: true, index: true },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    schoolId: { type: Schema.Types.ObjectId, ref: "School", default: null, index: true },
    phone: { type: String, trim: true },
    avatarUrl: { type: String, default: null },
    classIds: [{ type: Schema.Types.ObjectId, ref: "ClassRoom" }],
    studentIds: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, status: 1 });

// Guard against model re-registration during Next.js hot reload.
export const UserModel: Model<IUser> = models.User ?? model<IUser>("User", userSchema);
