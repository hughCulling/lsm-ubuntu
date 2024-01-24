// // Start the server on port 3000
// const port = 80;
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

const express = require("express");
const https = require("https");
const fs = require("fs");

const app = express();

// Define a route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/html/index.html");
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
