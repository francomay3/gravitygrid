import { useEffect, useRef } from "react";
import { getRadius } from "../functions";
import { State } from "../models";

interface CanvasProps {
  state: State;
  density: number;
}

const draw = (ctx: CanvasRenderingContext2D, state: State, density: number) => {
  state.forEach((particle) => {
    const radius = getRadius(particle.m, density);
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(
      particle.x + particle.ax * 100000,
      particle.y + particle.ay * 100000
    );
    ctx.strokeStyle = "red";
    ctx.stroke();
  });
};

const Canvas = ({ state, density }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    draw(ctx, state, density);
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      width="1000"
      height="1000"
      style={{ border: "1px solid grey" }}
    />
  );
};

export default Canvas;
