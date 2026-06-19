// ─────────────────────────────────────────────────────────────────
// TODO: Replace with your actual Cloudinary credentials
// Cloudinary Dashboard → Settings → Upload → Upload presets (unsigned)
// ─────────────────────────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = "dv8hscoko";
const CLOUDINARY_UPLOAD_PRESET = "user-profile"; // unsigned preset

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

/**
 * Upload an image file (from expo-image-picker) to Cloudinary.
 * Uses unsigned upload with a preset — no API secret needed on client.
 */
export const uploadToCloudinary = async (
  localUri: string,
  folder = 'printxpress'
): Promise<CloudinaryUploadResult> => {
  const fileName = localUri.split('/').pop() ?? 'upload.jpg';
  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    name: fileName,
    type: mimeType,
  } as any);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? 'Cloudinary upload failed');
  }

  return res.json();
};

/**
 * Upload a design file (PDF or image) to Cloudinary.
 * For PDFs, uses the raw resource type.
 */
export const uploadDesignFile = async (
  localUri: string,
  mimeType: string
): Promise<CloudinaryUploadResult> => {
  const fileName = localUri.split('/').pop() ?? 'design';
  const isPdf = mimeType === 'application/pdf';

  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    name: fileName,
    type: mimeType,
  } as any);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'printxpress/designs');
  if (isPdf) formData.append('resource_type', 'raw');

  const resourceType = isPdf ? 'raw' : 'image';
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? 'Cloudinary upload failed');
  }

  return res.json();
};
