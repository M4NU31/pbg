const path = require("path");
const fs = require("fs");
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const ROOT = __dirname;
const WEB_DIR = path.join(ROOT, "apps/web");
const BUILD_DIR = path.join(WEB_DIR, ".nextbuild");
const STATIC_DIR = path.join(BUILD_DIR, "static");

// Startup diagnostics
console.log("> BUILD_DIR:", BUILD_DIR);
console.log("> BUILD_DIR exists:", fs.existsSync(BUILD_DIR));
console.log("> static exists:", fs.existsSync(STATIC_DIR));
try {
  const buildId = fs.readFileSync(path.join(BUILD_DIR, "BUILD_ID"), "utf8").trim();
  console.log("> BUILD_ID:", buildId);
  const chunks = fs.readdirSync(path.join(STATIC_DIR, "chunks"));
  console.log("> chunks count:", chunks.length, "| first:", chunks[0]);
} catch (e) {
  console.log("> build info error:", e.message);
}

const app = next({ dev: false, dir: WEB_DIR });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || "3000", 10);

const MIME = {
  ".js":    "application/javascript; charset=utf-8",
  ".css":   "text/css; charset=utf-8",
  ".json":  "application/json",
  ".ico":   "image/x-icon",
  ".png":   "image/png",
  ".svg":   "image/svg+xml",
  ".woff":  "font/woff",
  ".woff2": "font/woff2",
};

function serveStatic(filePath, res) {
  const ext = path.extname(filePath);
  res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  fs.createReadStream(filePath).on("error", (err) => {
    console.error("> serveStatic error:", err.message);
    res.statusCode = 404;
    res.end("Not found");
  }).pipe(res);
}

function testDbConnection() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) { console.error("> DB check FAILED: DATABASE_URL not set"); return; }
  let parsed;
  try { parsed = new URL(dbUrl); } catch (e) { console.error("> DB URL invalid:", e.message); return; }

  const socketPath = parsed.searchParams.get("socket");
  if (socketPath) {
    let mysql2;
    try { mysql2 = require(path.join(ROOT, "node_modules/mysql2")); } catch { return; }
    const conn = mysql2.createConnection({
      socketPath,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: decodeURIComponent(parsed.pathname.slice(1)),
    });
    conn.connect((err) => {
      if (err) console.error("> DB mysql2 socket FAILED:", err.message);
      else { console.log("> DB mysql2 socket OK: connected successfully"); conn.end(); }
    });
    return;
  }

  const net = require("net");
  const host = parsed.hostname;
  const p = parseInt(parsed.port || "3306", 10);
  const client = net.createConnection({ host, port: p }, () => {
    console.log("> DB TCP check OK:", host + ":" + p); client.destroy();
  });
  client.on("error", (err) => console.error("> DB TCP check FAILED:", err.message));
  client.setTimeout(5000, () => { console.error("> DB TCP check timed out"); client.destroy(); });
}

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const pathname = parsedUrl.pathname || "";

    // Serve _next/static directly from disk
    if (pathname.startsWith("/_next/static/")) {
      const relativePath = pathname.slice("/_next/static/".length);
      const filePath = path.join(STATIC_DIR, relativePath);
      if (fs.existsSync(filePath)) return serveStatic(filePath, res);
    }

    handle(req, res, parsedUrl);
  }).listen(port, "0.0.0.0", () => {
    console.log("> Ready on port " + port);
    testDbConnection();
  });
}).catch((err) => {
  console.error("> Failed to start:", err);
  process.exit(1);
});
