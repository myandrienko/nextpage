import type { PathLike } from "node:fs";
import fs, { access, readFile, stat } from "node:fs/promises";

export function isExistingDirectory(path: PathLike): Promise<boolean> {
  return stat(path).then(
    (s) => s.isDirectory(),
    () => false
  );
}

export async function isExistingExecutable(path: PathLike): Promise<boolean> {
  try {
    await access(path, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export function tryReadFile(path: PathLike): Promise<string | null> {
  return readFile(path, { encoding: "utf8" }).catch(() => null);
}
