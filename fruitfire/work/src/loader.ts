import { parseNumbers } from "xml2js/lib/processors";
import * as util from "./util";


const PARSER = new DOMParser();

const DEFAULTFILE = "texturemap";

const EMPTYELEMENT = document.createElement("html");


function castVec2(data: Element | null, def: util.vec2 = [0, 0]): util.vec2 {
    data = data ?? EMPTYELEMENT;
    return [
        parseFloat(data.getAttribute("x") ?? String(def[0])),
        parseFloat(data.getAttribute("y") ?? String(def[1])),
    ];
}
function castBoolean(data: string | null, def: boolean = false) {
    if (data === null) return def;
    return !!JSON.parse(data);
}

export type Location = {
    file: string,

    x: number,
    y: number,
    w: number,
    h: number,
};
function castLocation(data: Element | null, defaultFile: string = DEFAULTFILE): Location {
    data = data ?? EMPTYELEMENT;
    return {
        file: data.getAttribute("file") ?? defaultFile,

        x: parseInt(data.getAttribute("x") ?? "0"),
        y: parseInt(data.getAttribute("y") ?? "0"),
        w: parseInt(data.getAttribute("w") ?? "0"),
        h: parseInt(data.getAttribute("h") ?? "0"),
    };
}

export type Texture = {
    location: Location,
    crop: boolean,
};
export type Textures = util.StringMap<Texture>;
function castTexture(data: Element | null, defaultFile: string = DEFAULTFILE): Texture {
    data = data ?? EMPTYELEMENT;
    return {
        location: castLocation(data.querySelector(":scope > location") ?? null, defaultFile),
        crop: castBoolean(data.getAttribute("crop")),
    };
}
function castTextures(data: Element | null, defaultFile: string = DEFAULTFILE): Textures {
    data = data ?? EMPTYELEMENT;
    const textures: Textures = {};
    for (const child of data.children) {
        const name = child.getAttribute("name");
        if (!name) continue;
        const texture = castTexture(child, defaultFile);
        textures[name] = texture;
    }
    return textures;
}


export type ThemeData = {
    texture: Texture,
};
export async function loadThemeData(): Promise<ThemeData> {
    const resp = await fetch("./assets/theme.xml");
    const text = await resp.text();
    const data = PARSER.parseFromString(text, "text/xml") as XMLDocument;
    const body = data.querySelector("body");
    if (!body) throw "Error loading theme.xml: No body found";
    return {
        texture: castTexture(body.querySelector(":scope > texture") ?? null),
    };
}

