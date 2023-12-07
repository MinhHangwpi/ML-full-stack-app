import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import {
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks, lerp } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS, POSE_CONNECTIONS } from "./connections";
import Typewriter from "typewriter-effect";
import Signup from "./Signup";
import { Button, Typography, Paper, styled, Box, Grid, CircularProgress} from "@mui/material";

let handLandmarker: HandLandmarker;
let poseLandmarker: PoseLandmarker;
let lastVideoTime = -1;
let results: { landmarks?: any[] } = {};
let pose_results: { landmarks?: any[] } = {};
let AppMessage = ""

function Fingerspelling() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [collectedHandFrames, setCollectedHandFrames] = useState<any[]>([]);
  const [collectedPoseFrames, setCollectedPoseFrames] = useState<any[]>([]);
  const [collectedRequest, setCollectedRequest] = useState<any>();
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [predictionActive, setPredictionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showappmessage,setAppMessage] = useState(false);


  ///function to initialize webcam
  const initializeWebcam = async () => {
    const video = videoRef.current;
    //const canvas = canvasRef.current;

    if (!webcamEnabled && video) {
      navigator.mediaDevices
        .getUserMedia({
          video: { width: 1280, height: 720 },
        })
        .then((stream) => {
          video.srcObject = stream;
          setWebcamEnabled(true);
        })
        .catch((err) => {
          console.error("Error accessing the webcam:", err);
          setServerMessage("Error accessing the webcam: " + err.message);
        });
      setupModels();
    } else if (video) {
      const tracks = (video.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      video.srcObject = null;
      setWebcamEnabled(false);
    }

    if (predictionActive) {
      stopPrediction();
      setPredictionActive(false);
    }
    
  };

  //const canvasCtx = canvas.getContext("2d");
  const setupModels = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU",
      },
      numHands: 2,
      runningMode: "VIDEO",
    });

    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
      },
      runningMode: "VIDEO",
    });
  };

  const startPrediction = () => {
    console.log("start prediction button is clicked!");
    predict();
  };

  const predict = async () => {

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const canvasCtx = canvas?.getContext("2d");
      if (canvasCtx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const nowInMs = performance.now();
        if (lastVideoTime !== video.currentTime) {
          lastVideoTime = video.currentTime;
          results = handLandmarker.detectForVideo(video, nowInMs);
          pose_results = poseLandmarker.detectForVideo(video, nowInMs);
          console.log("handlandmark result", results);
          console.log("poselandmark result", pose_results);
        }
        canvasCtx?.save();
        canvasCtx?.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx?.scale(-1, 1);
        canvasCtx?.translate(-video.videoWidth, 0);

        if (results.landmarks) {
          for (const landmarks of results.landmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
              color: "#00FF00",
              lineWidth: 5,
            });
            drawLandmarks(canvasCtx, landmarks, {
              color: "#FF0000",
              lineWidth: 2,
            });
          }

          setCollectedHandFrames((prevFrames) => [...prevFrames, results]);
        }
        if (pose_results.landmarks) {
          for (const landmarks of pose_results.landmarks) {
            drawLandmarks(canvasCtx, landmarks, {
              radius: (data) => {
                // Handle potential undefined values
                const zValue = data.from && data.from.z ? data.from.z : 0;
                return lerp(zValue, -0.15, 0.1, 5, 1);
              },
            });
            drawConnectors(canvasCtx, landmarks, POSE_CONNECTIONS);
          }

          setCollectedPoseFrames((prevFrames) => [...prevFrames, pose_results]);
      
        }

        canvasCtx.restore();
        animationFrameRef.current = requestAnimationFrame(predict);
        
      }
    }
  };

  const prepareAndSendData = () => {
    // Prep the request format
    const requestPayload = {
      handLandmarks: collectedHandFrames,
      poseLandmarks: collectedPoseFrames,
    };
    // Stop collecting new frames
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Clear any existing frames to start fresh if needed later
    setCollectedHandFrames([]);
    setCollectedPoseFrames([]);

    // Send to server
    sendLandmarksToServer(requestPayload);
  };

  const stopPrediction = () => {
    console.log("stop prediction buttion is clicked!");
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;

      // Clearing the canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    prepareAndSendData();
  };

  const togglePrediction = () => {
    if (!predictionActive) {
      startPrediction();
    } else {
      stopPrediction();
    }
    setPredictionActive(!predictionActive);
    if (showappmessage){
      setAppMessage(!showappmessage);
    }
  };

  useEffect(() => {
    // This effect will run when the length of collectedHandFrames or collectedPoseFrames changes
    if (collectedHandFrames.length >= 128 || collectedPoseFrames.length >= 128) {
      // Stop prediction and animation frames
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Clearing the canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      // Prepare and send data to the server or handle it accordingly
      prepareAndSendData();
      setPredictionActive(!predictionActive);
      AppMessage = "Payload is too large, sending to server"
      setAppMessage(!showappmessage)
    }
  }, [collectedHandFrames, collectedPoseFrames]);
  
  useEffect(() => {
    // This effect will be called when collectedRequest changes.
    if (collectedRequest) {
      console.log("collectedRequest", collectedRequest);
      sendLandmarksToServer(collectedRequest);
    }
  }, [collectedRequest]);

  const sendLandmarksToServer = async (collectedFrames: any) => {
    setIsLoading(true); // Start loading
    console.log("sending data to server");
    try {
      const response = await fetch("http://localhost:3030/landmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(collectedFrames),
      });

      const data = await response.json();
      console.log(data.message);
      setServerMessage(data.message);
    } catch (error: any) {
      console.error("Error sending data to server:", error.message);
      setServerMessage(error.message);
    } finally {
      setIsLoading(false); // Stop loading whether the request succeeded or failed
    }
  };

  return (
    <Paper elevation={10}
    style={{
      padding: "10px",
      paddingBottom: "50px",
      height: "100vh",
      width: 1200,
      margin: "10px auto",
    }}>
      <Box display="flex" justifyContent="center" alignItems="center" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <Typography variant="h2" >
          The Finger Speller
        </Typography>
      </Box>
      <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12} style={{ 
        position: 'fixed',
        top: 750,
        left: 0,
        right: 0,
        textAlign: "center",
        zIndex: 1000 
      }}>
          <Button variant="contained" color="primary" onClick={initializeWebcam}>
            {webcamEnabled ? "Disable Webcam" : "Enable Webcam"}
          </Button>
          {webcamEnabled && (
            <Button variant="contained" color="secondary" onClick={togglePrediction} style={{ marginLeft: 10 }}>
              {predictionActive ? "Stop Prediction" : "Start Prediction"}
            </Button>
          )}
        </Grid>
      <Grid container spacing={-10} justifyContent="center" item xs={12} md={6}>
      <video
        autoPlay
        playsInline
        ref={videoRef}
        id="video"
        style={{
          position: "absolute",
          width: 1000,
          height:600,
          textAlign: "center",
          transform: "scaleX(-1)", // Flip the video on the X-axis
        }}
      />
      <canvas
        ref={canvasRef}
        id="canvas_output"
        style={{
          position: "absolute",
          width:1000,
          height:600,
          textAlign: "center",
        }}
      />
      </Grid>
      
      <Grid item xs={12} style={{ 
        position: 'fixed',
        bottom: 400,
        left: 0,
        right: 0,
        textAlign: "center",
        zIndex: 1000 
      }}>
        {showappmessage &&(
        <p>{AppMessage}</p>
        )}
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              zIndex: 2,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CircularProgress/>
          </Box>
        )}
        {isLoading == false && (
          <Typewriter
            options={{
              strings: serverMessage,
              autoStart: true,
              loop: false,
              delay:50
            }}
          />
        )}
      </Grid>
      </Grid>
      </Paper>
  );
}

export default Fingerspelling;
