import React from "react";
import { useState, useEffect } from "react";
import io from "socket.io-client";

function Simple() {
  const [performanceData, setPerformanceData] = useState({});
  const [macA, setMacA] = useState([]);

  useEffect(() => {
    // setMacA(['08:00:27:72:80:14'])
    async function getAuthToken() {
      try {
        // Add proxy and make a get request with sending the clientType object
        // Client has to be either [UI] or [dog] to recieve respective token
        let token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiZTd0RzZhelZlbVdnN210IiwiaWF0IjoxNjcwOTE3ODIxLCJleHAiOjE2NzA5MjE0MjF9.DueInufE9eXfDrUoWJeaaXhZ1r6nkb_5wRfIm6GllNI";

        const socket = io.connect("http://192.168.0.155:8003");
        socket.emit("clientAuth", token);

        socket.on("data", (data) => {

          let index = macA.findIndex(e => e === data.macA)
          if (index === -1) {
            let mac = []
            mac = macA
            mac.push(data.macA)
            setMacA(mac)
          }
          setPerformanceData({
            ...performanceData,
            [data.macA]: data
          })
        });
      } catch (error) {
        console.log(error);
      }
    }

    getAuthToken();
// eslint-disable-next-line  
}, []);

  return (
    <>
   <h1>Watch Dog Client Screens</h1>

      { macA.map((e, i) => performanceData[e] && (
        <ol key={i}>
          <li><b>Screen {i+1}</b></li>
          <li>MAC Address - <b>{performanceData[e].macA}</b></li>
          <li>Up Time - {performanceData[e].upTime} </li>
          <li>OS Type - {performanceData[e].osType} </li>
          <li>CPU Model Type - {performanceData[e].cpuModel} </li>
          <li>Number of Cores - {performanceData[e].numCores} </li>
          <li>CPU Speed - {performanceData[e].cpuSpeed} </li>
          <li>CPU Load - {performanceData[e].cpuLoad} </li>
          <li>Total Memory : {performanceData[e].totalMem}</li>
          <li>Used Memory : {performanceData[e].usedMem}</li>
          <li>Free Memory : {performanceData[e].freeMem}</li>
          <hr />
        </ol>
      ))}

    </>
  );
}

export default Simple;
