export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
};

export type DriveFileKind = "sheet" | "pdf" | "image" | "unsupported";

export function classifyDriveFile(file: DriveFile): DriveFileKind {
  if (file.mimeType === "application/vnd.google-apps.spreadsheet") return "sheet";
  if (file.mimeType === "application/pdf") return "pdf";
  if (file.mimeType.startsWith("image/")) return "image";
  return "unsupported";
}
