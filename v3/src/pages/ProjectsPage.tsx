import PageTitle from "../components/PageTitle";
import Page from "../components/Page";
import { motion } from "framer-motion";
import {
  defaultChildVariants,
  defaultMotionSpring,
  defaultParentProps,
  useJiggle,
} from "../features/jiggle";
import { useMemo } from "react";
import { LuGithub } from "react-icons/lu";
import { MdOpenInNew } from "react-icons/md";
import { FiDownload } from "react-icons/fi";
import peninsulaportal from "../assets/projects/peninsulaportal.png";
import noteblast from "../assets/projects/noteblast.png";
import mergegame from "../assets/projects/mergegame.png";
import { FaRegFolder } from "react-icons/fa6";

type ProjectURLs =
  | string
  | {
      main: string;
      github?: string;
      open?: string;
      download?: string;
    };

type ProjectSide = "left" | "right";

type ProjectProps = {
  title: string;
  urls?: ProjectURLs;
  tags?: string[];
  children?: string;
};

type FeaturedProjectProps = {
  img: string;
  side: ProjectSide;
} & ProjectProps;

const getURLs = (urls: ProjectURLs) => {
  const main = typeof urls === "string" ? urls : urls.main;
  const github = typeof urls === "string" ? undefined : urls.github;
  const open = typeof urls === "string" ? undefined : urls.open;
  const download = typeof urls === "string" ? undefined : urls.download;
  return { main, github, open, download };
};

function ProjectTags({
  tags,
  side = "right",
  delay,
}: {
  tags: string[];
  side?: ProjectSide;
  delay?: number;
}) {
  return (
    <motion.p
      className={`flex ${
        side === "left" ? "flex-row-reverse" : "flex-row"
      } gap-4 text-a1 italic lowercase`}
      {...defaultParentProps({ delay, type: "in-view" })}
    >
      {(side === "left" ? [...tags].reverse() : tags).map((tag) => (
        <motion.span
          key={tag}
          variants={defaultChildVariants({})}
          style={{ transformOrigin: side === "left" ? "100% 0" : "0 0" }}
        >
          {tag}
        </motion.span>
      ))}
    </motion.p>
  );
}

function ProjectURLs({
  urls,
  side = "right",
  delay,
  className = "",
}: {
  urls: ProjectURLs;
  side?: ProjectSide;
  delay?: number;
  className?: string;
}) {
  const { github, open, download } = getURLs(urls);

  return (
    <motion.p
      className={`mt-4 flex ${
        side === "left" ? "flex-row-reverse" : "flex-row"
      } gap-4 text-a1 italic lowercase ${className}`}
      {...defaultParentProps({
        delay,
        type: "in-view",
      })}
    >
      {((buttons: any[]) =>
        side === "left" ? [...buttons].reverse() : buttons)([
        github && (
          <motion.a
            className="group"
            href={github}
            variants={defaultChildVariants({})}
            style={{ transformOrigin: side === "left" ? "100% 0" : "0 0" }}
          >
            <button className="group-hover:text-fg1 transition-color duration-300">
              <LuGithub />
            </button>
          </motion.a>
        ),
        open && (
          <motion.a
            className="group"
            href={open}
            variants={defaultChildVariants({})}
            style={{ transformOrigin: side === "left" ? "100% 0" : "0 0" }}
          >
            <button className="group-hover:text-fg1 transition-color duration-300">
              <MdOpenInNew />
            </button>
          </motion.a>
        ),
        download && (
          <motion.a
            className="group"
            href={download}
            variants={defaultChildVariants({})}
            style={{ transformOrigin: side === "left" ? "100% 0" : "0 0" }}
          >
            <button className="group-hover:text-fg1 transition-color duration-300">
              <FiDownload />
            </button>
          </motion.a>
        ),
      ])}
    </motion.p>
  );
}

