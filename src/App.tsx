import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { FaceLandmarker, FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

let video: HTMLVideoElement;
let handLandmarker: HandLandmarker;
let lastVideoTime = -1;
function App() {

  const handleOnChange = () =>{

  }

  const setup = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        numHands: 2,
        runningMode: "VIDEO"
      });
    video = document.getElementById("video") as HTMLVideoElement;
    navigator.mediaDevices.getUserMedia({
      video: {width: 1280, height:720}
    }).then((stream) => {
      video.srcObject = stream;
      video.addEventListener('loadeddata', predict);
    })
  }

  const predict = ()=>{
    const nowInMs = performance.now()
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      const results = handLandmarker.detectForVideo(video, nowInMs);
      console.log(results)
    }

    requestAnimationFrame(predict);
  }

  useEffect(()=>{
    setup();

  }, [])

  return (
    <div className="App">
      <video autoPlay id = "video"/>
    </div>
  );
}

export default App;
