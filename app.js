// // Import required modules
// const express = require("express");

// // Create an Express application
// const app = express();

// // Define a route
// app.get("/", (req, res) => {
//   res.send("Hello, Express!");
// });

// // Start the server on port 3000
// const port = 80;
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

const express = require("express");
const https = require("https");
const fs = require("fs");

const app = express();

// Your existing server setup...

const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/your_domain.com/privkey.pem",
  "utf8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/your_domain.com/cert.pem",
  "utf8"
);
const ca = fs.readFileSync(
  "/etc/letsencrypt/live/your_domain.com/chain.pem",
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
