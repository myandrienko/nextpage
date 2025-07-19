#!/usr/bin/env node

import { spawn } from "node:child_process";
import { cp } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { exit } from "node:process";
import { getRandomName } from "./rndname.mjs";
import { readOptions, writeOptions } from "./options.mjs";

async function main() {
  const options = await readOptions();
  options.config = await open(options);
  options.config = await prepare(options);
  await writeOptions(options);
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