function FeaturedProject({
  img,
  side,
  title,
  urls = "",
  tags = [],
  children,
}: FeaturedProjectProps) {
  const angle = useMemo(() => (Math.random() * 2 - 1) * 5, []);

  const [jiggleX, jiggleY, setScale, _] = useJiggle({ initial: 0 });

  const overlapPercent = 15;
  const sidePercent = 50 + overlapPercent / 2;

  const { main } = getURLs(urls);

  return (
    <motion.section
      className={`max-w-[60rem] mt-8 flex ${
        side === "left" ? "flex-row" : "flex-row-reverse"
      }`}
    >
      <motion.div
        className="max-h-full"
        style={{ width: sidePercent + "%", maxWidth: sidePercent + "%" }}
        initial={{
          scale: 0.75,
          opacity: 0,
          x: side === "left" ? "-25%" : "25%",
        }}
        whileInView={{
          scale: 1,
          opacity: 1,
          x: "0%",
          transition: defaultMotionSpring({}),
        }}
      >
        <motion.div
          className="group relative max-w-full max-h-full rounded-[3rem] overflow-hidden bg-a1 cursor-pointer"
          onHoverStart={() => setScale(1.05)}
          onHoverEnd={() => setScale(1)}
          style={{
            transform: `scale(${jiggleX}, ${jiggleY}) rotate(${angle}deg)`,
          }}
        >
          <img
            src={img}
            className="w-full h-full opacity-75 group-hover:opacity-0 transition-opacity duration-300"
            style={{
              mixBlendMode: "multiply",
              filter: "grayscale(1)",
            }}
          />
          <img
            src={img}
            className="absolute top-0 left-0 bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          <div
            className="absolute top-0 left-0 bottom-0 right-0"
            style={{
              boxShadow: "inset 0 0 5rem var(--color-a1aa)",
            }}
          ></div>
        </motion.div>
      </motion.div>
      <motion.div
        className={`max-h-full z-10 flex flex-col ${
          side === "left" ? "items-end" : "items-start"
        } justify-center gap-4`}
        style={{
          marginLeft: side === "left" ? -overlapPercent + "%" : "0%",
          marginRight: side === "right" ? -overlapPercent + "%" : "0%",
          width: sidePercent + "%",
          maxWidth: sidePercent + "%",
        }}
        {...defaultParentProps({ type: "in-view" })}
      >
        <motion.h1
          className="text-3xl font-black"
          variants={{
            hidden: {
              scale: 0.75,
              opacity: 0,
              x: side === "left" ? "50%" : "-50%",
            },
            visible: {
              scale: 1,
              opacity: 1,
              x: "0%",
            },
          }}
        >
          <a
            className="!text-fg1 hover:!text-a1 transition-color duration-300"
            href={main}
          >
            {title}
          </a>
        </motion.h1>
        <motion.p
          className={`text-fg2 bg-bg1 p-6 rounded-lg self-stretch ${
            side === "left" ? "text-right" : "text-left"
          }`}
          style={{
            filter: "drop-shadow(0 0 1rem #0008)",
          }}
          variants={{
            hidden: {
              scale: 0.75,
              opacity: 0,
              x: side === "left" ? "50%" : "-50%",
            },
            visible: {
              scale: 1,
              opacity: 1,
              x: "0%",
            },
          }}
        >
          {children}
        </motion.p>
        <ProjectTags tags={tags} side={side} />
        <ProjectURLs urls={urls} side={side} className="text-[1.25rem]" />
      </motion.div>
    </motion.section>
  );
}

function Project({ title, urls = "", tags = [], children }: ProjectProps) {
  const { main } = getURLs(urls);

  return (
    <motion.div
      className="w-[20rem] max-w-[20rem] h-[25rem] max-h-[25rem] bg-bg1 p-8 rounded-[2rem] flex flex-col gap-4"
      initial={{ scale: 0.75, opacity: 0, y: "-25%" }}
      whileInView={{
        scale: 1,
        opacity: 1,
        y: "0%",
        transition: defaultMotionSpring({}),
      }}
      style={{
        filter: "drop-shadow(0 0 1rem #0008)",
      }}
    >
      <div className="text-3xl flex flex-row items-center justify-start">
        <div className="flex-1">
          <FaRegFolder className="text-a1" />
        </div>
        <ProjectURLs urls={urls} />
      </div>
      <a
        className="text-2xl font-bold !text-fg1 hover:!text-a1 transition-color duration-300 self-start"
        href={main}
      >
        <h1>{title}</h1>
      </a>
      <p className="text-fg2 flex-1">{children}</p>
      <ProjectTags tags={tags} />
    </motion.div>
  );
}

