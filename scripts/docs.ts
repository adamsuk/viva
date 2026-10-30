// Writes the generated Markdown docs. Run with `npm run docs`.
import { writeFileSync } from "node:fs";
import { docFiles } from "../src/viva/docs.ts";

for (const [path, body] of Object.entries(docFiles())) {
  writeFileSync(new URL(`../${path}`, import.meta.url), body);
  console.log(`wrote ${path}`);
}
