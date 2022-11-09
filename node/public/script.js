let socket = null;
let isRecording = false;
let id = i => document.getElementById(i);
let respText = id("respText");
let lang = id("lang");
let btn = id("mainBtn");
const languages = [
  "English",
  "Kannada",
  "Tamil",
  "Telugu",
  "Gujrati",
  "Marathi",
  "Hindi"
];

handleStopRecording = () => {
  try {
    socket.emit("stopAudioStream");
    socket.emit("disconnect");
    stopRecord();
  } catch {}
};
handleStartRecording = () => {
//  socket = io("https://websocket.gnani.ai/");
  socket = io();
  socket.emit("language", lang.value);
  socket.emit("startAudioStream");
  socket.on("result", msg => {
    respText.textContent = msg;
  });
  startRecord();
};

function handleToggle() {
  isRecording = !isRecording;
  if (isRecording) {
    console.log("Start record");
    btn.textContent = "Stop";
    handleStartRecording();
  } else {
    btn.textContent = "Start";
    console.log("Stop record");
    handleStopRecording();
  }
}
btn.addEventListener("click", handleToggle);