export default function ProjectsPage() {
  return (
    <Page key="ProjectsPage">
      <PageTitle>My Stuff</PageTitle>
      <motion.section>
        <FeaturedProject
          img={peninsulaportal}
          side="left"
          title="PeninsulaPortal"
          urls={{
            main: "https://github.com/team6036/peninsulaportal",
            github: "https://github.com/team6036/peninsulaportal",
            download:
              "https://github.com/team6036/peninsulaportal/releases/latest",
          }}
          tags={["JS", "Node.js", "Electron.js", "UI"]}
        >
          A complete FRC robot diagnostic and debugger, path generator, and
          competition pit display. Sleek, navigable design focused on user
          experience. Full end-to-end development from back-end servers to
          front-end applications.
        </FeaturedProject>
        <FeaturedProject
          img={noteblast}
          side="right"
          title="NoteBlast"
          urls={{
            main: "https://www.noteblast.org/",
            github: "https://github.com/Noteblast/noteblast",
            open: "https://play.noteblast.org/",
          }}
          tags={["JS", "Algorithm", "Game", "UI"]}
        >
          A sight-reading rhythm game to help musicians practice! Comes with a
          built-in free tuner to provide feedback on the accuracy of your
          instrument
        </FeaturedProject>
        <FeaturedProject
          img={mergegame}
          side="left"
          title="Merge Game"
          urls={{
            main: "https://chromewebstore.google.com/detail/merge-game/neemdnfmagdkajnbljpccdechakhfgeb",
            github: "https://github.com/12Jeef/MergeGame",
            download:
              "https://chromewebstore.google.com/detail/merge-game/neemdnfmagdkajnbljpccdechakhfgeb",
          }}
          tags={["JS", "Game", "UI"]}
        >
          A fun 2048-like Chrome extension about merging shapes to create higher
          tiers. A good offline way to enjoy some down time. Boasting over 3.6K
          installations in total and over 700 monthly users.
        </FeaturedProject>
      </motion.section>
      <section className="mt-16 flex flex-wrap justify-center items-center gap-8">
        <Project
          title="CellLuminex"
          tags={["TS", "Algorithm", "UI"]}
          urls={{
            main: "https://cell-luminex.vercel.app/",
            github: "https://github.com/12Jeef/CellLuminex",
            open: "https://cell-luminex.vercel.app/",
          }}
        >
          A fluorescent cell counter and calculator, able to distinguish
          immunofluorescently-stained cell images.
        </Project>
        <Project
          title="Portfolio V3"
          tags={["TS", "React", "Tailwind", "Motion", "UI"]}
          urls={{
            main: "https://12jeef.github.io/",
            github: "https://github.com/12Jeef/12Jeef.github.io/tree/main/v3",
            open: "https://12jeef.github.io/",
          }}
        >
          My third iteration of my portfolio website which is the very website
          you see now! Built using a variety of frameworks, including React,
          Vite, TailwindCSS, and Framer-Motion.
        </Project>
        <Project
          title="Portfolio V2"
          tags={["TS", "UI"]}
          urls={{
            main: "https://12jeef.github.io/v2/build",
            github: "https://github.com/12Jeef/12Jeef.github.io/tree/main/v2",
            open: "https://12jeef.github.io/v2/build",
          }}
        >
          My second iteration of my portfolio website. Built using TS, HTML, and
          CSS, but no other frameworks.
        </Project>
        <Project
          title="Portfolio V1"
          tags={["JS", "UI"]}
          urls={{
            main: "https://12jeef.github.io/v1/",
            github: "https://github.com/12Jeef/12Jeef.github.io/tree/main/v1",
            open: "https://12jeef.github.io/v1/",
          }}
        >
          My first iteration of my portfolio website. Built using basic HTML,
          JS, and CSS.
        </Project>
        <Project
          title="Biotech Sandboxes"
          tags={["JS", "Algorithm", "Biology"]}
          urls={{
            main: "https://jbiotech.vercel.app/",
            github: "https://github.com/12Jeef/biotech",
            open: "https://jbiotech.vercel.app/",
          }}
        >
          A sandbox environment where I simulated some mathematical models of
          biological systems! Notable models include Gierer-Meinhardt and
          FitzHugh-Nagumo.
        </Project>
        <Project
          title="pPatrol"
          tags={["JS", "FRC", "UI"]}
          urls={{
            main: "https://ppatrol.vercel.app/",
            github: "https://github.com/12Jeef/pPatrol",
            open: "https://ppatrol.vercel.app/",
          }}
        >
          2024 FRC Crescendo web scouting application linked with PythonAnywhere
          simple Flask backend.
        </Project>
        <Project
          title="Celestial.py"
          tags={["PY", "PyGame", "Game", "WIP"]}
          urls={{
            main: "https://github.com/12Jeef/CelestialPY",
            github: "https://github.com/12Jeef/CelestialPY",
          }}
        >
          A top down space shooter game where you defeat asteroids and enemies.
          Includes in-house self-developed PyGame game engine.
        </Project>
        <Project
          title="Celestial.js"
          tags={["JS", "Canvas", "Game", "WIP"]}
          urls={{
            main: "https://github.com/12Jeef/CelestialJS",
            github: "https://github.com/12Jeef/CelestialJS",
            open: "https://12jeef.github.io/CelestialJS/",
          }}
        >
          A top down space shooter game where you defeat asteroids and enemies.
          Includes in-house self-developed Javascript game engine.
        </Project>
        <Project
          title="BlobBlast"
          tags={["PY", "PyGame", "Game"]}
          urls={{
            main: "https://github.com/12Jeef/BlobBlast",
            github: "https://github.com/12Jeef/BlobBlast",
          }}
        >
          A unique pixel shooter game with interesting movement mechanics.
          Includes in-house self-developed PyGame game engine.
        </Project>
      </section>
    </Page>
  );
}
