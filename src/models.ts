export type Particle = {
  x: number;
  y: number;
  m: number;
  vx: number;
  vy: number;
  r: number;
  ax: number;
  ay: number;
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
