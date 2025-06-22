import * as THREE from "three";

import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";

import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { SAOPass } from "three/examples/jsm/postprocessing/SAOPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";

type vec2 = [number, number];
type vec3 = [number, number, number];

function castOptionalFloat(value: string | undefined): number | undefined {
  if (typeof value !== "string") return undefined;
  return parseFloat(value);
}
function castOptionalInt(value: string | undefined): number | undefined {
  if (typeof value !== "string") return undefined;
  return parseInt(value);
}
function castOptionalBool(value: string | undefined): boolean | undefined {
  if (typeof value !== "string") return undefined;
  return value === "true";
}

// @ts-ignore
const ARTWORKS: string[] = __artworks__;

const stlLoader = new STLLoader();
const texLoader = new THREE.TextureLoader();

type Settings = {
  cameraFov: number;
  cameraNear: number;
  cameraFar: number;

  hemLightIntensity: number;

  fogExp: number;

  saoEnabled: boolean;
  saoBias: number;
  saoIntensity: number;

  playerSize: number;
  playerAccelUPS: number;
  playerVelHalfLifeS: number;
  topSpeed: number;
  topRSpeed: number;

  isNight: boolean;

  skyDayColor: string;
  skyNightColor: string;

  hemLightDayColor: string;
  hemLightNightColor: string;

  wallDayColor: string;
  wallNightColor: string;

  groundDayColor: string;
  groundNightColor: string;

  frameDayColor: string;
  frameNightColor: string;

  textDayColor: string;
  textNightColor: string;

  plantDayColor: string;
  plantNightColor: string;

  hShift: number;
  sShift: number;
  vShift: number;

  chunkSize: number;
  renderDist: number;
  wallHeight: number;
  wallThickness: number;
  railingHeight: number;
  railingThickness: number;
  carpetPatternColor1: number;
  carpetPatternColor2: number;
  carpetPatternSize: number;
  carpetPatternSizeBig: number;
  carpetPatternSizeSmall: number;
  carpetPatternLine: number;
  carpetPatternPadding: number;
  carpetPatterCenterSize: number;
  lightSphereSize: number;
  infoBoxShowRadius: number;
  artworkFrameThickness: number;

  uiArtworkZoom: number;
};

function castSettings(data: any): Settings {
  const settings: Settings = {
    cameraFov: 0,
    cameraNear: 0,
    cameraFar: 0,

    hemLightIntensity: 0,

    fogExp: 0,

    saoEnabled: false,
    saoBias: 0,
    saoIntensity: 0,

    playerSize: 0,
    playerAccelUPS: 0,
    playerVelHalfLifeS: 0,
    topSpeed: 0,
    topRSpeed: 0,

    isNight: false,

    skyDayColor: "",
    skyNightColor: "",

    hemLightDayColor: "",
    hemLightNightColor: "",

    wallDayColor: "",
    wallNightColor: "",

    groundDayColor: "",
    groundNightColor: "",

    frameDayColor: "",
    frameNightColor: "",

    textDayColor: "",
    textNightColor: "",

    plantDayColor: "",
    plantNightColor: "",

    hShift: 0,
    sShift: 0,
    vShift: 0,

    chunkSize: 0,
    renderDist: 0,
    wallHeight: 0,
    wallThickness: 0,
    railingHeight: 0,
    railingThickness: 0,
    carpetPatternColor1: 0,
    carpetPatternColor2: 0,
    carpetPatternSize: 0,
    carpetPatternSizeBig: 0,
    carpetPatternSizeSmall: 0,
    carpetPatternLine: 0,
    carpetPatternPadding: 0,
    carpetPatterCenterSize: 0,
    lightSphereSize: 0,
    infoBoxShowRadius: 0,
    artworkFrameThickness: 0,

    uiArtworkZoom: 0,
  };

  const apply = (
    src: { [key: string]: any } | any[],
    dest: { [key: string]: any } | any[] | null,
  ) => {
    if (Array.isArray(src)) {
      if (!Array.isArray(dest)) return;
      src.push(...dest);
      return;
    }
    if (dest == null) return;
    if (Array.isArray(dest)) return;
    for (const key in dest) {
      if (!(key in settings)) continue;
      if (typeof dest[key] !== typeof src[key]) {
        continue;
      }
      if (typeof src[key] === "object") {
        apply(src[key], dest[key]);
        continue;
      }
      src[key] = dest[key];
    }
  };

  apply(settings, typeof data === "object" ? data : null);

  return settings;
}

type OffsetData = vec3;
type LoopData = {
  x?: number;
  y?: number;
};
type StructureDataData = {
  offset: OffsetData;
  loop: LoopData;
  other: { [key: string]: string };
};
type StructureData = {
  type: string;
  chunk: vec2;
  data: StructureDataData;
};
type StructureDatas = StructureData[];

function castStructures(data: string) {
  const structures: StructureDatas = [];
  for (const line of data.split("\n")) {
    const lineParts = line
      .trim()
      .split(/[\s\t]/)
      .filter((part) => part.length > 0);
    if (lineParts.length <= 0) continue;
    if (lineParts[0].startsWith("#")) continue;
    if (lineParts.length < 3) continue;
    const type = lineParts[0];
    const chunkX = parseFloat(lineParts[1]);
    const chunkY = parseFloat(lineParts[2]);
    const data: StructureDataData = { offset: [0, 0, 0], loop: {}, other: {} };
    for (const kv of lineParts.slice(3)) {
      const kvPair = kv.split("=");
      if (kvPair.length !== 2) continue;
      const [k, v] = kvPair;
      if (k === "x") {
        data.offset[0] = parseFloat(v);
        continue;
      }
      if (k === "y") {
        data.offset[1] = parseFloat(v);
        continue;
      }
      if (k === "z") {
        data.offset[2] = parseFloat(v);
        continue;
      }
      if (k === "loopX") {
        data.loop.x = parseFloat(v);
        continue;
      }
      if (k === "loopY") {
        data.loop.y = parseFloat(v);
        continue;
      }
      data.other[k] = v;
    }
    structures.push({ type, chunk: [chunkX, chunkY], data });
  }
  return structures;
}

type Artwork = {
  name: string;
  date: [number, number, number];
  info: string;
};
type Artworks = { [key: string]: Artwork };

function castArtworks(data: any) {
  const artworks: Artworks = {};
  if (typeof data === "object" && data != null) {
    for (const key in data) {
      const artwork: Artwork = { name: "", date: [0, 0, 0], info: "" };
      const value = data[key];
      if (typeof value === "object" && value != null) {
        for (const key in value) {
          if (key === "name") artwork.name = String(value[key]);
          if (key === "date") {
            if (
              Array.isArray(value[key]) &&
              value[key].length === 3 &&
              Number.isInteger(value[key][0]) &&
              Number.isInteger(value[key][1]) &&
              Number.isInteger(value[key][2])
            ) {
              artwork.date[0] = value[key][0];
              artwork.date[1] = value[key][1];
              artwork.date[2] = value[key][2];
            }
          }
          if (key === "info") artwork.info = String(value[key]);
        }
      }
      artworks[key] = artwork;
    }
  }
  return artworks;
}

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
function getArtworkDate(date: [number, number, number]) {
  return (MONTHS[date[1]] ?? String(date[1])) + " " + date[2] + " " + date[0];
}

