import PageTitle from "../components/PageTitle";
import Page from "../components/Page";
import { type HTMLAttributes } from "react";
import JiggleButton from "../components/JiggleButton";
import { AnimatePresence, motion, type MotionNodeOptions } from "motion/react";
import {
  defaultChildProps,
  defaultChildVariants,
  defaultMotionSpring,
  defaultParentProps,
} from "../features/jiggle";
import { useNavigate } from "react-router-dom";

type PaneName = "frc" | "sssip" | "cosmos" | "acf" | "lbl";
const paneNames: PaneName[] = ["frc", "sssip", "cosmos", "acf", "lbl"];

function Ul({
  delay,
  ...props
}: { delay?: number } & HTMLAttributes<HTMLUListElement> & MotionNodeOptions) {
  return <motion.ul {...props} {...defaultParentProps({ delay })} />;
}

function Li({ ...props }: HTMLAttributes<HTMLLIElement> & MotionNodeOptions) {
  return <motion.li {...props} {...defaultChildProps({})} />;
}

function Pane({
  title,
  location,
  locationUrl = "",
  time,
  children,
  className = "",
  ...props
}: {
  title: string;
  location: string;
  locationUrl?: string;
  time: string;
} & HTMLAttributes<HTMLElement> &
  MotionNodeOptions) {
  return (
    <motion.section
      className={`absolute top-0 left-0 right-0 flex flex-col gap-2 ${className}`}
      initial={{ scale: 0.75, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, transition: defaultMotionSpring({}) }}
      exit={{ scale: 0.75, opacity: 0 }}
      style={{
        transformOrigin: "0 0",
      }}
      {...props}
    >
      <h1 className="text-2xl flex flex-row gap-3">
        <span className="font-black text-fg1">{title}</span>
        <span className="font-light text-fg2a">@</span>
        <span className="font-bold">
          <a href={locationUrl}>{location}</a>
        </span>
      </h1>
      <h3 className="text-2xl font-light text-fg2a italic">{time}</h3>
      {children}
    </motion.section>
  );
}

export type ActivitiesPageProps = { pane?: string };

