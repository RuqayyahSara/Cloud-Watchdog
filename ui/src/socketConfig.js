import io from "socket.io-client";

const socket = io.connect("http://192.168.0.155:8003");
socket.emit(
  "clientAuth",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiZTd0RzZhelZlbVdnN210IiwiaWF0IjoxNjcwOTE3ODIxLCJleHAiOjE2NzA5MjE0MjF9.DueInufE9eXfDrUoWJeaaXhZ1r6nkb_5wRfIm6GllNI"
);

console.log(socket);
export default socket;
