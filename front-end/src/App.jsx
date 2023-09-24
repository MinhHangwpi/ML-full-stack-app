/**
 * Important sources:
 * Web demo for Pose Landmarker: https://codepen.io/mediapipe-preview/pen/abRLMxN?editors=1111
 * Web demo for Hand Landmarker: https://codepen.io/mediapipe-preview/pen/gOKBGPN
 */


import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { HandLandmarker, FilesetResolver, PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

/*
to use DrawingUtils
const drawingUtils = new DrawingUtils(canvasCtx);

for (const landmark of result.landmarks){
  drawingUtils.drawLandmarks(
    landmark, {
      radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1)
    }
  )

  drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
}
*/

import DeviceList from "./DeviceList";

const App = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const canvasRef = useRef(null);
  const [handLandmarker, setHandLandmarker] = useState(null);
  const [poseLandmarker, setPoseLandmarker] = useState(null);

  const connect = window.drawConnectors;
  var camera = null;

  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [runningMode, setRunningMode] = useState("IMAGE");
  const [webcamRunning, setWebcamRunning] = useState(false);

  // show all cameras by deviceId
  const [devices, setDevices] = React.useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  // to send results to backend
  const [collectedResults, setCollectedResults] = useState([]);


  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    setWebcamRunning(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm"
    });
    mediaRecorderRef.current.addEventListener("dataavailable", ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    });
    mediaRecorderRef.current.start();
  }, [webcamRef, mediaRecorderRef]);

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
    setWebcamRunning(false);
  }, [mediaRecorderRef, webcamRef]);

  // const handleDownload = useCallback(() => {
  //   if (recordedChunks.length) {
  //     const blob = new Blob(recordedChunks, {
  //       type: "video/webm"
  //     });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     document.body.appendChild(a);
  //     a.style = "display: none";
  //     a.href = url;
  //     a.download = "react-webcam-stream-capture.webm";
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //     setRecordedChunks([]);
  //   }
  // }, [recordedChunks]);


  // handing devices
  const handleDevices = React.useCallback(
    mediaDevices =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices]
  );


  // function onResults on MediaPipe
  function onResultsCallback(results) {
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // set canvas width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    // PoseLandmarker.POSE_CONNECTIONS

    console.log("The whole handLandmarker results object ==============> ", results); // the result object corresponding to processing video of a single frame.

    // if (results.landmarks && results.handedness) {
    //   for (let i = 0; i < results.landmarks.length; i++) {
    //     const landmarks = results.landmarks[i];
    //     const handInfo = results.handednesses[i];

    //     console.log("landmarks for hand", i, "======================>", landmarks);
    //     console.log("handedness for hand", i, "======================>", handInfo);

    //     // Check if it's a right or left hand
    //     if (handInfo.categoryName === 'Right') {
    //       console.log("This is a right hand");
    //     } else if (handInfo.categoryName === 'Left') {
    //       // Do something for left hand
    //       console.log("This is a left hand");
    //     }
    //   }
    // }

    // console.log("The whole pose landmarker result object ===========>", results_pose);

    // collect results
    setCollectedResults(prev => [...prev, results]);

    // check if we have collected 128 results
    if (collectedResults.length >= 128) {
      sendDataToServer(collectedResults);
      setCollectedResults([]);
    }

    canvasCtx.restore();
  }

  // a function to send data to Node.js server
  async function sendDataToServer(data) {
    try {

      const response = await fetch("http://localhost:3000/landmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      console.log(responseData);

    } catch (error) {
      console.log("There was an error sending the data: ", error);
    }
  }


  useEffect(() => {
    const loadMediaPipe = async () => {

      // Only create the HandLandmarker instance and poseLandmarker if they don't already exist
      if (!handLandmarker && !poseLandmarker) {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");

        // for handlandmarker specifically
        const newHandLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU",
          },
          runningMode,
          numHands: 2,
        });

        await newHandLandmarker.setOptions({ runningMode: "VIDEO" }); //should the running_mode be Livestream or video? if using livestream a listener needs to be set up https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
        setHandLandmarker(newHandLandmarker);

        // for poseLandmarker specifically

        const newPoseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 2
        });

        setPoseLandmarker(newPoseLandmarker);
      }

    };

    loadMediaPipe();

    const intervalId = setInterval(() => {
      if (handLandmarker && poseLandmarker && webcamRef.current) {
        let startTimeMs = performance.now();
        let results = handLandmarker.detectForVideo(webcamRef.current.video, startTimeMs);

        poseLandmarker.detectForVideo(webcamRef.current.video, startTimeMs, (result) => {
          console.log("The whole poselandmark result object", result);
        });

        onResultsCallback(results); // need 128 frames/results object for a prediction
      }
    }, 2000);

    // Cleanup interval when the component is unmounted or when dependencies change
    return () => clearInterval(intervalId);


  }, [runningMode, handLandmarker]);

  useEffect(() => {
    async function getDevices() {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(mediaDevices.filter(device => device.kind === "videoinput"));
    }
    getDevices();
  }, []);

  const handleDeviceClick = deviceId => {
    setSelectedDeviceId(deviceId);
  }


  useEffect(() => {
    console.log(canvasRef.current.width, canvasRef.current.height);
  }, []);

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        videoConstraints={{ facingMode: "user", deviceId: selectedDeviceId }}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 9,
          width: 640,
          height: 480,
        }}
        onUserMedia={() => {
          if (webcamRef.current && canvasRef.current) {
            canvasRef.current.width = webcamRef.current.videoWidth;
            canvasRef.current.height = webcamRef.current.videoHeight;
            drawLineOnCanvas();
          }
        }}
      />
      {capturing ? (
        <button onClick={handleStopCaptureClick}>Stop Capture</button>
      ) : (
        <button onClick={handleStartCaptureClick}>Start Capture</button>
      )}

      <canvas
        ref={canvasRef}
        className="output_canvas"
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 9,
          width: 640,
          height: 480,
        }}
      ></canvas>

      {webcamRunning ? "Webcam is running" : "Webcam is not running"}

      {/* Enable Webcam Button for hand detection */}
      {/* {navigator.mediaDevices?.getUserMedia && (
        <button id="webcamButton" onClick={() => {
          console.log(webcamRunning);
          if (webcamRunning) {

            // drawLineOnCanvas();
            // drawLineOnWebcam();
            console.log("clicked on webcam button!!!");
          }
        }}>
          {webcamRunning ? "DISABLE PREDICTIONS" : "ENABLE PREDICTIONS"}
        </button>
      )} */}

      <h1> Media devices list</h1>

      {devices.map((device, key) => (
        <div key={device.deviceId} onClick={() => handleDeviceClick(device.deviceId)}>
          {device.label || `Device ${key + 1}`}
        </div>
      ))}

    </div>
  );
};

export default App;
