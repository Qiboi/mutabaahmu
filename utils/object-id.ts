import type { Types } from "mongoose";

/**
 * Mongoose `.populate()` replaces an ObjectId field with a full sub-document at runtime,
 * even though the TS interface still types it as `Types.ObjectId`. Calling `.toString()`
 * directly on a populated field does NOT reliably return the raw id, which silently breaks
 * ownership/authorization checks. This helper always extracts the underlying id string
 * regardless of whether the field came back populated or not.
 */
export function idOf(value: Types.ObjectId | { _id: Types.ObjectId | string } | string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value) return String(value._id);
  return String(value);
}
