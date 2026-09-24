import { createAdminClient } from "./admin";

export const STORAGE_BUCKETS = {
  CAMPAIGN_ASSETS: "campaign-assets",
  VERIFICATION_DOCS: "verification-docs",
  PAYMENT_PROOFS: "payment-proofs",
} as const;

/**
 * Get public URL for public bucket (e.g. campaign banners and updates)
 */
export function getPublicAssetUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const supabase = createAdminClient();
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.CAMPAIGN_ASSETS)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Generate a temporary signed URL for private verification documents (KYC, medical proofs).
 * Default expiration: 300 seconds (5 minutes).
 */
export async function getSignedVerificationUrl(
  filePath: string,
  expiresInSeconds: number = 300
): Promise<string> {
  if (!filePath) return "";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    // If it's already an absolute URL (e.g. mock or external CDN), return as is
    return filePath;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.VERIFICATION_DOCS)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.warn("Storage signed URL generation fallback notice:", error?.message);
      return filePath;
    }

    return data.signedUrl;
  } catch (err) {
    console.error("Failed to generate signed verification URL:", err);
    return filePath;
  }
}

/**
 * Generate a temporary signed URL for private donation payment transfer proofs.
 * Default expiration: 300 seconds (5 minutes).
 */
export async function getSignedPaymentProofUrl(
  filePath: string,
  expiresInSeconds: number = 300
): Promise<string> {
  if (!filePath) return "";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.PAYMENT_PROOFS)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.warn("Storage payment proof signed URL notice:", error?.message);
      return filePath;
    }

    return data.signedUrl;
  } catch (err) {
    console.error("Failed to generate signed payment proof URL:", err);
    return filePath;
  }
}

/**
 * Upload a file directly to a specified bucket using the admin client.
 */
export async function uploadToStorage(
  bucketName: keyof typeof STORAGE_BUCKETS | string,
  path: string,
  fileBody: Buffer | Blob | Uint8Array,
  contentType: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, fileBody, {
        contentType,
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, path: data.path };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to upload file to storage" };
  }
}

/**
 * Delete a file from a specified storage bucket.
 */
export async function deleteFromStorage(
  bucketName: keyof typeof STORAGE_BUCKETS | string,
  paths: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.storage.from(bucketName).remove(paths);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete from storage" };
  }
}
