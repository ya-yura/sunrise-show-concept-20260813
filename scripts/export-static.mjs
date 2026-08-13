import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = join(root, "dist", "client");
const basePath = (process.env.BASE_PATH || "").replace(/\/$/, "");
const sourceBasePath = (process.env.SOURCE_BASE_PATH || "").replace(/\/$/, "");
const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("static", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const response = await worker.fetch(
    new Request(`http://localhost${sourceBasePath}/`, { headers: { accept: "text/html" } }),
  { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} },
);

if (!response.ok) {
  throw new Error(`Static export failed with status ${response.status}`);
}

let html = await response.text();
if (basePath) {
  const prefixedRoot = `${basePath.replace(/^\//, "")}/`;
  html = html.replace(/((?:href|src)=['"])\/(?!\/)([^'"]+)/g, (match, attribute, path) => {
    if (path.startsWith(prefixedRoot)) return match;
    return `${attribute}${basePath}/${path}`;
  });
}

await mkdir(output, { recursive: true });
await writeFile(join(output, "index.html"), html, "utf8");
await writeFile(join(output, ".nojekyll"), "", "utf8");
console.log(`Static export written to ${join(output, "index.html")}`);
