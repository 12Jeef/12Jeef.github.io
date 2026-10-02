import HomeProject from "../HomeProject";
import g3d from "../../assets/projects/rtf/g3d.png";
import g2d from "../../assets/projects/rtf/g2d.png";
import HomeProjectImage from "../HomeProjectImage";

export default function ReactionTrajFinder() {
  return (
    <HomeProject
      title="Reaction TrajFinder"
      role={["Solo Developer", "January 2026 – May 2026"]}
      bullets={[
        "Created 2D reaction coordinate/trajectory analyzer and extractor from gigabyte-sized ORCA output files for geometric optimization",
        "Provides detailed viewing and post-processing tooling such as trajectory extraction and exporting, activation energy analysis, etc",
      ]}
      stats={[
        { amount: "1gb+", description: "files" },
        { amount: "100x", description: "workload reduction" },
      ]}
    >
      <div className="w-full max-w-full flex flex-row gap-2">
        <HomeProjectImage
          src={g3d}
          className="w-0 flex-1"
          description="Home page and loaded energy scan and reaction trajectory"
        />
        <HomeProjectImage
          src={g2d}
          className="w-0 flex-1"
          description="Reaction coordinate and energy with molecule trajectory shown"
        />
      </div>
    </HomeProject>
  );
}
