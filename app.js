// // Start the server on port 3000
// const port = 80;
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "index.html"));
});

app.get("/broadcast.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "broadcast.html"));
});

app.get("/playback.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "playback.html"));
});

app.get("/sign-up.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "sign-up.html"));
});

app.get("/sign-in.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "sign-in.html"));
});

const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/live-stream-music.com/privkey.pem",
  "utf8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/live-stream-music.com/fullchain.pem",
  "utf8"
);
const ca = fs.readFileSync(
  "/etc/letsencrypt/live/live-stream-music.com/chain.pem",
  "utf8"
);

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

const httpsServer = https.createServer(credentials, app);

const PORT = 443;

httpsServer.listen(PORT, () => {
  console.log(`Server running on https://your_domain.com:${PORT}`);
});
