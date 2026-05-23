import PageTitle from "../components/PageTitle";
import Page from "../components/Page";
import { AnimatePresence, motion } from "framer-motion";
import {
  defaultChildVariants,
  defaultMotionSpring,
  defaultParentProps,
  // useJiggle,
} from "../features/jiggle";
// import { useMemo } from "react";
import { LuGithub } from "react-icons/lu";
import { MdOpenInNew } from "react-icons/md";
import { FiDownload } from "react-icons/fi";
import artgalleryv1 from "../assets/projects/artgalleryv1.png";
import artgalleryv2 from "../assets/projects/artgalleryv2.png";
import biotech from "../assets/projects/biotech.png";
import blobblast from "../assets/projects/blobblast.png";
import celestialjs from "../assets/projects/celestialjs.png";
import cellluminex from "../assets/projects/cellluminex.png";
import mergegame from "../assets/projects/mergegame.png";
import noteblast from "../assets/projects/noteblast.png";
import peninsulaportal from "../assets/projects/peninsulaportal.png";
import portfoliov1 from "../assets/projects/portfoliov1.png";
import portfoliov2 from "../assets/projects/portfoliov2.png";
import portfoliov3 from "../assets/projects/portfoliov3.png";
import ppatrol from "../assets/projects/ppatrol.png";
import reactiontrajfinder from "../assets/projects/reactiontrajfinder.png";
import refraction from "../assets/projects/refraction.png";
import { FaRegFolder } from "react-icons/fa6";
import { createContext, useContext, useEffect, useState } from "react";

type Context = {
  tags: { [key: string]: string[] };
  setTags: (tags: { [key: string]: string[] }) => void;
  wantedTags: null | string[];
  setWantedTags: (tags: null | string[]) => void;
};

const context = createContext<Context>({
  tags: {},
  setTags: () => {},
  wantedTags: null,
  setWantedTags: () => {},
});

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
  img?: string;
  urls?: ProjectURLs;
  tags?: string[];
  children?: string;
};

