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
  frameDayColor: string;
  frameNightColor: string;
  textDayColor: string;
  textNightColor: string;
  plantDayColor: string;
  plantNightColor: string;

  hShift: number;

  chunkSize: number;
  renderDist: number;
  wallHeight: number;
  wallThickness: number;
  railingHeight: number;
  railingThickness: number;
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
    frameDayColor: "",
    frameNightColor: "",
    textDayColor: "",
    textNightColor: "",
    plantDayColor: "",
    plantNightColor: "",

    hShift: 0,

    chunkSize: 0,
    renderDist: 0,
    wallHeight: 0,
    wallThickness: 0,
    railingHeight: 0,
    railingThickness: 0,
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

type StructureData = {
  x: number;
  y: number;
  z: number;
  other: { [key: string]: string };
};
type Structure = {
  type: string;
  chunkX: number;
  chunkY: number;
  data: StructureData;
};
type Structures = Structure[];

function castStructures(data: string) {
  const structures: Structures = [];
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
    const data: StructureData = { x: 0, y: 0, z: 0, other: {} };
    for (const kv of lineParts.slice(3)) {
      const kvPair = kv.split("=");
      if (kvPair.length !== 2) continue;
      const [k, v] = kvPair;
      if (k === "x") {
        data.x = parseFloat(v);
        continue;
      }
      if (k === "y") {
        data.y = parseFloat(v);
        continue;
      }
      if (k === "z") {
        data.z = parseFloat(v);
        continue;
      }
      data.other[k] = v;
    }
    structures.push({ type, chunkX, chunkY, data });
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

const main = async () => {
  const settingsResp = await fetch("./settings.json");
  const settings = castSettings(await settingsResp.json());

  const structuresResp = await fetch("./structures.txt");
  const structures = castStructures(await structuresResp.text());

  const artworksResp = await fetch("./assets/art/info.json");
  const artworks = castArtworks(await artworksResp.json());

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
  const hsl = { h: 0, s: 0, l: 0 };
  wallColorShifted.getHSL(hsl);
  hsl.h += settings.hShift;
  const fullTurn = 2 * Math.PI;
  hsl.h = ((hsl.h % fullTurn) + fullTurn) % fullTurn;
  wallColorShifted.setHSL(hsl.h, hsl.s, hsl.l);

  const color = new THREE.Color();

  const wallTextureCanvas1 = document.createElement("canvas");
  const ctx1 = wallTextureCanvas1.getContext("2d");
  if (!ctx1) throw new Error("Could not get context 2d");
  ctx1.canvas.width = ctx1.canvas.height = 100;
  for (let x = 0; x < 100; x++) {
    for (let y = 0; y < 100; y++) {
      color.set(0xffffff);
      color.lerp(wallColorShifted, Math.random() ** 5);
      ctx1.fillStyle = "#" + color.getHexString();
      ctx1.fillRect(x * 1, y * 1, 1, 1);
    }
  }

  const wallTextureCanvas2 = document.createElement("canvas");
  const ctx2 = wallTextureCanvas2.getContext("2d");
  if (!ctx2) throw new Error("Could not get context 2d");
  ctx2.canvas.width = ctx2.canvas.height = 100;
  for (let x = 0; x < 100; x++) {
    for (let y = 0; y < 100; y++) {
      color.set(0xffffff);
      color.lerp(wallColorShifted, Math.random() * 0.75);
      ctx2.fillStyle = "#" + color.getHexString();
      ctx2.fillRect(x * 1, y * 1, 1, 1);
    }
  }

  const WALLTEXTURE = new THREE.CanvasTexture(wallTextureCanvas1);
  WALLTEXTURE.repeat.set(2, 2);
  WALLTEXTURE.wrapS = THREE.RepeatWrapping;
  WALLTEXTURE.wrapT = THREE.RepeatWrapping;

  const GROUNDTEXTURE = new THREE.CanvasTexture(wallTextureCanvas2);
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
    color: wallColor,
    map: GROUNDTEXTURE,
  });
  const FRAMEMATERIAL = new THREE.MeshLambertMaterial({
    color: frameColor,
  });
  const PLANTMATERIAL = new THREE.MeshLambertMaterial({
    color: plantColor,
  });

  const wallPlaneGeometryCache: {
    [key: number]: { [key: number]: THREE.BoxGeometry };
  } = {};
  const getWallPlaneSize = (sizeScale: number) =>
    settings.wallThickness * (1 + sizeScale);
  const getWallPlaneHeight = (heightScale: number) =>
    settings.wallHeight * (1 + heightScale);
  const getWallPlaneGeometry = (size: number, height: number) => {
    if (size in wallPlaneGeometryCache)
      if (height in wallPlaneGeometryCache[size])
        return wallPlaneGeometryCache[size][height];
    if (!(size in wallPlaneGeometryCache)) wallPlaneGeometryCache[size] = {};
    return (wallPlaneGeometryCache[size][height] = new THREE.BoxGeometry(
      settings.chunkSize,
      height,
      size,
    ));
  };

  const wallPillarGeometryCache: {
    [key: number]: { [key: number]: THREE.BoxGeometry };
  } = {};
  const getWallPillarSize = (sizeScale: number) =>
    settings.wallThickness * (2 + sizeScale);
  const getWallPillarHeight = (heightScale: number) =>
    settings.wallThickness + settings.wallHeight * (1 + heightScale);
  const getWallPillarGeometry = (size: number, height: number) => {
    if (size in wallPillarGeometryCache)
      if (height in wallPillarGeometryCache[size])
        return wallPillarGeometryCache[size][height];
    if (!(size in wallPillarGeometryCache)) wallPillarGeometryCache[size] = {};
    return (wallPillarGeometryCache[size][height] = new THREE.BoxGeometry(
      size,
      height,
      size,
    ));
  };

  const railingGeometryCache: {
    beam: { [key: number]: THREE.BoxGeometry };
    pillar: { [key: number]: { [key: number]: THREE.BoxGeometry } };
  } = { beam: {}, pillar: {} };
  const getRailingBeamTopSize = (sizeScale: number) =>
    settings.railingThickness * (1.5 + sizeScale);
  const getRailingBeamBottomSize = (sizeScale: number) =>
    settings.railingThickness * (1 + sizeScale);
  const getRailingPillarSize = (sizeScale: number) =>
    settings.railingThickness * (0.75 + sizeScale);
  const getRailingPillarHeight = (heightScale: number) =>
    settings.railingHeight * (1 + heightScale);
  const getRailingBeamGeometry = (size: number) => {
    if (size in railingGeometryCache.beam)
      return railingGeometryCache.beam[size];
    return (railingGeometryCache.beam[size] = new THREE.BoxGeometry(
      settings.chunkSize,
      size,
      size,
    ));
  };
  const getRailingPillarGeometry = (size: number, height: number) => {
    if (size in railingGeometryCache.pillar)
      if (height in railingGeometryCache.pillar[size])
        return railingGeometryCache.pillar[size][height];
    if (!(size in railingGeometryCache.pillar))
      railingGeometryCache.pillar[size] = {};
    return (railingGeometryCache.pillar[size][height] = new THREE.BoxGeometry(
      size,
      height,
      size,
    ));
  };

  const artworkGeometryCache: {
    horizontal: { [key: number]: THREE.BoxGeometry };
    vertical: { [key: number]: THREE.BoxGeometry };
  } = { horizontal: {}, vertical: {} };
  const getArtworkFrameHGeometry = (size: number) => {
    if (size in artworkGeometryCache.horizontal)
      return artworkGeometryCache.horizontal[size];
    return (artworkGeometryCache.horizontal[size] = new THREE.BoxGeometry(
      size + settings.artworkFrameThickness * 2,
      settings.artworkFrameThickness,
      settings.artworkFrameThickness,
    ));
  };
  const getArtworkFrameVGeometry = (size: number) => {
    if (size in artworkGeometryCache.vertical)
      return artworkGeometryCache.vertical[size];
    return (artworkGeometryCache.vertical[size] = new THREE.BoxGeometry(
      settings.artworkFrameThickness,
      size + settings.artworkFrameThickness * 2,
      settings.artworkFrameThickness,
    ));
  };

  const lightSphereGeometryCache: {
    [key: number]: THREE.SphereGeometry;
  } = {};
  const getLightSphereGeometry = (radius: number) => {
    if (radius in lightSphereGeometryCache)
      return lightSphereGeometryCache[radius];
    return (lightSphereGeometryCache[radius] = new THREE.SphereGeometry(
      radius * settings.lightSphereSize,
      24,
      24,
    ));
  };

  const playerCollider = [settings.playerSize, settings.playerSize];
  const colliders: [number, number, number, number, string][] = [];
  const infoBoxes: [THREE.Object3D, HTMLElement, number][] = [];

  const addWallX = (chunkX: number, chunkY: number, data: StructureData) => {
    let x = data.x + chunkX * settings.chunkSize;
    let y = data.y + chunkY * settings.chunkSize;
    let z = data.z;

    const sizeScale = parseFloat(data.other["size"] ?? "0");
    const heightScale = parseFloat(data.other["height"] ?? "0");

    const size = getWallPlaneSize(sizeScale);
    const height = getWallPlaneHeight(heightScale);

    const wall = new THREE.Object3D();

    const plane = new THREE.Mesh(
      getWallPlaneGeometry(size, height),
      new Array(6).fill(WALLMATERIALTEXTURED),
    );
    plane.position.set(0, height / 2, 0);
    plane.receiveShadow = true;
    plane.castShadow = true;
    wall.add(plane);

    if ((data.other["p1"] ?? "true") === "true") {
      const pillar1 = new THREE.Mesh(
        getWallPillarGeometry(
          getWallPillarSize(sizeScale),
          getWallPillarHeight(heightScale),
        ),
        WALLMATERIAL,
      );
      pillar1.position.set(
        settings.chunkSize / 2,
        getWallPillarHeight(heightScale) / 2,
        0,
      );
      pillar1.receiveShadow = true;
      pillar1.castShadow = true;
      wall.add(pillar1);
    }

    if ((data.other["p2"] ?? "true") === "true") {
      const pillar2 = new THREE.Mesh(
        getWallPillarGeometry(
          getWallPillarSize(sizeScale),
          getWallPillarHeight(heightScale),
        ),
        WALLMATERIAL,
      );
      pillar2.position.set(
        -settings.chunkSize / 2,
        getWallPillarHeight(heightScale) / 2,
        0,
      );
      pillar2.receiveShadow = true;
      pillar2.castShadow = true;
      wall.add(pillar2);
    }

    wall.position.set(x, z, y);
    scene.add(wall);

    colliders.push([
      wall.position.x,
      wall.position.z,
      settings.chunkSize,
      size,
      "wall",
    ]);

    return wall;
  };

  const addWallY = (chunkX: number, chunkY: number, data: StructureData) => {
    const wall = addWallX(chunkX, chunkY, data);

    wall.rotateY(Math.PI / 2);

    const last = colliders.pop();
    if (!last) return wall;
    const [x, y, w, h, type] = last;
    colliders.push([x, y, h, w, type]);

    return wall;
  };

  const addRailingX = (chunkX: number, chunkY: number, data: StructureData) => {
    let x = data.x + chunkX * settings.chunkSize;
    let y = data.y + chunkY * settings.chunkSize;
    let z = data.z;

    const sizeScale = parseFloat(data.other["size"] ?? "0");
    const heightScale = parseFloat(data.other["height"] ?? "0");

    const topSize = getRailingBeamTopSize(sizeScale);
    const bottomSize = getRailingBeamBottomSize(sizeScale);
    const size = getRailingPillarSize(sizeScale);
    const height = getRailingPillarHeight(heightScale);

    const nBars = parseInt(data.other["n"] ?? "12");

    const railing = new THREE.Object3D();

    const beamTop = new THREE.Mesh(
      getRailingBeamGeometry(topSize),
      WALLMATERIAL,
    );
    beamTop.position.set(0, height, 0);
    beamTop.receiveShadow = true;
    beamTop.castShadow = true;
    railing.add(beamTop);

    const beamBottom = new THREE.Mesh(
      getRailingBeamGeometry(bottomSize),
      WALLMATERIAL,
    );
    beamBottom.position.set(0, bottomSize / 2, 0);
    beamBottom.receiveShadow = true;
    beamBottom.castShadow = true;
    railing.add(beamBottom);

    for (let i = 0; i < nBars; i++) {
      let rx =
        (settings.chunkSize / nBars) * (i + 0.5) - settings.chunkSize / 2;
      const pillar = new THREE.Mesh(
        getRailingPillarGeometry(size, height),
        new Array(6).fill(WALLMATERIALTEXTURED),
      );
      pillar.position.set(rx, height / 2, 0);
      pillar.receiveShadow = true;
      pillar.castShadow = true;
      railing.add(pillar);
    }

    railing.position.set(x, z, y);
    scene.add(railing);

    colliders.push([
      railing.position.x,
      railing.position.z,
      settings.chunkSize,
      Math.max(topSize, bottomSize, size),
      "wall",
    ]);

    return railing;
  };

  const addRailingY = (chunkX: number, chunkY: number, data: StructureData) => {
    const railing = addRailingX(chunkX, chunkY, data);

    railing.rotateY(Math.PI / 2);

    const last = colliders.pop();
    if (!last) return railing;
    const [x, y, w, h, type] = last;
    colliders.push([x, y, h, w, type]);

    return railing;
  };

  const addPillar = (chunkX: number, chunkY: number, data: StructureData) => {
    let x = data.x + chunkX * settings.chunkSize;
    let y = data.y + chunkY * settings.chunkSize;
    let z = data.z;

    const sizeScale = parseFloat(data.other["size"] ?? "0");
    const heightScale = parseFloat(data.other["height"] ?? "0");

    const size = getWallPillarSize(sizeScale);
    const height = getWallPillarHeight(heightScale);

    const pillar = new THREE.Mesh(
      getWallPillarGeometry(size, height),
      WALLMATERIAL,
    );
    pillar.position.set(x, z + height / 2, y);
    pillar.receiveShadow = true;
    pillar.castShadow = true;
    scene.add(pillar);

    colliders.push([x, y, size, size, "wall"]);

    return pillar;
  };

  const addArch = (chunkX: number, chunkY: number, data: StructureData) => {
    let x = data.x + chunkX * settings.chunkSize;
    let y = data.y + chunkY * settings.chunkSize;
    let z = data.z;

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
    if ((data.other["type"] ?? "x") === "y") arch.rotateY(Math.PI / 2);
    arch.position.set(x, z, y);
    arch.receiveShadow = true;
    arch.castShadow = true;
    scene.add(arch);

    return arch;
  };

  const addBamboo = (chunkX: number, chunkY: number, data: StructureData) => {
    let x = data.x + chunkX * settings.chunkSize;
    let y = data.y + chunkY * settings.chunkSize;
    let z = data.z;
    let scale = parseFloat(data.other["scale"] ?? "1");

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
    if ((data.other["type"] ?? "x") === "y") bamboo.rotateY(Math.PI / 2);
    bamboo.position.set(x, z, y);
    bamboo.receiveShadow = true;
    bamboo.castShadow = true;
    scene.add(bamboo);

    return bamboo;
  };

  const addPLight = (chunkX: number, chunkY: number, data: StructureData) => {
    let x = data.x + chunkX * settings.chunkSize;
    let y = data.y + chunkY * settings.chunkSize;
    let z = data.z;

    const color = data.other["color"] ?? "#ffffff";
    const invColor = new THREE.Color(color);

    // invColor.r = 1 - invColor.r;
    // invColor.g = 1 - invColor.g;
    // invColor.b = 1 - invColor.b;

    // const hsl = { h: 0, s: 0, l: 0 };
    // invColor.getHSL(hsl);
    // if (!settings.isNight) hsl.l = 1 - hsl.l;
    // invColor.setHSL(hsl.h, hsl.s, hsl.l);

    const light = new THREE.Object3D();

    const pLight = new THREE.PointLight(
      color,
      parseFloat(data.other["intensity"] ?? "1"),
      parseFloat(data.other["distance"] ?? "3"),
      parseFloat(data.other["decay"] ?? "0.75"),
    );
    pLight.castShadow = true;
    pLight.shadow.mapSize.width = 1024;
    pLight.shadow.mapSize.height = 1024;
    pLight.shadow.camera.near = 0.1;
    pLight.shadow.camera.far = 10;
    light.add(pLight);

    const sphere = new THREE.Mesh(
      getLightSphereGeometry(parseFloat(data.other["radius"] ?? "1")),
      new THREE.MeshBasicMaterial({ color: invColor }),
    );
    light.add(sphere);

    light.position.set(x, z, y);
    scene.add(light);

    return light;
  };

  const addInfoBox = (chunkX: number, chunkY: number, data: StructureData) => {
    let x = data.x + chunkX * settings.chunkSize;
    let y = data.y + chunkY * settings.chunkSize;
    let z = data.z;

    const elem = document.createElement("div");
    const ielem = document.createElement(data.other["type"] ?? "span");
    ielem.classList.add("infobox");
    ielem.textContent = (data.other["text"] ?? "").replaceAll("\\s", " ");
    elem.appendChild(ielem);

    const obj = new CSS2DObject(elem);
    obj.position.set(x, z, y);
    scene.add(obj);

    infoBoxes.push([obj, ielem, 0]);

    return obj;
  };

  const artworkCache: {
    [key: string]: {
      width: number;
      height: number;
      scale: number;
      canvas: HTMLCanvasElement;
    };
  } = {};

  const addArtwork = (chunkX: number, chunkY: number, data: StructureData) => {
    let x = data.x + chunkX * settings.chunkSize;
    let y = data.y + chunkY * settings.chunkSize;
    let z = data.z;

    const facing = data.other["facing"] ?? "x+";
    const angle =
      facing === "x+"
        ? -Math.PI / 2
        : facing === "x-"
        ? (-3 * Math.PI) / 2
        : facing === "y+"
        ? 0
        : Math.PI;
    const xWise = facing === "x+" || facing === "x-";

    const name = data.other["name"] ?? "";

    const maxWidth = parseFloat(
      data.other["width"] ?? String(settings.chunkSize * 0.65),
    );
    const maxHeight = parseFloat(
      data.other["height"] ?? String(settings.wallHeight * 0.65),
    );

    const obj = new THREE.Object3D();

    (async () => {
      const { width, height, scale, canvas } = await (async () => {
        if (name in artworkCache) return artworkCache[name];
        const canvas = document.createElement("canvas");
        const { width, height, scale } = (await new Promise((res, rej) => {
          const offCanvas = canvas.transferControlToOffscreen();
          const worker = new Worker("./worker.js");
          worker.addEventListener("message", (e) => res(e.data));
          worker.addEventListener("error", (e) => rej(e));
          worker.postMessage({ name, maxWidth, maxHeight, canvas: offCanvas }, [
            offCanvas,
          ]);
        })) as { width: number; height: number; scale: number };
        return (artworkCache[name] = { width, height, scale, canvas });
      })();

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;

      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(width * scale, height * scale),
        new THREE.MeshBasicMaterial({ map: tex, color: 0xffffff }),
      );
      obj.add(plane);

      const hGeo = getArtworkFrameHGeometry(width * scale);
      const vGeo = getArtworkFrameVGeometry(height * scale);

      const frameH1 = new THREE.Mesh(hGeo, FRAMEMATERIAL);
      frameH1.position.set(
        0,
        (height * scale + settings.artworkFrameThickness) / 2,
        0,
      );
      frameH1.receiveShadow = true;
      frameH1.castShadow = true;
      obj.add(frameH1);

      const frameH2 = new THREE.Mesh(hGeo, FRAMEMATERIAL);
      frameH2.position.set(
        0,
        -(height * scale + settings.artworkFrameThickness) / 2,
        0,
      );
      frameH2.receiveShadow = true;
      frameH2.castShadow = true;
      obj.add(frameH2);

      const frameV1 = new THREE.Mesh(vGeo, FRAMEMATERIAL);
      frameV1.position.set(
        (width * scale + settings.artworkFrameThickness) / 2,
        0,
        0,
      );
      frameV1.receiveShadow = true;
      frameV1.castShadow = true;
      obj.add(frameV1);

      const frameV2 = new THREE.Mesh(vGeo, FRAMEMATERIAL);
      frameV2.position.set(
        -(width * scale + settings.artworkFrameThickness) / 2,
        0,
        0,
      );
      frameV2.receiveShadow = true;
      frameV2.castShadow = true;
      obj.add(frameV2);

      if (name in artworks) {
        const artwork = artworks[name];
        addInfoBox(chunkX, chunkY, {
          x: data.x,
          y: data.y,
          z: data.z - 0.2 - (height * scale) / 2,
          other: {
            text: artwork.name,
            type: "h2",
          },
        });
        addInfoBox(chunkX, chunkY, {
          x: data.x,
          y: data.y,
          z: data.z - 0.3 - (height * scale) / 2,
          other: {
            text: getArtworkDate(artwork.date),
            type: "h6",
          },
        });

        let [w, h] = [width * scale * 1.5, settings.artworkFrameThickness * 6];
        if (xWise) [w, h] = [h, w];
        colliders.push([x, y, w, h, "artwork:" + name]);
      }
    })();

    obj.position.set(x, z, y);
    obj.rotateY(angle);
    scene.add(obj);

    return obj;
  };

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

  const camCentricAccel = new THREE.Vector2();
  const worldAccel = new THREE.Vector2();
  const worldVel = new THREE.Vector2();
  let camElevation = 0;
  let xyz0 = [camera.position.x, camera.position.y, camera.position.z];
  let rxyz0 = [camera.rotation.x, camera.rotation.y, camera.rotation.z];

  let activeArtwork: string | null = null;

  const chunkedObjects: {
    [key: number]: {
      [key: number]: { visible: boolean; list: THREE.Object3D[] };
    };
  } = {};
  structures
    .map(({ type, chunkX, chunkY, data }) => {
      if (type === "wallX") return addWallX(chunkX, chunkY, data);
      if (type === "wallY") return addWallY(chunkX, chunkY, data);
      if (type === "railX") return addRailingX(chunkX, chunkY, data);
      if (type === "railY") return addRailingY(chunkX, chunkY, data);
      if (type === "pillar") return addPillar(chunkX, chunkY, data);
      if (type === "arch") return addArch(chunkX, chunkY, data);
      if (type === "bamboo") return addBamboo(chunkX, chunkY, data);
      if (type === "plight") return addPLight(chunkX, chunkY, data);
      if (type === "infobox") return addInfoBox(chunkX, chunkY, data);
      if (type === "art") return addArtwork(chunkX, chunkY, data);
    })
    .forEach((obj, i) => {
      if (!obj) return;
      const chunkX = Math.round(structures[i].chunkX);
      const chunkY = Math.round(structures[i].chunkY);
      if (!chunkedObjects[chunkX]) chunkedObjects[chunkX] = {};
      if (!chunkedObjects[chunkX][chunkY])
        chunkedObjects[chunkX][chunkY] = { visible: true, list: [] };
      chunkedObjects[chunkX][chunkY].list.push(obj);
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
    for (const [x, y, w, h, type] of colliders) {
      if (type === "wall") {
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
        const name = type.slice("artwork:".length);
        if (Math.abs(playerX - x) >= (playerW + w) / 2) continue;
        if (Math.abs(playerY - y) >= (playerH + h) / 2) continue;
        activeArtwork = name;
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

    for (let i = 0; i < infoBoxes.length; i++) {
      const [obj, elem, scale] = infoBoxes[i];
      elem.style.transform = "scale(" + scale + ")";
      const dist = obj.position.distanceTo(camera.position);
      infoBoxes[i][2] += (+(dist < settings.infoBoxShowRadius) - scale) * 0.1;
    }

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

    const chunkX = Math.round(camera.position.x / settings.chunkSize);
    const chunkY = Math.round(camera.position.z / settings.chunkSize);

    for (const xS in chunkedObjects) {
      const x = parseInt(xS);
      const xValid = Math.abs(x - chunkX) <= settings.renderDist;
      for (const yS in chunkedObjects[x]) {
        const y = parseInt(yS);
        const valid = xValid && Math.abs(y - chunkY) <= settings.renderDist;
        if (chunkedObjects[x][y].visible === valid) continue;
        chunkedObjects[x][y].visible = valid;
        for (const obj of chunkedObjects[x][y].list) {
          obj.visible = valid;
          obj.receiveShadow = valid;
          obj.castShadow = valid;
        }
      }
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
