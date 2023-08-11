import { Particle, State, Parameters, Distribution } from "./models";
import { useState, useEffect } from "react";

export const getRadius = (m: number, density: number) =>
  Math.pow(m / density, 1 / 3);

export const createRandomParticle = (
  massDistribution: Distribution,
  velocityDistribution: Distribution,
  density: number
) => {
  const x = Math.random() * 1000;
  const y = Math.random() * 1000;
  const [m1, m2] = massDistribution;
  const [v1, v2] = velocityDistribution;

  const likelyToBeSmall = (n: number) => {
    let result = 1;
    for (let i = 0; i < n; i++) {
      result *= Math.random();
    }
    return result;
  };

  const m = likelyToBeSmall(8) * (m2 - m1) + m1;
  const vx = ((Math.random() * (v2 - v1) + v1) * likelyToBeSmall(2)) / m;
  const vy = ((Math.random() * (v2 - v1) + v1) * likelyToBeSmall(2)) / m;
  const r = getRadius(m, density);

  return { x, y, m, vx, vy, r };
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

export const interactParticle = (
  a: Particle,
  b: Particle,
  parameters: Parameters,
  particles: Particle[]
) => {
  if (a === b) {
    return;
  }
  const { gravitationalConstant, density } = parameters;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const proportional = (prop: keyof Particle) =>
    (a[prop] * a.m + b[prop] * b.m) / (a.m + b.m);

  if (distance < a.r + b.r) {
    a.vx = proportional("vx");
    a.vy = proportional("vy");
    a.x = proportional("x");
    a.y = proportional("y");
    a.m += b.m;
    a.r = getRadius(a.m, density);
    particles.splice(particles.indexOf(b), 1);
    return;
  }

  const force = (gravitationalConstant * a.m * b.m) / (distance * distance);
  const angle = Math.atan2(dy, dx);
  const fx = force * Math.cos(angle);
  const fy = force * Math.sin(angle);
  a.vx += fx / a.m;
  a.vy += fy / a.m;
  a.x += a.vx;
  a.y += a.vy;
};

export const getNextState = (state: State, parameters: Parameters) => {
  state.forEach((a) => {
    state.forEach((b) => {
      interactParticle(a, b, parameters, state);
    });
  });
  return [...state];
};

export const useEvolveState = (parameters: Parameters) => {
  const [state, setState] = useState(getInitialConditions(parameters));
  useEffect(() => {
    const interval = setInterval(() => {
      setState((state) => getNextState(state, parameters));
    }, 50);
    return () => clearInterval(interval);
  }, [state]);
  return state;
};