// type FeaturedProjectProps = {
//   img: string;
//   side: ProjectSide;
// } & ProjectProps;

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
      } gap-4 text-a1 text-sm italic lowercase`}
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
            key="github"
            className="group/btn"
            href={github}
            variants={defaultChildVariants({})}
            style={{ transformOrigin: side === "left" ? "100% 0" : "0 0" }}
          >
            <button className="group/btn-hover:text-fg1 transition-color duration-300">
              <LuGithub />
            </button>
          </motion.a>
        ),
        open && (
          <motion.a
            key="open"
            className="group/btn"
            href={open}
            variants={defaultChildVariants({})}
            style={{ transformOrigin: side === "left" ? "100% 0" : "0 0" }}
          >
            <button className="group/btn-hover:text-fg1 transition-color duration-300">
              <MdOpenInNew />
            </button>
          </motion.a>
        ),
        download && (
          <motion.a
            key="download"
            className="group/btn"
            href={download}
            variants={defaultChildVariants({})}
            style={{ transformOrigin: side === "left" ? "100% 0" : "0 0" }}
          >
            <button className="group/btn-hover:text-fg1 transition-color duration-300">
              <FiDownload />
            </button>
          </motion.a>
        ),
      ])}
    </motion.p>
  );
}

// function FeaturedProject({
//   img,
//   side,
//   title,
//   urls = "",
//   tags = [],
//   children,
// }: FeaturedProjectProps) {
//   const angle = useMemo(() => (Math.random() * 2 - 1) * 5, []);

//   const [jiggleX, jiggleY, setScale, _] = useJiggle({ initial: 0 });

//   const overlapPercent = 15;
//   const sidePercent = 50 + overlapPercent / 2;

//   const { main } = getURLs(urls);

//   return (
//     <motion.section
//       className={`max-w-[60rem] mt-8 flex ${
//         side === "left" ? "flex-row" : "flex-row-reverse"
//       }`}
//     >
//       <motion.div
//         className="max-h-full"
//         style={{ width: sidePercent + "%", maxWidth: sidePercent + "%" }}
//         initial={{
//           scale: 0.75,
//           opacity: 0,
//           x: side === "left" ? "-25%" : "25%",
//         }}
//         whileInView={{
//           scale: 1,
//           opacity: 1,
//           x: "0%",
//           transition: defaultMotionSpring({}),
//         }}
//       >
//         <motion.div
//           className="group relative max-w-full max-h-full rounded-[3rem] overflow-hidden bg-a1 cursor-pointer"
//           onHoverStart={() => setScale(1.05)}
//           onHoverEnd={() => setScale(1)}
//           style={{
//             transform: `scale(${jiggleX}, ${jiggleY}) rotate(${angle}deg)`,
//           }}
//         >
//           <img
//             src={img}
//             className="w-full h-full opacity-75 group-hover:opacity-0 transition-opacity duration-300"
//             style={{
//               mixBlendMode: "multiply",
//               filter: "grayscale(1)",
//             }}
//           />
//           <img
//             src={img}
//             className="absolute top-0 left-0 bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//           />
//           <div
//             className="absolute top-0 left-0 bottom-0 right-0"
//             style={{
//               boxShadow: "inset 0 0 5rem var(--color-a1aa)",
//             }}
//           ></div>
//         </motion.div>
//       </motion.div>
//       <motion.div
//         className={`max-h-full z-10 flex flex-col ${
//           side === "left" ? "items-end" : "items-start"
//         } justify-center gap-4`}
//         style={{
//           marginLeft: side === "left" ? -overlapPercent + "%" : "0%",
//           marginRight: side === "right" ? -overlapPercent + "%" : "0%",
//           width: sidePercent + "%",
//           maxWidth: sidePercent + "%",
//         }}
//         {...defaultParentProps({ type: "in-view" })}
//       >
//         <motion.h1
//           className="text-3xl font-black"
//           variants={{
//             hidden: {
//               scale: 0.75,
//               opacity: 0,
//               x: side === "left" ? "50%" : "-50%",
//             },
//             visible: {
//               scale: 1,
//               opacity: 1,
//               x: "0%",
//             },
//           }}
//         >
//           <a
//             className="!text-fg1 hover:!text-a1 transition-color duration-300"
//             href={main}
//           >
//             {title}
//           </a>
//         </motion.h1>
//         <motion.p
//           className={`text-fg2 bg-bg1 p-6 rounded-lg self-stretch ${
//             side === "left" ? "text-right" : "text-left"
//           }`}
//           style={{
//             filter: "drop-shadow(0 0 1rem #0008)",
//           }}
//           variants={{
//             hidden: {
//               scale: 0.75,
//               opacity: 0,
//               x: side === "left" ? "50%" : "-50%",
//             },
//             visible: {
//               scale: 1,
//               opacity: 1,
//               x: "0%",
//             },
//           }}
//         >
//           {children}
//         </motion.p>
//         <ProjectTags tags={tags} side={side} />
//         <ProjectURLs urls={urls} side={side} className="text-[1.25rem]" />
//       </motion.div>
//     </motion.section>
//   );
// }

function Project({ title, img, urls = "", tags = [], children }: ProjectProps) {
  const { main } = getURLs(urls);

  const {
    tags: allTags,
    setTags: setAllTags,
    wantedTags,
  } = useContext(context);
  useEffect(() => {
    let changed = false;
    for (const tag of tags) {
      const titles = allTags[tag] ?? [];
      if (titles.includes(title)) continue;
      changed = true;
      allTags[tag] = [...titles, title];
    }
    if (changed) setAllTags({ ...allTags });
  }, [tags, allTags, setAllTags]);

  const isAllowed =
    wantedTags == null ||
    tags.filter((tag) => wantedTags.includes(tag)).length === wantedTags.length;
  if (!isAllowed) return null;

  return (
    <motion.div
      className="group relative w-[20rem] max-w-[20rem] h-[25rem] max-h-[25rem] bg-bg1 rounded-[2rem] overflow-hidden"
      initial={{ scale: 0.75, opacity: 0, y: "-25%" }}
      whileInView={{
        scale: 1,
        opacity: 1,
        y: "0%",
        transition: defaultMotionSpring({}),
      }}
      exit={{ scale: 0.75, opacity: 0, y: "-25%" }}
      style={{
        filter: "drop-shadow(0 0 1rem #0008)",
      }}
      layout="position"
    >
      {img && (
        <img
          src={img}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-0 group-hover:opacity-35 blur-xs group-hover:blur-[1px] duration-300"
        />
      )}
      <div className="absolute top-0 left-0 bottom-0 right-0 p-8 flex flex-col gap-4">
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
        <p className="text-fg2 group-hover:text-fg1 flex-1 duration-300">
          {children}
        </p>
        <ProjectTags tags={tags} />
      </div>
    </motion.div>
  );
}

function WantedTags() {
  const { tags, wantedTags, setWantedTags } = useContext(context);

  const [shown, setShown] = useState(false);

  return (
    <div
      className="relative flex flex-row items-center justify-center"
      onMouseEnter={() => {
        if (wantedTags != null) setShown(true);
      }}
      onMouseLeave={() => setShown(false)}
    >
      <button
        className="text-a1 font-bold min-w-30 min-h-[1.5em] max-h-[1.5em]"
        onClick={() => {
          setWantedTags(wantedTags == null ? [] : null);
          setShown(wantedTags == null);
        }}
      >
        <div
          className={`${wantedTags == null ? "max-h-[1.5em] opacity-100" : "max-h-[0em] opacity-0"} overflow-hidden flex flex-col-reverse duration-200`}
        >
          I'm good.
        </div>
        <div
          className={`${wantedTags != null ? "max-h-[1.5em] opacity-100" : "max-h-[0em] opacity-0"} overflow-hidden flex flex-col duration-200`}
        >
          Yes!
        </div>
      </button>
      <AnimatePresence>
        {shown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75, transition: { delay: 0.1 } }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-10 rounded-[1rem] backdrop-blur-sm"
            style={{
              transformOrigin: "50% 0%",
            }}
          >
            <div
              className="px-8 py-4 bg-a1aa rounded-[1rem] flex flex-wrap justify-start items-center gap-2 w-120"
              style={{
                filter: "drop-shadow(0 0 1rem #0008)",
                boxShadow: "inset 0 0 1rem var(--color-a1a)",
              }}
            >
              {Object.keys(tags)
                .sort((a, b) => tags[b].length - tags[a].length)
                .map((tag) => (
                  <motion.button
                    key={tag}
                    className="min-w-30 text-sm lowercase flex flex-row items-center justify-start gap-2"
                    onClick={() => {
                      if (wantedTags == null) return;
                      if (wantedTags.includes(tag))
                        setWantedTags(wantedTags.filter((t) => t !== tag));
                      else setWantedTags([...wantedTags, tag]);
                    }}
                  >
                    <div
                      className={`w-2 h-2 ${wantedTags?.includes(tag) ? "bg-a1" : "bg-a1aa"} rounded-full duration-200`}
                    ></div>
                    <div
                      className={`${wantedTags?.includes(tag) ? "text-a1" : "text-a1a"} duration-200`}
                    >
                      {tag} ({tags[tag].length})
                    </div>
                  </motion.button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProjectsPage() {
  const [tags, setTags] = useState<{ [key: string]: string[] }>({});
  const [wantedTags, setWantedTags] = useState<null | string[]>(null);

  return (
    <context.Provider
      value={{
        tags,
        setTags,
        wantedTags,
        setWantedTags,
      }}
    >
      <Page key="ProjectsPage">
        <PageTitle>My Stuff</PageTitle>
        <motion.section className="mt-4 text-fg2 text-[1.25rem] flex flex-row items-center justify-center gap-2">
          <div>Want to find something specific?</div>
          <WantedTags />
        </motion.section>
        {/* <motion.section>
        <FeaturedProject
          side="left"
          title="PeninsulaPortal"
          img={peninsulaportal}
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
          side="right"
          title="NoteBlast"
          img={noteblast}
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
          side="left"
          title="Merge Game"
          img={mergegame}
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
      </motion.section> */}
        <section className="mt-16 flex flex-wrap justify-center items-center gap-8">
          <AnimatePresence>
            <Project
              title="Refraction"
              img={refraction}
              tags={["TS", "React", "UI", "Algorithm", "Physics", "WIP"]}
              urls={{
                main: "https://re-fraction.vercel.app/",
                github: "https://github.com/12Jeef/refraction",
                open: "https://re-fraction.vercel.app/",
              }}
            >
              An ray optics simulator with refraction, reflection, material
              customization, spectrogram customization, and more! Still a work
              in progress.
            </Project>
            <Project
              title="Reaction TrajFinder"
              img={reactiontrajfinder}
              tags={["TS", "React", "UI", "Algorithm", "Biotech"]}
              urls={{
                main: "https://reaction-trajfinder.vercel.app/",
                github: "https://github.com/12Jeef/ReactionTrajFinder",
                open: "https://reaction-trajfinder.vercel.app/",
              }}
            >
              An ORCA software output file parser to understand reaction
              dynamics and energy wells through data processing.
            </Project>
            <Project
              title="Virtual Art Gallery V2"
              img={artgalleryv2}
              tags={["TS", "React", "Three.JS", "R3F", "UI"]}
              urls={{
                main: "https://12jeef.github.io/gallery/",
                github:
                  "https://github.com/12Jeef/12Jeef.github.io/tree/main/gallery/v2",
                open: "https://12jeef.github.io/gallery/",
              }}
            >
              My second iteration of my virtual art gallery, with a strong focus
              on light and immersion. I really enjoyed the super dynamic camera
              effect I made. Check it out!
            </Project>
            <Project
              title="CellLuminex"
              img={cellluminex}
              tags={["TS", "React", "UI", "Algorithm", "Biotech"]}
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
              img={portfoliov3}
              tags={["TS", "React", "UI"]}
              urls={{
                main: "https://12jeef.github.io/",
                github:
                  "https://github.com/12Jeef/12Jeef.github.io/tree/main/v3",
                open: "https://12jeef.github.io/",
              }}
            >
              My third iteration of my portfolio website which is the very
              website you see now! Built using a variety of frameworks,
              including React, Vite, TailwindCSS, and Framer-Motion.
            </Project>
            <Project
              title="NoteBlast"
              img={noteblast}
              urls={{
                main: "https://www.noteblast.org/",
                github: "https://github.com/Noteblast/noteblast",
                open: "https://play.noteblast.org/",
              }}
              tags={["JS", "UI", "Algorithm", "Game"]}
            >
              A sight-reading rhythm game to help musicians practice! Comes with
              a built-in free tuner to provide feedback on the accuracy of your
              instrument
            </Project>
            <Project
              title="Merge Game"
              img={mergegame}
              urls={{
                main: "https://chromewebstore.google.com/detail/merge-game/neemdnfmagdkajnbljpccdechakhfgeb",
                github: "https://github.com/12Jeef/MergeGame",
                download:
                  "https://chromewebstore.google.com/detail/merge-game/neemdnfmagdkajnbljpccdechakhfgeb",
              }}
              tags={["JS", "UI", "Game"]}
            >
              A fun 2048-like Chrome extension about merging shapes to create
              higher tiers. A good offline way to enjoy some down time. Boasting
              over 3.6K installations in total and over 700 monthly users.
            </Project>
            <Project
              title="Portfolio V2"
              img={portfoliov2}
              tags={["TS", "UI"]}
              urls={{
                main: "https://12jeef.github.io/v2/build",
                github:
                  "https://github.com/12Jeef/12Jeef.github.io/tree/main/v2",
                open: "https://12jeef.github.io/v2/build",
              }}
            >
              My second iteration of my portfolio website. Built using TS, HTML,
              and CSS, but no other frameworks.
            </Project>
            <Project
              title="Portfolio V1"
              img={portfoliov1}
              tags={["JS", "UI"]}
              urls={{
                main: "https://12jeef.github.io/v1/",
                github:
                  "https://github.com/12Jeef/12Jeef.github.io/tree/main/v1",
                open: "https://12jeef.github.io/v1/",
              }}
            >
              My first iteration of my portfolio website. Built using basic
              HTML, JS, and CSS.
            </Project>
            <Project
              title="Virtual Art Gallery V1"
              img={artgalleryv1}
              tags={["TS", "Three.JS", "UI"]}
              urls={{
                main: "https://12jeef.github.io/gallery/v1/",
                github:
                  "https://github.com/12Jeef/12Jeef.github.io/tree/main/gallery/v1",
                open: "https://12jeef.github.io/gallery/v1/",
              }}
            >
              My first iteration of my art gallery! It's totally broken right
              now, but has some functional bits.
            </Project>
            <Project
              title="Biotech Sandboxes"
              img={biotech}
              tags={["JS", "Algorithm", "Biotech"]}
              urls={{
                main: "https://jbiotech.vercel.app/",
                github: "https://github.com/12Jeef/biotech",
                open: "https://jbiotech.vercel.app/",
              }}
            >
              A sandbox environment where I simulated some mathematical models
              of biological systems! Notable models include Gierer-Meinhardt and
              FitzHugh-Nagumo.
            </Project>
            <Project
              title="pPatrol"
              img={ppatrol}
              tags={["JS", "FRC", "UI"]}
              urls={{
                main: "https://ppatrol.vercel.app/",
                github: "https://github.com/12Jeef/pPatrol",
                open: "https://ppatrol.vercel.app/",
              }}
            >
              2024 FRC Crescendo web scouting application linked with
              PythonAnywhere simple Flask backend.
            </Project>
            <Project
              title="PeninsulaPortal"
              img={peninsulaportal}
              tags={["JS", "FRC", "Electron.JS", "Three.JS", "UI"]}
              urls={{
                main: "https://github.com/team6036/peninsulaportal",
                github: "https://github.com/team6036/peninsulaportal",
                download:
                  "https://github.com/team6036/peninsulaportal/releases/latest",
              }}
            >
              Complete FRC robot diagnostic app, path generator, and competition
              pit display. UI/UX focus. Full-stack application, including
              backend servers and frontend displays/graphics.
            </Project>
            <Project
              title="Celestial.py"
              tags={["PY", "PyGame", "Game", "WIP"]}
              urls={{
                main: "https://github.com/12Jeef/CelestialPY",
                github: "https://github.com/12Jeef/CelestialPY",
              }}
            >
              A top down space shooter game where you defeat asteroids and
              enemies. Includes in-house self-developed PyGame game engine.
            </Project>
            <Project
              title="Celestial.js"
              img={celestialjs}
              tags={["JS", "Game", "WIP"]}
              urls={{
                main: "https://github.com/12Jeef/CelestialJS",
                github: "https://github.com/12Jeef/CelestialJS",
                open: "https://12jeef.github.io/CelestialJS/",
              }}
            >
              A top down space shooter game where you defeat asteroids and
              enemies. Includes in-house self-developed Javascript game engine.
            </Project>
            <Project
              title="BlobBlast"
              img={blobblast}
              tags={["PY", "PyGame", "Game"]}
              urls={{
                main: "https://github.com/12Jeef/BlobBlast",
                github: "https://github.com/12Jeef/BlobBlast",
              }}
            >
              A unique pixel shooter game with interesting movement mechanics.
              Includes in-house self-developed PyGame game engine.
            </Project>
          </AnimatePresence>
        </section>
      </Page>
    </context.Provider>
  );
}
