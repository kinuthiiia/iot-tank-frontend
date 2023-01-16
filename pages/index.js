import { io } from "socket.io-client";
import { color } from "d3-color";
import { interpolateRgb } from "d3-interpolate";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import LiquidFillGauge from "react-liquid-gauge";

let socket;

export default function Home() {
  const [level, setLevel] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [width, setWidth] = useState(400);

  const [status, setStatus] = useState("rising");

  const fullPage = useRef();

  let startColor = "#6495ed"; // cornflowerblue
  let endColor = "#dc143c";

  useLayoutEffect(() => {
    setWidth(() => {
      if (fullPage?.current?.clientWidth > 600) {
        return fullPage?.current?.clientWidth / 2;
      } else {
        return fullPage?.current?.clientWidth;
      }
    });
    console.log(fullPage?.current?.clientWidth);
  }, []);

  // With ultrasonic sensor configured

  // useEffect(() => {
  //   (async () => {
  //     await fetch("/api/socket");
  //     socket = io();

  //     socket.on("connect", () => {
  //       console.log("Connected!");
  //       setIsConnected(true);
  //     });

  //     socket.on("disconnect", () => {
  //       setIsConnected(false);
  //     });

  //     socket.on("level", ({ data }) => {
  //       setLevel(() => data);
  //     });
  //   })();
  // }, []);

  // Without ultrasonic sensor
  useEffect(() => {
    setIsConnected(true);
    const myInterval = setInterval(() => {
      while (level < 100) {
        setLevel((prevLevel) => prevLevel + 5);
      }
    }, 5000);

    return () => clearInterval(myInterval);
  }, []);

  const interpolate = interpolateRgb(startColor, endColor);
  const fillColor = interpolate(level / 100);

  const gradientStops = [
    {
      key: "0%",
      stopColor: color(fillColor).darker(0.5).toString(),
      stopOpacity: 1,
      offset: "0%",
    },
    {
      key: "50%",
      stopColor: fillColor,
      stopOpacity: 0.75,
      offset: "50%",
    },
    {
      key: "100%",
      stopColor: color(fillColor).brighter(0.5).toString(),
      stopOpacity: 0.5,
      offset: "100%",
    },
  ];

  const sendPumpSignal = () => {
    if (!isConnected) {
      alert("System offline");
      return;
    }
    // socket.emit("start-pump", true, (val) => {
    //   console.log(val);
    // });
    alert("Pump started");
  };

  const sendTapSignal = () => {
    if (!isConnected) {
      alert("System offline");
      return;
    }
    // socket.emit("open-tap", true, (val) => {
    //   console.log(val);
    // });
    alert("Tap opened");
  };

  // client-side

  return (
    <div className="p-8 space-y-4 w-full" ref={fullPage}>
      <h1 className="text-[2rem] font-bold ">WaterTank Level</h1>
      <p className="font-semibold text-gray-500">
        System status{"  "}
        {isConnected ? (
          <span class="bg-green-100 text-green-900 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
            Online
          </span>
        ) : (
          <span class="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
            Offline
          </span>
        )}
      </p>

      <LiquidFillGauge
        width={width - 64}
        height={400}
        value={level}
        percent="%"
        textSize={0.5}
        riseAnimation
        riseAnimationTime={1500}
        innerRadius={0.98}
        waveAnimation
        waveFrequency={2}
        waveAmplitude={1}
        gradient
        gradientStops={gradientStops}
        circleStyle={{
          fill: fillColor,
        }}
        waveStyle={{
          fill: fillColor,
        }}
      />

      <hr />
      <h1 className="text-[1.2rem] font-bold tracking-tight ">Actions</h1>
      <div className="space-y-2 pt-8">
        <button
          onClick={sendPumpSignal}
          type="button"
          class=" w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
        >
          Pump In Water
        </button>
        <button
          onClick={sendTapSignal}
          type="button"
          class="w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        >
          Open Discharge Tap
        </button>
      </div>
    </div>
  );
}
