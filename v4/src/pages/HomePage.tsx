import Background from "../components/Background";
import HomeBanner from "../components/HomeBanner";
import Page from "../components/Page";
import { useContext } from "react";
import { context } from "../main";
import LuxCM5 from "../components/projects/LuxCM5";
import EEG from "../components/projects/EEG";
import ReactionTrajFinder from "../components/projects/ReactionTrajFinder";
import Robotics from "../components/projects/Robotics";
import BiotechSB from "../components/projects/BiotechSB";
import Merge from "../components/projects/Merge";

export type HomePageProps = {};

export default function HomePage({}: HomePageProps) {
  const { mobile } = useContext(context);

  return (
    <Page innerClassName="bg-bg1 z-1">
      <Background
        background="radial-gradient(ellipse 50vw 50vh at 50vw 50vh, var(--color-a1) 0%, var(--color-mg) 100%)"
        className="-z-1 opacity-20"
      />
      <HomeBanner />
      <LuxCM5 />
      <EEG />
      <ReactionTrajFinder />
      <Robotics />
      <BiotechSB />
      <Merge />
      {mobile && <div className="min-h-[30rem]"></div>}
    </Page>
  );
}
