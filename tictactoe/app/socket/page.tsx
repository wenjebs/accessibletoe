// "use client";

// import { useEffect, useState } from "react";
// import { socket } from "../socket";
// import Link from "next/link";

// export default function Home() {
//   const [isConnected, setIsConnected] = useState(false);
//   const [transport, setTransport] = useState("N/A");
//   const [helloMessage, setHelloMessage] = useState("");

//   useEffect(() => {
//     if (socket.connected) {
//       onConnect();
//     }

//     function onConnect() {
//       setIsConnected(true);
//       setTransport(socket.io.engine.transport.name);

//       socket.io.engine.on("upgrade", (transport) => {
//         setTransport(transport.name);
//       });
//     }

//     function onDisconnect() {
//       setIsConnected(false);
//       setTransport("N/A");
//     }

//     function onHello(...args: any[]) {
//       console.log("Received hello event with args:", ...args);
//       setHelloMessage(args[0]); // Update the state with the received message
//     }

//     socket.on("connect", onConnect);
//     socket.on("disconnect", onDisconnect);
//     socket.on("hello", onHello);
//     return () => {
//       socket.off("connect", onConnect);
//       socket.off("disconnect", onDisconnect);
//       socket.off("hello", onHello);
//     };
//   }, []);

//   function emitHello() {
//     console.log("emitting hello world");
//     socket.emit("hello", "EMITTING FROM CLIENT");
//   }

//   function resetMessage() {
//     setHelloMessage("");
//   }

//   return (
//     <div>
//       <p>Status: {isConnected ? "connected" : "disconnected"}</p>
//       <p>Transport: {transport}</p>
//       <div className="flex flex-col">
//         <button onClick={emitHello}>Emit</button>
//         <button onClick={resetMessage}>Reset Message</button>
//       </div>
//       <p>Received Message: {helloMessage}</p>
//       <div className="flex flex-col">
//         <Link href="/tic-tac-toe">TicTacToe</Link>
//         <Link href="/">Back Home</Link>
//       </div>
//     </div>
//   );
// }
