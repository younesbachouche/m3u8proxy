// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  const target = req.query.url;
  if (!target) {
    return res.status(400).send("Missing ?url=");
  }

  try {
    const response = await fetch(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
        "Referer": "https://liveboxpro.com/",
        "Origin": "https://liveboxpro.com/",
      },
    });

    res.setHeader("Content-Type", response.headers.get("content-type") || "application/vnd.apple.mpegurl");
    response.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
