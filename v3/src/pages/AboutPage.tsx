import { motion, type MotionNodeOptions } from "framer-motion";
import PageTitle from "../components/PageTitle";
import picture from "../assets/picture.png";
import {
  defaultChildProps,
  defaultChildVariants,
  defaultMotionSpring,
  defaultParentProps,
  useJiggle,
} from "../features/jiggle";
import type { HTMLAttributes } from "react";
import { Link } from "react-router-dom";
import JiggleButtonLink from "../components/JiggleButtonLink";
import art from "../assets/art/art.png";
import Page from "../components/Page";

function Section({
  header,
  className = "",
  children,
  ...props
}: { header: string } & HTMLAttributes<HTMLElement> & MotionNodeOptions) {
  return (
    <motion.section
      className={`w-full lg:w-[40rem] max-w-[40rem] flex flex-col items-stretch justify-start gap-10 mt-50 ${className}`}
      {...props}
    >
      <motion.h1
        className="text-a1 text-5xl font-black lowercase"
        initial={{ scale: 0.75, opacity: 0 }}
        whileInView={{
          scale: 1,
          opacity: 1,
          transition: defaultMotionSpring({}),
        }}
        style={{ transformOrigin: "0 0" }}
      >
        {header}
      </motion.h1>
      {children}
    </motion.section>
  );
}

