import React, { useEffect, useRef, useState } from "react";
import {
  HandLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

export default function HandDetection() {
  const [handLandmarker, setHandLandmarker] = useState(undefined);
  const [runningMode, setRunningMode] = useState("IMAGE");
  const [webcamRunning, setWebcamRunning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadHandLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "@mediapipe/tasks-vision/wasm"
      );
      const hl = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU",
        },
        runningMode,
        numHands: 2,
      });
      setHandLandmarker(hl);
    };
    loadHandLandmarker();
  }, [runningMode]);

  const handleClick = async (event) => {
    // ... (similarly handle the click event as in your code)
  };

  const enableCam = async () => {
    // ... (similarly enable the cam as in your code)
  };

  const predictWebcam = () => {
    // ... (similarly predict webcam as in your code)
  };

  return (
    <div>
      <div id="demos">
        {/* Images for detection on click might look something like this */}
        <div className="detectOnClick">
          <img
            src="path-to-your-image.jpg"
            alt="Sample for detection"
            onClick={handleClick}
          />
          {/* Add other images similarly */}
        </div>

        {/* Webcam and Canvas */}
        <video ref={videoRef} id="webcam"></video>
        <canvas ref={canvasRef} id="output_canvas"></canvas>

        {/* Enable Webcam Button */}
        {navigator.mediaDevices?.getUserMedia && (
          <button id="webcamButton" onClick={enableCam}>
            {webcamRunning ? "DISABLE PREDICTIONS" : "ENABLE PREDICTIONS"}
          </button>
        )}
      </div>
    </div>
  );
}
