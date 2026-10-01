import Title from "../components/Title";
import { motion } from "framer-motion";
import { defaultMotionSpring } from "../features/jiggle";
import { LuGithub } from "react-icons/lu";
import { RiLinkedinLine } from "react-icons/ri";
import { FiMail } from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";
import Page from "../components/Page";
import IconButton from "../components/IconButton";
import Background from "../components/Background";

export type HomePageProps = {};

export default function HomePage({}: HomePageProps) {
  return (
    <Page innerClassName="bg-bg1 z-1">
      <Background />
      <div className="flex flex-col items-center justify-center">
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
          I make things.
        </motion.p>
        <motion.div className="mt-5 flex flex-row items-center justify-center gap-4">
          <IconButton delay={0.75} href="mailto:jeffrey.fanjf@gmail.com">
            <FiMail />
          </IconButton>
          <IconButton
            delay={0.85}
            href="https://www.linkedin.com/in/jeffrey-fan-5b4769284/"
          >
            <RiLinkedinLine />
          </IconButton>
          <IconButton delay={0.95} href="https://github.com/12Jeef">
            <LuGithub />
          </IconButton>
          <IconButton delay={1.05} href="./portfolio.pdf">
            <HiOutlineDocumentText />
          </IconButton>
        </motion.div>
      </div>
      {/* <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p>
      <p>hello</p> */}
    </Page>
  );
}
