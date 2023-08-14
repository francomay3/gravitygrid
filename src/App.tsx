import Canvas from "./components/Canvas";
import { useEvolveState } from "./functions";

function App() {
  const parameters = {
    numberOfParticles: 500,
    massDistribution: [1, 50],
    velocityDistribution: [-0.005, 0.005],
    gravitationalConstant: 0.01,
    density: 1,
  };

  const state = useEvolveState(parameters);

  return <Canvas state={state} density={parameters.density} />;
}

export default App;
