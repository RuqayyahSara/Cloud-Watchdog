import { createAdapter } from "@socket.io/redis-adapter";
import cluster from "cluster";
import CryptoJS from "crypto-js";
import express from "express";
import farmhash from "farmhash";
import JWT from "jsonwebtoken";
import net from "net";
import os from "os";
import path from "path";
import { createClient } from "redis";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import Tokens from "./models/Token.js";
import socketMain from "./socketMain.js";
import sendEmail from "./sendEmail.js";

const __filename = fileURLToPath(import.meta.url); //
const __dirname = path.dirname(__filename); //
const port = 4000;

const num_cores = os.cpus().length;

if (cluster.isPrimary) {
  /*
        Reason behind workers = []
        workers Array stores all the worker cpu threads in an array. We need to keep them to be able to reference them based on
        Source IP Addres. It is also useful to auto-restart the respective worker if any worker thread is dead.

    */
  let workers = [];
  let spawn = function (i) {
    workers[i] = cluster.fork();

    workers[i].on("exit", (code, signal) => {
      //log if you want to some file that this is dead worker.
      spawn(i);
    });
  };
  //Spawn Worker threads
  for (let i = 0; i < num_cores; i++) {
    spawn(i);
  }

  const worker_index = function (ip, len) {
    return farmhash.fingerprint32(ip) % len;
  };

  const server = net.createServer({ pauseOnConnect: true }, (connection) => {
    let worker = workers[worker_index(connection.remoteAddress, num_cores)];
    worker.send("sticky-session:connection", connection);
    console.log(connection.remoteAddress);
  });
  server.listen(port, { host: "0xweb.net" });

  console.log(`Master listening at ${port}`);
} else {
  /*
    Note : We do not use a port in this block because the master listens for all the worker threads.
     */
  let app = express();
  const server = app.listen(0, "localhost"); // Don't expose our internal server to the outside world.
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    headers: {
      "access-control-allow-origin": "*",
      "Content-type": "application/json; charset=UTF-8",
    },
  });
  const pubClient = createClient({ url: "redis://localhost:6379" });
  const subClient = pubClient.duplicate();

  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
  });

  // API for token based on wether the client is UI or a dog server
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "build")));
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "build"));
  });

  app.post("/notify", async (req, res) => {
    try {
      const { email, metric } = req.body
      if (!req.body.email || !req.body.metric)
        return res.status(400).json({ error: "Missing Fields" });

      sendEmail({
        subject: "System Alert!! - CS.CODE.IN",
        to: email,
        body: `Hi<br/>
         Your System's ${metric} has reached more than 90% of the limit. 
         Review your system for safety reasons.<br/><br/>
            Thank you <br/>
            <b>Team CS.CODE.IN</b>`,
      });

      res.status(200).json({ success: "Email sent successfully" })
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: "Internal Server Error" })
    }
  })

  app.post("/token", async (req, res) => {
    try {
      if (!req.body.clientType || !req.body.macA)
        return res.send("Missing Fields");

      // If macA is already there then check in clientTokens for token
      // associated with macA & throw same one
      let token,
        macA = await Tokens.find({});

      let inUiClient = SearchMacA(req.body.macA, macA[0].uiClientTokens);
      if (inUiClient != -1) {
        res.send(macA[0].uiClientTokens[inUiClient].key);
        return;
      }

      let inDogClient = SearchMacA(req.body.macA, macA[0].dogClientTokens);
      if (inDogClient != -1) {
        res.send(macA[0].dogClientTokens[inDogClient].key);
        return;
      }

      if (req.body.clientType == "ui") {
        token = JWT.sign(
          {
            data: makeid(15),
          },
          "WATCHDOG",
          { expiresIn: 60 * 60 }
        );

        let tokens = await Tokens.find({});
        tokens[0].uiClientTokens.push({ key: token, macA: req.body.macA });
        await tokens[0].save();
      } else {
        token = makeid(15);
        token = CryptoJS.AES.encrypt(token, "WATCHDOG").toString();
        let tokens = await Tokens.find({});
        tokens[0].dogClientTokens.push({ key: token, macA: req.body.macA });
        await tokens[0].save();
      }

      res.send(token);
    } catch (error) {
      console.log(error);
    }
  });

  io.on("connection", (socket) => {
    socketMain(io, socket);
    console.log("Connected to Worker Thread : ", cluster.worker.id);
  });

  // Listen to messages sent from the master. Ignore everything else.
  process.on("message", function (message, connection) {
    if (message !== "sticky-session:connection") {
      return;
    }

    // Emulate a connection event on the server by emitting the
    // event with the connection the master sent us.
    server.emit("connection", connection);

    connection.resume();
  });
}

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function SearchMacA(macA, array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].macA == macA) {
      return i;
    }
  }

  return -1;
}