export type Command = {
    action: "get" | "set" | "call" | "op" | "if" | "for" | "json" | "log" | "null",

    attr?: string,

    prop?: string,
    value?: Command,

    func?: string,
    args?: Commands,

    op?: string,
    left?: Command,
    right?: Command,

    cond?: Command,
    true_?: Commands,
    false_?: Commands,

    start?: Command,
    stop?: Command,
    step?: Command,
    of?: Command,
    body?: Commands,

    json?: any,

    log?: Commands,
};
export type Commands = Command[];
function castCommand(data: Element | null): Command {
    data = data ?? EMPTYELEMENT;
    if (data.tagName === "get") {
        const attr = data.textContent ?? "";
        return {
            action: "get",

            attr: attr,
        };
    }
    if (data.tagName === "set") {
        const prop = data.querySelector(":scope > prop") ?? EMPTYELEMENT;
        const value = data.querySelector(":scope > value") ?? EMPTYELEMENT;
        return {
            action: "set",

            prop: prop.textContent ?? "",
            value: castCommand(value.children[0]),
        };
    }
    if (data.tagName === "call") {
        const func = data.querySelector(":scope > func") ?? EMPTYELEMENT;
        const args = data.querySelector(":scope > args");
        return {
            action: "call",

            func: func.textContent ?? "",
            args: castCommands(args),
        };
    }
    if (data.tagName === "op") {
        const op = data.querySelector(":scope > op") ?? EMPTYELEMENT;
        const left = data.querySelector(":scope > left") ?? EMPTYELEMENT;
        const right = data.querySelector(":scope > right") ?? EMPTYELEMENT;
        return {
            action: "op",

            op: op.textContent ?? "",
            left: castCommand(left.children[0]),
            right: castCommand(right.children[0]),
        };
    }
    if (data.tagName === "if") {
        const cond = data.querySelector(":scope > cond") ?? EMPTYELEMENT;
        const true_ = data.querySelector(":scope > true");
        const false_ = data.querySelector(":scope > false");
        return {
            action: "if",

            cond: castCommand(cond.children[0]),
            true_: castCommands(true_),
            false_: castCommands(false_),
        };
    }
    if (data.tagName === "for") {
        const start = data.querySelector(":scope > start") ?? EMPTYELEMENT;
        const stop = data.querySelector(":scope > stop") ?? EMPTYELEMENT;
        const step = data.querySelector(":scope > step") ?? EMPTYELEMENT;
        const of = data.querySelector(":scope > of");
        const body = data.querySelector(":scope > body");
        if (of) return {
            action: "for",

            of: castCommand(of.children[0]),

            body: castCommands(body),
        };
        return {
            action: "for",

            start: start.children[0] ? castCommand(start.children[0]) : {
                action: "json",
                json: 0,
            },
            stop: stop.children[0] ? castCommand(stop.children[0]) : {
                action: "json",
                json: 0,
            },
            step: step.children[0] ? castCommand(step.children[0]) : {
                action: "json",
                json: 1,
            },

            body: castCommands(body),
        };
    }
    if (data.tagName === "json") {
        return {
            action: "json",

            json: JSON.parse(data.textContent ?? "null"),
        };
    }
    if (data.tagName === "log") {
        return {
            action: "log",

            log: castCommands(data),
        };
    }
    return {
        action: "null",
    };
}
function castCommands(data: Element | null): Commands {
    data = data ?? EMPTYELEMENT;
    return Array.from(data.children).map(child => castCommand(child));
}

export type EnemyList = string[];
export async function loadEnemyList(): Promise<EnemyList> {
    const resp = await fetch("./assets/enemies/index.xml");
    const text = await resp.text();
    const data = PARSER.parseFromString(text, "text/xml") as XMLDocument;
    const body = data.querySelector("body");
    if (!body) throw "Error loading index.xml: No body found";
    return Array.from(body.children).filter(item => item.tagName === "i").map(item => item.textContent ?? "");
}

export type EnemyComponentData = {
    texture: string,
    type: "original" | "outlined" | "white" | "white + outlined",

    offset: util.vec2,
    scale: util.vec2,

    opacity: number,
    dir: number,

    isBody: boolean,
};
export type EnemyComponentDatas = util.StringMap<EnemyComponentData>;
function castEnemyComponentData(data: Element | null): EnemyComponentData {
    data = data ?? EMPTYELEMENT;
    return {
        texture: data.querySelector(":scope > texture")?.textContent ?? "",
        type: ((type: string) => {
            if (!["original", "outlined", "white", "white + outlined"].includes(type)) return "original";
            return type as ("original" | "outlined" | "white" | "white + outlined");
        })(data.querySelector(":scope > type")?.textContent ?? ""),

        offset: castVec2(data.querySelector(":scope > offset")),
        scale: castVec2(data.querySelector(":scope > scale"), [1, 1]),

        opacity: parseFloat(data.querySelector(":scope > opacity")?.textContent ?? "1"),
        dir: parseFloat(data.querySelector(":scope > dir")?.textContent ?? "0"),

        isBody: castBoolean(data.getAttribute("body")),
    };
}
function castEnemyComponentDatas(data: Element | null): EnemyComponentDatas {
    data = data ?? EMPTYELEMENT;
    const datas: EnemyComponentDatas = {};
    for (const child of data.children) {
        const id = child.getAttribute("id");
        if (!id) continue;
        datas[id] = castEnemyComponentData(child);
    }
    return datas;
}

