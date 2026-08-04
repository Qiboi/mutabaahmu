"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, ImageOff } from "lucide-react";
import { cn } from "@/utils/cn";
import { uploadFile } from "@/lib/api/upload-file";
import { ApiClientError } from "@/lib/api/client";

export function ImageUploadField({
  currentUrl,
  uploadUrl,
  onUploaded,
  alt,
  shape = "circle",
  size = 96,
}: {
  currentUrl?: string | null;
  uploadUrl: string;
  onUploaded: (url: string) => void;
  alt: string;
  shape?: "circle" | "rounded";
  size?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    try {
      const result = await uploadFile<{ avatarUrl?: string; logoUrl?: string }>(uploadUrl, file);
      const uploadedUrl = result.avatarUrl ?? result.logoUrl;
      if (uploadedUrl) onUploaded(uploadedUrl);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Gagal mengunggah gambar");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const displayUrl = previewUrl ?? currentUrl;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          "group relative flex shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-50 transition-opacity hover:opacity-90 disabled:pointer-events-none",
          shape === "circle" ? "rounded-full" : "rounded-[var(--radius-card)]",
        )}
        style={{ width: size, height: size }}
        aria-label={`Ubah ${alt}`}
      >
        {displayUrl ? (
          <Image src={displayUrl} alt={alt} fill className="object-cover" sizes={`${size}px`} />
        ) : (
          <ImageOff className="h-6 w-6 text-slate-300" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition-opacity group-hover:bg-slate-900/40 group-hover:opacity-100">
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="max-w-[200px] text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