export default function ActivitiesPage({ pane: thePane }: ActivitiesPageProps) {
  const navigate = useNavigate();

  const pane = (thePane ?? "frc") as PaneName;

  return (
    <Page key="ActivitiesPage" className="h-full">
      <PageTitle>Activities</PageTitle>
      <section className="w-full max-w-[60rem] h-full max-h-full mt-10 flex flex-row">
        <section className="relative w-[12.5rem] h-full">
          <motion.nav
            className="absolute top-0 left-0 bottom-0 right-0 overflow-auto p-4 flex flex-col items-stretch justify-start gap-2"
            {...defaultParentProps({})}
          >
            {paneNames.map((name) => (
              <motion.div
                key={name}
                className="relative w-full"
                variants={defaultChildVariants({})}
              >
                <JiggleButton
                  showBackground={false}
                  className="w-full"
                  onClick={() => navigate(`/activities/${name}`)}
                >
                  {name}
                </JiggleButton>
                {pane === name && (
                  <JiggleButton
                    showBackground={true}
                    className="absolute top-0 left-0 bottom-0 right-0 pointer-events-none"
                    layoutId="underline"
                    id="underline"
                    transition={defaultMotionSpring({})}
                  ></JiggleButton>
                )}
              </motion.div>
            ))}
          </motion.nav>
        </section>
        <section className="relative w-full h-full">
          <article className="absolute top-0 left-0 bottom-0 right-0 overflow-auto">
            <AnimatePresence>
              {pane === "frc" && (
                <Pane
                  key="frc"
                  title="Software Captain"
                  location="FIRST Robotics Competition"
                  locationUrl="https://www.team6036.com/"
                  time="August 2023 - Present"
                >
                  <Ul delay={0.3} className="text-fg2">
                    <Li>Management of a team of over 30 software recruits</Li>
                    <Li>Robot competes in 3 annual regionals</Li>
                    <Li>2025: Top 15 in California, top 120 in the world</Li>
                    <Li>Created a robust robot development environment</Li>
                    <Ul delay={0.5}>
                      <Li>
                        Necessary debugging and tuning tools built in for rapid
                        testing in the short 2-month season
                      </Li>
                      <Li>
                        Modularity and collaboration-focused software
                        architecture promotes sustainability
                      </Li>
                      <Li>
                        Versatile custom library speeds up development tenfold
                      </Li>
                    </Ul>
                    <Li>
                      Created a front-end application for interaction with the
                      robot during a competition
                    </Li>
                    <Li>
                      Developed entire{" "}
                      <a href="https://ppatrol.vercel.app/">scouting system</a>{" "}
                      for information gathering during FIRST competitions
                    </Li>
                  </Ul>
                </Pane>
              )}
              {pane === "sssip" && (
                <Pane
                  key="sssip"
                  title="Lab Group Lead"
                  location="Stanford Summer Science Intership Program"
                  locationUrl=""
                  time="Summer 2023"
                >
                  <Ul delay={0.3} className="text-fg2">
                    <Li>
                      Led lab group of 4 through experiments and data gathering
                    </Li>
                    <Li>
                      Organized and designed final{" "}
                      <a href="https://docs.google.com/presentation/d/1sAsadl8qCEeEIsuwh-oJhNrDyNXjPEzXEM6Vq-zhWQ0/edit?usp=sharing">
                        presentation
                      </a>{" "}
                      to Stanford professors
                    </Li>
                    <Li>
                      Developed image processing algorithm (and later an{" "}
                      <a href="https://cell-luminex.vercel.app/">app</a>) to
                      count transfected cells, which surprised camp mentors
                    </Li>
                  </Ul>
                </Pane>
              )}
              {pane === "cosmos" && (
                <Pane
                  key="cosmos"
                  title="Project Group Lead"
                  location="UCD COSMOS Cluster 9"
                  locationUrl="https://cosmos.sf.ucdavis.edu/cluster-9-mathematical-modeling-biological-systems"
                  time="Summer 2024"
                >
                  <Ul delay={0.3} className="text-fg2">
                    <Li>
                      Led group of 4 through modeling numerous biological
                      systems
                    </Li>
                    <Li>
                      Created{" "}
                      <a href="https://jbiotech.vercel.app/">
                        front-end application
                      </a>{" "}
                      capable of simulating numerous mathematical models
                    </Li>
                    <Ul delay={0.4}>
                      <Li>
                        Fitz-Nagumo neuron and heart action potential model
                      </Li>
                      <Li>
                        Gierer-Meinhardt animal coat pattern formation model
                      </Li>
                      <Li>Boid and Viseck flocking model</Li>
                    </Ul>
                    <Li>
                      Presented an analysis on Gierer-Meinhardt pattern
                      amplification frequency related to initial empirical model
                      parameters to professors
                    </Li>
                    <Li>
                      Wrote a{" "}
                      <a href="https://docs.google.com/document/d/1SKy9RJ6pgksgf8ciz8WO9G5OPDivu7E0d7HNQqSzUJY/edit?usp=sharing">
                        writeup
                      </a>{" "}
                      of our discoveries and learning process
                    </Li>
                  </Ul>
                </Pane>
              )}
              {pane === "acf" && (
                <Pane
                  key="acf"
                  title="Development Lead"
                  location="ACF"
                  locationUrl="https://www.applied-computing.org/"
                  time="2022 - 2024"
                >
                  <Ul delay={0.3} className="text-fg2">
                    <Li>
                      Solely created a{" "}
                      <a href="https://github.com/Noteblast/noteblast">
                        full-stack application called Noteblast
                      </a>
                      providing musicians with free instrument tuning and
                      built-in sightreading gameplay
                    </Li>
                    <Li>
                      <a href="https://www.congressionalappchallenge.us/">
                        Congressional App Challenge
                      </a>{" "}
                      Honorable mention
                    </Li>
                    <Li>
                      <a href="https://www.svttt.org/">SVTTT</a> 9th Summit
                      participant
                    </Li>
                    <Li>
                      <a href="https://www.fic.applied-computing.org/">FIC</a>{" "}
                      Honorable mention
                    </Li>
                    <Li>
                      Author of{" "}
                      <a href="https://www.jsr.org/hs/index.php/path/article/view/6235">
                        published paper
                      </a>{" "}
                      about music and education sustainability in JSR
                    </Li>
                  </Ul>
                </Pane>
              )}
              {pane === "lbl" && (
                <Pane
                  key="lbl"
                  title="General Intern"
                  location="LBL"
                  locationUrl="https://scienceit-docs.lbl.gov/hpc/"
                  time="2024"
                >
                  <Ul delay={0.3} className="text-fg2">
                    <Li>
                      Operated on a large scale with supercomputing to evaluate
                      mathematical optimization tasks
                    </Li>
                    <Li>
                      Performed geometric optimization and frequency analysis of
                      molecules to determine reaction efficiency
                    </Li>
                    <Li>
                      Worked on succinct{" "}
                      <a href="https://en.wikipedia.org/wiki/Command-line_interface">
                        CL
                      </a>{" "}
                      tool for batch submitting and tracking repetitive tasks to{" "}
                      <a href="https://slurm.schedmd.com/documentation.html">
                        slurm
                      </a>
                    </Li>
                    <Li>
                      Performed staticstical analysis of DNA structures using{" "}
                      <a href="https://charmm-gui.org/?doc=lecture&module=scientific&lesson=9">
                        alternate coordinate representations
                      </a>{" "}
                      to determine their{" "}
                      <a href="https://en.wikipedia.org/wiki/DNA#Alternative_DNA_structures">
                        forms
                      </a>
                    </Li>
                  </Ul>
                </Pane>
              )}
            </AnimatePresence>
          </article>
        </section>
      </section>
    </Page>
  );
}
