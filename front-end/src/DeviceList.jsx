import {useEffect, useState} from 'react';
import Webcam from "react-webcam";

const DeviceList = () => {
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  
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
  
    return (
      <div>
        <Webcam 
          audio={false} 
          videoConstraints={{ deviceId: selectedDeviceId }} 
        />
        {devices.map((device, key) => (
          <div key={device.deviceId} onClick={() => handleDeviceClick(device.deviceId)}>
            {device.label || `Device ${key + 1}`}
          </div>
        ))}
      </div>
    );
  };

export default DeviceList;