export type EnemyFunctionData = {
    args: string[],
    commands: Commands,
};
export type EnemyFunctionDatas = util.StringMap<EnemyFunctionData>;
function castEnemyFunctionData(data: Element | null): EnemyFunctionData {
    data = data ?? EMPTYELEMENT;
    return {
        args: Array.from((data.querySelector(":scope > args") ?? EMPTYELEMENT).children).map(child => child.textContent ?? ""),
        commands: castCommands(data.querySelector(":scope > commands")),
    };
}
function castEnemyFunctionDatas(data: Element | null): EnemyFunctionDatas {
    data = data ?? EMPTYELEMENT;
    const datas: EnemyFunctionDatas = {};
    for (const child of data.children) {
        const name = child.getAttribute("name");
        if (!name) continue;
        datas[name] = castEnemyFunctionData(child);
    }
    return datas;
}

export type EnemyAnimationKeyframeData = {
    continual: Commands,
    start: Commands,
    stop: Commands,
    wait: number,
};
export type EnemyAnimationKeyframeDatas = EnemyAnimationKeyframeData[];
function castEnemyAnimationKeyframeData(data: Element | null): EnemyAnimationKeyframeData {
    data = data ?? EMPTYELEMENT;
    return {
        continual: castCommands(data.querySelector(":scope > continual")),
        start: castCommands(data.querySelector(":scope > start")),
        stop: castCommands(data.querySelector(":scope > stop")),
        wait: parseFloat(data.getAttribute("wait") ?? "0"),
    };
}
function castEnemyAnimationKeyframeDatas(data: Element | null): EnemyAnimationKeyframeDatas {
    data = data ?? EMPTYELEMENT;
    return Array.from(data.children).map(child => castEnemyAnimationKeyframeData(child));
}
export type EnemyAnimationData = {
    keyframes: EnemyAnimationKeyframeDatas,
    loop: boolean,
};
export type EnemyAnimationDatas = util.StringMap<EnemyAnimationData>;
function castEnemyAnimationData(data: Element | null): EnemyAnimationData {
    data = data ?? EMPTYELEMENT;
    return {
        keyframes: castEnemyAnimationKeyframeDatas(data.querySelector(":scope > keyframes")),
        loop: castBoolean(data.getAttribute("loop")),
    };
}
function castEnemyAnimationDatas(data: Element | null): EnemyAnimationDatas {
    data = data ?? EMPTYELEMENT;
    const datas: EnemyAnimationDatas = {};
    for (const child of data.children) {
        const name = child.getAttribute("name");
        if (!name) continue;
        datas[name] = castEnemyAnimationData(child);
    }
    return datas;
}

export type EnemyStateData = {
    continual: Commands,
    start: Commands,
    stop: Commands,
};
export type EnemyStateDatas = util.StringMap<EnemyStateData>;
function castEnemyStateData(data: Element | null): EnemyStateData {
    data = data ?? EMPTYELEMENT;
    return {
        continual: castCommands(data.querySelector(":scope > continual")),
        start: castCommands(data.querySelector(":scope > start")),
        stop: castCommands(data.querySelector(":scope > stop")),
    };
}
function castEnemyStateDatas(data: Element | null): EnemyStateDatas {
    data = data ?? EMPTYELEMENT;
    const datas: EnemyStateDatas = {};
    for (const child of data.children) {
        const name = child.getAttribute("name");
        if (!name) continue;
        datas[name] = castEnemyStateData(child);
    }
    return datas;
}

