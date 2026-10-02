import Title from "../components/Title";
import { motion } from "framer-motion";
import { defaultMotionSpring } from "../features/jiggle";
import { LuGithub } from "react-icons/lu";
import { RiLinkedinLine } from "react-icons/ri";
import { FiMail } from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";
import HomeBannerIconButton from "./HomeBannerIconButton";
import HomeNext from "../components/HomeNext";
import HomeBannerCarousel from "./HomeBannerCarousel";

export type HomeBannerProps = {};

export default function HomeBanner({}: HomeBannerProps) {
  return (
    <div className="h-dvh flex flex-col items-center justify-center">
      <Title className="mb-10" />
      <motion.p
        className="text-[1.25rem] text-fg2"
        initial={{ scale: 0.75, opacity: 0, y: "-50%", height: "0em" }}
        animate={{
          scale: 1,
          opacity: 1,
          y: "0",
          height: "1.5em",
          transition: defaultMotionSpring({ delay: 0.25 }),
        }}
      >
        I'm <span className="text-a1 font-bold">Jeffrey Fan</span>
      </motion.p>
      <motion.p
        className="text-[1.25rem] text-fg2"
        initial={{ scale: 0.75, opacity: 0, y: "-50%", height: "0em" }}
        animate={{
          scale: 1,
          opacity: 1,
          y: "0",
          height: "1.5em",
          transition: defaultMotionSpring({ delay: 0.5 }),
        }}
      >
        I make{" "}
        <HomeBannerCarousel
          values={[
            "things",
            "software",
            "robots",
            "vision systems",
            "biotechnology",
            "neurotechnology",
            "tools",
            "art",
            "AI models",
          ]}
        />
      </motion.p>
      <div className="mt-5 flex flex-row items-center justify-center gap-4">
        <HomeBannerIconButton
          delay={0.75}
          href="mailto:jeffrey.fanjf@gmail.com"
        >
          <FiMail />
        </HomeBannerIconButton>
        <HomeBannerIconButton
          delay={0.85}
          href="https://www.linkedin.com/in/jeffrey-fan-5b4769284/"
        >
          <RiLinkedinLine />
        </HomeBannerIconButton>
        <HomeBannerIconButton delay={0.95} href="https://github.com/12Jeef">
          <LuGithub />
        </HomeBannerIconButton>
        <HomeBannerIconButton delay={1.05} href="./portfolio.pdf">
          <HiOutlineDocumentText />
        </HomeBannerIconButton>
      </div>
      <HomeNext className="mt-16 -mb-16" onClick={() => {}} />
    </div>
  );
}
