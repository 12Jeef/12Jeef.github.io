import { Canvas } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import Player from "./Player";
import Wall from "./Wall";
import { Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GiArrowCursor, GiMove } from "react-icons/gi";
import Inspect from "./Inspect";
import {
  createDigitalArtDisplay,
  createIntroDisplay,
  createTraditionalArtDisplay,
} from "./displays";

const background = "#000011";
const lightBackground = "#000044";

export type ArtworkData = {
  name: string;
  file: string;
  date: [number, number, number];
  info: string;
};

export type ArtworkDatas = { [key: string]: ArtworkData };

const introDisplay = createIntroDisplay();
const digitalArtDisplay = createDigitalArtDisplay();
const traditionalArtDisplay = createTraditionalArtDisplay();

export type GameParams = {};

export default function Game({}: GameParams) {
  const [digitalArtworkDatas, setDigitalArtworkDatas] = useState<ArtworkDatas>(
    {},
  );
  const nDigitalArtworks = Object.keys(digitalArtworkDatas).length;

  useEffect(() => {
    (async () => {
      const result = await fetch("./art/info-digital.json");
      const json = await result.json();
      setDigitalArtworkDatas(json);
    })();
  }, []);

  const [tutorial, setTutorial] = useState<
    "LOCK" | "LOOK" | "MOVE" | "DONE" | "RELOCK"
  >("LOCK");
  const [close, setClose] = useState<ArtworkData | null>(null);
  const [inspect, setInspect] = useState<ArtworkData | null>(null);

  const [controls, setControls] = useState<any>(null);

  useEffect(() => {
    if (!inspect) return;
    const onKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.code === "Escape" || e.code === "KeyE") setInspect(null);
    };
    document.body.addEventListener("keydown", onKeyDown, true);
    return () => document.body.removeEventListener("keydown", onKeyDown, true);
  }, [inspect]);

  useEffect(() => {
    if (!controls) return;
    if (inspect) controls.unlock();
  }, [inspect, controls]);

  return (
    <div className="relative w-full h-full" style={{ background }}>
      <Canvas
        className={inspect ? "pointer-events-none" : ""}
        shadows
        onMouseMove={() => {
          if (tutorial === "LOOK") setTutorial("MOVE");
        }}
      >
        <fogExp2 attach="fog" args={[background, 0.1]} />
        <ambientLight color={lightBackground} intensity={1} />

        <PointerLockControls
          ref={setControls}
          onLock={() => {
            if (tutorial === "LOCK") setTutorial("LOOK");
            else if (tutorial === "RELOCK") setTutorial("DONE");
          }}
          onUnlock={() => {
            if (tutorial === "DONE") setTutorial("RELOCK");
            else setTutorial("LOCK");
          }}
        />
        <Player
          onMove={() => {
            if (tutorial === "MOVE") setTutorial("DONE");
          }}
          onInspect={() => setInspect(close)}
          loopDigital={nDigitalArtworks * 3 + 3}
        />

        <Wall
          height={3}
          lights={2}
          position={[0, 0, 0]}
          canvas={introDisplay}
        />
        <Wall
          height={3}
          lights={2}
          position={[-10, 0, 1]}
          rotation={[0, Math.PI / 2, 0]}
          canvas={digitalArtDisplay}
        />
        <Wall
          height={3}
          lights={2}
          position={[10, 0, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          canvas={traditionalArtDisplay}
        />
        {Object.values(digitalArtworkDatas).map((artwork, i) => (
          <Fragment key={artwork.file}>
            <Wall
              position={[-10, 0, 1 - (i + 1) * 3]}
              rotation={[0, Math.PI / 2, 0]}
              artwork={artwork}
              onClose={() => setClose(artwork)}
              onFar={() => setClose(null)}
            />
            <Wall
              position={[-10, 0, 1 - (i - nDigitalArtworks) * 3]}
              rotation={[0, Math.PI / 2, 0]}
              artwork={artwork}
              onClose={() => setClose(artwork)}
              onFar={() => setClose(null)}
            />
          </Fragment>
        ))}
      </Canvas>
      <div className="absolute top-0 bottom-0 left-0 right-0 edge-blur"></div>
      <div className="absolute bottom-0 left-1/2">
        <AnimatePresence>
          {(tutorial === "LOCK" || tutorial === "RELOCK") && (
            <motion.div
              key="LOCK"
              initial={{ bottom: "-4rem", opacity: 0 }}
              animate={{
                bottom: "2rem",
                opacity: 1,
                transition: { duration: 0.5, ease: "easeOut" },
              }}
              exit={{
                bottom: "-4rem",
                opacity: 0,
                transition: { duration: 0.5, ease: "easeOut" },
              }}
              className="absolute left-1/2 -translate-x-1/2 font-black text-xl text-white flex flex-row items-center justify-center gap-4"
            >
              <GiArrowCursor size={100} />
            </motion.div>
          )}
          {tutorial === "LOOK" && (
            <motion.div
              key="LOOK"
              initial={{ bottom: "-4rem", opacity: 0 }}
              animate={{
                bottom: "2rem",
                opacity: 1,
                transition: { duration: 0.5, ease: "easeOut" },
              }}
              exit={{
                bottom: "-4rem",
                opacity: 0,
                transition: { duration: 0.5, ease: "easeOut" },
              }}
              className="absolute left-1/2 -translate-x-1/2 font-black text-xl text-white flex flex-row items-center justify-center gap-4"
            >
              <GiMove size={100} />
            </motion.div>
          )}
          {tutorial === "MOVE" && (
            <motion.div
              key="MOVE"
              initial={{ bottom: "-4rem", opacity: 0 }}
              animate={{
                bottom: "2rem",
                opacity: 1,
                transition: { duration: 0.5, ease: "easeOut" },
              }}
              exit={{
                bottom: "-4rem",
                opacity: 0,
                transition: { duration: 0.5, ease: "easeOut" },
              }}
              className="absolute left-1/2 -translate-x-1/2 font-black text-xl text-white flex flex-row items-center justify-center gap-4"
            >
              <div
                className="grid gap-2 text-3xl text-black"
                style={{
                  gridTemplateRows: "repeat(2, 4rem)",
                  gridTemplateColumns: "repeat(3, 4rem)",
                }}
              >
                <div className=""></div>
                <div className="bg-white rounded-xl flex flex-row items-center justify-center">
                  W
                </div>
                <div className=""></div>
                <div className="bg-white rounded-xl flex flex-row items-center justify-center">
                  A
                </div>
                <div className="bg-white rounded-xl flex flex-row items-center justify-center">
                  S
                </div>
                <div className="bg-white rounded-xl flex flex-row items-center justify-center">
                  D
                </div>
              </div>
            </motion.div>
          )}
          {tutorial === "DONE" && close && !inspect && (
            <motion.div
              key="MOVE"
              initial={{ bottom: "-4rem", opacity: 0 }}
              animate={{
                bottom: "2rem",
                opacity: 1,
                transition: { duration: 0.5, ease: "easeOut" },
              }}
              exit={{
                bottom: "-4rem",
                opacity: 0,
                transition: { duration: 0.5, ease: "easeOut" },
              }}
              className="absolute left-1/2 -translate-x-1/2 font-black text-xl text-white flex flex-row items-center justify-center gap-4"
            >
              <div
                className="bg-white rounded-xl text-3xl text-black flex flex-row items-center justify-center"
                style={{ width: "4rem", height: "4rem" }}
              >
                E
              </div>
              <span className="text-3xl font-light">Inspect</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {inspect && <Inspect artwork={inspect} />}
      </AnimatePresence>
    </div>
  );
}