export type EnemyData = {
    name: string,
    type: string[],

    size: number,
    health: number,
    colors: number[],
    part: boolean,
    location: Location,

    textures: Textures,

    components: EnemyComponentDatas,
    functions: EnemyFunctionDatas,
    animations: EnemyAnimationDatas,

    states: EnemyStateDatas,
    initialState: string,

    events: util.StringMap<Commands>,
};
export async function loadEnemyData(type: string): Promise<EnemyData> {
    const resp = await fetch("./assets/enemies/"+type+".xml");
    const text = await resp.text();
    const data = PARSER.parseFromString(text, "text/xml") as XMLDocument;
    const body = data.querySelector("body");
    if (!body) throw "Error loading "+type+".xml: No body found";

    const location = castLocation(body.querySelector(":scope > location"));

    const textures = castTextures(body.querySelector(":scope > textures"));
    for (const name in textures) {
        textures[name].location.x += location.x;
        textures[name].location.y += location.y;
    }

    const eventsElem = body.querySelector(":scope > events") ?? EMPTYELEMENT;
    const events: util.StringMap<Commands> = {};
    for (const child of eventsElem.children) {
        const name = child.getAttribute("name");
        if (!name) continue;
        events[name] = castCommands(child);
    }

    return {
        name: data.querySelector(":scope > name")?.textContent ?? "",
        type: Array.from(body.querySelector(":scope > type")?.children ?? []).map(child => child.textContent ?? ""),

        size: parseFloat(body.querySelector(":scope > size")?.textContent ?? "0"),
        health: parseFloat(body.querySelector(":scope > health")?.textContent ?? "0"),
        colors: Array.from((body.querySelector(":scope > colors") ?? EMPTYELEMENT).children).map(child => parseInt(child.textContent ?? "0")),
        part: !!body.querySelector(":scope > part"),
        location: location,

        textures: textures,

        components: castEnemyComponentDatas(body.querySelector(":scope > components")),
        functions: castEnemyFunctionDatas(body.querySelector(":scope > functions")),
        animations: castEnemyAnimationDatas(body.querySelector(":scope > animations")),

        states: castEnemyStateDatas(body.querySelector(":scope > states")),
        initialState: body.querySelector(":scope > states")?.getAttribute("initial") ?? "",

        events: events,
    };
}

export type ParticlesData = {
    list: string[],
    location: Location,
};
export async function loadParticlesData(): Promise<ParticlesData> {
    const resp = await fetch("./assets/particles/index.xml");
    const text = await resp.text();
    const data = PARSER.parseFromString(text, "text/xml") as XMLDocument;
    const body = data.querySelector("body");
    if (!body) throw "Error loading index.xml: No body found";
    return {
        list: Array.from((body.querySelector(":scope > types") ?? EMPTYELEMENT).children).filter(item => item.tagName === "i").map(item => item.textContent ?? ""),
        location: castLocation(body.querySelector(":scope > location")),
    };
}

export type ParticleData = {
    texture: Texture,
};
export async function loadParticleData(type: string, particlesData: ParticlesData): Promise<ParticleData> {
    const resp = await fetch("./assets/particles/"+type+".xml");
    const text = await resp.text();
    const data = PARSER.parseFromString(text, "text/xml") as XMLDocument;
    const body = data.querySelector("body");
    if (!body) throw "Error loading "+type+".xml: No body found";

    const texture = castTexture(body.querySelector(":scope > texture"));
    texture.location.x += particlesData.location.x;
    texture.location.y += particlesData.location.y;

    return {
        texture: texture,
    };
}

export type ProjectilesData = {
    list: string[],
    location: Location,
};
export async function loadProjectilesData(): Promise<ProjectilesData> {
    const resp = await fetch("./assets/projectiles/index.xml");
    const text = await resp.text();
    const data = PARSER.parseFromString(text, "text/xml") as XMLDocument;
    const body = data.querySelector("body");
    if (!body) throw "Error loading index.xml: No body found";
    return {
        list: Array.from((body.querySelector(":scope > types") ?? EMPTYELEMENT).children).filter(item => item.tagName === "i").map(item => item.textContent ?? ""),
        location: castLocation(body.querySelector(":scope > location")),
    };
}

export type ProjectileData = {
    texture: Texture,

    size: number,
    rotate: boolean,
    outline: boolean,
};
export async function loadProjectileData(type: string, projectilesData: ProjectilesData): Promise<ProjectileData> {
    const resp = await fetch("./assets/projectiles/"+type+".xml");
    const text = await resp.text();
    const data = PARSER.parseFromString(text, "text/xml") as XMLDocument;
    const body = data.querySelector("body");
    if (!body) throw "Error loading "+type+".xml: No body found";

    const texture = castTexture(body.querySelector(":scope > texture"));
    texture.location.x += projectilesData.location.x;
    texture.location.y += projectilesData.location.y;

    return {
        texture: texture,

        size: parseFloat(body.querySelector(":scope > size")?.textContent ?? "0"),
        rotate: !!body.querySelector(":scope > rotate"),
        outline: !!body.querySelector(":scope > outline"),
    };
}

