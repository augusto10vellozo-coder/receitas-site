import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = process.argv[2];
const port = Number(process.argv[3] || 8080);
const tipos = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

http
  .createServer((req, res) => {
    let url = decodeURIComponent(req.url.split("?")[0]);
    if (url.endsWith("/")) url += "index.html";
    let arq = path.join(root, url);
    if (!arq.startsWith(root)) { res.writeHead(403).end(); return; }
    if (!fs.existsSync(arq) && fs.existsSync(arq + ".html")) arq += ".html";
    if (!fs.existsSync(arq) || fs.statSync(arq).isDirectory()) {
      res.writeHead(404, { "content-type": "text/plain" }).end("404");
      return;
    }
    res.writeHead(200, { "content-type": tipos[path.extname(arq)] || "application/octet-stream" });
    fs.createReadStream(arq).pipe(res);
  })
  .listen(port, () => console.log(`http://localhost:${port}`));
