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
import Sky from "./Sky";

export const cssBackground = "#000011";
export const materialBackground = "#000022";
export const lightBackground = "#000044";

export type Artwork = {
  name: string;
  file: string;
  date: [number, number, number];
  info: string;
  canvas: HTMLCanvasElement;
};

export type Artworks = { [key: string]: Artwork };

const introDisplay = createIntroDisplay();
const digitalArtDisplay = createDigitalArtDisplay();
const traditionalArtDisplay = createTraditionalArtDisplay();

export type GameParams = {};

export default function Game({}: GameParams) {
  const [digitalArtworks, setDigitalArtworks] = useState<Artworks>({});
  const nDigitalArtworks = Object.keys(digitalArtworks).length;

  useEffect(() => {
    (async () => {
      await new Promise((res) => setTimeout(res, 500));
      const result = await fetch("./art/info-digital.json");
      const json = await result.json();
      let imageLoadTime = 0,
        canvasTime = 0,
        t0 = 0,
        t1 = 0;
      await Promise.all(
        Object.keys(json).map(async (key) => {
          t0 = Date.now();
          const image = await new Promise<HTMLImageElement>((res, rej) => {
            const image = new Image();
            image.addEventListener("load", () => res(image));
            image.addEventListener("error", rej);
            image.src = "./art/" + json[key].file + "_tiny.png";
          });
          t1 = Date.now();
          imageLoadTime += t1 - t0;
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          json[key].canvas = canvas;
          t0 = Date.now();
          canvasTime += t0 - t1;
        }),
      );
      console.log("image load time", imageLoadTime);
      console.log("canvas time", canvasTime);
      setDigitalArtworks(json);
    })();
  }, []);

  const [tutorial, setTutorial] = useState<
    "INTRO" | "LOCK" | "LOOK" | "MOVE" | "DONE" | "RELOCK"
  >("INTRO");
  const [close, setClose] = useState<Artwork | null>(null);
  const [inspect, setInspect] = useState<Artwork | null>(null);

  const [nWalls, setNWalls] = useState(0);
  const onLost = () => setNWalls(nWalls - 1);
  const onFound = () => setNWalls(nWalls + 1);
  const [lost, setLost] = useState(false);
  useEffect(() => {
    if (nWalls > 0) return setLost(false);
    const timeout = setTimeout(() => {
      setLost(true);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [nWalls]);

  const [controls, setControls] = useState<any>(null);

  useEffect(() => {
    if (!inspect) return;
    const onKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.code === "Escape" || e.code === "KeyE") {
        setInspect(null);
        controls.lock();
      }
    };
    document.body.addEventListener("keydown", onKeyDown, true);
    return () => document.body.removeEventListener("keydown", onKeyDown, true);
  }, [inspect, controls]);

  useEffect(() => {
    if (!controls) return;
    if (inspect) controls.unlock();
  }, [inspect, controls]);

  return (
    <div
      className="relative w-full h-full"
      style={{ background: cssBackground }}
    >
      <Canvas
        shadows
        onMouseMove={() => {
          if (tutorial === "LOOK") setTutorial("MOVE");
        }}
      >
        <fogExp2 attach="fog" args={[cssBackground, 0.1]} />
        <ambientLight color={lightBackground} intensity={1} />

        <Sky />

        <PointerLockControls
          ref={setControls}
          enabled={tutorial != "INTRO"}
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
          onIntroDone={() => setTutorial("LOCK")}
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
          onLost={onLost}
          onFound={onFound}
        />
        <Wall
          height={3}
          lights={2}
          position={[-10, 0, 1]}
          rotation={[0, Math.PI / 2, 0]}
          canvas={digitalArtDisplay}
          onLost={onLost}
          onFound={onFound}
        />
        <Wall
          height={3}
          lights={2}
          position={[10, 0, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          canvas={traditionalArtDisplay}
          onLost={onLost}
          onFound={onFound}
        />
        {Object.values(digitalArtworks).map((artwork, i) => (
          <Fragment key={artwork.file}>
            <Wall
              position={[-10, 0, 1 - (i + 1) * 3]}
              rotation={[0, Math.PI / 2, 0]}
              artwork={artwork}
              onClose={() => setClose(artwork)}
              onFar={() => setClose(null)}
              loop={nDigitalArtworks * 3 + 3}
              onLost={onLost}
              onFound={onFound}
            />
            <Wall
              position={[-10, 0, 1 - (i - nDigitalArtworks) * 3]}
              rotation={[0, Math.PI / 2, 0]}
              artwork={artwork}
              onClose={() => setClose(artwork)}
              onFar={() => setClose(null)}
              loop={nDigitalArtworks * 3 + 3}
              onLost={onLost}
              onFound={onFound}
            />
          </Fragment>
        ))}
      </Canvas>
      <div className="absolute top-0 bottom-0 left-0 right-0 edge-blur"></div>
      <div className="absolute bottom-0 left-1/2">
        <AnimatePresence>
          {(tutorial === "LOCK" || tutorial === "RELOCK") && !lost && (
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
          {tutorial === "DONE" && !lost && close && !inspect && (
            <motion.div
              key="inspect"
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
          {(tutorial === "DONE" || tutorial === "RELOCK") &&
            lost &&
            !close &&
            !inspect && (
              <motion.div
                key="lost"
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
                className="absolute left-1/2 -translate-x-1/2 font-black text-xl text-white flex flex-col items-center justify-center gap-4 w-80"
              >
                <span className="italic text-3xl font-light min-w-max">
                  You seem lost
                </span>
                <button
                  className="bg-white rounded-xl text-3xl text-black flex flex-row items-center justify-center px-8 py-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    controls.camera.position.set(0, 0, 5);
                    controls.camera.rotation.set(0, 0, 0);
                  }}
                >
                  GO HOME
                </button>
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
