const { createReadStream } = require("node:fs") as typeof import("node:fs");
const { access, stat } = require("node:fs/promises") as typeof import("node:fs/promises");
const http = require("node:http") as typeof import("node:http");
const servePath = require("node:path") as typeof import("node:path");

const serveDistRoot = servePath.resolve(__dirname, "..", "dist");
const host = "127.0.0.1";
const port = Number(process.env.PORT || 1420);

const contentTypes = new Map<string, string>([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"]
]);

function getContentType(filePath: string): string {
  return contentTypes.get(servePath.extname(filePath).toLowerCase()) || "application/octet-stream";
}

function resolveRequestPath(requestUrl: string): string {
  const parsedUrl = new URL(requestUrl, `http://${host}:${port}`);
  let relativePath = decodeURIComponent(parsedUrl.pathname);

  if (relativePath === "/") {
    relativePath = "/index.html";
  }

  const normalizedPath = servePath.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  return servePath.join(serveDistRoot, normalizedPath);
}

const server = http.createServer(async (
  request: import("node:http").IncomingMessage,
  response: import("node:http").ServerResponse
) => {
  if (!request.url) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request.");
    return;
  }

  const targetPath = resolveRequestPath(request.url);

  if (!targetPath.startsWith(serveDistRoot)) {
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
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found.");
  }
});

server.listen(port, host, () => {
  console.log(`Quill dev server running at http://${host}:${port}/`);
});
