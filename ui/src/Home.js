import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";
// import spinner from "./spinner.gif";
import Chart, { ArcElement, Legend, Title, Tooltip } from "chart.js/auto";
import { Doughnut } from "react-chartjs-2";
Chart.register(Tooltip, Title, ArcElement, Legend);
let data = {
  labels: ["Total Memory", "Used Memory", "Free Memory"],
  datasets: [
    {
      label: "My First Dataset",
      data: [100, 60, 40],
      backgroundColor: [
        "rgb(255, 99, 132)",
        "rgb(54, 162, 235)",
        "rgb(255, 205, 86)",
      ],
      hoverOffset: 4,
    },
  ],
};

const data2 = {
  labels: ["Red", "Blue", "Yellow"],
  datasets: [
    {
      label: "My First Dataset",
      data: [300, 50, 100],
      backgroundColor: [
        "rgb(155, 93, 229)",
        "rgb(76, 201, 240)",
        "rgb(219, 255, 0)",
      ],
      hoverOffset: 4,
    },
  ],
};
const data3 = {
  labels: ["Red", "Blue", "Yellow"],
  datasets: [
    {
      label: "My First Dataset",
      data: [300, 50, 100],
      backgroundColor: [
        "rgb(155, 10, 132)",
        "rgb(255, 205, 86)",
        "rgb(55, 205, 16)",
      ],
      hoverOffset: 4,
    },
  ],
};
const data4 = {
  labels: ["Red", "Blue", "Yellow"],
  datasets: [
    {
      label: "My First Dataset",
      data: [300, 50, 100],
      backgroundColor: [
        "rgb(255, 205, 86)",
        "rgb(124, 162, 25)",
        "rgb(55, 205, 186)",
      ],
      hoverOffset: 4,
    },
  ],
};
function Home() {
  const [performanceData, setPerformanceData] = useState({});
  const [keys, setKeys] = useState([]);
  // let [response, setResponse] = useState();
  let response = {
    labels: ["Total Memory", "Used Memory", "Free Memory"],
    datasets: [
      {
        label: "My First Dataset",

        backgroundColor: [
          "rgb(255, 99, 132)",
          "rgb(54, 162, 235)",
          "rgb(255, 205, 86)",
        ],
        hoverOffset: 4,
      },
    ],
  };

  useEffect(() => {
    //
    async function getAuthToken() {
      try {
        // Add proxy and make a get request with sending the clientType object
        // Client has to be either [UI] or [dog] to recieve respective token
        let token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiZTd0RzZhelZlbVdnN210IiwiaWF0IjoxNjcwOTE3ODIxLCJleHAiOjE2NzA5MjE0MjF9.DueInufE9eXfDrUoWJeaaXhZ1r6nkb_5wRfIm6GllNI";

        const socket = io.connect("http://192.168.0.241:8003");
        socket.emit("clientAuth", token);

        // CPU info.
        socket.on("data", (data) => {
          // console.log(data);
          let temp = [data.totalMem, data.usedMem, data.freeMem];

          response.datasets[0].data = temp;

          console.log(response);

          console.log(data);
        });
      } catch (error) {
        console.log(error);
      }
    }
    getAuthToken();

    const config = {
      type: "doughnut",
      data: response.datasets[0].data,
    };
  }, []);
  return (
    <div className="App">
      <center>
        <div style={{ marginLeft: "15%" }}>
          <h1
            style={{
              fontFamily: "sans-serif",
              color: "#666",
              textAlign: "left",
            }}
          >
            Watch Dog
          </h1>

          <p
            style={{
              fontFamily: "sans-serif",
              color: "#666",
              textAlign: "left",
            }}
          >
            Watchdog can monitor the following services: Web server providing
            the control panel interface. <br />
            Watchdog component is a solution that ensures that your server is
            clean from malware, all services are up and running and there is
            enough free disk space on the server.
          </p>
        </div>
        <center>
          <form>
            <div style={{ height: "300px", width: "900px" }}>
              <br />

              <Doughnut
                data={data}
                style={{ height: "10px", width: "10px", float: "left" }}
              />
              <Doughnut
                data={data2}
                style={{ height: "10px", width: "10px" }}
              />

              <br />
              <br />
              <Doughnut
                data={data3}
                style={{ height: "10px", width: "10px", float: "left" }}
              />
              <Doughnut
                data={data4}
                style={{ height: "10px", width: "10px" }}
              />

              <br />
              <br />
            </div>
          </form>
        </center>

        <br />
        <br />
      </center>
    </div>
  );
}

export default Home;
