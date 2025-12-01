import { Socket } from "socket.io";

export default function (socket: Socket) {

    socket.emit("message", "success the connection to server");
    console.log('Client connected:', socket.id);
}