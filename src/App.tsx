import { useState } from "react";
import Canvas from "./components/Canvas";
import { useEvolveState } from "./functions";

const Input = ({
  value,
  setter,
  label,
}: {
  value: number;
  setter: Function;
  label: string;
}) => {
  return (
    <div>
      <label>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => setter(parseInt(e.target.value))}
      />
    </div>
  );
};

function App() {
  const [density, setDensity] = useState(10);
  const [gravitationalConstant, setGravitationalConstant] = useState(1);
  const [gridResolution, setGridResolution] = useState(30);
  const [massDistribution, setMassDistribution] = useState(50);
  const [numberOfParticles, setNumberOfParticles] = useState(500);
  const [velocityDistribution, setVelocityDistribution] = useState(5);

  const parameters = {
    density: density / 10,
    gravitationalConstant: gravitationalConstant / 1000,
    gridResolution,
    massDistribution: massDistribution / 0.1,
    numberOfParticles,
    velocityDistribution: velocityDistribution / 1000,
  };

  const {
    grid,
    hideGrid,
    isGridShowing,
    paused,
    reset,
    resume,
    showGrid,
    state,
    stop,
  } = useEvolveState(parameters);

  return (
    <>
      <button onClick={reset}>Reset</button>
      <button onClick={isGridShowing ? hideGrid : showGrid}>
        {isGridShowing ? "Hide grid" : "Show grid"}
      </button>
      <button onClick={paused ? resume : stop}>
        {paused ? "Resume" : "Stop"}
      </button>
      <Input value={density} setter={setDensity} label="Density" />
      <Input
        value={gravitationalConstant}
        setter={setGravitationalConstant}
        label="Gravitational Constant"
      />
      <Input
        value={massDistribution}
        setter={setMassDistribution}
        label="Mass Distribution"
      />
      <Input
        value={numberOfParticles}
        setter={setNumberOfParticles}
        label="Number of Particles"
      />
      <Input
        value={velocityDistribution}
        setter={setVelocityDistribution}
        label="Velocity Distribution"
      />
      <Input
        value={gridResolution}
        setter={setGridResolution}
        label="Grid Resolution"
      />
      <Canvas state={state} parameters={parameters} grid={grid} />
    </>
  );
}

export default App;
