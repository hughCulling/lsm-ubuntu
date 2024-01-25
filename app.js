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
const uri = require("./atlas_uri.js");
const bodyParser = require("body-parser");

const app = express();
const client = new MongoClient(uri);
const dbname = "live-stream-music";
const collection_name = "users";
const usersCollection = client.db(dbname).collection(collection_name);
let userAccount = {
  name: "Hugh",
  email: "Culling",
  password: "pw123",
};
let documentToFind = { email: "lornica@lsm.com" };

const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log(
      `Connected to the ${dbname} database 🌍 \nFull connection string: ${uri}`
    );
  } catch (err) {
    console.error(`Error connecting to the database: ${err}`);
  }
};

const signUpUser = async () => {
  try {
    await connectToDatabase();
    let result = await usersCollection.insertOne(userAccount);
    console.log(`Inserted document: ${result.insertedId}`);
  } catch (err) {
    console.error(`Error connecting to the database: ${err}`);
  } finally {
    await client.close();
  }
};

const signInUser = async () => {
  try {
    await connectToDatabase();
    let result = await usersCollection.findOne(documentToFind);
    console.log(`Found one document`);
    console.log(result);
    return result;
  } catch (err) {
    console.error(`Error connecting to the database: ${err}`);
  } finally {
    await client.close();
  }
};

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

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

app.post("/sign-up.html", function (req, res, next) {
  userAccount = {
    name: `${req.body.name}`,
    email: `${req.body.email}`,
    password: `${req.body.password}`,
  };

  signUpUser();

  res.sendFile(path.join(__dirname, "public", "html", "sign-up.html"));
});

app.post("/sign-in.html", async function (req, res, next) {
  documentToFind = {
    email: `${req.body.email}`,
    password: `${req.body.password}`,
  };
  let result = await signInUser();
  console.log("They signed in.");

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
  console.log(`Server running on https://live-stream-music.com:${PORT}`);
});
