import Title from "../components/Title";
import { motion, type MotionNodeOptions } from "framer-motion";
import { defaultMotionSpring } from "../features/jiggle";
import type { HTMLAttributes } from "react";
import { LuGithub } from "react-icons/lu";
import { IoDocumentTextOutline } from "react-icons/io5";
import { RiLinkedinLine } from "react-icons/ri";
import JiggleButtonLink from "../components/JiggleButtonLink";

function IconButton({
  children,
  delay = 0,
  href = "",
  className = "",
  ...props
}: { delay?: number; href?: string } & HTMLAttributes<HTMLButtonElement> &
  MotionNodeOptions) {
  return (
    <a href={href}>
      <motion.button
        initial={{ scale: 0.75, opacity: 0, x: "-50%", y: "-50%" }}
        animate={{
          scale: 1,
          opacity: 1,
          x: "0%",
          y: "0%",
          transition: defaultMotionSpring({ delay }),
        }}
        className={`text-[1.25rem] text-a1 hover:text-fg1 ${className}`}
        style={{
          transition: "color 0.3s",
        }}
        {...props}
      >
        {children}
      </motion.button>
    </a>
  );
}

export default function HomePage() {
  const makeProps = (x: number, delay: number) => ({
    initial: { scale: 0.75, opacity: 0, x: x * -50 + "%", y: "-50%" },
    animate: {
      scale: 1,
      opacity: 1,
      x: "0%",
      y: "0%",
      transition: defaultMotionSpring({ delay }),
    },
    exit: { scale: 0, x: x * 100 + "%", y: "100%" },
  });

  return (
    <motion.article
      key="HomePage"
      className="relative w-full h-full max-w-full max-h-full overflow-hidden bg-bg1 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
    >
      <div className="absolute bottom-3 text-fg2aa pointer-events-none">
        © 2025 Jeffrey Fan. All rights reserved.
      </div>
      <Title className="mb-10" />
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
          transition: defaultMotionSpring({ delay: 0.8 }),
        }}
      >
        I make apps, art, robots, and more
      </motion.p>
      <motion.p className="mt-5 flex flex-row items-center justify-center gap-4">
        <IconButton delay={1.1} href="https://github.com/12Jeef">
          <LuGithub />
        </IconButton>
        <IconButton
          delay={1.2}
          href="https://www.linkedin.com/in/jeffrey-fan-5b4769284/"
        >
          <RiLinkedinLine />
        </IconButton>
        <IconButton delay={1.3} href="https://12jeef.github.io/resume.pdf">
          <IoDocumentTextOutline />
        </IconButton>
      </motion.p>
      <motion.p
        className="mt-[5rem] flex flex-col lg:flex-row items-center justify-center gap-4"
        initial={{ maxHeight: "0rem" }}
        animate={{
          maxHeight: "10rem",
          transition: { duration: 0.3, delay: 1.4 },
        }}
      >
        <motion.span {...makeProps(-1, 1.4)}>
          <JiggleButtonLink to="/about" className="lowercase">
            Stuff About Me
          </JiggleButtonLink>
        </motion.span>
        <motion.span {...makeProps(0, 1.5)}>
          <JiggleButtonLink to="/activities" className="lowercase">
            Stuff I've Done
          </JiggleButtonLink>
        </motion.span>
        <motion.span {...makeProps(1, 1.6)}>
          <JiggleButtonLink to="projects" className="lowercase">
            Stuff I've Made
          </JiggleButtonLink>
        </motion.span>
      </motion.p>
    </motion.article>
  );
}
