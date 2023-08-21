import { Particle, State, Parameters, Grid } from "./models";
import { useState, useEffect } from "react";

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

const proportional = (a: Particle, b: Particle, prop: keyof Particle) => {
  if (prop === "dead") return 0;
  return (a[prop] * a.m + b[prop] * b.m) / (a.m + b.m);
};

export const getForce = (a: Particle, b: Particle, parameters: Parameters) => {
  const defaultResult = { fx: 0, fy: 0, collision: false, distance: 0 };
  if (a === b || a.dead || b.dead) {
    return defaultResult;
  }
  const { gravitationalConstant } = parameters;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // const force =
  //   (-2 * g * a.m * b.m * (dx + dy)) / Math.pow(dx * dx + dy * dy, 2);
  const distance = Math.sqrt(dx * dx + dy * dy);
  const collision = distance < a.r + b.r;
  const force = (gravitationalConstant * a.m * b.m) / (distance * distance);
  const angle = Math.atan2(dy, dx);
  const fx = force * Math.cos(angle);
  const fy = force * Math.sin(angle);
  // const ax = fx / a.m;
  // const ay = fy / a.m;

  return { fx, fy, collision, distance };
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
  const { grid: nextGrid, cellSize } = createBlankGrid(gridResolution);
  nextGrid.forEach((cell) => {
    state.forEach((p) => {
      const { fx, fy, distance } = getForce(p, cell, parameters);
      if (distance > cellSize) {
        cell.fx += fx;
        cell.fy += fy;
      }
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
    return p;
  });
  nextState.forEach((a) => {
    nextState.forEach((b) => {
      const { fx, fy, collision } = getForce(a, b, parameters);

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
    }, 200);
    if (paused) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [state, paused, parameters]);

  return {
    grid,
    hideGrid,
    isGridShowing,
    paused,
    reset,
    resume,
    showGrid,
    state,
    stop,
  };
};