function cleanJSON(text: string) {
  return JSON.parse(
    text
      .split("\n")
      .map((line) => line.split("//")[0])
      .join("\n"),
  );
}

function hsvShiftColor(
  color: THREE.Color,
  hShift: number,
  sShift: number,
  vShift: number,
) {
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  hsl.h += hShift;
  hsl.s += sShift;
  hsl.l -= vShift;
  const fullTurn = 2 * Math.PI;
  hsl.h = ((hsl.h % fullTurn) + fullTurn) % fullTurn;
  hsl.s = Math.min(1, Math.max(0, hsl.s));
  hsl.l = Math.min(1, Math.max(0, hsl.l));
  color.setHSL(hsl.h, hsl.s, hsl.l);
}

const main = async () => {
  const settingsResp = await fetch("./settings.json");
  const settings = castSettings(cleanJSON(await settingsResp.text()));

  const structuresResp = await fetch("./structures.txt");
  const structures = castStructures(await structuresResp.text());

  const artworksResp = await fetch("./assets/art/info.json");
  const artworks = castArtworks(cleanJSON(await artworksResp.text()));

  const ARCHGEOMETRY = await stlLoader.loadAsync("./assets/arch.stl");
  const BAMBOOGEOMETRY = await stlLoader.loadAsync("./assets/bamboo.stl");

  const canvas = document.querySelector("body > canvas");
  if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas not found");

  const cssOverlay = document.querySelector("body > div.css-overlay");
  if (!(cssOverlay instanceof HTMLElement))
    throw new Error("CSS Overlay not found");

  const hud = document.querySelector("body > div.hud");
  if (!(hud instanceof HTMLElement)) throw new Error("HUD not found");

  const hudInspectBtn = hud.querySelector(":scope > div.inspect > button");
  if (!(hudInspectBtn instanceof HTMLButtonElement))
    throw new Error("HUD Inspect Button not found");

  const ui = document.querySelector("body > div.ui");
  if (!(ui instanceof HTMLElement)) throw new Error("UI not found");

  const uiArtwork = ui.querySelector(":scope > div.artwork");
  if (!(uiArtwork instanceof HTMLElement))
    throw new Error("UI Artwork not found");

  const uiArtworkImage = uiArtwork.querySelector(":scope > img");
  if (!(uiArtworkImage instanceof HTMLImageElement))
    throw new Error("UI Artwork Image not found");

  const uiPlacard = ui.querySelector(":scope > div.placard");
  if (!(uiPlacard instanceof HTMLElement))
    throw new Error("UI Placard not found");

  const uiPlacardTitle = uiPlacard.querySelector(":scope > h1");
  if (!(uiPlacardTitle instanceof HTMLElement))
    throw new Error("UI Placard Title not found");

  const uiPlacardDate = uiPlacard.querySelector(":scope > h3");
  if (!(uiPlacardDate instanceof HTMLElement))
    throw new Error("UI Placard Date not found");

  const uiPlacardInfo = uiPlacard.querySelector(":scope > p");
  if (!(uiPlacardInfo instanceof HTMLElement))
    throw new Error("UI Placard Info not found");

  const keysDown = new Set();
  const keysJustDown = new Set();
  const keysJustUp = new Set();
  document.body.addEventListener("keydown", (e) => {
    keysDown.add(e.code);
    keysJustDown.add(e.code);
  });
  document.body.addEventListener("keyup", (e) => {
    keysDown.delete(e.code);
    keysJustUp.add(e.code);
  });

  const skyColor = new THREE.Color(
    settings.isNight ? settings.skyNightColor : settings.skyDayColor,
  );
  const hemLightColor = new THREE.Color(
    settings.isNight ? settings.hemLightNightColor : settings.hemLightDayColor,
  );
  const wallColor = new THREE.Color(
    settings.isNight ? settings.wallNightColor : settings.wallDayColor,
  );
  const groundColor = new THREE.Color(
    settings.isNight ? settings.groundNightColor : settings.groundDayColor,
  );
  const frameColor = new THREE.Color(
    settings.isNight ? settings.frameNightColor : settings.frameDayColor,
  );
  const textColor = new THREE.Color(
    settings.isNight ? settings.textNightColor : settings.textDayColor,
  );
  const plantColor = new THREE.Color(
    settings.isNight ? settings.plantNightColor : settings.plantDayColor,
  );

  document.body.style.setProperty("--sky-color", "#" + skyColor.getHexString());
  document.body.style.setProperty(
    "--hem-light-color",
    "#" + hemLightColor.getHexString(),
  );
  document.body.style.setProperty(
    "--wall-color",
    "#" + wallColor.getHexString(),
  );
  document.body.style.setProperty(
    "--ground-color",
    "#" + groundColor.getHexString(),
  );
  document.body.style.setProperty(
    "--frame-color",
    "#" + frameColor.getHexString(),
  );
  document.body.style.setProperty(
    "--text-color",
    "#" + textColor.getHexString(),
  );
  document.body.style.setProperty(
    "--plant-color",
    "#" + plantColor.getHexString(),
  );

  const wallColorShifted = new THREE.Color(wallColor);
  hsvShiftColor(
    wallColorShifted,
    settings.hShift,
    settings.sShift,
    settings.vShift,
  );

  const groundColorShifted = new THREE.Color(wallColor);
  hsvShiftColor(
    groundColorShifted,
    settings.hShift,
    settings.sShift,
    settings.vShift,
  );

  const color = new THREE.Color();

  const wallTextureCanvas = document.createElement("canvas");
  const wallCtx = wallTextureCanvas.getContext("2d");
  if (!wallCtx) throw new Error("Could not get context 2d");
  wallCtx.canvas.width = wallCtx.canvas.height = 100;
  for (let x = 0; x < 100; x++) {
    for (let y = 0; y < 100; y++) {
      color.set(0xffffff);
      color.lerp(wallColorShifted, Math.random() ** 5);
      wallCtx.fillStyle = "#" + color.getHexString();
      wallCtx.fillRect(x * 1, y * 1, 1, 1);
    }
  }

  const groundTextureCanvas = document.createElement("canvas");
  const groundCtx = groundTextureCanvas.getContext("2d");
  if (!groundCtx) throw new Error("Could not get context 2d");
  groundCtx.canvas.width = groundCtx.canvas.height = 100;
  for (let x = 0; x < 100; x++) {
    for (let y = 0; y < 100; y++) {
      color.set(0xffffff);
      color.lerp(wallColorShifted, Math.random() * 0.75);
      groundCtx.fillStyle = "#" + color.getHexString();
      groundCtx.fillRect(x * 1, y * 1, 1, 1);
    }
  }

  const WALLTEXTURE = new THREE.CanvasTexture(wallTextureCanvas);
  WALLTEXTURE.repeat.set(2, 2);
  WALLTEXTURE.wrapS = THREE.RepeatWrapping;
  WALLTEXTURE.wrapT = THREE.RepeatWrapping;

  const GROUNDTEXTURE = new THREE.CanvasTexture(groundTextureCanvas);
  GROUNDTEXTURE.repeat.set(20, 20);
  GROUNDTEXTURE.wrapS = THREE.RepeatWrapping;
  GROUNDTEXTURE.wrapT = THREE.RepeatWrapping;

  const WALLMATERIAL = new THREE.MeshLambertMaterial({
    color: wallColor,
  });
  const WALLMATERIALTEXTURED = new THREE.MeshLambertMaterial({
    color: wallColor,
    map: WALLTEXTURE,
  });
  const GROUNDMATERIAL = new THREE.MeshLambertMaterial({
    color: groundColor,
    map: GROUNDTEXTURE,
  });
  const FRAMEMATERIAL = new THREE.MeshLambertMaterial({
    color: frameColor,
  });
  const PLANTMATERIAL = new THREE.MeshLambertMaterial({
    color: plantColor,
  });

  type StructureConstructorData = { offset?: OffsetData; loop?: LoopData };
  class Structure {
    private static readonly _structures: Structure[] = [];
    public static get structures() {
      return [...this._structures];
    }
    public static update(delta: number) {
      this._structures.forEach((structure) => structure.update(delta));
    }

    public readonly chunkX;
    public readonly chunkY;

    public readonly offsetX;
    public readonly offsetY;
    public readonly offsetZ;

    public readonly loopX;
    public readonly loopY;

    protected readonly object;

    constructor(chunk: vec2, data?: StructureConstructorData) {
      Structure._structures.push(this);

      [this.chunkX, this.chunkY] = chunk;

      this.offsetX = data?.offset ? data?.offset[0] : 0;
      this.offsetY = data?.offset ? data?.offset[1] : 0;
      this.offsetZ = data?.offset ? data?.offset[2] : 0;

      this.loopX = data?.loop?.x;
      this.loopY = data?.loop?.y;

      this.object = new THREE.Object3D();
      scene.add(this.object);
    }

    public get x() {
      return this.getRealChunk()[0] * settings.chunkSize + this.offsetX;
    }
    public get y() {
      return this.getRealChunk()[1] * settings.chunkSize + this.offsetY;
    }
    public get z() {
      return this.offsetZ;
    }

    public get collider(): {
      x: number;
      y: number;
      w: number;
      h: number;
      type: string;
    } | null {
      return null;
    }

    public getRealChunk(): vec2 {
      const chunkX = Math.round(camera.position.x / settings.chunkSize);
      const chunkY = Math.round(camera.position.z / settings.chunkSize);
      let realChunkX = this.chunkX,
        realChunkY = this.chunkY;
      if (this.loopX) {
        const x = Math.round(chunkX / this.loopX);
        let dist = Infinity;
        for (let i = -1; i <= 1; i++) {
          let realChunkXI = this.chunkX + (x + i) * this.loopX;
          if (Math.abs(realChunkXI - chunkX) < dist) {
            dist = Math.abs(realChunkXI - chunkX);
            realChunkX = realChunkXI;
          }
        }
      }
      if (this.loopY) {
        const y = Math.round(chunkY / this.loopY);
        let dist = Infinity;
        for (let i = -1; i <= 1; i++) {
          let realChunkYI = this.chunkY + (y + i) * this.loopY;
          if (Math.abs(realChunkYI - chunkY) < dist) {
            dist = Math.abs(realChunkYI - chunkY);
            realChunkY = realChunkYI;
          }
        }
      }
      return [realChunkX, realChunkY];
    }

    public update(delta: number) {
      const [chunkX, chunkY] = this.getRealChunk();
      const camChunkX = Math.round(camera.position.x / settings.chunkSize);
      const camChunkY = Math.round(camera.position.z / settings.chunkSize);
      this.object.visible =
        Math.abs(chunkX - camChunkX) <= settings.renderDist &&
        Math.abs(chunkY - camChunkY) <= settings.renderDist;
      this.object.position.set(this.x, this.z, this.y);
    }
  }

  class SolidStructure extends Structure {
    protected colliderWidth;
    protected colliderHeight;

    constructor(chunk: vec2, size: vec2, data?: StructureConstructorData) {
      super(chunk, data);

      [this.colliderWidth, this.colliderHeight] = size;
    }

    public get collider() {
      return {
        x: this.x,
        y: this.y,
        w: this.colliderWidth,
        h: this.colliderHeight,
        type: "solid",
      };
    }
  }

  class Wall extends SolidStructure {
    private static readonly geometryCache: {
      [key: number]: { [key: number]: THREE.BoxGeometry };
    } = {};
    private static getSize(scale: number) {
      return settings.wallThickness * (1 + scale);
    }
    private static getHeight(scale: number) {
      return settings.wallHeight * (1 + scale);
    }
    private static getGeometry(size: number, height: number) {
      if (!(size in this.geometryCache)) this.geometryCache[size] = {};
      if (!(height in this.geometryCache[size]))
        this.geometryCache[size][height] = new THREE.BoxGeometry(
          settings.chunkSize,
          height,
          size,
        );
      return this.geometryCache[size][height];
    }

    public readonly facing;
    public readonly size;
    public readonly height;

    public readonly pillar1: Pillar | null;
    public readonly pillar2: Pillar | null;

    constructor(
      chunk: vec2,
      options: {
        facing?: "x" | "y";
        sizeScale?: number;
        heightScale?: number;
        pillar1?: boolean;
        pillar2?: boolean;
      },
      data?: StructureConstructorData,
    ) {
      const facing = options.facing ?? "x";
      const size = Wall.getSize(options.sizeScale ?? 0);
      const height = Wall.getHeight(options.heightScale ?? 0);

      let colliderSize: vec2 = [settings.chunkSize, size];
      let pillarOffset = [settings.chunkSize / 2, 0];
      if (facing === "y") {
        colliderSize.reverse();
        pillarOffset.reverse();
      }

      super(chunk, colliderSize, data);

      this.facing = facing;
      this.size = size;
      this.height = height;

      if (facing === "y") this.object.rotateY(Math.PI / 2);

      const plane = new THREE.Mesh(
        Wall.getGeometry(size, height),
        new Array(6).fill(WALLMATERIALTEXTURED),
      );
      plane.position.set(0, height / 2, 0);
      plane.receiveShadow = true;
      plane.castShadow = true;
      this.object.add(plane);

      if (options.pillar1 ?? true) {
        this.pillar1 = new Pillar(chunk, options, {
          offset: [
            this.offsetX + pillarOffset[0],
            this.offsetY + pillarOffset[1],
            this.offsetZ,
          ],
          loop: data?.loop,
        });
      } else this.pillar1 = null;

      if (options.pillar2 ?? true) {
        this.pillar2 = new Pillar(chunk, options, {
          offset: [
            this.offsetX + pillarOffset[0],
            this.offsetY + pillarOffset[1],
            this.offsetZ,
          ],
          loop: data?.loop,
        });
      } else this.pillar2 = null;
    }
  }

  class Pillar extends SolidStructure {
    private static readonly geometryCache: {
      [key: number]: { [key: number]: THREE.BoxGeometry };
    } = {};
    private static getSize(scale: number) {
      return settings.wallThickness * (2 + scale);
    }
    private static getHeight(scale: number) {
      return settings.wallThickness + settings.wallHeight * (1 + scale);
    }
    private static getGeometry(size: number, height: number) {
      if (!(size in this.geometryCache)) this.geometryCache[size] = {};
      if (!(height in this.geometryCache[size]))
        this.geometryCache[size][height] = new THREE.BoxGeometry(
          size,
          height,
          size,
        );
      return this.geometryCache[size][height];
    }

    public readonly size;
    public readonly height;

    constructor(
      chunk: vec2,
      options: {
        sizeScale?: number;
        heightScale?: number;
      },
      data?: StructureConstructorData,
    ) {
      const size = Pillar.getSize(options.sizeScale ?? 0);
      const height = Pillar.getHeight(options.heightScale ?? 0);

      super(chunk, [size, size], data);

      this.size = size;
      this.height = height;

      const pillar = new THREE.Mesh(
        Pillar.getGeometry(size, height),
        WALLMATERIAL,
      );
      pillar.position.set(0, height / 2, 0);
      pillar.receiveShadow = true;
      pillar.castShadow = true;
      this.object.add(pillar);
    }
  }

  class Railing extends SolidStructure {
    private static readonly geometryCache: {
      beam: { [key: number]: THREE.BoxGeometry };
      pillar: { [key: number]: { [key: number]: THREE.BoxGeometry } };
    } = { beam: {}, pillar: {} };
    private static getBeamTopSize(scale: number) {
      return settings.railingThickness * (1.5 + scale);
    }
    private static getBeamBottomSize(scale: number) {
      return settings.railingThickness * (1 + scale);
    }
    private static getPillarSize(scale: number) {
      return settings.railingThickness * (0.75 + scale);
    }
    private static getPillarHeight(scale: number) {
      return settings.railingHeight * (1 + scale);
    }
    private static getBeamGeometry(size: number) {
      if (!(size in this.geometryCache.beam))
        this.geometryCache.beam[size] = new THREE.BoxGeometry(
          settings.chunkSize,
          size,
          size,
        );
      return this.geometryCache.beam[size];
    }
    private static getPillarGeometry(size: number, height: number) {
      if (!(size in this.geometryCache.pillar))
        this.geometryCache.pillar[size] = {};
      if (!(height in this.geometryCache.pillar[size]))
        this.geometryCache.pillar[size][height] = new THREE.BoxGeometry(
          size,
          height,
          size,
        );
      return this.geometryCache.pillar[size][height];
    }

    public readonly facing;
    public readonly beamTopSize;
    public readonly beamBottomSize;
    public readonly pillarSize;
    public readonly pillarHeight;
    public readonly n;

    constructor(
      chunk: vec2,
      options: {
        facing?: "x" | "y";
        sizeScale?: number;
        heightScale?: number;
        n?: number;
      },
      data?: StructureConstructorData,
    ) {
      const facing = options.facing ?? "x";
      const beamTopSize = Railing.getBeamTopSize(options.sizeScale ?? 0);
      const beamBottomSize = Railing.getBeamBottomSize(options.sizeScale ?? 0);
      const pillarSize = Railing.getPillarSize(options.sizeScale ?? 0);
      const pillarHeight = Railing.getPillarHeight(options.heightScale ?? 0);
      const n = options.n ?? 12;

      let colliderSize: vec2 = [
        settings.chunkSize,
        Math.max(beamTopSize, beamBottomSize, pillarSize),
      ];
      if (facing === "y") {
        colliderSize.reverse();
      }

      super(chunk, colliderSize, data);

      this.facing = facing;
      this.beamTopSize = beamTopSize;
      this.beamBottomSize = beamBottomSize;
      this.pillarSize = pillarSize;
      this.pillarHeight = pillarHeight;
      this.n = n;

      if (facing === "y") this.object.rotateY(Math.PI / 2);

      const beamTop = new THREE.Mesh(
        Railing.getBeamGeometry(beamTopSize),
        WALLMATERIAL,
      );
      beamTop.position.set(0, pillarHeight, 0);
      beamTop.receiveShadow = true;
      beamTop.castShadow = true;
      this.object.add(beamTop);

      const beamBottom = new THREE.Mesh(
        Railing.getBeamGeometry(beamBottomSize),
        WALLMATERIAL,
      );
      beamBottom.position.set(0, beamBottomSize / 2, 0);
      beamBottom.receiveShadow = true;
      beamBottom.castShadow = true;
      this.object.add(beamBottom);

      for (let i = 0; i < n; i++) {
        let rx = (settings.chunkSize / n) * (i + 0.5) - settings.chunkSize / 2;
        const pillar = new THREE.Mesh(
          Railing.getPillarGeometry(pillarSize, pillarHeight),
          new Array(6).fill(WALLMATERIALTEXTURED),
        );
        pillar.position.set(rx, pillarHeight / 2, 0);
        pillar.receiveShadow = true;
        pillar.castShadow = true;
        this.object.add(pillar);
      }
    }
  }

  class Arch extends Structure {
    public readonly facing;

    constructor(
      chunk: vec2,
      options: {
        facing?: "x" | "y";
      },
      data?: StructureConstructorData,
    ) {
      const facing = options.facing ?? "x";

      super(chunk, data);

      this.facing = facing;

      if (facing === "y") this.object.rotateY(Math.PI / 2);

      const arch = new THREE.Mesh(ARCHGEOMETRY, WALLMATERIAL);
      const archBBox = new THREE.Box3().setFromObject(arch);
      const axisSizes = [
        archBBox.max.x - archBBox.min.x,
        archBBox.max.y - archBBox.min.y,
        archBBox.max.z - archBBox.min.z,
      ];
      axisSizes.sort((a, b) => a - b);
      const scale = (settings.chunkSize / axisSizes[1]) * 1.1;
      arch.scale.set(scale, scale, scale);
      arch.receiveShadow = true;
      arch.castShadow = true;
      this.object.add(arch);
    }
  }

  class Bamboo extends Structure {
    public readonly facing;
    public readonly scale;

    constructor(
      chunk: vec2,
      options: {
        facing?: "x" | "y";
        scale?: number;
      },
      data?: StructureConstructorData,
    ) {
      const facing = options.facing ?? "x";
      let scale = options.scale ?? 1;

      super(chunk, data);

      this.facing = facing;
      this.scale = scale;

      if (facing === "y") this.object.rotateY(Math.PI / 2);

      const bamboo = new THREE.Mesh(BAMBOOGEOMETRY, PLANTMATERIAL);
      const bambooBBox = new THREE.Box3().setFromObject(bamboo);
      const bambooSizes = [
        bambooBBox.max.x - bambooBBox.min.x,
        bambooBBox.max.y - bambooBBox.min.y,
        bambooBBox.max.z - bambooBBox.min.z,
      ];
      bambooSizes.sort((a, b) => a - b);
      scale *=
        (settings.wallThickness * 8) / ((bambooSizes[0] + bambooSizes[1]) / 2);
      bamboo.scale.set(scale, scale, scale);
      bamboo.receiveShadow = true;
      bamboo.castShadow = true;
      this.object.add(bamboo);
    }
  }

  class Carpet extends Structure {
    private static readonly geometryCache: {
      [key: number]: { [key: number]: THREE.PlaneGeometry };
    } = {};
    private static getSize(scale: number) {
      return settings.chunkSize * (0.65 + scale);
    }
    private static getGeometry(width: number, height: number) {
      if (!(width in this.geometryCache)) this.geometryCache[width] = {};
      if (!(height in this.geometryCache[width]))
        this.geometryCache[width][height] = new THREE.PlaneGeometry(
          width,
          height,
        );
      return this.geometryCache[width][height];
    }

    private static readonly textureCache: {
      centerless: { [key: number]: { [key: number]: THREE.CanvasTexture } };
      center: { [key: number]: { [key: number]: THREE.CanvasTexture } };
    } = { center: {}, centerless: {} };
    private static getTexture(width: number, height: number, center = false) {
      const cache = center
        ? this.textureCache.center
        : this.textureCache.centerless;
      if (!(width in cache)) cache[width] = {};
      if (!(height in cache[width])) {
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(width * settings.carpetPatternSize);
        canvas.height = Math.ceil(height * settings.carpetPatternSize);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          color.set(0xffffff);
          color.lerp(wallColor, settings.carpetPatternColor2);
          ctx.fillStyle = "#" + color.getHexString();
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const sizeBig = settings.carpetPatternSizeBig;
          const sizeSmall = settings.carpetPatternSizeSmall;
          color.set(0xffffff);
          color.lerp(wallColor, settings.carpetPatternColor1);
          ctx.strokeStyle = "#" + color.getHexString();
          ctx.lineWidth = settings.carpetPatternLine;
          ctx.beginPath();
          const nX = Math.ceil(canvas.width / (sizeBig + sizeSmall)) + 2;
          const nY = Math.ceil(canvas.height / (sizeBig + sizeSmall)) + 2;
          for (let iX = 0; iX < nX; iX++) {
            for (let iY = 0; iY < nY; iY++) {
              const x =
                (iX - (nX - 1) / 2) * (sizeBig + sizeSmall) + canvas.width / 2;
              const y =
                (iY - (nY - 1) / 2) * (sizeBig + sizeSmall) + canvas.height / 2;
              const points = [];
              for (let i = 0; i < 4; i++) {
                const forwardX = [1, 0, -1, 0][i];
                const forwardY = [0, 1, 0, -1][i];
                const rightX = [0, -1, 0, 1][i];
                const rightY = [1, 0, -1, 0][i];
                for (const side of [-1, 1])
                  points.push([
                    forwardX * (sizeBig / 2 + sizeSmall) +
                      rightX * (sizeBig / 2 - sizeSmall) * side,
                    forwardY * (sizeBig / 2 + sizeSmall) +
                      rightY * (sizeBig / 2 - sizeSmall) * side,
                  ]);
              }
              for (let i = 0; i <= points.length; i++) {
                let [px, py] = points[i % points.length];
                px += x;
                py += y;
                if (i > 0) ctx.lineTo(px, py);
                else ctx.moveTo(px, py);
              }
            }
          }
          ctx.stroke();
          const padding = settings.carpetPatternPadding;
          ctx.fillRect(0, 0, padding, canvas.height);
          ctx.fillRect(0, 0, canvas.width, padding);
          ctx.fillRect(canvas.width - padding, 0, padding, canvas.height);
          ctx.fillRect(0, canvas.height - padding, canvas.width, padding);
          for (const factor of [1, settings.carpetPatternLine / 2 / padding]) {
            ctx.beginPath();
            ctx.moveTo(padding * factor, padding * factor);
            ctx.lineTo(canvas.width - padding * factor, padding * factor);
            ctx.lineTo(
              canvas.width - padding * factor,
              canvas.height - padding * factor,
            );
            ctx.lineTo(padding * factor, canvas.height - padding * factor);
            ctx.closePath();
            ctx.stroke();
          }
          if (center) {
            const centerSize = settings.carpetPatterCenterSize;
            ctx.beginPath();
            ctx.arc(
              canvas.width / 2,
              canvas.height / 2,
              centerSize / 2,
              0,
              2 * Math.PI,
            );
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(
              canvas.width / 2,
              canvas.height / 2,
              (centerSize / 2) * 0.9,
              0,
              2 * Math.PI,
            );
            ctx.closePath();
            ctx.stroke();
          }
        }
        cache[width][height] = new THREE.CanvasTexture(canvas);
      }
      return cache[width][height];
    }

    private static readonly materialCache: {
      [key: number]: { [key: number]: THREE.MeshLambertMaterial };
    } = {};
    private static getMaterial(width: number, height: number, center = false) {
      if (!(width in this.materialCache)) this.materialCache[width] = {};
      if (!(height in this.materialCache[width]))
        this.materialCache[width][height] = new THREE.MeshLambertMaterial({
          color: wallColor,
          map: this.getTexture(width, height, center),
        });
      return this.materialCache[width][height];
    }

    public readonly width;
    public readonly height;

    constructor(
      chunk: vec2,
      options: { widthScale?: number; heightScale?: number; center?: boolean },
      data?: StructureConstructorData,
    ) {
      const width = Carpet.getSize(options.widthScale ?? 0);
      const height = Carpet.getSize(options.heightScale ?? 0);
      const center = options.center ?? false;

      super(chunk, data);

      this.width = width;
      this.height = height;

      const carpet = new THREE.Mesh(
        Carpet.getGeometry(width, height),
        Carpet.getMaterial(width, height, center),
      );
      carpet.rotateX(-Math.PI / 2);
      carpet.position.set(0, 0.05, 0);
      carpet.receiveShadow = true;
      this.object.add(carpet);
    }
  }

  class PLight extends Structure {
    private static readonly geometryCache: {
      [key: number]: THREE.SphereGeometry;
    } = {};
    private static getRadius(scale: number) {
      return settings.lightSphereSize * scale;
    }
    private static getGeometry(radius: number) {
      if (!(radius in this.geometryCache))
        this.geometryCache[radius] = new THREE.SphereGeometry(radius, 24, 24);
      return this.geometryCache[radius];
    }

    public readonly color;
    public readonly intensity;
    public readonly distance;
    public readonly decay;
    public readonly radius;

    constructor(
      chunk: vec2,
      options: {
        color?: string;
        intensity?: number;
        distance?: number;
        decay?: number;
        radius?: number;
      },
      data?: StructureConstructorData,
    ) {
      const color = new THREE.Color(options.color ?? "#ffffff");
      const invColor = new THREE.Color(color);
      const intensity = options.intensity ?? 1;
      const distance = options.distance ?? 3;
      const decay = options.decay ?? 0.75;
      const radius = PLight.getRadius(options.radius ?? 1);

      super(chunk, data);

      this.color = color;
      this.intensity = intensity;
      this.distance = distance;
      this.decay = decay;
      this.radius = radius;

      const light = new THREE.PointLight(color, intensity, distance, decay);
      light.castShadow = true;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      light.shadow.camera.near = 0.1;
      light.shadow.camera.far = 10;
      this.object.add(light);

      const sphere = new THREE.Mesh(
        PLight.getGeometry(radius),
        new THREE.MeshBasicMaterial({ color: invColor }),
      );
      this.object.add(sphere);
    }
  }

  class InfoBox extends Structure {
    public readonly elem;
    private scale;

    constructor(
      chunk: vec2,
      options: {
        text?: string;
        type?: string;
      },
      data?: StructureConstructorData,
    ) {
      const text = (options.text ?? "").replaceAll("\\s", " ");
      const type = options.type ?? "span";

      super(chunk, data);

      const elem = document.createElement("div");
      const ielem = (this.elem = document.createElement(type));
      ielem.classList.add("infobox");
      ielem.textContent = text;
      elem.appendChild(ielem);

      const obj = new CSS2DObject(elem);
      this.object.add(obj);

      this.scale = 0;
    }

    public update(delta: number): void {
      super.update(delta);

      this.elem.style.transform = "scale(" + this.scale + ")";
      const dist = this.object.position.distanceTo(camera.position);
      this.scale += (+(dist < settings.infoBoxShowRadius) - this.scale) * 0.1;
    }
  }

  class Artwork extends Structure {
    private static readonly geometryCache: {
      horizontal: { [key: number]: THREE.BoxGeometry };
      vertical: { [key: number]: THREE.BoxGeometry };
    } = { horizontal: {}, vertical: {} };
    private static getFrameHGeo(size: number) {
      if (!(size in this.geometryCache.horizontal))
        this.geometryCache.horizontal[size] = new THREE.BoxGeometry(
          size + settings.artworkFrameThickness * 2,
          settings.artworkFrameThickness,
          settings.artworkFrameThickness,
        );
      return this.geometryCache.horizontal[size];
    }
    private static getFrameVGeo(size: number) {
      if (!(size in this.geometryCache.vertical))
        this.geometryCache.vertical[size] = new THREE.BoxGeometry(
          settings.artworkFrameThickness,
          size + settings.artworkFrameThickness * 2,
          settings.artworkFrameThickness,
        );
      return this.geometryCache.vertical[size];
    }

    public readonly facing;
    public readonly name;
    public readonly maxWidth;
    public readonly maxHeight;

    private width;
    private height;

    constructor(
      chunk: vec2,
      options: {
        facing?: "x+" | "x-" | "y+" | "y-";
        name?: string;
        maxWidth?: number;
        maxHeight?: number;
      },
      data?: StructureConstructorData,
    ) {
      const facing = options.facing ?? "x+";
      const name = options.name ?? "";
      const maxWidth = options.maxWidth ?? settings.chunkSize * 0.65;
      const maxHeight = options.maxHeight ?? settings.wallHeight * 0.65;

      super(chunk, data);

      this.facing = facing;
      this.name = name;
      this.maxWidth = maxWidth;
      this.maxHeight = maxHeight;

      const angle =
        facing === "x+"
          ? -Math.PI / 2
          : facing === "x-"
          ? (-3 * Math.PI) / 2
          : facing === "y+"
          ? 0
          : Math.PI;

      this.object.rotateY(angle);

      this.width = this.height = 0;

      (async () => {
        const { width, height, scale, canvas } = await (async () => {
          if (name in artworkCache) return artworkCache[name];
          const canvas = document.createElement("canvas");
          const { width, height, scale } = (await new Promise((res, rej) => {
            const offCanvas = canvas.transferControlToOffscreen();
            const worker = new Worker("./worker.js");
            worker.addEventListener("message", (e) => res(e.data));
            worker.addEventListener("error", (e) => rej(e));
            worker.postMessage(
              { name, maxWidth, maxHeight, canvas: offCanvas },
              [offCanvas],
            );
          })) as { width: number; height: number; scale: number };
          return (artworkCache[name] = { width, height, scale, canvas });
        })();

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;

        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(width * scale, height * scale),
          new THREE.MeshBasicMaterial({ map: tex, color: 0xffffff }),
        );
        this.object.add(plane);

        const hGeo = Artwork.getFrameHGeo(width * scale);
        const vGeo = Artwork.getFrameVGeo(height * scale);

        const frameH1 = new THREE.Mesh(hGeo, FRAMEMATERIAL);
        frameH1.position.set(
          0,
          (height * scale + settings.artworkFrameThickness) / 2,
          0,
        );
        frameH1.receiveShadow = true;
        frameH1.castShadow = true;
        this.object.add(frameH1);

        const frameH2 = new THREE.Mesh(hGeo, FRAMEMATERIAL);
        frameH2.position.set(
          0,
          -(height * scale + settings.artworkFrameThickness) / 2,
          0,
        );
        frameH2.receiveShadow = true;
        frameH2.castShadow = true;
        this.object.add(frameH2);

        const frameV1 = new THREE.Mesh(vGeo, FRAMEMATERIAL);
        frameV1.position.set(
          (width * scale + settings.artworkFrameThickness) / 2,
          0,
          0,
        );
        frameV1.receiveShadow = true;
        frameV1.castShadow = true;
        this.object.add(frameV1);

        const frameV2 = new THREE.Mesh(vGeo, FRAMEMATERIAL);
        frameV2.position.set(
          -(width * scale + settings.artworkFrameThickness) / 2,
          0,
          0,
        );
        frameV2.receiveShadow = true;
        frameV2.castShadow = true;
        this.object.add(frameV2);

        if (name in artworks) {
          const artwork = artworks[name];

          new InfoBox(
            chunk,
            {
              text: artwork.name,
              type: "h2",
            },
            {
              offset: [
                this.offsetX,
                this.offsetY,
                this.offsetZ - (height * scale) / 2 - 0.2,
              ],
              loop: data?.loop,
            },
          );
          new InfoBox(
            chunk,
            {
              text: getArtworkDate(artwork.date),
              type: "h6",
            },
            {
              offset: [
                this.offsetX,
                this.offsetY,
                this.offsetZ - (height * scale) / 2 - 0.3,
              ],
              loop: data?.loop,
            },
          );

          this.width = width * scale;
          this.height = height * scale;
        }
      })();
    }

    public get collider() {
      return {
        x: this.x,
        y: this.y,
        w:
          this.facing[0] === "x"
            ? settings.artworkFrameThickness * 6
            : this.width * 1.5,
        h:
          this.facing[0] === "x"
            ? this.width * 1.5
            : settings.artworkFrameThickness * 6,
        type: "artwork:" + this.name,
      };
    }
  }

  class Portal extends Structure {
    private static readonly portals: { [key: string]: Portal } = {};
    public static getPortal(id: string) {
      return id in this.portals ? this.portals[id] : null;
    }

    public readonly id;
    public readonly linkId;
    public readonly facing;
    public readonly normal;

    public colliding;

    constructor(
      chunk: vec2,
      options: {
        id?: string;
        linkId?: string;
        facing?: "x+" | "x-" | "y+" | "y-";
      },
      data?: StructureConstructorData,
    ) {
      const id = options.id ?? "";
      const linkId = options.linkId ?? "";
      const facing = options.facing ?? "x+";

      super(chunk, data);

      this.id = id;
      this.linkId = linkId;
      this.facing = facing;
      this.normal = new THREE.Vector2();
      if (this.facing[0] === "x") this.normal.x = 1;
      else this.normal.y = 1;
      if (this.facing[1] === "-") this.normal.multiplyScalar(-1);

      Portal.portals[this.id] = this;

      this.colliding = false;
    }

    public get collider() {
      return {
        x: this.x,
        y: this.y,
        w:
          this.facing[0] === "x"
            ? settings.chunkSize
            : settings.wallThickness * 0.25,
        h:
          this.facing[0] === "x"
            ? settings.wallThickness * 0.25
            : settings.chunkSize,
        type: "portal:" + this.id + ">" + this.linkId,
      };
    }
  }

  const artworkCache: {
    [key: string]: {
      width: number;
      height: number;
      scale: number;
      canvas: HTMLCanvasElement;
    };
  } = {};

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);

  const cssRenderer = new CSS2DRenderer({
    element: cssOverlay,
  });

  const camera = new THREE.PerspectiveCamera(
    settings.cameraFov,
    1,
    settings.cameraNear,
    settings.cameraFar,
  );
  camera.position.set(0, 1, 0);
  camera.lookAt(camera.position.x, camera.position.y, camera.position.z + 1);

  const controller = new PointerLockControls(camera, renderer.domElement);
  document.body.addEventListener("click", (e) => {
    if (e.target instanceof Node)
      if (hud.contains(e.target) || ui.contains(e.target)) return;
    controller.lock();
  });

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(skyColor);

  const fog = new THREE.FogExp2(skyColor, settings.fogExp);
  scene.fog = fog;

  const hemLight = new THREE.AmbientLight(
    hemLightColor,
    settings.hemLightIntensity,
  );
  scene.add(hemLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    GROUNDMATERIAL,
  );
  ground.position.set(0, 0, 0);
  ground.rotateX(-Math.PI / 2);
  ground.castShadow = true;
  ground.receiveShadow = true;
  scene.add(ground);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const saoPass = new SAOPass(scene, camera);
  saoPass.params.saoBias = settings.saoBias;
  saoPass.params.saoIntensity = settings.saoIntensity;
  composer.addPass(saoPass);
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    composer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", onResize);
  onResize();

  const cameraHeadingVector = new THREE.Vector3();

  const origin2 = new THREE.Vector2(0, 0);

  const playerCollider = [settings.playerSize, settings.playerSize];
  const camCentricAccel = new THREE.Vector2();
  const worldAccel = new THREE.Vector2();
  const worldVel = new THREE.Vector2();
  let camElevation = 0;
  let xyz0 = [camera.position.x, camera.position.y, camera.position.z];
  let rxyz0 = [camera.rotation.x, camera.rotation.y, camera.rotation.z];

  let activeArtwork: string | null = null;

  structures.forEach(({ type, chunk, data }) => {
    if (type === "wall") {
      const facing = data.other.facing;
      return new Wall(
        chunk,
        {
          facing: facing === "x" ? "x" : facing === "y" ? "y" : undefined,
          sizeScale: castOptionalFloat(data.other.size),
          heightScale: castOptionalFloat(data.other.height),
          pillar1: castOptionalBool(data.other.p1),
          pillar2: castOptionalBool(data.other.p2),
        },
        data,
      );
    }
    if (type === "pillar") {
      return new Pillar(
        chunk,
        {
          sizeScale: castOptionalFloat(data.other.size),
          heightScale: castOptionalFloat(data.other.height),
        },
        data,
      );
    }
    if (type === "rail") {
      const facing = data.other.facing;
      return new Railing(
        chunk,
        {
          facing: facing === "x" ? "x" : facing === "y" ? "y" : undefined,
          sizeScale: castOptionalFloat(data.other.size),
          heightScale: castOptionalFloat(data.other.height),
          n: castOptionalInt(data.other.n),
        },
        data,
      );
    }
    if (type === "arch") {
      const facing = data.other.facing;
      return new Arch(
        chunk,
        {
          facing: facing === "x" ? "x" : facing === "y" ? "y" : undefined,
        },
        data,
      );
    }
    if (type === "bamboo") {
      const facing = data.other.facing;
      return new Bamboo(
        chunk,
        {
          facing: facing === "x" ? "x" : facing === "y" ? "y" : undefined,
          scale: castOptionalFloat(data.other.scale),
        },
        data,
      );
    }
    if (type === "carpet") {
      return new Carpet(
        chunk,
        {
          widthScale: castOptionalFloat(data.other.width),
          heightScale: castOptionalFloat(data.other.height),
          center: castOptionalBool(data.other.center),
        },
        data,
      );
    }
    if (type === "plight") {
      return new PLight(
        chunk,
        {
          color: data.other.color,
          intensity: castOptionalFloat(data.other.intensity),
          distance: castOptionalFloat(data.other.distance),
          decay: castOptionalFloat(data.other.decay),
          radius: castOptionalFloat(data.other.radius),
        },
        data,
      );
    }
    if (type === "infobox") {
      return new InfoBox(
        chunk,
        {
          text: data.other.text,
          type: data.other.type,
        },
        data,
      );
    }
    if (type === "art") {
      const facing = data.other.facing;
      return new Artwork(
        chunk,
        {
          facing:
            facing === "x+"
              ? "x+"
              : facing === "x-"
              ? "x-"
              : facing === "y+"
              ? "y+"
              : facing === "y-"
              ? "y-"
              : undefined,
          name: data.other.name,
          maxWidth: castOptionalFloat(data.other.width),
          maxHeight: castOptionalFloat(data.other.height),
        },
        data,
      );
    }
    if (type === "portal") {
      return;
      const facing = data.other.facing;
      return new Portal(
        chunk,
        {
          id: data.other.id,
          linkId: data.other.linkId,
          facing:
            facing === "x+"
              ? "x+"
              : facing === "x-"
              ? "x-"
              : facing === "y+"
              ? "y+"
              : facing === "y-"
              ? "y-"
              : undefined,
        },
        data,
      );
    }
  });

  const removeAllCanvases = () => {
    for (const name in artworkCache) artworkCache[name].canvas.remove();
  };
  const setArtworkCanvas = (name: string) => {
    removeAllCanvases();
    if (!(name in artworkCache)) return;
    uiArtwork.appendChild(artworkCache[name].canvas);
  };

  hudInspectBtn.addEventListener("click", (e) => {
    if (ui.classList.contains("this")) {
      controller.lock();
      ui.classList.remove("this");
      removeAllCanvases();
    } else {
      controller.unlock();
      ui.classList.add("this");
      uiArtworkImage.src = "./assets/art/" + (activeArtwork ?? "") + ".png";
      uiArtworkImage.style.display = "none";
      if (activeArtwork != null && activeArtwork in artworks) {
        const artwork = artworks[activeArtwork];
        uiPlacardTitle.textContent = artwork.name;
        uiPlacardDate.textContent = getArtworkDate(artwork.date);
        uiPlacardInfo.textContent = artwork.info;
      } else {
        uiPlacardTitle.textContent = "Untitled";
        uiPlacardDate.textContent = "•";
        uiPlacardInfo.textContent = "... ... ... ...";
      }
      setArtworkCanvas(activeArtwork ?? "");
    }
  });

  uiArtworkImage.addEventListener("load", (e) => {
    uiArtworkImage.style.display = "";
    removeAllCanvases();
  });

  let artworkX = 0,
    artworkY = 0,
    artworkZ = 1;
  let artworkW = 0,
    artworkH = 0;
  const getArtworkTransformScale = () => {
    const xScale = (window.innerWidth - 40) / artworkW;
    const yScale = (window.innerHeight - 40) / artworkH;
    return Math.min(xScale, yScale);
  };
  const getArtworkTransform = () => {
    const scale = getArtworkTransformScale();
    let x = artworkX * artworkW;
    let y = artworkY * artworkH;
    let z = scale * artworkZ;
    return "scale(" + z + ") translate(" + -x + "px, " + -y + "px)";
  };
  const updateArtworkXYZ = () => {
    const scale = getArtworkTransformScale();
    let artworkMouseX = (mouseX - window.innerWidth / 2) / (artworkW * scale);
    let artworkMouseY = (mouseY - window.innerHeight / 2) / (artworkH * scale);
    artworkZ += (1 + settings.uiArtworkZoom * +mouseDown - artworkZ) * 0.1;
    artworkX += (artworkMouseX * +mouseDown - artworkX) * 0.1;
    artworkY += (artworkMouseY * +mouseDown - artworkY) * 0.1;
  };
  let mouseDown = false;
  let mouseX = 0,
    mouseY = 0;
  uiArtwork.addEventListener("mousedown", (e) => {
    mouseDown = true;
  });
  uiArtwork.addEventListener("mousemove", (e) => {
    mouseX = e.pageX;
    mouseY = e.pageY;
  });
  uiArtwork.addEventListener("mouseup", (e) => {
    mouseDown = false;
  });

  let t0 = Date.now();
  const update = () => {
    window.requestAnimationFrame(update);
    let t1 = Date.now();
    const delta = t1 - t0;

    activeArtwork = null;

    if (controller.isLocked) {
      controller.getDirection(cameraHeadingVector);
      const azimuth = Math.atan2(cameraHeadingVector.z, cameraHeadingVector.x);

      camCentricAccel.x = +keysDown.has("KeyD") - +keysDown.has("KeyA");
      camCentricAccel.y = +keysDown.has("KeyW") - +keysDown.has("KeyS");

      if (camCentricAccel.x && camCentricAccel.y) camCentricAccel.normalize();

      camCentricAccel.multiplyScalar(settings.playerAccelUPS);
      if (keysDown.has("Space")) {
        camCentricAccel.multiplyScalar(2);
      } else if (keysDown.has("ShiftLeft") || keysDown.has("ShiftRight")) {
        camCentricAccel.multiplyScalar(0.25);
      }
      camCentricAccel.multiplyScalar(delta / 1000);

      worldAccel.copy(camCentricAccel.rotateAround(origin2, -azimuth));
      worldVel.add(worldAccel);
    }

    worldVel.x *= 0.5 ** (delta / 1000 / settings.playerVelHalfLifeS);
    worldVel.y *= 0.5 ** (delta / 1000 / settings.playerVelHalfLifeS);

    camera.position.x += worldVel.y * (delta / 10);
    camera.position.z += worldVel.x * (delta / 10);

    let [playerX, playerY] = [camera.position.x, camera.position.z];
    const [playerW, playerH] = playerCollider;
    for (const structure of Structure.structures) {
      const collider = structure.collider;
      if (!collider) continue;
      const { x, y, w, h, type } = collider;
      if (type === "solid") {
        let shiftX = (playerW + w) / 2 - Math.abs(playerX - x);
        let shiftY = (playerH + h) / 2 - Math.abs(playerY - y);
        if (shiftX <= 0) continue;
        if (shiftY <= 0) continue;
        let shiftXSign = 2 * +(playerX > x) - 1;
        let shiftYSign = 2 * +(playerY > y) - 1;
        if (shiftX < shiftY) {
          playerX += shiftX * shiftXSign;
          worldVel.y = 0;
        } else {
          playerY += shiftY * shiftYSign;
          worldVel.x = 0;
        }
        continue;
      }
      if (type.startsWith("artwork:")) {
        if (Math.abs(playerX - x) >= (playerW + w) / 2) continue;
        if (Math.abs(playerY - y) >= (playerH + h) / 2) continue;
        activeArtwork = type.slice("artwork:".length);
        continue;
      }
      if (type.startsWith("portal:")) {
        if (Math.abs(playerX - x) >= (playerW + w) / 2) {
          if (structure instanceof Portal) structure.colliding = false;
          continue;
        }
        if (Math.abs(playerY - y) >= (playerH + h) / 2) {
          if (structure instanceof Portal) structure.colliding = false;
          continue;
        }
        if (structure instanceof Portal) if (structure.colliding) continue;
        const ids = type.slice("portal:".length).split(">");
        if (ids.length !== 2) {
          if (structure instanceof Portal) structure.colliding = false;
          continue;
        }
        const [fromId, toId] = ids;
        const fromPortal = Portal.getPortal(fromId);
        if (!fromPortal) continue;
        const toPortal = Portal.getPortal(toId);
        if (!toPortal) continue;

        const fromPortalNormal = fromPortal.normal;
        const toPortalNormal = toPortal.normal;
        const angleShift = toPortalNormal.angle() - fromPortalNormal.angle();

        const portalOffset = new THREE.Vector2(
          playerX - fromPortal.x,
          playerY - fromPortal.y,
        );
        portalOffset.rotateAround({ x: 0, y: 0 }, angleShift);
        playerX = portalOffset.x + toPortal.x;
        playerY = portalOffset.y + toPortal.y;

        fromPortal.colliding = toPortal.colliding = true;

        worldVel.rotateAround({ x: 0, y: 0 }, angleShift);
        continue;
      }
    }
    [camera.position.x, camera.position.z] = [playerX, playerY];

    let camWantedElevation = 1;
    if (keysDown.has("Space")) camWantedElevation += 0.5;
    if (keysDown.has("ShiftLeft") || keysDown.has("ShiftRight"))
      camWantedElevation -= 0.5;
    camElevation += (camWantedElevation - camElevation) * 0.1;
    camera.position.y = camElevation;

    Structure.update(delta);

    let xyz1 = [camera.position.x, camera.position.y, camera.position.z];
    let rxyz1 = [camera.rotation.x, camera.rotation.y, camera.rotation.z];
    let speed = 0,
      rspeed = 0;
    for (let i = 0; i < 3; i++) {
      speed += (xyz1[i] - xyz0[i]) ** 2;
      rspeed += (rxyz1[i] - rxyz0[i]) ** 2;
    }
    speed = Math.sqrt(speed) / (delta / 10);
    rspeed = Math.sqrt(rspeed) / (delta / 10);
    xyz0 = xyz1;
    rxyz0 = rxyz1;

    let scale = Math.max(1, 1.25 - (speed / settings.topSpeed) * 0.25);
    let blurPX = Math.min(1, rspeed / settings.topRSpeed) * 10;
    // document.body.style.setProperty("--scale", String(scale));
    // document.body.style.setProperty("--blur-px", blurPX + "px");

    if (ui.classList.contains("this")) {
      hud.classList.remove("inspecting");
      if (
        ui.classList.contains("this") &&
        (keysJustDown.has("KeyE") || keysJustDown.has("Escape"))
      )
        hudInspectBtn.click();
      if (uiArtworkImage.style.display === "none") {
        if (activeArtwork != null && activeArtwork in artworkCache) {
          const canvas = artworkCache[activeArtwork].canvas;
          artworkW = canvas.width;
          artworkH = canvas.height;
          canvas.style.transform = getArtworkTransform();
        }
      } else {
        artworkW = uiArtworkImage.width;
        artworkH = uiArtworkImage.height;
        uiArtworkImage.style.transform = getArtworkTransform();
      }
      updateArtworkXYZ();
    } else if (activeArtwork == null) {
      hud.classList.remove("inspecting");
    } else {
      hud.classList.add("inspecting");
      if (keysJustDown.has("KeyE")) hudInspectBtn.click();
    }

    controller.update(delta);

    if (settings.saoEnabled) composer.render(delta);
    else renderer.render(scene, camera);
    cssRenderer.render(scene, camera);

    keysJustDown.clear();
    keysJustUp.clear();

    t0 = t1;
  };
  update();
};

main();
