import type { DriveFile } from "./classifyDriveFiles";

export async function listFilesInFolder(folderId: string): Promise<DriveFile[]> {
  void folderId;

  throw new Error(
    "Drive client not configured. Install googleapis, create an authenticated Drive client, and query the configured folder.",
  );
}

export async function downloadDriveFile(fileId: string): Promise<Buffer> {
  void fileId;

  throw new Error(
    "Drive download not configured. Use drive.files.get({ alt: 'media' }) for binary PDF/image files.",
  );
}