export async function loadFile(file: string = DEFAULTFILE) {
    return await util.loadImage("./assets/"+file+".png");
}

export type TextureSource = {
    texture: Texture,
    padding: number,

    original: HTMLCanvasElement,
    white: HTMLCanvasElement,
    outline: HTMLCanvasElement,
    originalAndOutline: HTMLCanvasElement,
    whiteAndOutline: HTMLCanvasElement,
};
function createCanvas() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw "Canvas not supported";
    return { canvas, ctx };
}
function createOutline(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw "How did we get here?";

    const width = canvas.width;
    const height = canvas.height;

    const { canvas: outlineCanvas, ctx: outlineCtx } = createCanvas();
    outlineCanvas.width = width;
    outlineCanvas.height = height;
    outlineCtx.drawImage(canvas, 0, 0);
    const outlineImageData = outlineCtx.getImageData(0, 0, width, height);
    const outline: number[][] = new Array(width).fill(null).map(_ => new Array(height).fill(0));
    for (let x = 0; x < width; x++)
        for (let y = 0; y < height; y++)
            outline[x][y] = (outlineImageData.data[(x + y*width)*4 + 3] > 0) ? 0 : 1;
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (outline[x][y]) continue;
            for (let i = 0; i < 4; i++) {
                let rx = x + [1, -1, 0, 0][i];
                let ry = y + [0, 0, 1, -1][i];
                if (rx < 0 || rx >= width) continue;
                if (ry < 0 || ry >= height) continue;
                if (!outline[rx][ry]) continue;
                outline[rx][ry] = 2;
            }
        }
    }
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let i = (x + y*width)*4;
            for (let j = 0; j < 3; j++)
                outlineImageData.data[i + j] = 0;
            outlineImageData.data[i + 3] = (outline[x][y] == 2) ? 255 : 0;
        }
    }
    outlineCtx.putImageData(outlineImageData, 0, 0);
    return outlineCanvas;
}
export function createTextureSource(source: HTMLImageElement, texture: Texture, padding: number = 8): TextureSource {

    const { canvas: canvas, ctx: ctx } = createCanvas();
    const { canvas: originalCanvas, ctx: originalCtx } = createCanvas();
    const { canvas: whiteCanvas, ctx: whiteCtx } = createCanvas();
    const { canvas: originalAndOutlineCanvas, ctx: originalAndOutlineCtx } = createCanvas();
    const { canvas: whiteAndOutlineCanvas, ctx: whiteAndOutlineCtx } = createCanvas();

    canvas.width = source.width;
    canvas.height = source.height;
    ctx.drawImage(source, 0, 0);

    let textureX = texture.location.x;
    let textureY = texture.location.y;
    let textureWidth = texture.location.w;
    let textureHeight = texture.location.h;
    if (texture.crop) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let textureX2 = textureX + textureWidth;
        let textureY2 = textureY + textureHeight;
        while (textureX < textureX2) {
            let nSolid = 0;
            for (let y = textureY; y < textureY2; y++) {
                if (imageData.data[(textureX + y*canvas.width)*4 + 3] > 0)
                    nSolid++;
            }
            if (nSolid > 0) break;
            textureX++;
        }
        while (textureX2 > textureX) {
            let nSolid = 0;
            for (let y = textureY; y < textureY2; y++) {
                if (imageData.data[((textureX2-1) + y*canvas.width)*4 + 3] > 0)
                    nSolid++;
            }
            if (nSolid > 0) break;
            textureX2--;
        }
        while (textureY < textureY2) {
            let nSolid = 0;
            for (let x = textureX; x < textureX2; x++) {
                if (imageData.data[(x + textureY*canvas.width)*4 + 3] > 0)
                    nSolid++;
            }
            if (nSolid > 0) break;
            textureY++;
        }
        while (textureY2 > textureY) {
            let nSolid = 0;
            for (let x = textureX; x < textureX2; x++) {
                if (imageData.data[(x + (textureY2-1)*canvas.width)*4 + 3] > 0)
                    nSolid++;
            }
            if (nSolid > 0) break;
            textureY2--;
        }
        textureWidth = textureX2 - textureX;
        textureHeight = textureY2 - textureY;
    }

    const width = textureWidth + padding * 2;
    const height = textureHeight + padding * 2;

    originalCanvas.width = whiteCanvas.width = originalAndOutlineCanvas.width = whiteAndOutlineCanvas.width = width;
    originalCanvas.height = whiteCanvas.height = originalAndOutlineCanvas.height = whiteAndOutlineCanvas.height = height;

    originalCtx.drawImage(
        source,
        textureX, textureY, textureWidth, textureHeight,
        padding, padding, textureWidth, textureHeight,
    );

    whiteCtx.drawImage(originalCanvas, 0, 0);
    const whiteImageData = whiteCtx.getImageData(0, 0, width, height);
    for (let x = 0; x < width; x++)
        for (let y = 0; y < height; y++)
            for (let i = 0; i < 3; i++)
                whiteImageData.data[(x + y*width)*4 + i] = 255;
    whiteCtx.putImageData(whiteImageData, 0, 0);

    const outlineCanvas = createOutline(originalCanvas);

    originalAndOutlineCtx.drawImage(outlineCanvas, 0, 0);
    originalAndOutlineCtx.drawImage(originalCanvas, 0, 0);

    whiteAndOutlineCtx.drawImage(outlineCanvas, 0, 0);
    whiteAndOutlineCtx.drawImage(whiteCanvas, 0, 0);

    return {
        texture: texture,
        padding: padding,

        original: originalCanvas,
        white: whiteCanvas,
        outline: outlineCanvas,
        originalAndOutline: originalAndOutlineCanvas,
        whiteAndOutline: whiteAndOutlineCanvas,
    };

}
export type ColorMappedTextureSource = {
    texture: Texture,
    padding: number,

    generator: (color: util.Color, outline?: boolean) => HTMLCanvasElement,
};
export function createColorMappedTextureSource(source: HTMLImageElement, texture: Texture, padding: number = 8): ColorMappedTextureSource {
    const { original } = createTextureSource(source, texture, padding);
    const originalCtx = original.getContext("2d");
    if (!originalCtx) throw "How did this happen?";

    const originalImageData = originalCtx.getImageData(0, 0, original.width, original.height);

    const colors: util.StringMap<[HTMLCanvasElement, HTMLCanvasElement]> = {};

    return {
        texture: texture,
        padding: padding,

        generator: (color: util.Color, outline?: boolean) => {
            outline ??= false;
            if (color.toHex(false) in colors) return colors[color.toHex(false)][+outline];
            const newRGB = color.rgb;
            const { canvas, ctx } = createCanvas();
            canvas.width = original.width;
            canvas.height = original.height;
            ctx.putImageData(originalImageData, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let x = 0; x < canvas.width; x++) {
                for (let y = 0; y < canvas.height; y++) {
                    const oldRGB = new Array(3).fill(null).map((_, i) => imageData.data[(x + y*canvas.width)*4 + i]) as util.vec3;
                    if (oldRGB[0] !== oldRGB[1]) continue;
                    if (oldRGB[1] !== oldRGB[2]) continue;
                    const p = oldRGB[0] / 255;
                    for (let i = 0; i < 3; i++)
                        imageData.data[(x + y*canvas.width)*4 + i] = util.lerp(newRGB[i], 255, p);
                }
            }
            ctx.putImageData(imageData, 0, 0);
            const outlineCanvas = createOutline(canvas);
            const { canvas: canvasOutlined, ctx: ctxOutlined } = createCanvas();
            canvasOutlined.width = canvas.width;
            canvasOutlined.height = canvas.height;
            ctxOutlined.drawImage(outlineCanvas, 0, 0);
            ctxOutlined.drawImage(canvas, 0, 0);
            return (colors[color.toHex(false)] = [canvas, canvasOutlined])[+outline];
        },
    };
}
