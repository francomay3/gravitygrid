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
