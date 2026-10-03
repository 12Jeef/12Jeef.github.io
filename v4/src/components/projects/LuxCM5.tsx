import HomeProject from "../HomeProject";
import HomeProjectImage from "../HomeProjectImage";
import hw from "../../assets/projects/luxcm5/hw.png";
import ui from "../../assets/projects/luxcm5/ui.png";
import od from "../../assets/projects/luxcm5/od.png";

export default function LuxCM5() {
  return (
    <HomeProject
      title="LuxCM5 Vision System"
      role={["Founder", "December 2025 – January 2026"]}
      bullets={[
        "Python backend with open-source UMich AprilTag detector, React+TS sleek frontend, running on fully custom PCBs integrating the RK3588 (OrangePi 5 Max) processor, leveraging onboard NPUs and GPUs",
        "Custom 4-lane MIPI driver (industry-grade video streaming hardware)",
        "Combines vision-model-inspired ROI algorithms with procedural AprilTag detection into a custom temporal algorithm capable of reducing pixel computation by 10x",
        "Supports YOLO object detection and high-performing threshold and contour shape detection",
      ]}
      links={[
        {
          name: "Demo",
          href: "https://drive.google.com/drive/folders/1xXJhVPovAGrjThJhUAaO-xbbWitbRN_u?usp=drive_link",
        },
      ]}
      stats={[
        { amount: "8x", description: "performance" },
        { amount: "4x", description: "less latency" },
        { amount: "1mo", description: "dev time" },
      ]}
    >
      <div className="w-full max-w-full flex flex-col gap-2">
        <HomeProjectImage
          src={hw}
          description="Flashed and ready-to-use cameras"
        />
        <div className="w-full flex flex-row gap-2 items-start">
          <HomeProjectImage
            src={ui}
            className="w-0 flex-[1.725]"
            description="Live AprilTag detection and streaming, with sleek UI"
          />
          <HomeProjectImage
            src={od}
            className="w-0 flex-1"
            description="Color threshold object detection in real time"
          />
        </div>
      </div>
    </HomeProject>
  );
}
