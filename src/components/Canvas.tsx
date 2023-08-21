import { useEffect, useRef } from "react";
import { getGridCellSize, getRadius } from "../functions";
import { State, Grid, Parameters } from "../models";
interface CanvasProps {
  state: State;
  parameters: Parameters;
  grid: Grid;
  setScroll: (scroll: { x: number; y: number }) => void;
}

const draw = (
  ctx: CanvasRenderingContext2D,
  state: State,
  { gridResolution, density }: Parameters,
  grid: Grid
) => {
  ctx.clearRect(0, 0, 1000, 1000);
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
    const maxMagnitude = 30;
    const length = Math.sqrt(magnitude.x ** 2 + magnitude.y ** 2) * multiplier;
    if (length > maxMagnitude) {
      magnitude.x = (magnitude.x / length) * maxMagnitude;
      magnitude.y = (magnitude.y / length) * maxMagnitude;
    }
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
    const multiplier = 10000;

    drawVector({
      center: { x: gridCell.x, y: gridCell.y },
      magnitude: { x: -gridCell.fx, y: -gridCell.fy },
      multiplier,
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

    const magnitudeX = particle.fx / particle.m;
    const magnitudeY = particle.fy / particle.m;

    drawVector({
      center: { x: particle.x, y: particle.y },
      magnitude: { x: magnitudeX, y: magnitudeY },
      multiplier: 10000,
      color: "blue",
    });
  });
};

const Canvas = ({ state, parameters, grid, setScroll }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    draw(ctx, state, parameters, grid);
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;

    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas?.getBoundingClientRect();
      if (!rect) return;
      const deltaY = -e.deltaY;
      const deltaX = -e.deltaX;
      setScroll({ x: deltaX, y: deltaY });
    };
    canvas?.addEventListener("wheel", handleScroll);
    return () => {
      canvas?.removeEventListener("wheel", handleScroll);
    };
  }, []);

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
