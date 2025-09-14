import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Headers required by the source server
const CUSTOM_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  "Referer": "https://liveboxpro.com/",
  "Origin": "https://liveboxpro.com",
  "Accept": "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "Connection": "keep-alive"
};


app.get("/", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing ?url parameter");

  try {
    const r = await fetch(targetUrl, { headers: CUSTOM_HEADERS });
    if (!r.ok) throw new Error(`Upstream error ${r.status}`);

    // If it's a playlist (.m3u8), rewrite segment URLs through this proxy
    if (targetUrl.endsWith(".m3u8")) {
      let text = await r.text();
      text = text.replace(
        /(https?:\/\/[^\s]+)/g,
        (match) =>
          `${req.protocol}://${req.get("host")}/?url=${encodeURIComponent(
            match
          )}`
      );
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.send(text);
    }

    // For .ts/.mp4 segments, just stream them
    res.setHeader("Content-Type", r.headers.get("content-type") || "application/octet-stream");
    r.body.pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).send("Proxy error: " + e.message);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on http://localhost:${PORT}`);
});
