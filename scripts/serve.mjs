#!/usr/bin/env node
// Tiny static server for this intro (copy of game2-kolo-world scripts/static-serve.mjs), no dependencies and no internet.
// npm start runs it; game2 run-mac.sh starts the same server for this folder.
//   node scripts/serve.mjs <folder> <port> [name]
// Pattern: game3-doom-world/scripts/serve.mjs.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
  ".gltf": "model/gltf+json",
  ".glb": "model/gltf-binary",
  ".bin": "application/octet-stream",
};

export function createStaticServer(root) {
  const base = path.resolve(root);
  return http.createServer((req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    } catch {
      res.writeHead(400);
      return res.end("Bad request");
    }
    let file = path.join(base, urlPath);
    if (file !== base && !file.startsWith(base + path.sep)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    if (urlPath.endsWith("/")) file = path.join(file, "index.html");
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(err.code === "ENOENT" || err.code === "EISDIR" ? 404 : 500);
        return res.end(err.code === "ENOENT" || err.code === "EISDIR" ? "Not found" : "Error");
      }
      res.writeHead(200, { "content-type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "cache-control": "no-cache" });
      res.end(data);
    });
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [root, port, name = "static"] = process.argv.slice(2);
  if (!root || !port || !fs.existsSync(path.join(root, "index.html"))) {
    console.error("usage: node scripts/serve.mjs <folder with index.html> <port> [name]");
    process.exit(1);
  }
  createStaticServer(root).listen(Number(port), () => console.log(`${name} http://localhost:${port}/`));
}
