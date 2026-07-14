import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const codeRoot = path.resolve(__dirname, "..", "code");
const host = "127.0.0.1";
const port = Number(process.env.PORT || 1420);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"]
]);

function getContentType(filePath) {
  return contentTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
}

function resolveRequestPath(requestUrl) {
  const parsedUrl = new URL(requestUrl, `http://${host}:${port}`);
  let relativePath = decodeURIComponent(parsedUrl.pathname);

  if (relativePath === "/") {
    relativePath = "/index.html";
  }

  const normalizedPath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(codeRoot, normalizedPath);
}

const server = http.createServer(async (request, response) => {
  if (!request.url) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request.");
    return;
  }

  const targetPath = resolveRequestPath(request.url);

  if (!targetPath.startsWith(codeRoot)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden.");
    return;
  }

  try {
    await access(targetPath);
    const targetStat = await stat(targetPath);

    if (targetStat.isDirectory()) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Directory listing is disabled.");
      return;
    }

    response.writeHead(200, { "Content-Type": getContentType(targetPath) });
    createReadStream(targetPath).pipe(response);
  } catch (error) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found.");
  }
});

server.listen(port, host, () => {
  console.log(`Quill dev server running at http://${host}:${port}/`);
});
