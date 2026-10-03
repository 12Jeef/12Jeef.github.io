import HomeProject from "../HomeProject";
import eeg from "../../assets/projects/eeg/eeg.png";
import code from "../../assets/projects/eeg/code.png";
import HomeProjectImage from "../HomeProjectImage";

export default function EEG() {
  return (
    <HomeProject
      title="EEG Left/Right Hand Classification"
      role={"August 2026"}
      bullets={[
        "Tested multiple inference methods for classification of hyper-noisy, subject-dependent EEG motor data, yielding 80% accuracy",
        "Evaluated LDA models with both spectral binning and channel covariance + Riemannian geometry project against brute-force CNN models",
        "Evaluated for overfitting, confounding factors, and other model parameters",
      ]}
      links={[
        { name: "GitHub", href: "https://github.com/12Jeef/NTatB_FA2026" },
      ]}
      stats={[
        { amount: "1wk", description: "dev time" },
        { amount: "80%", description: "gen accuracy" },
      ]}
    >
      <div className="w-full max-w-full flex flex-row gap-2">
        <HomeProjectImage
          src={eeg}
          className="w-0 flex-[2.325]"
          description="Raw EEG signals plotted for pattern comparison between motor channels"
        />
        <HomeProjectImage
          src={code}
          className="w-0 flex-1"
          description="Multi-CNN training and accuracy for benchmark"
        />
      </div>
    </HomeProject>
  );
}
