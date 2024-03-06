// Had to convert from CommonJS to ESM
import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { MongoClient, ObjectId } from "mongodb";
import atlasUri from "./atlas_uri.js";
import bodyParser from "body-parser";
import session from "express-session";
import { IvsClient, CreateChannelCommand } from "@aws-sdk/client-ivs";
import { fileURLToPath } from "url";

const app = express();
// MongoDB instantiations and declarations, needed for function definitions
const mongoClient = new MongoClient(atlasUri);
const dbname = "live-stream-music";
const collectionName = "users";
const usersCollection = mongoClient.db(dbname).collection(collectionName);
// Used in 'signUpUser()' function
let userAccount = {
  name: "Hugh Wilfred Culling",
  email: "hughculling@icloud.com",
  password: "pw123",
};
// Used in 'signInUser()' function
let documentToFind = { email: "lornica@lsm.com" };

// Used as parameter in 'res.render()' function to
// find path to Pug files
const __filename = fileURLToPath(import.meta.url);
console.log(`__filename = ${__filename}`);
// Prints '/root/lsm-ubuntu/app.js'
const __dirname = dirname(__filename);
console.log(`__dirname = ${__dirname}`);
// Prints '/root/lsm-ubuntu'

// IVS instantiations and declarations, needed for 'signUpUser()' function
const ivsClient = new IvsClient({ region: "eu-west-1" });
// 'name' field will get changed in 'signUpUser()' function
let ivsChannelMetaData = {
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

// MongoDB function definitions
const connectToDatabase = async () => {
  try {
    await mongoClient.connect();
    console.log(
      `Connected to the ${dbname} database 🌍 \nFull connection string: ${uri}`
    );
  } catch (err) {
    console.error(`Error connecting to the database: ${err}`);
  }
};

// Insert document with user input and automatic ObjectId.
// Create an IVS channel with ObjectId as 'name' and update
// document with 'streamKey' and 'playbackUrl'
const signUpUser = async () => {
  try {
    await connectToDatabase();
    // userAccount given new values before 'signUpUser()' function call
    let result = await usersCollection.insertOne(userAccount);
    console.log(`Inserted document: ${result.insertedId}`);

    // 'ivsChannelMetaData' object updated after document inserted to use retrieved '_id'
    ivsChannelMetaData.name = `${result.insertedId}`;
    console.log(`ivsChannelMetaData.name = ${ivsChannelMetaData.name}`);

    // 'command' and 'response' are instantiated and declared here
    // so that they receive updated 'ivsChannelMetaData' object
    const command = new CreateChannelCommand(ivsChannelMetaData);
    const response = await ivsClient.send(command);
    console.log(
      `response.channel.ingestEndpoint = ${response.channel.ingestEndpoint}
      response.channel.playbackUrl = ${response.channel.playbackUrl}
      response.streamKey.value = ${response.streamKey.value}`
    );
    // Update inserted document to include the 'streamKey' and 'playbackUrl'
    // The 'ingestEndpoint' is the same for all my channels in 'eu-west-1'
    const documentToUpdate = { _id: new ObjectId(result.insertedId) };
    const update = {
      $set: {
        streamKey: `${response.streamKey.value}`,
        playbackUrl: `${response.channel.playbackUrl}`,
      },
    };
    let updateResult = await usersCollection.updateOne(
      documentToUpdate,
      update
    );
    updateResult.modifiedCount > 0
      ? console.log(`Updated ${updateResult.modifiedCount} documents`)
      : console.log("No documents updated");
  } catch (err) {
    console.error(`Error connecting to the database: ${err}`);
  } finally {
    await mongoClient.close();
  }
};

const signInUser = async () => {
  try {
    await connectToDatabase();
    // documentToFind is updated before function call.
    let result = await usersCollection.findOne(documentToFind);
    console.log(`Found one document`);
    console.log(`result = ${result}`);
    return result;
  } catch (err) {
    console.error(`Error connecting to the database: ${err}`);
  } finally {
    await mongoClient.close();
  }
};

// Specifies which templating engine to use
// Allows use of 'res.render()'
app.set("view engine", "pug");
// Allows serving of static files from 'public' directory
app.use(express.static(path.join(__dirname, "public")));
// Allows information sent in POST request to be retrieved
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "secret",
    cookie: { secure: false },
  })
);

// Returns respective 'href' based on whether user is signed in
function getIdPage(req) {
  // Checks whether a session exists, meaning they would've signed in.
  if (req.session.user) {
    console.log("getIdPage() They are signed in.");
    console.log(`req.session.user = ${req.session.user}`);
    return "/" + req.session.user._id;
  } else {
    console.log("getIdPage() They are not signed in.");
    return "/sign-in.html";
  }
}

// Returns respective 'status' based on whether user is signed in
function getStatusMessage(req) {
  if (req.session.user) {
    console.log("getStatusMessage() They are signed in.");
    console.log(`req.session.user = ${req.session.user}`);
    return `Signed in as: ${req.session.user.name}`;
  } else {
    console.log("getStatusMessage() They are not signed in.");
    return "User: not signed in";
  }
}

app.get("/", (req, res) => {
  let idPage = getIdPage(req);
  console.log(`idPage = ${idPage}`);
  let statusMessage = getStatusMessage(req);
  console.log(`statusMessage = ${statusMessage}`);

  res.render(path.join(__dirname, "views", "index.pug"), {
    title: "Live Stream Music",
    href: `${idPage}`,
    status: `${statusMessage}`,
  });
});

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

app.get("/:id", async (req, res) => {
  let currentUrl = req.url;
  console.log("current URL = " + currentUrl);
  let pageid = currentUrl.slice(1, 25);
  console.log("page id = " + pageid);
  // console.log(pageid == req.session.user._id);

  if (req.session.user) {
    if (pageid == req.session.user._id) {
      console.log("They are the broadcaster");
    }
    console.log("They are signed in.");
    let id = "/" + req.session.user._id;
    res.render(path.join(__dirname, "views", "user.pug"), {
      title: "User | Live Stream Music",
      href: `${id}`,
      status: `Signed in as: ${req.session.user.name}`,
      streamKey: `${req.session.user.streamKey}`,
    });
  } else {
    console.log("They are not signed in.");
    console.log("They are a viewer.");
    documentToFind = {
      _id: new ObjectId(pageid),
    };
    let result = await signInUser();
    console.log(result);
    res.render(path.join(__dirname, "views", "playback.pug"), {
      title: "User | Live Stream Music",
      href: "/sign-in.html",
      status: "User: not signed in",
      playbackUrl: `${result.playbackUrl}`,
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
