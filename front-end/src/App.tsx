import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Signup from "./Signup";
import Login from "./login";
import Fingerspelling from "./fingerspelling";


function App() {
 

  return (
    <Routes>
      <Route path="/" element={<Login/>} />
      <Route path="/home" element={<Fingerspelling/>}/>
      <Route path="/signup" element={<Signup/>}/>
    </Routes>
  );
}

export default App;
