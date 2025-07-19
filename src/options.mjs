import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { cwd } from "node:process";

export async function readOptions() {
  const dotDir = await findDotDir();
  let template = "";
  let isDir = false;

  for (const file of await readdir(dotDir)) {
    if (basename(file).startsWith("template")) {
      template = file;
      isDir = (await stat(resolve(dotDir, file))).isDirectory();
      break;
    }
  }

  let config = {};

  try {
    const configStr = await readFile(resolve(dotDir, "config.json"), {
      encoding: "utf-8",
    }).catch(() => null);

    if (typeof configStr === "string") {
      config = JSON.parse(configStr);
    }
  } catch {
    throw new Error("File .nextpage/config.json is malformed");
  }

  return {
    dotDir,
    template,
    isDir,
    config,
  };
}

export async function writeOptions(options) {
  await writeFile(
    resolve(options.dotDir, "./config.json"),
    JSON.stringify(options.config, undefined, 2),
    { encoding: "utf-8" }
  );
}

async function findDotDir() {
  let currentDir = cwd();

  while (currentDir !== "/") {
    const dotDir = resolve(currentDir, ".nextpage");

    if ((await stat(dotDir).catch(() => null))?.isDirectory()) {
      return dotDir;
    }

    currentDir = dirname(currentDir);
  }

  throw new Error("No .nextpage dir found");
}
