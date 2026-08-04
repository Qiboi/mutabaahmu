import { put, del } from "@vercel/blob";

export class UploadValidationError extends Error {}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

function validateImageFile(file: File): void {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new UploadValidationError("Format file harus JPG, PNG, atau WEBP.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new UploadValidationError("Ukuran file maksimal 5MB.");
  }
}

/**
 * Uploads an image to Vercel Blob under the given folder, and best-effort deletes the previous
 * blob URL (if any) so orphaned files don't accumulate. Deletion failures are swallowed —
 * a stale/already-deleted previous blob should never block a new upload from succeeding.
 */
export async function uploadImage(
  folder: "students" | "school",
  file: File,
  previousUrl?: string | null,
): Promise<string> {
  validateImageFile(file);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN belum diset. Tambahkan di .env.local (lihat .env.example).",
    );
  }

  const pathname = `${folder}/${crypto.randomUUID()}.${extensionForMime(file.type)}`;

  const result = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  });

  if (previousUrl) {
    try {
      await del(previousUrl);
    } catch {
      // Ignore — the old blob may already be gone, or the URL may be stale. Not worth failing
      // the new upload over cleanup of the old one.
    }
  }

  return result.url;
}
