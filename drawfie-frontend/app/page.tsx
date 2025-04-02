"use client";

import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", { autoConnect: false });

const DrawingGame = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastCoords, setLastCoords] = useState<null | { x: number; y: number }>(
    null
  );

  // only one user draws at a time
  // clear all
  // colors, pencils, fill bucket, etc
  // input for guessing
  // verify button for accepting user's guess
  // score
  // next user's turn

  useEffect(() => {
    console.log(socket.current);

    if (!isConnected) {
      socket.connect();
      console.log("connect new");
      setIsConnected(true);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctxRef.current = ctx;

    socket.on("draw", ({ x, y, xPrev, yPrev }) => {
      if (!xPrev || !yPrev) {
        // If there's no previous point, start a new path
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(x, y);
      } else {
        // Otherwise, continue drawing
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(xPrev, yPrev);
        ctxRef.current.lineTo(x, y);
        ctxRef.current.stroke();
      }
    });

    socket.on("updateUsers", (users) => {
      console.log("users", users);
    });
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const [x, y] = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    setLastCoords({ x, y });
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    socket.emit("draw", {
      x,
      y,
      xPrev: lastCoords ? lastCoords.x : null,
      yPrev: lastCoords ? lastCoords.y : null,
    });

    if (lastCoords) {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(lastCoords.x, lastCoords.y);
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
    }

    setLastCoords({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    ctxRef.current.closePath();
    setLastCoords(null);
  };

  return (
    <div className="main-container">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        style={{ border: "1px solid black" }}
      />
    </div>
  );
};

export default DrawingGame;
