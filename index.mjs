#!/usr/bin/env node

import { spawn } from "node:child_process";
import { cp, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";
import { cwd } from "node:process";

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
  let template = null;

  for (const file of await readdir(dotDir)) {
    if (basename(file).startsWith("template")) {
      template = file;
      break;
    }
  }

  if (!template) {
    throw new Error("No template found in .nextpage dir");
  }

  let config = null;

  try {
    const configStr = await readFile(resolve(dotDir, "config.json"), {
      encoding: "utf-8",
    }).catch(() => null);
    config = typeof configStr === "string" ? JSON.parse(configStr) : {};
  } catch {
    throw new Error("File .nextpage/config.json is malformed");
  }

  return {
    dotDir,
    template,
    config,
  };
}

async function writeOptions(options) {
  await writeFile(
    resolve(options.dotDir, "./config.json"),
    JSON.stringify(options.config, undefined, 2),
    {
      encoding: "utf-8",
    }
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

  await cp(
    resolve(options.dotDir, options.template),
    resolve(dirname(options.dotDir), config.next),
    { recursive: true }
  );

  if (typeof config.open === "string") {
    console.log(`Preparing ${config.next}`);
    await execScript(config.prepare, { ...options, config });
  }

  return config;
}

function execScript(cmd, options) {
  const child = spawn(cmd, {
    shell: true,
    cwd: dirname(options.dotDir),
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

function getRandomName() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return `${pick(adjectives)}-${pick(nouns)}-${pick(verbs)}`;
}

// prettier-ignore
const adjectives = ["afraid", "all", "angry", "beige", "big", "better", "bitter", "blue", "brave", "breezy", "bright", "brown", "bumpy", "busy", "calm", "chatty", "chilly", "chubby", "clean", "clear", "clever", "cold", "crazy", "cruel", "cuddly", "curly", "curvy", "cute", "common", "cold", "cool", "cyan", "dark", "deep", "dirty", "dry", "dull", "eager", "early", "easy", "eight", "eighty", "eleven", "empty", "every", "evil", "fair", "famous", "fast", "fancy", "few", "fine", "fifty", "five", "flat", "fluffy", "floppy", "forty", "four", "free", "fresh", "fruity", "full", "funny", "fuzzy", "gentle", "giant", "gold", "good", "great", "green", "grumpy", "happy", "heavy", "hip", "honest", "hot", "huge", "hungry", "icy", "itchy", "khaki", "kind", "large", "late", "lazy", "lemon", "legal", "light", "little", "long", "loose", "loud", "lovely", "lucky", "major", "many", "mean", "metal", "mighty", "modern", "moody", "nasty", "neat", "new", "nice", "nine", "ninety", "odd", "old", "olive", "open", "orange", "pink", "plain", "plenty", "polite", "poor", "pretty", "proud", "public", "puny", "petite", "purple", "quick", "quiet", "rare", "real", "ready", "red", "rich", "ripe", "rotten", "rude", "sad", "salty", "seven", "shaggy", "shaky", "sharp", "shiny", "short", "shy", "silent", "silly", "silver", "six", "sixty", "slick", "slimy", "slow", "small", "smart", "smooth", "social", "soft", "solid", "some", "sour", "spicy", "spotty", "stale", "strong", "stupid", "sweet", "swift", "tall", "tame", "tangy", "tasty", "ten", "tender", "thick", "thin", "thirty", "three", "tidy", "tiny", "tired", "tough", "tricky", "true", "twelve", "twenty", "two", "upset", "vast", "violet", "warm", "weak", "wet", "whole", "wicked", "wide", "wild", "wise", "witty", "yellow", "young", "yummy"];
// prettier-ignore
const nouns = ["apes", "animals", "areas", "bars", "banks", "baths", "breads", "bushes", "cloths", "clowns", "clubs", "hoops", "loops", "memes", "papers", "parks", "paths", "showers", "sides", "signs", "sites", "streets", "teeth", "tires", "webs", "actors", "ads", "adults", "aliens", "ants", "apples", "baboons", "badgers", "bags", "bananas", "bats", "beans", "bears", "beds", "beers", "bees", "berries", "bikes", "birds", "boats", "bobcats", "books", "bottles", "boxes", "brooms", "buckets", "bugs", "buses", "buttons", "camels", "cases", "cameras", "candies", "candles", "carpets", "carrots", "carrots", "cars", "cats", "chairs", "chefs", "chicken", "clocks", "clouds", "coats", "cobras", "coins", "corners", "colts", "comics", "cooks", "cougars", "regions", "results", "cows", "crabs", "crabs", "crews", "cups", "cities", "cycles", "dancers", "days", "deer", "dingos", "dodos", "dogs", "dolls", "donkeys", "donuts", "doodles", "doors", "dots", "dragons", "drinks", "dryers", "ducks", "ducks", "eagles", "ears", "eels", "eggs", "ends", "mammals", "emus", "experts", "eyes", "facts", "falcons", "fans", "feet", "files", "flies", "flowers", "forks", "foxes", "friends", "frogs", "games", "garlics", "geckos", "geese", "ghosts", "ghosts", "gifts", "glasses", "goats", "grapes", "groups", "guests", "hairs", "hands", "hats", "heads", "hornets", "horses", "hotels", "hounds", "houses", "humans", "icons", "ideas", "impalas", "insects", "islands", "items", "jars", "jeans", "jobs", "jokes", "keys", "kids", "kings", "kiwis", "knives", "lamps", "lands", "laws", "lemons", "lies", "lights", "lines", "lions", "lizards", "llamas", "mails", "mangos", "maps", "masks", "meals", "melons", "mice", "mirrors", "moments", "moles", "monkeys", "months", "moons", "moose", "mugs", "nails", "needles", "news", "nights", "numbers", "olives", "onions", "oranges", "otters", "owls", "pandas", "pans", "pants", "papayas", "parents", "parts", "parrots", "paws", "peaches", "pears", "peas", "pens", "pets", "phones", "pianos", "pigs", "pillows", "places", "planes", "planets", "plants", "plums", "poems", "poets", "points", "pots", "pugs", "pumas", "queens", "rabbits", "radios", "rats", "ravens", "readers", "rice", "rings", "rivers", "rockets", "rocks", "rooms", "roses", "rules", "schools", "bats", "seals", "seas", "sheep", "shirts", "shoes", "shrimps", "singers", "sloths", "snails", "snakes", "socks", "spiders", "spies", "spoons", "squids", "stamps", "stars", "states", "steaks", "suits", "suns", "swans", "symbols", "tables", "taxes", "taxis", "teams", "terms", "things", "ties", "tigers", "times", "tips", "toes", "towns", "tools", "toys", "trains", "trams", "trees", "turkeys", "turtles", "vans", "views", "walls", "walls", "wasps", "waves", "ways", "weeks", "windows", "wings", "wolves", "wombats", "words", "worlds", "worms", "yaks", "years", "zebras", "zoos"];
// prettier-ignore
const verbs = ["accept", "act", "add", "admire", "agree", "allow", "appear", "argue", "arrive", "ask", "attack", "attend", "bake", "bathe", "battle", "beam", "beg", "begin", "behave", "bet", "boil", "bow", "brake", "brush", "build", "burn", "buy", "call", "camp", "care", "carry", "change", "cheat", "check", "cheer", "chew", "clap", "clean", "cough", "count", "cover", "crash", "create", "cross", "cry", "cut", "dance", "decide", "deny", "design", "dig", "divide", "do", "double", "doubt", "draw", "dream", "dress", "drive", "drop", "drum", "eat", "end", "enter", "enjoy", "exist", "fail", "fall", "feel", "fetch", "film", "find", "fix", "flash", "float", "flow", "fly", "fold", "follow", "fry", "give", "glow", "go", "grab", "greet", "grin", "grow", "guess", "hammer", "hang", "happen", "heal", "hear", "help", "hide", "hope", "hug", "hunt", "invent", "invite", "itch", "jam", "jog", "join", "joke", "judge", "juggle", "jump", "kick", "kiss", "kneel", "knock", "know", "laugh", "lay", "lead", "learn", "leave", "lick", "like", "lie", "listen", "live", "look", "lose", "love", "make", "march", "marry", "mate", "matter", "melt", "mix", "move", "nail", "notice", "obey", "occur", "open", "own", "pay", "peel", "play", "poke", "post", "press", "prove", "pull", "pump", "pick", "punch", "push", "raise", "read", "refuse", "relate", "relax", "remain", "repair", "repeat", "reply", "report", "rescue", "rest", "retire", "return", "rhyme", "ring", "roll", "rule", "run", "rush", "say", "scream", "see", "search", "sell", "send", "serve", "shake", "share", "shave", "shine", "show", "shop", "shout", "sin", "sink", "sing", "sip", "sit", "sleep", "slide", "smash", "smell", "smile", "smoke", "sneeze", "sniff", "sort", "speak", "spend", "stand", "start", "stay", "stick", "stop", "stare", "study", "strive", "swim", "switch", "take", "talk", "tan", "tap", "taste", "teach", "tease", "tell", "thank", "think", "throw", "tickle", "tie", "trade", "train", "travel", "try", "turn", "type", "unite", "vanish", "visit", "wait", "walk", "warn", "wash", "watch", "wave", "wear", "win", "wink", "wish", "wonder", "work", "worry", "write", "yawn", "yell"];

try {
  const dotDir = await findDotDir();
  const options = await readOptions(dotDir);
  options.config = await open(options);
  options.config = await prepare(options);
  await writeOptions(options);
} catch (err) {
  console.error(err.message);
}
