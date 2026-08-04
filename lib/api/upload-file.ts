import { ApiClientError, handleSessionExpiry } from "./client";
import type { ApiResponse } from "@/types";

/** Like apiClient(), but for multipart/form-data file uploads instead of JSON bodies. */
export async function uploadFile<T>(url: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch(url, { method: "POST", body: formData });
  const body = (await response.json()) as ApiResponse<T>;

  if (!body.success) {
    if (response.status === 401) {
      handleSessionExpiry();
    }
    throw new ApiClientError(body.message, response.status, body.errors);
  }

  return body.data;
}
