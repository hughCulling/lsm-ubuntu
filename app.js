// // Start the server on port 3000
// const port = 80;
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

// const express = require("express");
// const https = require("https");
// const fs = require("fs");
// const path = require("path");
// const { MongoClient } = require("mongodb");
// const uri = require("./atlas_uri.js");
// const bodyParser = require("body-parser");
// const session = require("express-session");

import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { MongoClient } from "mongodb";
import uri from "./atlas_uri.js";
import bodyParser from "body-parser";
import session from "express-session";
import { IvsClient, CreateChannelCommand } from "@aws-sdk/client-ivs";
import { fileURLToPath } from "url";

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
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ivs_client = new IvsClient({ region: "eu-west-1" });
let input = {
  // CreateChannelRequest
  name: "lsm_channel",
  latencyMode: "NORMAL",
  type: "BASIC",
  authorized: false,
  recordingConfigurationArn: "",
  tags: {
    // Tags
  },
  insecureIngest: false,
  preset: "",
};
// const command = new CreateChannelCommand(input);
// const response = await ivs_client.send(command);

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
    input = {
      // CreateChannelRequest
      name: `${result.insertedId}`,
      latencyMode: "NORMAL",
      type: "BASIC",
      authorized: false,
      recordingConfigurationArn: "",
      tags: {
        // Tags
      },
      insecureIngest: false,
      preset: "",
    };
    console.log(input);
    const command = new CreateChannelCommand(input);
    const response = await ivs_client.send(command);
  } catch (err) {
    console.error(`Error connecting to the database: ${err}`);
  } finally {
    // input = {
    //   // CreateChannelRequest
    //   name: `${result.insertedId}`,
    //   latencyMode: "NORMAL",
    //   type: "BASIC",
    //   authorized: false,
    //   recordingConfigurationArn: "",
    //   tags: {
    //     // Tags
    //   },
    //   insecureIngest: false,
    //   preset: "",
    // };
    // console.log(input);
    // const response = await ivs_client.send(command);
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

// view engine setup
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "secret",
    cookie: { secure: false },
  })
);

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "html", "index.html"));
// });

app.get("/", (req, res) => {
  if (req.session.user) {
    console.log("They are signed in.");
    let id = "/" + req.session.user._id;
    res.render(path.join(__dirname, "views", "index.pug"), {
      title: "Live Stream Music",
      href: `${id}`,
      status: `Signed in as: ${req.session.user.name}`,
    });
  } else {
    console.log("They are not signed in.");
    res.render(path.join(__dirname, "views", "index.pug"), {
      title: "Live Stream Music",
      href: "/sign-in.html",
      status: "User: not signed in",
    });
  }
});

// app.get("/broadcast.html", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "html", "broadcast.html"));
// });

app.get("/broadcast.html", (req, res) => {
  if (req.session.user) {
    console.log("They are signed in.");
    let id = "/" + req.session.user._id;
    res.render(path.join(__dirname, "views", "broadcast.pug"), {
      title: "Broadcast | Live Stream Music",
      href: `${id}`,
      status: `Signed in as: ${req.session.user.name}`,
    });
  } else {
    console.log("They are not signed in.");
    res.render(path.join(__dirname, "views", "broadcast.pug"), {
      title: "Broadcast | Live Stream Music",
      href: "/sign-in.html",
      status: "User: not signed in",
    });
  }
});

// app.get("/playback.html", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "html", "playback.html"));
// });

app.get("/playback.html", (req, res) => {
  if (req.session.user) {
    console.log("They are signed in.");
    let id = "/" + req.session.user._id;
    res.render(path.join(__dirname, "views", "playback.pug"), {
      title: "Playback | Live Stream Music",
      href: `${id}`,
      status: `Signed in as: ${req.session.user.name}`,
    });
  } else {
    console.log("They are not signed in.");
    res.render(path.join(__dirname, "views", "playback.pug"), {
      title: "Playback | Live Stream Music",
      href: "/sign-in.html",
      status: "User: not signed in",
    });
  }
});

