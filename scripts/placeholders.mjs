#!/usr/bin/env node
// Lists every placeholder still in the app: `PLACEHOLDER` markers and imports
// of the demo data in src/lib/demo/.
//
// The app is being built screen-first, so invented data is expected for now.
// The rule is only that it is findable: mark it with `// PLACEHOLDER: <what
// replaces it>`, or put demo datasets in src/lib/demo/. Before launch, run
//
//   npm run placeholders -- --strict
//
// in CI, which fails while any remain.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("../src/", import.meta.url).pathname;
const strict = process.argv.includes("--strict");

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) yield path;
  }
}

const hits = [];
for (const path of files(ROOT)) {
  const rel = relative(process.cwd(), path);
  readFileSync(path, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (/PLACEHOLDER\b/.test(line) || /from ["'](@\/lib|\.{1,2})\/demo\//.test(line)) {
        hits.push(`${rel}:${i + 1}  ${line.trim()}`);
      }
    });
}

if (hits.length === 0) {
  console.log("No placeholders left.");
} else {
  console.log(hits.join("\n"));
  console.log(`\n${hits.length} placeholder line(s).`);
}
process.exit(strict && hits.length > 0 ? 1 : 0);
