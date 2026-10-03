import Background from "../components/Background";
import HomeBanner from "../components/HomeBanner";
import Page from "../components/Page";
import { useContext, useEffect, useState } from "react";
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

  const [elem, setElem] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (mobile) return;
    if (!elem) return;
    let timeout: number;
    const onScroll = () => {
      clearTimeout(timeout);
      const screen = Math.round(elem.scrollTop / window.innerHeight);
      const y = screen * window.innerHeight;
      if (Math.abs(elem.scrollTop - y) > 200) return;
      timeout = setTimeout(() => {
        elem.scrollTo({ top: y, behavior: "smooth" });
      }, 0.1 * 1e3);
    };
    elem.addEventListener("scroll", onScroll);
    return () => elem.removeEventListener("scroll", onScroll);
  }, [mobile, elem]);

  return (
    <Page setElem={setElem} innerClassName="bg-bg1 z-1">
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
