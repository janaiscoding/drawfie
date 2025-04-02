"use client";

import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", { autoConnect: false });

const DrawingGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [canStartGame, setCanStartGame] = useState(false);
  const [users, setUsers] = useState(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [lastCoords, setLastCoords] = useState<null | { x: number; y: number }>(null);

  // only one user draws at a time
  // clear all
  // colors, pencils, fill bucket, etc
  // input for guessing
  // verify button for accepting user's guess
  // score
  // next user's turn

  useEffect(() => {
    if (!isConnected) {
      socket.connect();
      setIsConnected(true);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");

    if (!ctx || ctxRef.current) return;

    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctxRef.current = ctx;

    socket.on("draw", ({ x, y, xPrev, yPrev }) => {
      if (!ctxRef.current) return;

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

    socket.on("canStartGame", (canStartGame) => {
      setCanStartGame(canStartGame);
    });
  }, []);

  const startDrawing = (e) => {
    if (!ctxRef.current) return;

    setIsDrawing(true);
    const [x, y] = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    setLastCoords({ x, y });
  };

  const draw = (e) => {
    if (!isDrawing || !ctxRef.current) return;
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
    if (!ctxRef.current) return;

    setIsDrawing(false);
    ctxRef.current.closePath();
    setLastCoords(null);
  };

  const toggleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    socket.emit("setReady", newReadyState);
  };

  const startGame = () => {
    console.log("can play now :D ");
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

      <div>
        <h1>Actions</h1>
        <div className="actions__buttons">
          <button onClick={toggleReady}>{isReady ? "Unready" : "Mark as Ready"}</button>
          <button disabled={!canStartGame} onClick={startGame}>
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingGame;
