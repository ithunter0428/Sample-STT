const io = require("socket.io");
let socket = null;
let isRecording = false;
// let id = (i) => document.getElementById(i);
// let respText = id("respText");
// let lang = id("lang");
// let btn = id("mainBtn");
const languages = [
  "English",
  "Kannada",
  "Tamil",
  "Telugu",
  "Gujrati",
  "Marathi",
  "Hindi",
];

let mediaStream = null;
let audio_context = null;

const initializeRecorder = (stream) => {
  mediaStream = stream;
  audio_context = new AudioContext();
  var audioInput = audio_context.createMediaStreamSource(stream);
  var bufferSize = 4096;
  var recorder = audio_context.createScriptProcessor(bufferSize, 1, 1);
  recorder.onaudioprocess = recorderProcess;
  audioInput.connect(recorder);
  recorder.connect(audio_context.destination);
};

const recorderProcess = (e) => {
  let sourceAudioBuffer = e.inputBuffer; // directly received by the audioprocess event from the microphone in the browser
  let TARGET_SAMPLE_RATE = 16000;
  let offlineCtx = new OfflineAudioContext(
    sourceAudioBuffer.numberOfChannels,
    sourceAudioBuffer.duration *
      sourceAudioBuffer.numberOfChannels *
      TARGET_SAMPLE_RATE,
    TARGET_SAMPLE_RATE
  );
  let buffer = offlineCtx.createBuffer(
    sourceAudioBuffer.numberOfChannels,
    sourceAudioBuffer.length,
    sourceAudioBuffer.sampleRate
  );
  for (
    let channel = 0;
    channel < sourceAudioBuffer.numberOfChannels;
    channel++
  ) {
    buffer.copyToChannel(sourceAudioBuffer.getChannelData(channel), channel);
  }
  // Play it from the beginning.
  let source = offlineCtx.createBufferSource();
  source.buffer = sourceAudioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);
  offlineCtx.oncomplete = (e) => {
    // `resampled` contains an AudioBuffer resampled at 16000Hz.
    // use resampled.getChannelData(x) to get an Float32Array for channel x.
    let resampled = e.renderedBuffer;
    let leftFloat32Array = resampled.getChannelData(0);
    //console.log(leftFloat32Array);
    socket.emit("audioData", convertFloat32ToInt16(leftFloat32Array));
    // use this float32array to send the samples to the server or whatever
  };
  offlineCtx.startRendering();
};
const convertFloat32ToInt16 = (buffer) => {
  let l = buffer.length;
  let buf = new Int16Array(l);
  while (l--) {
    buf[l] = Math.min(1, buffer[l]) * 0x7fff;
  }
  return buf.buffer;
};

function startRecord() {
  navigator.getUserMedia({ audio: true }, initializeRecorder, () => {});
}

function stopRecord() {
  try {
    mediaStream.getAudioTracks().forEach((x) => x.stop());
    audio_context.close();
  } catch {}
}

const handleStopRecording = () => {
  try {
    socket.emit("stopAudioStream");
    socket.emit("disconnect");
    stopRecord();
  } catch {}
};
const handleStartRecording = () => {
  //  socket = io("https://websocket.gnani.ai/");
  socket = io();
  // socket.emit("language", lang.value);
  socket.emit("language", languages[0]);
  socket.emit("startAudioStream");
  // socket.on("result", (msg) => {
  //   respText.textContent = msg;
  // });
  startRecord();
};

const handleToggle = () => {
  isRecording = !isRecording;
  if (isRecording) {
    console.log("Start record");
    // btn.textContent = "Stop";
    handleStartRecording();
  } else {
    // btn.textContent = "Start";
    console.log("Stop record");
    handleStopRecording();
  }
};
// btn.addEventListener("click", handleToggle);

module.exports = handleToggle;
