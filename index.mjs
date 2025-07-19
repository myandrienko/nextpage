#!/usr/bin/env node

import { spawn } from "node:child_process";
import { cp, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";
import { cwd, exit } from "node:process";
import { getRandomName } from "./rndname.mjs";

async function main() {
  const dotDir = await findDotDir();
  const options = await readOptions(dotDir);
  options.config = await open(options);
  options.config = await prepare(options);
  await writeOptions(options);
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

async function readOptions(dotDir) {
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

async function writeOptions(options) {
  await writeFile(
    resolve(options.dotDir, "./config.json"),
    JSON.stringify(options.config, undefined, 2),
    { encoding: "utf-8" }
  );
}

async function open(options) {
  let config = options.config;

  if (!options.config.next) {
    config = await prepare(options);
  }

  if (typeof config.open === "string") {
    console.log(`Opening ${config.next}`);
    await execScript(config.open, { ...options, config });
  }

  return config;
}

async function prepare(options) {
  const config = {
    ...options.config,
    next: `${getRandomName()}${extname(options.template)}`,
  };

  if (options.template) {
    await cp(
      resolve(options.dotDir, options.template),
      resolve(dirname(options.dotDir), config.next),
      { recursive: true }
    );
  }

  if (typeof config.prepare === "string") {
    console.log(`Preparing ${config.next}`);
    await execScript(config.prepare, { ...options, config });
  }

  return config;
}

function execScript(cmd, options) {
  const child = spawn(cmd, {
    shell: true,
    cwd: resolve(
      dirname(options.dotDir),
      options.isDir ? options.config.next : ""
    ),
    stdio: "inherit",
    env: {
      ...process.env,
      NEXTPAGE: options.config.next,
    },
  });

  return new Promise((resolve, reject) => {
    child.on("exit", () => resolve());
    child.on("error", (err) => reject(err));
  });
}

try {
  await main();
} catch (err) {
  console.error(err.message);
  exit(1);
}
