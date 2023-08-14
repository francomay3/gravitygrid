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

export type Distribution = number[];

export type Parameters = {
  gravitationalConstant: number;
  density: number;
  numberOfParticles: number;
  massDistribution: Distribution;
  velocityDistribution: Distribution;
};