// app.get("/sign-up.html", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "html", "sign-up.html"));
// });

app.get("/sign-up.html", (req, res) => {
  if (req.session.user) {
    console.log("They are signed in.");
    let id = "/" + req.session.user._id;
    res.render(path.join(__dirname, "views", "sign_up.pug"), {
      title: "Sign Up | Live Stream Music",
      href: `${id}`,
      status: `Signed in as: ${req.session.user.name}`,
    });
  } else {
    console.log("They are not signed in.");
    res.render(path.join(__dirname, "views", "sign_up.pug"), {
      title: "Sign Up | Live Stream Music",
      href: "/sign-in.html",
      status: "User: not signed in",
    });
  }
});

// app.get("/sign-in.html", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "html", "sign-in.html"));
// });

app.get("/sign-in.html", (req, res) => {
  if (req.session.user) {
    console.log("They are signed in.");
    let id = "/" + req.session.user._id;
    res.render(path.join(__dirname, "views", "sign_in.pug"), {
      title: "Sign In | Live Stream Music",
      href: `${id}`,
      status: `Signed in as: ${req.session.user.name}`,
    });
  } else {
    console.log("They are not signed in.");
    res.render(path.join(__dirname, "views", "sign_in.pug"), {
      title: "Sign In | Live Stream Music",
      href: "/sign-in.html",
      status: "User: not signed in",
    });
  }
});

// app.get("/:id", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "html", "user.html"));
// });

app.get("/:id", (req, res) => {
  if (req.session.user) {
    console.log("They are signed in.");
    let id = "/" + req.session.user._id;
    res.render(path.join(__dirname, "views", "user.pug"), {
      title: "User | Live Stream Music",
      href: `${id}`,
      status: `Signed in as: ${req.session.user.name}`,
    });
  } else {
    console.log("They are not signed in.");
    res.render(path.join(__dirname, "views", "user.pug"), {
      title: "User | Live Stream Music",
      href: "/sign-in.html",
      status: "User: not signed in",
    });
  }
});

app.post("/sign-up.html", function (req, res, next) {
  userAccount = {
    name: `${req.body.name}`,
    email: `${req.body.email}`,
    password: `${req.body.password}`,
  };
  signUpUser();

  // res.sendFile(path.join(__dirname, "public", "html", "sign-up.html"));
  if (req.session.user) {
    console.log("They are signed in.");
    let id = "/" + req.session.user._id;
    res.render(path.join(__dirname, "views", "sign_up.pug"), {
      title: "Sign Up | Live Stream Music",
      href: `${id}`,
      status: `Signed in as: ${req.session.user.name}`,
    });
  } else {
    console.log("They are not signed in.");
    res.render(path.join(__dirname, "views", "sign_up.pug"), {
      title: "Sign Up | Live Stream Music",
      href: "/sign-in.html",
      status: "User: not signed in",
    });
  }
});

app.post("/sign-in.html", async function (req, res, next) {
  documentToFind = {
    email: `${req.body.email}`,
    password: `${req.body.password}`,
  };
  let result = await signInUser();
  console.log("They signed in.");
  req.session.user = result;
  req.session.save();
  console.log(result);

  // res.sendFile(path.join(__dirname, "public", "html", "sign-in.html"));
  if (req.session.user) {
    console.log("They are signed in.");
    let id = "/" + req.session.user._id;
    res.render(path.join(__dirname, "views", "sign_in.pug"), {
      title: "Sign In | Live Stream Music",
      href: `${id}`,
      status: `Signed in as: ${req.session.user.name}`,
    });
  } else {
    console.log("They are not signed in.");
    res.render(path.join(__dirname, "views", "sign_in.pug"), {
      title: "Sign In | Live Stream Music",
      href: "/sign-in.html",
      status: "User: not signed in",
    });
  }
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
