/* eslint-disable no-undef */
const express = require("express");
const path = require("path");
var logger = require("morgan");
const handleToggle = require("./utils");
token =
  process.env.TOKEN ||
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VyX25hbWUiOiJiJzNjSDNGZ3ZlTllpK1JxSlFKSERtbE5JR0hiTjYxSno1ZzB3aENDTHJ0Mm89JyIsImtleV9kYXRlIjoiMjAxOS0xMS0wOCJ9.F6Wf-oiE0XUoKb3BELmmPTBvO61SN99h-qDtnPewOuaf_lEC_H7shdh-9mDQ_L8HWtGjOZjuRcxSxMryESsY0w";
accesskey = process.env.ACCESSKEY || "eca2785a8af296c0ce36c1d8137db8aadff4152f";

var my = require("./helper");
const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.use(logger("dev"));
app.use(my.cors);
const port = 5000;
// var https = require("https");
var http = require("http");

var server = http.createServer(app);

// var redirectserver = http
//   .createServer(function(req, res) {
//     res.writeHead(301, {
//       Location: "https://" + req.headers["host"] + req.url
//     });
//     res.end();
//   })
//   .listen(80);
// var https_options = {
//   key: fs.readFileSync("./Keys/star_gnani_ai.key"),
//   cert: fs.readFileSync("./Keys/ServerCertificate.pem"),
//   ca: [fs.readFileSync("./Keys/CACertificate-INTERMEDIATE-1.pem")]
// };
// const server = https.createServer(https_options, app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const ListenerService = require("./stt_grpc_pb.js");
var grpc = require("grpc");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var OK = (_, res) => res.end("OK");
var index = (_, res) => {
  console.log("sending index file");
  try {
    res.sendFile(path.join(__dirname, "public/index.html"));
    console.log("sent index file done.");
  } catch {
    res.end("404!! Some Error Occured");
    console.log("sending 404");
  }
};
app.get("/", index);
app.get("/livecheck", OK);
app.get("/readycheck", OK);
app.post("/", () => {
  handleToggle();
});
app.get("*", index);
//  (req, res) => {
//   res.redirect(301, "/");
// });
// =========================== SOCKET.IO ================================ //

let common_url = process.env.GRPCURL || "speech.gnani.ai:80";
const urls = {
  eng_IN: common_url,
  kan_IN: common_url,
  tam_IN: common_url,
  tel_IN: common_url,
  guj_IN: common_url,
  mar_IN: common_url,
  hin_eng_IN: common_url,
  hin_IN: common_url,
};

const default_lang = "English";

io.on("connection", (client) => {
  client.call = null;
  function setLanguage(lang) {
    lang = my.getlangCode(lang) || my.getlangCode(default_lang);
    client.lang = lang;
    client.url = urls[lang];
    console.log(client.lang, client.url);
  }
  setLanguage();
  console.log(client.id);
  client.on("startAudioStream", startRecognitionStream);
  client.on("stopAudioStream", stopRecognitionStream);
  client.on("language", setLanguage);
  client.on("audioData", SendAudioData);
  client.on("disconnect", () => (client.sttService = null));

  function SendAudioData(data) {
    console.log(data);
    if (client.call) {
      data = Buffer.from(data, "base64");
      var speechChunk = new proto.SpeechToText.SpeechChunk();
      speechChunk.setContent(data);
      speechChunk.setToken("shantanu@gnani.ai");
      client.call.write(speechChunk);
    }
  }
  async function startRecognitionStream() {
    console.log("Client Connected to server connection happened");
    console.log(client.url);
    client.sttService = new ListenerService.ListenerClient(
      client.url,
      grpc.credentials.createInsecure()
    );
    console.log("start function");
    var metadata = new grpc.Metadata();
    metadata.add("token", token);
    metadata.add("lang", client.lang);
    metadata.add("accesskey", accesskey);
    metadata.add("audioformat", "wav");
    metadata.add("encoding", "pcm16");
    metadata.add("sensitive", "Y");
    //metadata.add("org", "editor");

    client.call = client.sttService.doSpeechToText(metadata);

    client.call.on("data", function (transcribeChunk) {
      let data = transcribeChunk.getTranscript();
      console.log(data, "<------------");
      client.emit("result", data);
    });
    client.call.on("end", function () {
      console.log("stub said end to grpc ");
    });
    client.call.on("error", function (exception) {
      console.log("error in grpc" + exception);
      try {
        let err = exception.split(":");
        if (err.length > 0) client.emit("grpcError", err[err.length - 1]);
      } catch {}
    });
  }

  function stopRecognitionStream() {
    console.log("stop function", client.id);
    if (client.call) {
      client.call.end();
      client.call = null;
    }
  }
});

// =========================== START SERVER ================================ ///

server.listen(port, function () {
  console.log("Server started on port:" + port);
});
