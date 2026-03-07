const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { URL } = require("url");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = __dirname;
const RECORDS_PATH = path.join(ROOT_DIR, "records.txt");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp3": "audio/mpeg",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(payload);
}

function readRecords() {
  if (!fs.existsSync(RECORDS_PATH)) {
    return [];
  }

  const raw = fs.readFileSync(RECORDS_PATH, "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean);
}

function appendRecord(record) {
  fs.appendFileSync(RECORDS_PATH, `${JSON.stringify(record)}${os.EOL}`, "utf8");
}

function collectRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalLength = 0;

    request.on("data", (chunk) => {
      totalLength += chunk.length;
      if (totalLength > 1_000_000) {
        reject(new Error("Request body too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    request.on("error", reject);
  });
}

async function handleApi(request, response, urlObject) {
  if (request.method === "GET" && urlObject.pathname === "/api/recent-map-guesses") {
    const limit = Math.max(1, Math.min(50, Number(urlObject.searchParams.get("limit") || 10)));
    const records = readRecords();
    const recent = records.slice(-limit).reverse();

    const mapped = recent.map((record) => ({
      participantName: record.participantName || "Unknown",
      mapCountrySelection: record.mapCountrySelection || "",
      raffleEntries: Number(record.raffleEntries || 0),
      submittedAt: record.submittedAt || record.savedAt || "",
    }));

    sendJson(response, 200, { records: mapped });
    return true;
  }

  if (request.method === "POST" && urlObject.pathname === "/api/submissions") {
    try {
      const rawBody = await collectRequestBody(request);
      const payload = JSON.parse(rawBody || "{}");

      if (!payload || typeof payload !== "object") {
        sendJson(response, 400, { error: "Invalid payload" });
        return true;
      }

      const participantName = String(payload.participantName || "").trim();
      if (!participantName) {
        sendJson(response, 400, { error: "participantName is required" });
        return true;
      }

      const record = {
        ...payload,
        savedAt: new Date().toISOString(),
      };

      appendRecord(record);
      sendJson(response, 201, { ok: true, savedAt: record.savedAt });
    } catch (error) {
      sendJson(response, 400, { error: "Invalid JSON payload" });
    }

    return true;
  }

  return false;
}

function serveStaticFile(response, urlObject) {
  const rawPath = decodeURIComponent(urlObject.pathname || "/");
  const relativePath = rawPath === "/" ? "/index.html" : rawPath;
  const resolvedPath = path.normalize(path.join(ROOT_DIR, relativePath));

  if (!resolvedPath.startsWith(ROOT_DIR)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  fs.readFile(resolvedPath, (error, data) => {
    if (error) {
      sendText(response, 404, "Not Found");
      return;
    }

    const extension = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";

    response.writeHead(200, {
      "Content-Type": contentType,
    });
    response.end(data);
  });
}

const server = http.createServer(async (request, response) => {
  const urlObject = new URL(request.url, `http://${request.headers.host || `${HOST}:${PORT}`}`);

  if (urlObject.pathname.startsWith("/api/")) {
    const handled = await handleApi(request, response, urlObject);
    if (!handled) {
      sendJson(response, 404, { error: "Not found" });
    }
    return;
  }

  serveStaticFile(response, urlObject);
});

server.listen(PORT, HOST, () => {
  console.log(`Wisslr server running at http://${HOST}:${PORT}`);
  console.log(`Records file: ${RECORDS_PATH}`);
});
