import { Server } from "socket.io";
import mqtt from "mqtt";

export default function handler(req, res) {
  // Socket server was already initialised
  if (res.socket.server.io) {
    console.log("Socket server already set up");
    res.end();
    return;
  }

  //   Initialize socket server
  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  const topic = "level";

  io.on("connection", (socket) => {
    // Socket connection made
    console.log(`client ${socket.id} connected`);

    // Connect to MQTT server
    let options = {
      host: "1387b8aada2e4198970f3b56103589c6.s2.eu.hivemq.cloud",
      port: 8883,
      protocol: "mqtts",
      username: "skinuthia800",
      password: "Gearbox001",
    };

    let client = mqtt.connect(options);

    // Check MQTT server connection
    client.on("connect", function () {
      console.log("MQTT client connected: " + client.connected);

      if (client.connected == true) {
        //  Subscribe to topic 'level'
        client.subscribe(topic);
      }
    });

    // Mock streams
    setInterval(() => {
      socket.emit(topic, {
        data: Math.random() * 100,
      });
    }, 5000);

    // Receiving data from device
    client.on("message", function (topic, message) {
      console.log("Message : " + message);
      console.log("Topic : " + topic);

      // Calculate % level

      let level = 100 - (parseInt(message) / 80) * 100;

      // Send data to dashboard via websockets
      socket.emit(topic, {
        data: parseInt(level),
      });

      console.log("WS data sent to frontend...");
    });

    // Emit events
    socket.on("start-pump", () => {
      // Send mqtt signal to device to start pump
      console.log("Sending signal to device to start pump...");
    });

    socket.on("open-tap", () => {
      // Send mqtt signal to device to open tap pump
      console.log("Sending signal to device to open tap...");
    });

    // Cant connect to mqtt server
    client.on("error", function (error) {
      console.log(error);
      process.exit(1);
    });
  });

  res.end();
}
