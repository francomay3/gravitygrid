import {
  Particle,
  State,
  Parameters,
  Grid,
  GetForce,
  GetDistance,
  Proportional,
} from "./models";
import { useState, useEffect } from "react";

const scroll = { x: 0, y: 0 };
const setScroll = ({ x, y }: { x: number; y: number }) => {
  scroll.x = x;
  scroll.y = y;
};

export const getRadius = (m: number, density: number) =>
  Math.pow(m / density, 1 / 3);

export const getGridCellSize = (gridResolution: number) =>
  1000 / gridResolution;

export const createRandomParticle = (
  massDistribution: number,
  velocityDistribution: number,
  density: number
) => {
  const x = Math.random() * 1000;
  const y = Math.random() * 1000;
  const m1 = 0;
  const m2 = massDistribution;
  const v1 = -velocityDistribution;
  const v2 = velocityDistribution;

  const likelyToBeSmall = (n: number) => {
    let result = 1;
    for (let i = 0; i < n; i++) {
      result *= Math.random();
    }
    return result;
  };

  const m = likelyToBeSmall(8) * (m2 - m1) + m1;
  const vx = (Math.random() * (v2 - v1) + v1) * likelyToBeSmall(2);
  const vy = (Math.random() * (v2 - v1) + v1) * likelyToBeSmall(2);
  const r = getRadius(m, density);
  const fx = 0;
  const fy = 0;

  return { x, y, m, vx, vy, fx, fy, r, dead: false };
};

export const getInitialConditions: (parameters: Parameters) => Particle[] = (
  parameters
) => {
  const particles: Particle[] = [];
  const { numberOfParticles, massDistribution, velocityDistribution, density } =
    parameters;
  for (let i = 0; i < numberOfParticles; i++) {
    particles.push(
      createRandomParticle(massDistribution, velocityDistribution, density)
    );
  }
  return particles;
};

const proportional: Proportional = (a, b, prop) => {
  if (prop === "dead") return 0;
  return (a[prop] * a.m + b[prop] * b.m) / (a.m + b.m);
};

export const getDistance: GetDistance = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const getForce: GetForce = (a, b, distance, parameters) => {
  const { gravitationalConstant } = parameters;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const force = (gravitationalConstant * a.m * b.m) / (distance * distance);
  const angle = Math.atan2(dy, dx);
  const fx = force * Math.cos(angle);
  const fy = force * Math.sin(angle);

  return { fx, fy };
};

export const createBlankGrid = (gridResolution: number) => {
  const cellSize = getGridCellSize(gridResolution);
  const getPos = (i: number) => i * cellSize + cellSize / 2;
  const getRow = (j: number) =>
    Array.from({ length: gridResolution }, (_, i) => ({
      x: getPos(i),
      y: getPos(j),
      m: 1,
      vx: 0,
      vy: 0,
      fx: 0,
      fy: 0,
      r: 1,
      dead: false,
    }));

  const grid: Grid = Array.from({ length: gridResolution }, (_, i) =>
    getRow(i)
  ).flat();

  return { grid, cellSize };
};

export const getNextGrid = (state: State, parameters: Parameters) => {
  const { gridResolution } = parameters;
  const { grid: nextGrid } = createBlankGrid(gridResolution);
  nextGrid.forEach((cell) => {
    state.forEach((p) => {
      const distance = getDistance(p, cell);
      const { fx, fy } = getForce(p, cell, distance, parameters);
      cell.fx += fx;
      cell.fy += fy;
    });
  });

  return nextGrid;
};

export const getNextState = (state: State, parameters: Parameters) => {
  const nextState: State = structuredClone(state).flatMap((p: Particle) => {
    if (p.dead) {
      return [];
    }
    const ax = p.fx / p.m;
    const ay = p.fy / p.m;
    p.vx += ax;
    p.vy += ay;
    p.fx = 0;
    p.fy = 0;
    p.x += scroll.x;
    p.y += scroll.y;
    return p;
  });
  setScroll({ x: scroll.x * 0.01, y: scroll.y * 0.01 });
  nextState.forEach((a) => {
    nextState.forEach((b) => {
      if (a === b || a.dead || b.dead) {
        return;
      }
      const distance = getDistance(a, b);
      const collision = distance < a.r + b.r;
      const { fx, fy } = getForce(a, b, distance, parameters);

      if (collision) {
        a.vx = proportional(a, b, "vx");
        a.vy = proportional(a, b, "vy");
        a.x = proportional(a, b, "x");
        a.y = proportional(a, b, "y");
        a.m += b.m;
        a.r = getRadius(a.m, parameters.density);
        b.dead = true;
        return;
      }
      a.x += a.vx;
      a.y += a.vy;
      a.fx += fx;
      a.fy += fy;
    });
  });
  return nextState;
};

export const useEvolveState = (parameters: Parameters) => {
  const [state, setState] = useState(getInitialConditions(parameters));
  const [paused, setPaused] = useState(false);
  const [isGridShowing, setIsGridShowing] = useState(false);
  const [grid, setGrid] = useState<Grid>([]);

  const reset = () => setState(getInitialConditions(parameters));
  const stop = () => setPaused(true);
  const resume = () => setPaused(false);
  const showGrid = () => setIsGridShowing(true);
  const hideGrid = () => setIsGridShowing(false);

  useEffect(() => {
    if (!isGridShowing) {
      setGrid([]);
      return;
    }
  }, [isGridShowing]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextState = getNextState(state, parameters);
      setState(nextState);
      if (!isGridShowing) return;
      const nextGrid = getNextGrid(state, parameters);
      setGrid(nextGrid);
    }, 1000 / 24);
    if (paused) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [state, paused, parameters, scroll]);

  return {
    grid,
    hideGrid,
    isGridShowing,
    paused,
    reset,
    resume,
    setScroll,
    showGrid,
    state,
    stop,
  };
};
