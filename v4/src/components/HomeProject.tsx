import { AnimatePresence, motion } from "framer-motion";
import { defaultMotionSpring } from "../features/jiggle";
import { createContext, useContext, useState } from "react";
import { context } from "../main";

export type ProjectContext = {
  description: string | null;
  setDescription: (value: string | null) => void;
};
export const projectContext = createContext<ProjectContext>({
  description: null,
  setDescription: () => {},
});

export type Link = { name: string; href: string };

export type Stat = { amount: string; description: string };

export type HomeProjectProps = {
  title: string;
  role?: string | string[];
  bullets?: string[];
  links?: Link[];
  stats?: Stat[];
  children?: any;
};

export default function HomeProject({
  title,
  role = [],
  bullets = [],
  links = [],
  stats = [],
  children,
}: HomeProjectProps) {
  const { mobile } = useContext(context);
  if (typeof role === "string") role = [role];

  const [description, setDescription] = useState<string | null>(null);

  return (
    <projectContext.Provider value={{ description, setDescription }}>
      <div
        className={`${mobile ? "mb-24" : "h-dvh"} w-full max-w-[90rem] ${mobile ? "px-4" : "px-20"} flex ${mobile ? "flex-col" : "flex-row"} items-center justify-center gap-8`}
      >
        <div
          className={`${mobile ? "w-full max-w-full" : "flex-1"} flex flex-col items-stretch justify-stretch gap-2`}
        >
          <div>{children}</div>
          <div className="relative">
            <AnimatePresence>
              <motion.p
                key={description}
                className="absolute top-0 left-0 min-h-5 -mb-5 text-sm text-fg2 italic"
                initial={{ scale: 0.75, opacity: 0, x: "-12.5%", y: "-50%" }}
                exit={{ scale: 0.75, opacity: 0, x: "-12.5%", y: "-50%" }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  x: "0%",
                  y: "0%",
                  transition: defaultMotionSpring(),
                }}
              >
                {description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        <div className={`${mobile ? "" : "flex-1"}`}>
          <h1 className="flex-1 text-4xl text-fg1 font-breeserif font-black">
            {title}
            <span className="text-a1">.</span>
          </h1>
          <h2 className="text-md text-a1">
            {role.map((r, index) => (
              <>
                {index > 0 && <span className="inline-block mx-2">|</span>}
                <span key={index} className="italic">
                  {r}
                </span>
              </>
            ))}
          </h2>
          {bullets.length > 0 && (
            <ul className="text-sm text-fg2">
              {bullets.map((bullet, index) => (
                <motion.li
                  key={index}
                  className="mt-4 leading-5"
                  initial={{ scale: 0.75, opacity: 0, x: "-12.5%", y: "-50%" }}
                  whileInView={{
                    scale: 1,
                    opacity: 1,
                    x: "0%",
                    y: "0%",
                    transition: defaultMotionSpring({
                      delay: 0.25 + index * 0.1,
                    }),
                  }}
                >
                  {bullet}
                </motion.li>
              ))}
            </ul>
          )}
          {links.length > 0 && (
            <motion.h2
              className="mt-4 text-xs text-a1 flex flex-row items-center justify-start gap-2"
              initial={{ scale: 0.75, opacity: 0, x: "-12.5%", y: "-50%" }}
              whileInView={{
                scale: 1,
                opacity: 1,
                x: "0%",
                y: "0%",
                transition: defaultMotionSpring({
                  delay: 0.25 + bullets.length * 0.1,
                }),
              }}
            >
              {links.map((link, index) => (
                <>
                  {index > 0 && <span className="inline-block">|</span>}
                  <a key={index} href={link.href}>
                    {link.name}
                  </a>
                </>
              ))}
            </motion.h2>
          )}
          {stats.length > 0 && bullets.length > 0 && (
            <motion.div
              className="h-[1px] my-8 bg-mg"
              initial={{ width: "0%" }}
              whileInView={{
                width: "100%",
                transition: defaultMotionSpring({
                  delay: 0.25 + bullets.length * 0.1,
                }),
              }}
            ></motion.div>
          )}
          {stats.length > 0 && (
            <div className="mt-8 flex flex-row items-center justify-start">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="w-40 flex flex-col items-start justify-center text-center gap-2"
                  initial={{ scale: 0.75, opacity: 0, x: "-25%", y: "-25%" }}
                  whileInView={{
                    scale: 1,
                    opacity: 1,
                    x: "0%",
                    y: "0%",
                    transition: defaultMotionSpring({
                      delay: 0.25 + bullets.length * 0.1 + 0.1 + index * 0.1,
                    }),
                  }}
                >
                  <span className="text-4xl font-black text-a1">
                    {stat.amount}
                  </span>
                  <span className="text-xs text-fg2 uppercase font-light">
                    {stat.description}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </projectContext.Provider>
  );
}
