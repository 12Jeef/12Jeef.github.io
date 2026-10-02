import HomeProject from "../HomeProject";
import HomeProjectImage from "../HomeProjectImage";
import home from "../../assets/projects/merge/home.png";
import lt from "../../assets/projects/merge/lt.png";
import dk from "../../assets/projects/merge/dk.png";

export default function Merge() {
  return (
    <HomeProject
      title="Merge Game"
      role={["Solo Developer", "2023"]}
      bullets={[
        "2048-inspired tile Chrome extension game boasting 900 weekly users",
        "Custom animations, user feedback, and intuitive interfaces",
        "Features dark mode detection and theme switching, a leaderboard hosted on Replit, and a built-in tutorial",
      ]}
      stats={[{ amount: "900+", description: "weekly users" }]}
    >
      <div className="w-full max-w-full flex flex-row gap-2">
        <HomeProjectImage
          src={home}
          className="w-0 flex-[2.42]"
          description="Home screen with clean UI"
        />
        <HomeProjectImage
          src={lt}
          className="w-0 flex-1"
          description="Gameplay sample showing tile-based combinations and score"
        />
        <HomeProjectImage
          src={dk}
          className="w-0 flex-1"
          description="Dark mode gameplay with color adjustment"
        />
      </div>
    </HomeProject>
  );
}