export default function AboutPage() {
  const [imgJiggleX, imgJiggleY, imgSetScale, _] = useJiggle({
    initial: 0,
  });

  const programmingRepertoire = [
    { name: "Python", href: "https://www.python.org/" },
    {
      name: "Javascript",
      href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    },
    { name: "Node.js", href: "https://nodejs.org/" },
    { name: "Electron.js", href: "https://www.electronjs.org/" },
    { name: "Three.js", href: "https://threejs.org/" },
    { name: "Typescript", href: "https://www.typescriptlang.org/" },
    { name: "React", href: "https://react.dev/" },
    { name: "Redux", href: "https://redux.js.org/" },
    { name: "RTKQ", href: "https://redux-toolkit.js.org/rtk-query/overview" },
    { name: "Tailwind", href: "https://tailwindcss.com/" },
    { name: "Framer-Motion", href: "https://motion.dev/" },
    { name: "Java", href: "https://www.java.com/" },
    {
      name: "GLSL",
      href: "https://en.wikipedia.org/wiki/OpenGL_Shading_Language",
    },
  ];

  const awards = [
    {
      name: "FRC Auto Award",
      href: "https://www.firstinspires.org/resource-library/frc/awards-based-on-machine-creativity-innovation",
    },
    { name: "USACO Silver", href: "https://usaco.org/" },
    {
      name: "AIME Qualifier",
      href: "https://maa.org/math-competitions/american-invitational-mathematics-examination-aime",
      suffix: "2023",
    },
    {
      name: "Congressional Art Honorable Mention",
      href: "https://eshoo.house.gov/services/art-competition",
      suffix: "2023/2024",
    },
    {
      name: "Congressional App Honorable Mention",
      href: "https://www.congressionalappchallenge.us/",
      suffix: "2023",
    },
    {
      name: "Scholastic Art Gold Key",
      href: "https://www.artandwriting.org/",
      suffix: "x4",
    },
    {
      name: "Scholastic Art Silver Key",
      href: "https://www.artandwriting.org/",
      suffix: "x2",
    },
    {
      name: "PVSA",
      href: "https://presidentialserviceawards.gov/",
      suffix: "2023",
    },
    {
      name: "COSMOS",
      href: "https://cosmos-ucop.ucdavis.edu/app/main",
      suffix: "2024",
    },
    {
      name: "Paly High Biology H Award",
      href: "",
      suffix: "2023",
    },
    {
      name: "Paly High Chemistry H Award",
      href: "",
      suffix: "2025",
    },
    {
      name: "Paly High AP Physics C Award",
      href: "",
      suffix: "2025",
    },
  ];

  return (
    <Page key="AboutPage">
      <PageTitle>'bout me</PageTitle>
      <motion.section className="flex flex-col lg:flex-row items-start justify-start gap-10 mt-10">
        <motion.div
          initial={{ y: "-50%", rotate: -15 }}
          whileInView={{
            y: "0%",
            rotate: 0,
            transition: defaultMotionSpring({}),
          }}
          exit={{ y: "-50%", rotate: -15 }}
        >
          <div
            className="relative rounded-[5rem] overflow-hidden select-none cursor-pointer"
            style={{
              transform: `scale(${imgJiggleX}, ${imgJiggleY})`,
            }}
            onMouseEnter={() => imgSetScale(1.05)}
            onMouseLeave={() => imgSetScale(1)}
          >
            <img className="w-[20rem] z-[-1]" src={picture} />
            <div
              className="absolute top-0 left-0 bottom-0 right-0 rounded-[5rem]"
              style={{
                boxShadow: "inset 0 0 5rem var(--color-a1aa)",
              }}
            ></div>
          </div>
        </motion.div>
        <motion.section
          className="max-w-[30rem] text-fg2 text-[1.25rem] flex flex-col gap-6"
          {...defaultParentProps({ delay: 0.1, type: "in-view" })}
        >
          <motion.p {...defaultChildProps({})}>
            Oh hi! My name's{" "}
            <span className="text-a1 font-bold">Jeffrey Fan</span>, but I've
            been called many things throughout my life. Notably, Jeef, Jeremy,
            Jeremiah, Jamal, and weirdly enough, Greg.
          </motion.p>
          <motion.p {...defaultChildProps({})}>
            That's my hand-drawn profile pic! You'll see me online with this as
            my icon!
          </motion.p>
        </motion.section>
      </motion.section>
      <Section header="Programming">
        <motion.section
          className="text-fg2 text-[1.25rem] flex flex-col gap-6"
          {...defaultParentProps({ type: "in-view" })}
        >
          <motion.p {...defaultChildProps({})}>
            I started programming in 2018 (8th grade) in{" "}
            <a href="https://scratch.mit.edu/">Scratch</a> before teaching
            myself Python and <a href="https://www.pygame.org/docs/">PyGame</a>,
            just so I could continue making games just as I had in Scratch.
          </motion.p>
          <motion.p {...defaultChildProps({})}>
            Following the game-dev dream, I started doing web development, since
            JS ran much faster than my hard-to-package and slow Python games.
          </motion.p>
          <motion.p {...defaultChildProps({})}>
            Since then, I've diversified into many{" "}
            <span className="italic">many</span> fields of programming. This
            includes algorithm studies from competitive programming,
            mathematical and computational models/simulations of biological
            systems, and physical modeling of robots and robot control.
          </motion.p>
          <motion.p {...defaultChildProps({})}>
            I elaborate much more in my <Link to="/projects">projects</Link>{" "}
            page.
          </motion.p>
          <motion.p {...defaultChildProps({})}>
            Here's my programming repertoire:
          </motion.p>
          <motion.section
            className="flex flex-row items-center justify-center gap-4 flex-wrap"
            {...defaultParentProps({
              delay: 0.5,
              stagger: 0.5 / programmingRepertoire.length,
              type: "in-view",
            })}
          >
            {programmingRepertoire.map(({ name, href }, i) => (
              <motion.span key={i} variants={defaultChildVariants({})}>
                <JiggleButtonLink key={i} href={href} className="lowercase">
                  {name}
                </JiggleButtonLink>
              </motion.span>
            ))}
          </motion.section>
        </motion.section>
      </Section>
      <Section header="Art">
        <motion.section
          className="text-fg2 text-[1.25rem] flex flex-col gap-6"
          {...defaultParentProps({ type: "in-view" })}
        >
          <motion.p {...defaultChildProps({})}>
            I've been drawing since I was 4, and since then I have never
            stopped. It's hard to explain what I've achieved since it has been
            much more of a personal journey for me. I learned to express myself
            in a variety of styles, from hyperrealistic to simplified cartoons
            and caricatures.
          </motion.p>
          <motion.p {...defaultChildProps({})}>
            There's no real point in me elaborating more; go check out my{" "}
            <a href="https://12jeef.github.io/gallery/">gallery</a> instead! As
            the saying goes, "a picture is worth a thousand words."
          </motion.p>
          <motion.div {...defaultChildProps({})}>
            <div
              className="relative h-[20rem] overflow-hidden rounded-[5rem] cursor-pointer"
              onMouseEnter={() => imgSetScale(1.05)}
              onMouseLeave={() => imgSetScale(1)}
              style={{
                transform: `scale(${imgJiggleX}, ${imgJiggleY})`,
              }}
            >
              <img className="mt-[-50%]" src={art} />
              <div
                className="absolute top-0 left-0 bottom-0 right-0"
                style={{ boxShadow: "inset 0 0 5rem var(--color-a1aa)" }}
              ></div>
            </div>
          </motion.div>
          <motion.p
            className="text-fg2a text-[1rem] text-center"
            {...defaultChildProps({})}
          >
            Art I did for my profile picture!
          </motion.p>
        </motion.section>
      </Section>
      <Section header="Awards">
        <motion.section
          className="text-fg2 text-[1.25rem] flex flex-col gap-6"
          {...defaultParentProps({ type: "in-view" })}
        >
          <motion.p {...defaultChildProps({})}>
            Boy don't we love awards! I got a few too!
          </motion.p>
          <motion.section
            className="flex flex-row items-center justify-center gap-4 flex-wrap"
            {...defaultParentProps({
              delay: 0.1,
              stagger: 0.5 / awards.length,
              type: "in-view",
            })}
          >
            {awards.map(({ name, href, suffix }, i) => (
              <motion.span key={i} {...defaultChildProps({})}>
                <JiggleButtonLink key={i} href={href} className="lowercase">
                  {name}
                  {suffix && <span className="opacity-50 ml-3">{suffix}</span>}
                </JiggleButtonLink>
              </motion.span>
            ))}
          </motion.section>
        </motion.section>
      </Section>
    </Page>
  );
}
