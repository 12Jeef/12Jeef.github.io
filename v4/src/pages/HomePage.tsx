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
import { FaArrowDown } from "react-icons/fa";

export type HomePageProps = {};

export default function HomePage({}: HomePageProps) {
  return (
    <Page innerClassName="bg-bg1">
      <Background
        background="radial-gradient(ellipse 50vw 50vh at 50vw 50vh, var(--color-a1) 0%, var(--color-mg) 100%)"
        className="z-100 opacity-20"
      />
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
          I make things.
        </motion.p>
        <div className="mt-5 flex flex-row items-center justify-center gap-4">
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
        </div>
        <motion.div
          className="mt-16 -mb-16 text-mg text-4xl"
          initial={{ scale: 0.75, opacity: 0, y: "-50%" }}
          animate={{
            scale: 1,
            opacity: 1,
            y: "0",
            transition: defaultMotionSpring({ delay: 1.25 }),
          }}
        >
          <motion.div
            animate={{
              y: ["-25%", "25%", "-25%"],
              transition: {
                repeat: Infinity,
                duration: 3,
              },
            }}
          >
            <FaArrowDown />
          </motion.div>
        </motion.div>
      </div>
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
      <p>hello</p>
      <p>hello</p>
    </Page>
  );
}
