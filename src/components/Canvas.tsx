import { useEffect, useRef } from "react";
import { getGridCellSize, getRadius } from "../functions";
import { State, Grid, Parameters } from "../models";

interface CanvasProps {
  state: State;
  parameters: Parameters;
  grid: Grid;
}

const draw = (
  ctx: CanvasRenderingContext2D,
  state: State,
  { gridResolution, density }: Parameters,
  grid: Grid
) => {
  const drawVector = ({
    center,
    color = "black",
    magnitude,
    multiplier,
  }: {
    center: { x: number; y: number };
    color?: string;
    magnitude: { x: number; y: number };
    multiplier: number;
  }) => {
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(
      center.x + magnitude.x * multiplier,
      center.y + magnitude.y * multiplier
    );
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  const drawCircle = ({
    center,
    radius,
    color = "black",
  }: {
    center: { x: number; y: number };
    radius: number;
    color?: string;
  }) => {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  grid.forEach((gridCell) => {
    drawVector({
      center: { x: gridCell.x, y: gridCell.y },
      magnitude: { x: -gridCell.ax, y: -gridCell.ay },
      multiplier: 5000000,
      color: "red",
    });

    const gridCellSize = getGridCellSize(gridResolution);
    ctx.beginPath();
    ctx.rect(
      gridCell.x - 0.5 * gridCellSize,
      gridCell.y - 0.5 * gridCellSize,
      gridCellSize,
      gridCellSize
    );
  });

  state.forEach((particle) => {
    const radius = getRadius(particle.m, density);
    drawCircle({
      center: { x: particle.x, y: particle.y },
      radius,
      color: "black",
    });

    drawVector({
      center: { x: particle.x, y: particle.y },
      magnitude: { x: particle.ax, y: particle.ay },
      multiplier: 100000,
      color: "blue",
    });
  });
};

const Canvas = ({ state, parameters, grid }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    draw(ctx, state, parameters, grid);
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      width="1000"
      height="1000"
      style={{ border: "1px solid grey", height: "100%", width: "100%" }}
    />
  );
};

export default Canvas;
