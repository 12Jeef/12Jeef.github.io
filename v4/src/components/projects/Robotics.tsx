import HomeProject from "../HomeProject";
import HomeProjectImage from "../HomeProjectImage";
import r26 from "../../assets/projects/robotics/r26.png";
import r25 from "../../assets/projects/robotics/r25.png";
import pwr from "../../assets/projects/robotics/pwr.png";
import awd from "../../assets/projects/robotics/awd.png";

export default function Robotics() {
  return (
    <HomeProject
      title="FRC Robotics Team 6036"
      role={["Software Captain", "August 2022 – June 2026"]}
      bullets={[
        "Managed a team of 30 software engineers to develop 5 robots, with multiple ranking in the top 2.5% in the world and California",
        "Created a robust robot development environment with a versatile, transparent internal library, speeding up software writing over 10x and reducing the recruit-to-expert learning timeline by 75%",
        "Designed a concise power logging system to track energy, current usage across motors, and diagnose power overconsumption and decrease energy usage 30% per battery",
        "Engineered full-auto positional alignment and ergonomic semi-auto driver assistance algorithms to enhance gameplay, scoring 50% more points per match",
      ]}
      stats={[
        { amount: "30", description: "engineers" },
        { amount: "5", description: "robots" },
        { amount: "2.5%", description: "in the world" },
      ]}
    >
      <div className="w-full max-w-full flex flex-col gap-2">
        <div className="w-full flex flex-row gap-2 items-start">
          <HomeProjectImage
            src={r26}
            className="w-0 flex-[2.275]"
            description="Our 2026 robot, scoring balls into a hoop while moving"
          />
          <HomeProjectImage
            src={r25}
            className="w-0 flex-1"
            description="Our 2025 robot, placing tubes onto pipes to score points"
          />
        </div>
        <div className="w-full flex flex-row gap-2 items-start">
          <HomeProjectImage
            src={pwr}
            className="w-0 flex-[1.65]"
            description="Energy management system and tracking with graphs"
          />
          <HomeProjectImage
            src={awd}
            className="w-0 flex-1"
            description="2026 Innovation in Control Award at World Championships"
          />
        </div>
      </div>
    </HomeProject>
  );
}
