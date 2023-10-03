import React, { useEffect, useRef } from "react";
import "./App.css";
import {
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker
} from "@mediapipe/tasks-vision";
import {
  drawConnectors,
  drawLandmarks,
  lerp
} from "@mediapipe/drawing_utils";

let handLandmarker: HandLandmarker;
let poseLandmarker: PoseLandmarker;
let lastVideoTime = -1;
let results: { landmarks?: any[] } = {};
let pose_results: { landmarks?: any[] } = {};

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
];

const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [11, 23], [12, 14], [12, 24], 
  [13, 15], [14, 16], [15, 17], [16, 18], [17, 19],
  [18, 20], [19, 21], [20, 22], [23, 25], [23, 24],
  [25, 27], [26, 28], [27, 29], [28, 30], [29, 31],
  [30, 32], [31, 32]
];


function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  ///function to initialize webcam 
  const initializeWebcam =async () => {

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const canvasCtx = canvas.getContext("2d");
      const setup = async () => {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU",
          },
          numHands: 4,
          runningMode: "VIDEO",
        });

        poseLandmarker = await PoseLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
            },
            runningMode: "VIDEO"
          });
        
        navigator.mediaDevices
          .getUserMedia({
            video: { width: 1280, height: 720 },
          })
          .then((stream) => {
            video.srcObject = stream;
            video.addEventListener("loadeddata", predict);
          });
      };
      const predict = () => {
        if (canvasCtx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const nowInMs = performance.now();
          if (lastVideoTime !== video.currentTime) {
            lastVideoTime = video.currentTime;
            results = handLandmarker.detectForVideo(video, nowInMs);
            pose_results = poseLandmarker.detectForVideo(video,nowInMs);
            console.log(results);
            console.log(pose_results);
          }
          canvasCtx?.save();
          canvasCtx?.clearRect(0, 0, canvas.width, canvas.height);
        
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
          }
          if (pose_results.landmarks){
            for (const landmarks of pose_results.landmarks) {
              drawLandmarks(canvasCtx, landmarks, {
                radius: (data) => {
                    // Handle potential undefined values
                    const zValue = data.from && data.from.z ? data.from.z : 0;
                    return lerp(zValue, -0.15, 0.1, 5, 1);
                }
            });
            drawConnectors(canvasCtx, landmarks, POSE_CONNECTIONS);
            }
          }
          canvasCtx.restore();
          requestAnimationFrame(predict);
        }
      };
      setup();
    }
  }


  return (
    <div className="App">
      <video
        autoPlay
        playsInline
        ref={videoRef}
        id="video"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          textAlign: "center",
        }}
      />
      <canvas
        ref={canvasRef}
        id="canvas_output"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          textAlign: "center",
        }}
      />
      <button onClick={initializeWebcam}>Enable Webcam</button>
    </div>
  );
}

export default App;
