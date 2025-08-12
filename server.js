const express = require("express");
const cors = require("cors");
const dns = require("dns");

const server = express();

absoluteHtmlPath = __dirname + "/views/index.html";
absoluteStylesPath = __dirname + "/public";

server.use(express.urlencoded({ extended: false }));

server.use(express.json());

server.use("/public", express.static(absoluteStylesPath));

server.use(cors({ optionsSuccessStatus: 200 }));

let urls = {};
let counter = 1024;

server.get("/", (req, res) => {
  res.sendFile(absoluteHtmlPath);
});

server.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  let hostname;
  try {
    const urlObj = new URL(originalUrl);
    hostname = urlObj.hostname;
  } catch {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }
  });

  const shortId = counter++;
  urls[shortId] = originalUrl;

  res.json({ original_url: originalUrl, short_url: shortId });
});

server.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  const originalUrl = urls[id];

  if (!originalUrl) {
    return res.json({ error: "invalid request" });
  }

  res.redirect(originalUrl);
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
