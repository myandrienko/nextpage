import { exit } from "node:process";
import { init, readDotdir, writeNext } from "./dotdir.mts";
import { open, pickName, prepare } from "./project.mts";

try {
  const dotdir = await readDotdir();

  if (!dotdir) {
    console.log("No .nextpage directory found.");
    await init();
    console.log("Initialized default .nextpage directory.");
    console.log("Run nextpage again to bootstrap the first project.");
    exit(0);
  }

  await Promise.all([
    open(dotdir),
    writeNext(pickName(), dotdir).then((nextDotdir) => prepare(nextDotdir)),
  ]);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  exit(1);
}
