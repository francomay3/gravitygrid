export type Particle = {
  x: number;
  y: number;
  m: number;
  vx: number;
  vy: number;
  r: number;
};

export type State = Particle[];

export type Distribution = number[];

export type Parameters = {
  gravitationalConstant: number;
  density: number;
  numberOfParticles: number;
  massDistribution: Distribution;
  velocityDistribution: Distribution;
};
