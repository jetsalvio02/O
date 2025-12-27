import path from "path";
import fs from "fs";

export function delete_file(file_path: string) {
  if (!file_path) return;

  const normalize_path = file_path.startsWith("/")
    ? file_path.slice(1)
    : file_path;

  const absolute_path = path.join(process.cwd(), "public", normalize_path);

  if (fs.existsSync(absolute_path)) {
    fs.unlinkSync(absolute_path);
  }
}
