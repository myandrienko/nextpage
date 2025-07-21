import { cp, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { cwd } from "node:process";
import {
  isExistingDirectory,
  isExistingExecutable,
  tryReadFile,
} from "./fsutils.mts";
import { pickName } from "./project.mts";

export interface Dotdir {
  rootPath: string;
  dotdirPath: string;
  templateDirPath?: string;
  openScriptPath?: string;
  prepareScriptPath?: string;
  nextPath: string;
  next: string;
}

export async function readDotdir(): Promise<Dotdir | null> {
  const dotdirPath = resolve(cwd(), ".nextpage");
  const hasDotdir = await isExistingDirectory(dotdirPath);

  if (!hasDotdir) {
    return null;
  }

  const templateDirPath = resolve(dotdirPath, "template");
  const openScriptPath = resolve(dotdirPath, "open");
  const prepareScriptPath = resolve(dotdirPath, "prepare");
  const nextPath = resolve(dotdirPath, "next");

  const [hasTemplate, hasOpenScript, hasPrepareScript, maybeNext] =
    await Promise.all([
      isExistingDirectory(templateDirPath),
      isExistingExecutable(openScriptPath),
      isExistingExecutable(prepareScriptPath),
      tryReadFile(nextPath),
    ]);

  return {
    rootPath: dirname(dotdirPath),
    dotdirPath,
    templateDirPath: hasTemplate ? templateDirPath : undefined,
    openScriptPath: hasOpenScript ? openScriptPath : undefined,
    prepareScriptPath: hasPrepareScript ? prepareScriptPath : undefined,
    nextPath,
    next: maybeNext ?? pickName(),
  };
}

export async function writeNext(next: string, dotdir: Dotdir): Promise<Dotdir> {
  await writeFile(dotdir.nextPath, next, { encoding: "utf8" });
  return { ...dotdir, next };
}

export async function init(): Promise<void> {
  await cp(resolve(import.meta.dirname, "../examples/default"), ".nextpage", {
    recursive: true,
  });
}
