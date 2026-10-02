import HomeProject from "../HomeProject";
import btsb from "../../assets/projects/btsb/btsb.png";
import HomeProjectImage from "../HomeProjectImage";

export default function BiotechSB() {
  return (
    <HomeProject
      title="Biotech Sandboxes"
      role={["Solo Developer", "2024"]}
      bullets={[
        "Independent project derived from UC COSMOS program (extracurricular) to simulate and model mathematical representations of biological systems",
        "Fitz-Nagumo neuron and heart action potential, Gierer-Meinhardt animal coat pattern, and Boid/Viseck flocking models are all included and simulated in discrete space",
        "Leverages modern web worker technology and multithreading to maximize efficiency while maintaining ease of use",
      ]}
      stats={[
        { amount: "5", description: "models" },
        { amount: "RT", description: "rendering" },
      ]}
    >
      <div className="w-full max-w-full flex flex-row gap-2">
        <HomeProjectImage
          src={btsb}
          className="w-0 flex-1"
          description="2D discrete simulation of the Gierer-Meinhardt two-chemical model, with user interface for editing and config"
        />
      </div>
    </HomeProject>
  );
}
