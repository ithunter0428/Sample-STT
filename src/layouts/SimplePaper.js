import React from "react";
import PropTypes from "prop-types";
import { makeStyles, styled } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import {
  AppBar,
  Box,
  Grid,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import { /*CloudUpload, */ RecordVoiceOver, Stop } from "@material-ui/icons";
import NestedList from "./Nested";
// import axios from "axios";
import io from "socket.io-client";

// const io = require("socket.io");
const socket = io(`http://${window.location.hostname}:5000`, {
  cors: {
    origin: `https://${window.location.hostname}`,
    methods: ["GET", "POST"],
  },
});

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

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    "& > *": {
      margin: theme.spacing(1),
      width: theme.spacing(64),
      height: theme.spacing(16),
    },
  },
  rootForTabs: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function SimplePaper() {
  const classes = useStyles();

  const [recordingStarted, setRecordingStarted] = React.useState(false);

  const [languageChoice, setLanguageChoice] = React.useState(0);

  const [inEnglish, setInEnglish] = React.useState(
    "Here goes translated English text."
  );

  React.useEffect(() => {
    socket.on("result", (msg) => {
      console.log("Translated to `" + msg + "`");
      setInEnglish(msg);
    });
  }, [inEnglish]);

  const handleCooseLanguage = (event, newLanguageChoice) => {
    setLanguageChoice(newLanguageChoice);
  };

  const handleRecording = () => {
    handleToggle();
    setRecordingStarted(!recordingStarted);
    // axios
    //   .post("http://localhost:5000/")
    //   .then((response) => {
    //     console.log(response);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  };

  return (
    <div>
      <Grid container spacing={1}>
        <Grid item xs={6} md={4}>
          <Paper elevation={3}>
            <IconButton
              style={{ display: !recordingStarted ? "block" : "none" }}
              onClick={handleRecording}
              id="mainBtn"
            >
              <RecordVoiceOver />
            </IconButton>
            <IconButton
              style={{ display: recordingStarted ? "block" : "none" }}
              onClick={handleRecording}
              id="mainBtn"
            >
              <Stop />
            </IconButton>
            {/* <Tooltip title="Upload My Audio">
                <IconButton color="primary" component="label">
                  <input hidden accept="audio/*" type="file" />
                  <CloudUpload />
                </IconButton>
              </Tooltip> */}
          </Paper>
          <Item>
            <NestedList />
          </Item>
        </Grid>
        <Grid item xs={6} md={8}>
          <div className={classes.rootForTabs}>
            <AppBar position="static">
              <Tabs
                value={languageChoice}
                onChange={handleCooseLanguage}
                aria-label="simple tabs example"
              >
                <Tab label="English" {...a11yProps(0)} />
                {/* <Tab label="नहीं" {...a11yProps(1)} disabled /> */}
              </Tabs>
            </AppBar>
            <TabPanel value={languageChoice} index={0}>
              {inEnglish}
            </TabPanel>
            {/* <TabPanel value={languageChoice} index={1}></TabPanel> */}
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
