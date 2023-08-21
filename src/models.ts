export type Particle = {
  x: number;
  y: number;
  m: number;
  vx: number;
  vy: number;
  r: number;
  fx: number;
  fy: number;
  dead: boolean;
};

export type State = Particle[];

export type Parameters = {
  gravitationalConstant: number;
  density: number;
  numberOfParticles: number;
  massDistribution: number;
  velocityDistribution: number;
  gridResolution: number;
};

export type Grid = Particle[];

export type GetForce = (
  a: Particle,
  b: Particle,
  distance: number,
  parameters: Parameters
) => { fx: number; fy: number };

export type GetDistance = (a: Particle, b: Particle) => number;

export type Proportional = (
  a: Particle,
  b: Particle,
  prop: keyof Particle
) => number;
