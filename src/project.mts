import { humanId } from "human-id";
import { spawn } from "node:child_process";
import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import type { Dotdir } from "./dotdir.mts";
import { isExistingDirectory } from "./fsutils.mts";

export async function open(dotdir: Dotdir): Promise<void> {
  const isPrepared = await isExistingDirectory(dotdir.next);

  if (!isPrepared) {
    await prepare(dotdir);
  }

  if (typeof dotdir.openScriptPath === "string") {
    console.log(`Opening ${dotdir.next}...`);
    await execute(dotdir.openScriptPath, dotdir);
  } else {
    console.log("No open script specified in .nextpage directory.");
    console.log("You can open the spare project manually:");
    console.log(dotdir.next);
  }
}

export async function prepare(dotdir: Dotdir): Promise<void> {
  console.log(`Preparing ${dotdir.next}...`);
  const projectDirPath = resolve(dotdir.rootPath, dotdir.next);

  if (typeof dotdir.templateDirPath === "string") {
    await cp(dotdir.templateDirPath, projectDirPath, { recursive: true });
  } else {
    console.log("No template specified in .nextpage directory.");
    console.log("Created empty project directory.");
    await mkdir(projectDirPath);
  }

  if (typeof dotdir.prepareScriptPath === "string") {
    await execute(dotdir.prepareScriptPath, dotdir);
  }
}

export function pickName(): string {
  return humanId({ capitalize: false, separator: "-" });
}

type ExecuteOptions = Pick<Dotdir, "rootPath" | "next">;

function execute(command: string, options: ExecuteOptions): Promise<void> {
  const child = spawn(command, {
    shell: true,
    cwd: options.rootPath,
    stdio: "inherit",
    env: {
      ...process.env,
      NEXTPAGE: options.next,
    },
  });

  return new Promise((resolve, reject) => {
    child.on("exit", () => resolve());
    child.on("error", (err) => reject(err));
  });
}
