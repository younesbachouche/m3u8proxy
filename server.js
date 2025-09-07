// server.js
import express from "express";
import fetch from "node-fetch";
import url from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Common headers
const headers = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "Referer": "https://liveboxpro.com/",
  "Origin": "https://liveboxpro.com/",
  "Accept": "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "Connection": "keep-alive"
};

app.get("/", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing ?url=");

  try {
    const response = await fetch(target, { headers });

    if (target.endsWith(".m3u8")) {
      // Get playlist text
      let playlist = await response.text();

      // Rewrite all segment URLs to go through this proxy
      const baseUrl = target.substring(0, target.lastIndexOf("/") + 1);
      playlist = playlist.replace(
        /(.*\.ts)/g,
        (match) =>
          `${req.protocol}://${req.get("host")}/?url=${encodeURIComponent(
            url.resolve(baseUrl, match)
          )}`
      );

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.send(playlist);
    } else if (target.endsWith(".ts")) {
      // Stream video segments
      res.setHeader("Content-Type", "video/mp2t");
      response.body.pipe(res);
    } else {
      // Fallback for other assets
      res.setHeader(
        "Content-Type",
        response.headers.get("content-type") || "application/octet-stream"
      );
      response.body.pipe(res);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error: " + err.message);
  }
});

app.listen(PORT, () =>
console.log(`iOS-compatible proxy running on https://m3u8proxy-2dwu.onrender.com`);
);
