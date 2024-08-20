function castObject(object) {
    return new Object(object);
}
function castArray(object) {
    return Array.from(object ?? []);
}
function castNumber(object, def = 0) {
    return Number(object ?? def);
}
function castBoolean$1(object, def = false) {
    return !!(object ?? def);
}
function castString(object, def = "") {
    return String(object ?? def);
}
function castNullishString(object) {
    if (object == null)
        return null;
    return castString(object);
}
function castNumberArray(object) {
    return castArray(object).map(value => castNumber(value));
}
function castStringArray(object) {
    return castArray(object).map(value => castString(value));
}
function castVec1(object) {
    let values = castNumberArray(object);
    values.splice(1);
    while (values.length < 1)
        values.push(0);
    return values;
}
function castVec2$1(object) {
    let values = castNumberArray(object);
    values.splice(2);
    while (values.length < 2)
        values.push(0);
    return values;
}
function castVec3(object) {
    let values = castNumberArray(object);
    values.splice(3);
    while (values.length < 3)
        values.push(0);
    return values;
}
function castVec4(object) {
    let values = castNumberArray(object);
    values.splice(4);
    while (values.length < 4)
        values.push(0);
    return values;
}
const EPSILON = 0.000001;
const NUMBERS = "0123456789";
const ALPHABETUPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ALPHABETLOWER = "abcdefghijklmnopqrstuvwxyz";
const ALPHABETALL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE16 = "0123456789abcdef";
const BASE64 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";
const BASE256 = [
    ...BASE64.split("").map(c => c.charCodeAt(0)),
    192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207,
    208, 209, 210, 211, 212, 213, 214, 216, 217, 218, 219, 220, 221, 222, 223, 224,
    225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240,
    241, 242, 243, 244, 245, 246, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257,
    258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273,
    274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289,
    290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305,
    306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321,
    322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337,
    338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353,
    354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 368, 369,
    370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385,
].map(c => String.fromCharCode(c)).join("");
const VARIABLE = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
if (NUMBERS.length !== 10)
    throw new Error("NUMBERS character set has incorrect length: " + NUMBERS.length);
if (ALPHABETUPPER.length !== 26)
    throw new Error("ALPHABETUPPER character set has incorrect length: " + ALPHABETUPPER.length);
if (ALPHABETLOWER.length !== 26)
    throw new Error("ALPHABETUPPER character set has incorrect length: " + ALPHABETLOWER.length);
if (ALPHABETLOWER !== ALPHABETUPPER.toLowerCase())
    throw new Error("ALPHABETLOWER and ALPHABETUPPER do not match");
if (BASE16.length !== 16)
    throw new Error("BASE16 character set has incorrect length: " + BASE16.length);
if (BASE64.length !== 64)
    throw new Error("BASE64 character set has incorrect length: " + BASE64.length);
if (BASE256.length !== 256)
    throw new Error("BASE256 character set has incorrect length: " + BASE256.length);
if (VARIABLE.length !== 63)
    throw new Error("VARIABLE character set has incorrect length: " + VARIABLE.length);
const MAGIC = "_*[[;ƒ";
const TEXTENCODER = new TextEncoder();
const TEXTDECODER = new TextDecoder();
function sumArray(array) {
    return array.reduce((sum, x) => sum + x, 0);
}
function flattenArray(array) {
    return array.reduce((sum, x) => {
        if (Array.isArray(x))
            sum.push(...flattenArray(x));
        else
            sum.push(x);
        return sum;
    }, []);
}
function collapseArray(array) {
    return array.reduce((sum, x) => {
        if (Array.isArray(x))
            sum.push(...x);
        else
            sum.push(x);
        return sum;
    }, []);
}
function allOfArray(array, callback = null) {
    for (let value of array) {
        let booleanValue = !!value;
        if (callback)
            booleanValue = callback(value);
        if (!booleanValue)
            return false;
    }
    return true;
}
function anyOfArray(array, callback = null) {
    for (let value of array) {
        let booleanValue = !!value;
        if (callback)
            booleanValue = callback(value);
        if (booleanValue)
            return true;
    }
    return false;
}
function equals(vec1, v2) {
    if (Array.isArray(vec1)) {
        if (!Array.isArray(v2))
            return false;
        if (vec1.length != v2.length)
            return false;
        for (let i = 0; i < vec1.length; i++)
            if (!equals(vec1[i], v2[i]))
                return false;
        return true;
    }
    if (typeof (vec1) === "object") {
        if (typeof (v2) !== "object")
            return false;
        for (let k in vec1) {
            if (!(k in v2))
                return false;
            if (!equals(vec1[k], v2[k]))
                return false;
        }
        for (let k in v2) {
            if (!(k in vec1))
                return false;
            if (!equals(v2[k], vec1[k]))
                return false;
        }
        return true;
    }
    return vec1 === v2;
}
function lerp(a, b, p) {
    if (typeof (a) === "number" && typeof (b) === "number")
        return a + p * (b - a);
    if ((a instanceof Vec1) && (b instanceof Vec1))
        return new Vec1([lerp(a.x, b.x, p)]);
    if ((a instanceof Vec2) && (b instanceof Vec2))
        return new Vec2([lerp(a.x, b.x, p), lerp(a.y, b.y, p)]);
    if ((a instanceof Vec3) && (b instanceof Vec3))
        return new Vec3([lerp(a.x, b.x, p), lerp(a.y, b.y, p), lerp(a.z, b.z, p)]);
    if ((a instanceof Vec4) && (b instanceof Vec4))
        return new Vec4([lerp(a.w, b.w, p), lerp(a.x, b.x, p), lerp(a.y, b.y, p), lerp(a.z, b.z, p)]);
    if ((a instanceof Color) && (b instanceof Color))
        return new Color([lerp(a.r, b.r, p), lerp(a.g, b.g, p), lerp(a.b, b.b, p), lerp(a.a, b.a, p)]);
    return null;
}
function lerpE(a, b, p) {
    if (typeof (a) === "number" && typeof (b) === "number") {
        if (p > 0) {
            if (Math.abs(a - b) > EPSILON)
                return lerp(a, b, p);
            return b;
        }
        return lerp(a, b, p);
    }
    if ((a instanceof Vec1) && (b instanceof Vec1))
        return new Vec1([lerpE(a.x, b.x, p)]);
    if ((a instanceof Vec2) && (b instanceof Vec2))
        return new Vec2([lerpE(a.x, b.x, p), lerpE(a.y, b.y, p)]);
    if ((a instanceof Vec3) && (b instanceof Vec3))
        return new Vec3([lerpE(a.x, b.x, p), lerpE(a.y, b.y, p), lerpE(a.z, b.z, p)]);
    if ((a instanceof Vec4) && (b instanceof Vec4))
        return new Vec4([lerpE(a.w, b.w, p), lerpE(a.x, b.x, p), lerpE(a.y, b.y, p), lerpE(a.z, b.z, p)]);
    if ((a instanceof Color) && (b instanceof Color))
        return new Color([lerpE(a.r, b.r, p), lerpE(a.g, b.g, p), lerpE(a.b, b.b, p), lerpE(a.a, b.a, p)]);
    return null;
}
const FULLTURNDEGREES = 360;
const FULLTURNRADIANS = 2 * Math.PI;
function clampAngleDegrees(x) { return ((x % FULLTURNDEGREES) + FULLTURNDEGREES) % FULLTURNDEGREES; }
function clampAngleRadians(x) { return ((x % FULLTURNRADIANS) + FULLTURNRADIANS) % FULLTURNRADIANS; }
function angleRelDegrees(a, b) {
    let diff = clampAngleDegrees(clampAngleDegrees(b) - clampAngleDegrees(a));
    if (diff > FULLTURNDEGREES / 2)
        diff -= FULLTURNDEGREES;
    return diff;
}
function angleRelRadians(a, b) {
    let diff = clampAngleRadians(clampAngleRadians(b) - clampAngleRadians(a));
    if (diff > FULLTURNRADIANS / 2)
        diff -= FULLTURNRADIANS;
    return diff;
}
function sin(x) { return Math.sin(x * (Math.PI / 180)); }
function cos(x) { return Math.cos(x * (Math.PI / 180)); }
function getTime() { return Date.now(); }
const UNITVALUES = {
    ms: 1,
    s: 1000,
    min: 60,
    hr: 60,
    d: 24,
    yr: 365,
};
function splitTimeUnits(time) {
    time = Math.max(0, time);
    let units = Object.keys(UNITVALUES);
    let values = new Array(units.length).fill(0);
    values[0] = time;
    units.forEach((unit, i) => {
        if (i <= 0)
            return;
        values[i] += Math.floor(values[i - 1] / UNITVALUES[unit]);
        values[i - 1] -= values[i] * UNITVALUES[unit];
    });
    return values;
}
function formatTime(time) {
    let isNegative = time < 0;
    time = Math.abs(time);
    let values = splitTimeUnits(time);
    values[0] = Math.round(values[0]);
    while (values.length > 2) {
        if (values.at(-1) > 0)
            break;
        values.pop();
    }
    let stringValues = values.map((value, i) => {
        let stringValue = String(value);
        if (i >= values.length - 1)
            return stringValue;
        let wantedLength = String(Object.values(UNITVALUES)[i + 1] - 1).length;
        if (i > 0)
            stringValue = stringValue.padStart(wantedLength, "0");
        else
            stringValue = stringValue.padEnd(wantedLength, "0");
        return stringValue;
    });
    return (isNegative ? "-" : "") + stringValues.slice(1).reverse().join(":") + "." + stringValues[0];
}
function formatText(value) {
    let string = castString(value);
    if (string.length <= 0)
        return string;
    return string
        .split("")
        .map((character, i) => {
        if (!ALPHABETALL.includes(character)) {
            if ("-_/ \\|,.".includes(character))
                return " ";
            return character;
        }
        if (i <= 0 || !ALPHABETALL.includes(string[i - 1]))
            return character.toUpperCase();
        return character.toLowerCase();
    })
        .join("");
}
async function loadImage(src) {
    return await new Promise((res, rej) => {
        let img = new Image();
        img.addEventListener("load", e => res(img));
        img.addEventListener("error", e => rej(e));
        img.src = src;
    });
}
async function wait(time) {
    return await new Promise((res, rej) => setTimeout(() => res(), time));
}
async function timeout(time, value) {
    return await new Promise((res, rej) => {
        (async () => {
            if (value instanceof Promise) {
                try {
                    res(await value);
                }
                catch (e) {
                    rej(e);
                }
                return;
            }
            try {
                res(await value());
            }
            catch (e) {
                rej(e);
            }
        })();
        (async () => {
            await wait(time);
            rej("timeout");
        })();
    });
}
function splitPath(pth) { return pth.split(/\/\\/); }
function splitString(string) {
    let parts = [];
    for (let i = 0; i < string.length; i++) {
        let character = string[i];
        if (NUMBERS.includes(character)) {
            let number = NUMBERS.indexOf(character);
            if (typeof (parts.at(-1)) != "number")
                parts.push(number);
            else
                parts[parts.length - 1] = parts[parts.length - 1] * 10 + number;
            continue;
        }
        if (typeof (parts.at(-1)) != "string")
            parts.push(character);
        else
            parts[parts.length - 1] += character;
    }
    return parts;
}
function compareString(string1, string2) {
    string1 = string1.toLowerCase();
    string2 = string2.toLowerCase();
    let string1Parts = splitString(string1);
    let string2Parts = splitString(string2);
    for (let i = 0; i < Math.min(string1Parts.length, string2Parts.length); i++) {
        if (string1Parts[i] < string2Parts[i])
            return -1;
        if (string1Parts[i] > string2Parts[i])
            return +1;
    }
    return string1Parts.length - string2Parts.length;
}
function choose(source) {
    let sourceArray = Array.from(source);
    return sourceArray[Math.floor(sourceArray.length * Math.random())];
}
function jargon(length, source) {
    length = Math.round(Math.max(0, length));
    return new Array(length).fill(null).map(_ => choose(source)).join("");
}
function jargonNumbers(length) { return jargon(length, NUMBERS); }
function jargonAlphabetUpper(length) { return jargon(length, ALPHABETUPPER); }
function jargonAlphabetLower(length) { return jargon(length, ALPHABETLOWER); }
function jargonAlphabetAll(length) { return jargon(length, ALPHABETALL); }
function jargonBase16(length) { return jargon(length, BASE16); }
function jargonBase64(length) { return jargon(length, BASE64); }
function jargonBase256(length) { return jargon(length, BASE256); }
function jargonVariable(length) { return jargon(length, VARIABLE); }
function stringifyError(error) { return stringifyErrorInternal(error); }
function stringifyErrorInternal(error, indentation = "") {
    if (error instanceof ErrorEvent) {
        return [
            String(error.message),
            "  " + error.filename + " @ " + error.lineno + ":" + error.colno,
        ].join("\n");
    }
    let lines = [String(error)];
    if (error.stack)
        lines.push(String(error.stack));
    lines = flattenArray(lines).join("\n").split("\n").filter(part => part.length > 0);
    if (lines[0] === lines[1])
        lines.shift();
    return lines.map(line => indentation + line).join("\n");
}
function getStack() {
    try {
        throw new Error("stack-get");
    }
    catch (error) {
        if (error instanceof Error)
            return String(error.stack);
        return "";
    }
}
const ease = {
    sinI: (value) => {
        value = Math.min(1, Math.max(0, value));
        return 1 - Math.cos((value * Math.PI) / 2);
    },
    sinO: (value) => {
        value = Math.min(1, Math.max(0, value));
        return 1 - ease.sinI(1 - value);
    },
    sinIO: (value) => {
        value = Math.min(1, Math.max(0, value));
        if (value < 0.5)
            return lerp(0, 0.5, ease.sinI(value / 0.5));
        return lerp(0.5, 1, ease.sinO((value - 0.5) / 0.5));
    },
    sin: (value, mode) => {
        switch (mode) {
            case "I": return ease.sinI(value);
            case "O": return ease.sinO(value);
            case "IO": return ease.sinIO(value);
        }
    },
    quadI: (value) => {
        value = Math.min(1, Math.max(0, value));
        return (value ** 2);
    },
    quadO: (value) => {
        value = Math.min(1, Math.max(0, value));
        return 1 - ease.quadI(1 - value);
    },
    quadIO: (value) => {
        value = Math.min(1, Math.max(0, value));
        if (value < 0.5)
            return lerp(0, 0.5, ease.quadI(value / 0.5));
        return lerp(0.5, 1, ease.quadO((value - 0.5) / 0.5));
    },
    quad: (value, mode) => {
        switch (mode) {
            case "I": return ease.quadI(value);
            case "O": return ease.quadO(value);
            case "IO": return ease.quadIO(value);
        }
    },
    cubicI: (value) => {
        value = Math.min(1, Math.max(0, value));
        return (value ** 3);
    },
    cubicO: (value) => {
        value = Math.min(1, Math.max(0, value));
        return 1 - ease.cubicI(1 - value);
    },
    cubicIO: (value) => {
        value = Math.min(1, Math.max(0, value));
        if (value < 0.5)
            return lerp(0, 0.5, ease.cubicI(value / 0.5));
        return lerp(0.5, 1, ease.cubicO((value - 0.5) / 0.5));
    },
    cubic: (value, mode) => {
        switch (mode) {
            case "I": return ease.cubicI(value);
            case "O": return ease.cubicO(value);
            case "IO": return ease.cubicIO(value);
        }
    },
    quartI: (value) => {
        value = Math.min(1, Math.max(0, value));
        return (value ** 4);
    },
    quartO: (value) => {
        value = Math.min(1, Math.max(0, value));
        return 1 - ease.quartI(1 - value);
    },
    quartIO: (value) => {
        value = Math.min(1, Math.max(0, value));
        if (value < 0.5)
            return lerp(0, 0.5, ease.quartI(value / 0.5));
        return lerp(0.5, 1, ease.quartO((value - 0.5) / 0.5));
    },
    quart: (value, mode) => {
        switch (mode) {
            case "I": return ease.quartI(value);
            case "O": return ease.quartO(value);
            case "IO": return ease.quartIO(value);
        }
    },
    quintI: (value) => {
        value = Math.min(1, Math.max(0, value));
        return (value ** 5);
    },
    quintO: (value) => {
        value = Math.min(1, Math.max(0, value));
        return 1 - ease.quintI(1 - value);
    },
    quintIO: (value) => {
        value = Math.min(1, Math.max(0, value));
        if (value < 0.5)
            return lerp(0, 0.5, ease.quintI(value / 0.5));
        return lerp(0.5, 1, ease.quintO((value - 0.5) / 0.5));
    },
    quint: (value, mode) => {
        switch (mode) {
            case "I": return ease.quintI(value);
            case "O": return ease.quintO(value);
            case "IO": return ease.quintIO(value);
        }
    },
    expoI: (value) => {
        value = Math.min(1, Math.max(0, value));
        return (value === 0) ? 0 : (2 ** (10 * value - 10));
    },
    expoO: (value) => {
        value = Math.min(1, Math.max(0, value));
        return 1 - ease.expoI(1 - value);
    },
    expoIO: (value) => {
        value = Math.min(1, Math.max(0, value));
        if (value === 0)
            return 0;
        if (value === 1)
            return 1;
        if (value < 0.5)
            return lerp(0, 0.5, ease.expoI(value / 0.5));
        return lerp(0.5, 1, ease.expoO((value - 0.5) / 0.5));
    },
    expo: (value, mode) => {
        switch (mode) {
            case "I": return ease.expoI(value);
            case "O": return ease.expoO(value);
            case "IO": return ease.expoIO(value);
        }
    },
    circI: (value) => {
        value = Math.min(1, Math.max(0, value));
        return 1 - Math.sqrt(1 - (value ** 2));
    },
    circO: (value) => {
        value = Math.min(1, Math.max(0, value));
        return 1 - ease.circI(1 - value);
    },
    circIO: (value) => {
        value = Math.min(1, Math.max(0, value));
        if (value < 0.5)
            return lerp(0, 0.5, ease.circI(value / 0.5));
        return lerp(0.5, 1, ease.circO((value - 0.5) / 0.5));
    },
    circ: (value, mode) => {
        switch (mode) {
            case "I": return ease.circI(value);
            case "O": return ease.circO(value);
            case "IO": return ease.circIO(value);
        }
    },
    backI: (value) => {
        value = Math.min(1, Math.max(0, value));
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * (value ** 3) - c1 * (value ** 2);
    },
    backO: (value) => {
        value = Math.min(1, Math.max(0, value));
        return 1 - ease.backI(1 - value);
    },
    backIO: (value) => {
        value = Math.min(1, Math.max(0, value));
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        return value < 0.5
            ? (((2 * value) ** 2) * ((c2 + 1) * 2 * value - c2)) / 2
            : (((2 * value - 2) ** 2) * ((c2 + 1) * (value * 2 - 2) + c2) + 2) / 2;
    },
    back: (value, mode) => {
        switch (mode) {
            case "I": return ease.backI(value);
            case "O": return ease.backO(value);
            case "IO": return ease.backIO(value);
        }
    },
    elasticI: (value) => {
        value = Math.min(1, Math.max(0, value));
        const c4 = (2 * Math.PI) / 3;
        if (value === 0)
            return 0;
        if (value === 1)
            return 1;
        return -(2 ** (10 * value - 10)) * Math.sin((value * 10 - 10.75) * c4);
    },
    elasticO: (value) => {
        value = Math.min(1, Math.max(0, value));
        return 1 - ease.elasticI(1 - value);
    },
    elasticIO: (value) => {
        value = Math.min(1, Math.max(0, value));
        const c5 = (2 * Math.PI) / 4.5;
        if (value === 0)
            return 0;
        if (value === 1)
            return 1;
        if (value < 0.5)
            return -((2 ** (20 * value - 10)) * Math.sin((20 * value - 11.125) * c5)) / 2;
        return ((2 ** (-20 * value + 10)) * Math.sin((20 * value - 11.125) * c5)) / 2 + 1;
    },
    elastic: (value, mode) => {
        switch (mode) {
            case "I": return ease.elasticI(value);
            case "O": return ease.elasticO(value);
            case "IO": return ease.elasticIO(value);
        }
    },
    bounceI: (value) => {
        value = Math.min(1, Math.max(0, value));
        return 1 - ease.bounceO(1 - value);
    },
    bounceO: (value) => {
        value = Math.min(1, Math.max(0, value));
        const n1 = 7.5625;
        const d1 = 2.75;
        if (value < 1 / d1)
            return n1 * (value * value);
        if (value < 2 / d1)
            return n1 * (value -= 1.5 / d1) * value + 0.75;
        if (value < 2.5 / d1)
            return n1 * (value -= 2.25 / d1) * value + 0.9375;
        return n1 * (value -= 2.625 / d1) * value + 0.984375;
    },
    bounceIO: (value) => {
        value = Math.min(1, Math.max(0, value));
        if (value < 0.5)
            return (1 - ease.bounceO(1 - 2 * value)) / 2;
        return (1 + ease.bounceI(2 * value - 1)) / 2;
    },
    bounce: (value, mode) => {
        switch (mode) {
            case "I": return ease.bounceI(value);
            case "O": return ease.bounceO(value);
            case "IO": return ease.bounceIO(value);
        }
    },
    ease: (value, type, mode) => {
        value = Math.min(1, Math.max(0, value));
        switch (type) {
            case "sin": return ease.sin(value, mode);
            case "quad": return ease.quad(value, mode);
            case "cubic": return ease.cubic(value, mode);
            case "quart": return ease.quart(value, mode);
            case "quint": return ease.quint(value, mode);
            case "expo": return ease.expo(value, mode);
            case "circ": return ease.circ(value, mode);
            case "back": return ease.back(value, mode);
            case "elastic": return ease.elastic(value, mode);
            case "bounce": return ease.bounce(value, mode);
        }
    },
};
class Target {
    handlers;
    nHandlers;
    constructor() {
        this.handlers = new Map();
        this.nHandlers = 0;
    }
    addLinkedHandler(objectLink, event, callback) {
        if (!this.handlers.has(objectLink))
            this.handlers.set(objectLink, {});
        let handlerGroup = this.handlers.get(objectLink);
        if (handlerGroup == null)
            return false;
        if (!(event in handlerGroup))
            handlerGroup[event] = new Set();
        if (handlerGroup[event].has(callback))
            return false;
        handlerGroup[event].add(callback);
        this.nHandlers++;
        return callback;
    }
    remLinkedHandler(objectLink, event, callback) {
        if (!this.handlers.has(objectLink))
            return false;
        let handlerGroup = this.handlers.get(objectLink);
        if (handlerGroup == null)
            return false;
        if (!(event in handlerGroup))
            return false;
        if (!handlerGroup[event].has(callback))
            return false;
        handlerGroup[event].delete(callback);
        this.nHandlers--;
        if (handlerGroup[event].size <= 0)
            delete handlerGroup[event];
        if (Object.keys(handlerGroup).length <= 0)
            this.handlers.delete(objectLink);
        return callback;
    }
    hasLinkedHandler(objectLink, event, callback) {
        if (!this.handlers.has(objectLink))
            return false;
        let handlerGroup = this.handlers.get(objectLink);
        if (handlerGroup == null)
            return false;
        if (!(event in handlerGroup))
            return false;
        return handlerGroup[event].has(callback);
    }
    getLinkedHandlers(objectLink, event) {
        if (!this.handlers.has(objectLink))
            return [];
        let handlerGroup = this.handlers.get(objectLink);
        if (handlerGroup == null)
            return [];
        if (!(event in handlerGroup))
            return [];
        return [...handlerGroup[event]];
    }
    clearLinkedHandlers(objectLink, event) {
        let callbacks = this.getLinkedHandlers(objectLink, event);
        callbacks.forEach(callback => this.remLinkedHandler(objectLink, event, callback));
        return callbacks;
    }
    addHandler(event, callback) { return this.addLinkedHandler(null, event, callback); }
    remHandler(event, callback) { return this.remLinkedHandler(null, event, callback); }
    hasHandler(event, callback) { return this.hasLinkedHandler(null, event, callback); }
    getHandlers(event) { return this.getLinkedHandlers(null, event); }
    clearHandlers(event) { return this.clearLinkedHandlers(null, event); }
    post(event, ...args) {
        if (this.nHandlers <= 0)
            return;
        for (let handlerGroup of this.handlers.values()) {
            if (!(event in handlerGroup))
                continue;
            handlerGroup[event].forEach(callback => callback(...args));
        }
    }
    async postResult(event, ...args) {
        if (this.nHandlers <= 0)
            return [];
        let callbacks = [];
        for (let handlerGroup of this.handlers.values()) {
            if (!(event in handlerGroup))
                continue;
            callbacks.push(...handlerGroup[event]);
        }
        return await Promise.all(callbacks.map(async (callback) => await callback(...args)));
    }
    change(attribute, from, to) {
        if (this.nHandlers <= 0)
            return;
        this.post("change", attribute, from, to);
        this.post("change-" + attribute, from, to);
    }
    onAdd() { return this.post("add"); }
    onRem() { return this.post("rem"); }
}
class Color extends Target {
    _r;
    _g;
    _b;
    _a;
    hsvCache;
    hexCache;
    hexCacheNoAlpha;
    rgbaCache;
    rgbCache;
    constructor(source) {
        super();
        this._r = this._g = this._b = this._a = 0;
        this.hsvCache = this.hexCache = this.hexCacheNoAlpha = this.rgbaCache = this.rgbCache = null;
        this.uncache();
        this.set(source);
    }
    static args(source) {
        if (source instanceof Color)
            return source.rgba;
        if (source instanceof Vec1)
            return this.args(source.x);
        if (source instanceof Vec2)
            return this.args(source.xy);
        if (source instanceof Vec3)
            return this.args(source.xyz);
        if (source instanceof Vec4)
            return this.args(source.wxyz);
        if (Array.isArray(source)) {
            if (source.length === 1)
                return this.args(source[0]);
            if (source.length === 2) {
                let rgb = [0, 0, 0];
                let hexadecimal = source[0];
                for (let i = 2; i >= 0; i--) {
                    let value = hexadecimal % 256;
                    hexadecimal = Math.floor(hexadecimal / 256);
                    rgb[i] = value;
                }
                return [...rgb, source[1]];
            }
            if (source.length === 3)
                return [...source, 1];
            return source;
        }
        if (typeof (source) === "string") {
            if (source.startsWith("#")) {
                source = source.slice(1).toLowerCase();
                for (let character of source) {
                    if (BASE16.includes(character))
                        continue;
                    return this.args([0, 1]);
                }
                let values = this.args([0, 1]);
                if (source.length === 3 || source.length === 4) {
                    for (let i = 0; i < source.length; i++) {
                        let value = BASE16.indexOf(source[i]);
                        value = value * 16 + value;
                        values[i] = value;
                    }
                    return values;
                }
                if (source.length === 6 || source.length === 8) {
                    for (let i = 0; i < source.length / 2; i++) {
                        let value = BASE16.indexOf(source[i * 2]) * 16 + BASE16.indexOf(source[i * 2 + 1]);
                        values[i] = value;
                    }
                }
                return values;
            }
            if ((source.startsWith("rgb(") || source.startsWith("rgba(")) && source.endsWith(")")) {
                source = source.slice(source.startsWith("rgb(") ? 4 : 5, -1);
                let parts = source.split(",").map(part => part.trim());
                if (parts.length !== 3 && parts.length !== 4)
                    return this.args([0, 1]);
                let values = this.args([0, 1]);
                for (let i = 0; i < parts.length; i++)
                    values[i] = parseFloat(parts[i]);
                return values;
            }
            if (source.startsWith("--"))
                return this.args(getComputedStyle(document.body).getPropertyValue(source));
            return this.args([0, 1]);
        }
        if (typeof (source) === "object")
            return [castNumber(source.r), castNumber(source.g), castNumber(source.b), castNumber(source.a)];
        if (typeof (source) !== "number")
            return this.args([0, 1]);
        return this.args([source, 1]);
    }
    set(source) {
        [this.r, this.g, this.b, this.a] = Color.args(source);
        return this;
    }
    clone() { return new Color(this); }
    uncache() { this.hsvCache = this.hexCache = this.hexCacheNoAlpha = this.rgbaCache = this.rgbCache = null; }
    get r() { return this._r; }
    set r(value) {
        value = Math.min(255, Math.max(0, value));
        if (this.r === value)
            return;
        this.uncache();
        this.change("r", this.r, this._r = value);
    }
    get g() { return this._g; }
    set g(value) {
        value = Math.min(255, Math.max(0, value));
        if (this.g === value)
            return;
        this.uncache();
        this.change("g", this.g, this._g = value);
    }
    get b() { return this._b; }
    set b(value) {
        value = Math.min(255, Math.max(0, value));
        if (this.b === value)
            return;
        this.uncache();
        this.change("b", this.b, this._b = value);
    }
    get a() { return this._a; }
    set a(value) {
        value = Math.min(1, Math.max(0, value));
        if (this.a === value)
            return;
        this.uncache();
        this.change("a", this.a, this._a = value);
    }
    get rgb() { return [this.r, this.g, this.b]; }
    set rgb(value) { [this.r, this.g, this.b] = value; }
    get rgba() { return [this.r, this.g, this.b, this.a]; }
    set rgba(value) { [this.r, this.g, this.b, this.a] = value; }
    averageDifference(source) {
        let [r, g, b, a] = Color.args(source);
        return sumArray([
            Math.abs(this.r - r),
            Math.abs(this.g - g),
            Math.abs(this.b - b),
            Math.abs(this.a * 255 - a * 255),
        ]) / 4;
    }
    get hsva() {
        if (this.hsvCache == null) {
            let r = this.r / 255, g = this.g / 255, b = this.b / 255;
            let cMax = Math.max(r, g, b), cMin = Math.min(r, g, b);
            let delta = cMax - cMin;
            let h = 0;
            if (delta > 0) {
                let rgb = [r, g, b];
                for (let i = 0; i < 3; i++) {
                    if (cMax != rgb[i])
                        continue;
                    h = 60 * (((((rgb[(i + 1) % 3] - rgb[(i + 2) % 3]) / delta + i * 2) % 6) + 6) % 6);
                    break;
                }
            }
            let s = (cMax > 0) ? (delta / cMax) : 0;
            let v = cMax;
            this.hsvCache = [h, s, v];
        }
        return [...this.hsvCache, this.a];
    }
    set hsva(hsva) {
        hsva[0] = clampAngleDegrees(hsva[0]);
        for (let i = 1; i < 4; i++)
            hsva[i] = Math.min(1, Math.max(0, hsva[i]));
        let [h, s, v, a] = hsva;
        let c = v * s;
        let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        let m = v - c;
        let rgb = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
            if (h >= (i + 1) * 120)
                continue;
            let u = i, v = (i + 1) % 3;
            if (h >= (i + 0.5) * 120)
                [u, v] = [v, u];
            rgb[u] = c;
            rgb[v] = x;
            break;
        }
        rgb = rgb.map(v => (v + m) * 255);
        this.rgba = [...rgb, a];
    }
    get h() { return this.hsva[0]; }
    set h(value) {
        let hsva = this.hsva;
        hsva[0] = value;
        this.hsva = hsva;
    }
    get s() { return this.hsva[1]; }
    set s(value) {
        let hsva = this.hsva;
        hsva[1] = value;
        this.hsva = hsva;
    }
    get v() { return this.hsva[2]; }
    set v(value) {
        let hsva = this.hsva;
        hsva[2] = value;
        this.hsva = hsva;
    }
    get hsv() { return this.hsva.slice(0, 3); }
    set hsv(hsv) {
        let hsva = this.hsva;
        [hsva[0], hsva[1], hsva[2]] = hsv;
        this.hsva = hsva;
    }
    equals(source) {
        let [r, g, b, a] = Color.args(source);
        if (this.r != r)
            return false;
        if (this.g != g)
            return false;
        if (this.b != b)
            return false;
        if (this.a != a)
            return false;
        return true;
    }
    toHex(useAlpha = true) {
        let value = useAlpha ? this.hexCache : this.hexCacheNoAlpha;
        if (value == null) {
            value = "#" + (useAlpha ? this.rgba : this.rgb).map((v, i) => {
                if (i === 3)
                    v *= 255;
                v = Math.round(v);
                return BASE16[Math.floor(v / 16)] + BASE16[v % 16];
            }).join("");
            if (useAlpha)
                this.hexCache = value;
            else
                this.hexCacheNoAlpha = value;
        }
        return value;
    }
    toRGBA() {
        if (this.rgbaCache == null)
            this.rgbaCache = "rgba(" + this.rgba.join(",") + ")";
        return this.rgbaCache;
    }
    toRGB() {
        if (this.rgbCache == null)
            this.rgbCache = "rgb(" + this.rgb.join(",") + ")";
        return this.rgbCache;
    }
}
class Range extends Target {
    _l;
    _r;
    _lInclude;
    _rInclude;
    constructor(source) {
        super();
        this._l = this._r = 0;
        this._lInclude = this._rInclude = true;
        this.set(source);
    }
    static args(source) {
        if (source instanceof Range)
            return [source.l, source.r, source.lInclude, source.rInclude];
        if (source instanceof Vec1)
            return this.args(source.x);
        if (source instanceof Vec2)
            return this.args(source.xy);
        if (Array.isArray(source)) {
            if (source.length === 1)
                return this.args([source[0], source[0]]);
            return [...source, true, true];
        }
        if (typeof (source) === "object")
            return [castNumber(source.l), castNumber(source.r), castBoolean$1(source.lInclude, true), castBoolean$1(source.rInclude, true)];
        if (typeof (source) !== "number")
            return this.args(0);
        return this.args([source]);
    }
    set(source) {
        [this.l, this.r, this.lInclude, this.rInclude] = Range.args(source);
        return this;
    }
    clone() { return new Range(this); }
    get l() { return this._l; }
    set l(value) {
        if (this.l === value)
            return;
        this.change("l", this.l, this._l = value);
    }
    get r() { return this._r; }
    set r(value) {
        if (this.r === value)
            return;
        this.change("r", this.r, this._r = value);
    }
    get lInclude() { return this._lInclude; }
    set lInclude(value) {
        if (this.lInclude === value)
            return;
        this.change("lInclude", this.lInclude, this._lInclude = value);
    }
    get rInclude() { return this._rInclude; }
    set rInclude(value) {
        if (this.rInclude === value)
            return;
        this.change("rInclude", this.rInclude, this._rInclude = value);
    }
    normalize() {
        if (this.l > this.r)
            [this.l, this.r] = [this.r, this.l];
        return this;
    }
    test(value) {
        if (this.lInclude && value < this.l)
            return false;
        if (!this.lInclude && value <= this.l)
            return false;
        if (this.rInclude && value > this.r)
            return false;
        if (!this.rInclude && value >= this.r)
            return false;
        return true;
    }
    clamp(value) { return Math.min(this.r, Math.max(this.l, value)); }
    lerp(p) {
        if (!Number.isFinite(this.l) || !Number.isFinite(this.r))
            return NaN;
        return lerp(this.l, this.r, p);
    }
    equals(source) {
        let args = Range.args(source);
        if (this.l !== args[0])
            return false;
        if (this.r !== args[1])
            return false;
        if (this.lInclude !== args[2])
            return false;
        if (this.rInclude !== args[3])
            return false;
        return true;
    }
    toString() { return (this.lInclude ? "[" : "(") + this.l + ", " + this.r + (this.rInclude ? "]" : ")"); }
}
class Vec1 extends Target {
    _x;
    constructor(source) {
        super();
        this._x = 0;
        this.set(source);
    }
    static args(source) {
        if (source instanceof Vec1 || source instanceof Vec2 || source instanceof Vec3 || source instanceof Vec4)
            return this.args(source.x);
        if (Array.isArray(source)) {
            return source.slice(0, 1);
        }
        if (typeof (source) === "object" && source)
            return [castNumber(source.x)];
        if (typeof (source) !== "number")
            return this.args(0);
        return this.args([source]);
    }
    set(source) {
        [this.x] = Vec1.args(source);
        return this;
    }
    clone() { return new Vec1(this); }
    get x() { return this._x; }
    set x(value) {
        if (this.x === value)
            return;
        this.change("x", this.x, this._x = value);
    }
    add(addend) {
        let args = Vec1.args(addend);
        return new Vec1([this.x + args[0]]);
    }
    sub(subtrahend) {
        let args = Vec1.args(subtrahend);
        return new Vec1([this.x - args[0]]);
    }
    mul(factor) {
        let args = Vec1.args(factor);
        return new Vec1([this.x * args[0]]);
    }
    div(divisor) {
        let args = Vec1.args(divisor);
        return new Vec1([this.x / args[0]]);
    }
    pow(exponent) {
        let args = Vec1.args(exponent);
        return new Vec1([this.x ** args[0]]);
    }
    map(callback) { return new Vec1([callback(this.x)]); }
    abs() { return this.map(Math.abs); }
    floor() { return this.map(Math.floor); }
    ceil() { return this.map(Math.ceil); }
    round() { return this.map(Math.round); }
    iadd(addend) {
        let [x] = Vec1.args(addend);
        this.x += x;
        return this;
    }
    isub(subtrahend) {
        let [x] = Vec1.args(subtrahend);
        this.x -= x;
        return this;
    }
    imul(factor) {
        let [x] = Vec1.args(factor);
        this.x *= x;
        return this;
    }
    idiv(divisor) {
        let [x] = Vec1.args(divisor);
        this.x /= x;
        return this;
    }
    ipow(exponent) {
        let [x] = Vec1.args(exponent);
        this.x **= x;
        return this;
    }
    imap(callback) {
        this.x = callback(this.x);
        return this;
    }
    iabs() { return this.imap(Math.abs); }
    ifloor() { return this.imap(Math.floor); }
    iceil() { return this.imap(Math.ceil); }
    iround() { return this.imap(Math.round); }
    dist(dest) {
        let [x] = Vec1.args(dest);
        return Math.abs(this.x - x);
    }
    equals(comparand) {
        let [x] = Vec1.args(comparand);
        return (this.x === x);
    }
    toString() { return "<" + this.x + ">"; }
}
class Vec2 extends Target {
    _x;
    _y;
    constructor(source) {
        super();
        this._x = this._y = 0;
        this.set(source);
    }
    static args(source) {
        if (source instanceof Vec1)
            return this.args([source.x, 0]);
        if (source instanceof Vec2 || source instanceof Vec3 || source instanceof Vec4)
            return this.args([source.x, source.y]);
        if (Array.isArray(source)) {
            if (source.length === 1)
                return this.args([source[0], source[0]]);
            return source.slice(0, 2);
        }
        if (typeof (source) === "object" && source)
            return [castNumber(source.x), castNumber(source.y)];
        if (typeof (source) !== "number")
            return this.args(0);
        return this.args([source]);
    }
    set(source) {
        [this.x, this.y] = Vec2.args(source);
        return this;
    }
    clone() { return new Vec2(this); }
    get x() { return this._x; }
    set x(value) {
        if (this.x === value)
            return;
        this.change("x", this.x, this._x = value);
    }
    get y() { return this._y; }
    set y(value) {
        if (this.y === value)
            return;
        this.change("y", this.y, this._y = value);
    }
    get xy() { return [this.x, this.y]; }
    set xy(value) { [this.x, this.y] = value; }
    add(addend) {
        let [x, y] = Vec2.args(addend);
        return new Vec2([this.x + x, this.y + y]);
    }
    sub(subtrahend) {
        let [x, y] = Vec2.args(subtrahend);
        return new Vec2([this.x - x, this.y - y]);
    }
    mul(factor) {
        let [x, y] = Vec2.args(factor);
        return new Vec2([this.x * x, this.y * y]);
    }
    div(divisor) {
        let [x, y] = Vec2.args(divisor);
        return new Vec2([this.x / x, this.y / y]);
    }
    pow(exponent) {
        let [x, y] = Vec2.args(exponent);
        return new Vec2([this.x ** x, this.y ** y]);
    }
    map(callback) { return new Vec2([callback(this.x), callback(this.y)]); }
    abs() { return this.map(Math.abs); }
    floor() { return this.map(Math.floor); }
    ceil() { return this.map(Math.ceil); }
    round() { return this.map(Math.round); }
    rotateOrigin(angleDegrees) {
        let angleRadians = angleDegrees * Math.PI / 180;
        return new Vec2([
            this.x * Math.cos(angleRadians) + this.y * Math.sin(angleRadians),
            this.x * Math.cos(angleRadians - Math.PI / 2) + this.y * Math.sin(angleRadians - Math.PI / 2),
        ]);
    }
    rotate(angleDegrees, origin) { return this.sub(origin).irotateOrigin(angleDegrees).iadd(origin); }
    normalize() { return (this.dist(0) > 0) ? this.div(this.dist(0)) : new Vec2(this); }
    iadd(addend) {
        let [x, y] = Vec2.args(addend);
        this.x += x;
        this.y += y;
        return this;
    }
    isub(subtrahend) {
        let [x, y] = Vec2.args(subtrahend);
        this.x -= x;
        this.y -= y;
        return this;
    }
    imul(factor) {
        let [x, y] = Vec2.args(factor);
        this.x *= x;
        this.y *= y;
        return this;
    }
    idiv(divisor) {
        let [x, y] = Vec2.args(divisor);
        this.x /= x;
        this.y /= y;
        return this;
    }
    ipow(exponent) {
        let [x, y] = Vec2.args(exponent);
        this.x **= x;
        this.y **= y;
        return this;
    }
    imap(callback) {
        this.x = callback(this.x);
        this.y = callback(this.y);
        return this;
    }
    iabs() { return this.imap(Math.abs); }
    ifloor() { return this.imap(Math.floor); }
    iceil() { return this.imap(Math.ceil); }
    iround() { return this.imap(Math.round); }
    irotateOrigin(angleDegrees) {
        let angleRadians = angleDegrees * Math.PI / 180;
        [this.x, this.y] = [
            this.x * Math.cos(angleRadians) + this.y * Math.sin(angleRadians),
            this.x * Math.cos(angleRadians - Math.PI / 2) + this.y * Math.sin(angleRadians - Math.PI / 2),
        ];
        return this;
    }
    irotate(angleDegrees, origin) { return this.isub(origin).irotateOrigin(angleDegrees).iadd(origin); }
    inormalize() { return (this.dist(0) > 0) ? this.idiv(this.dist(0)) : this; }
    distSquared(dest) {
        let [x, y] = Vec2.args(dest);
        return (this.x - x) ** 2 + (this.y - y) ** 2;
    }
    dist(dest) { return Math.sqrt(this.distSquared(dest)); }
    towards(dest) {
        let [x, y] = Vec2.args(dest);
        return (180 / Math.PI) * Math.atan2(y - this.y, x - this.x);
    }
    equals(comparand) {
        let [x, y] = Vec2.args(comparand);
        return (this.x === x) && (this.y === y);
    }
    static dir(headingDegrees, magnitude = 1) {
        let headingRadians = headingDegrees * Math.PI / 180;
        return new Vec2([Math.cos(headingRadians), Math.sin(headingRadians)]).imul(magnitude);
    }
    toString() { return "<" + this.xy.join(", ") + ">"; }
}
class Vec3 extends Target {
    _x;
    _y;
    _z;
    constructor(source) {
        super();
        this._x = this._y = this._z = 0;
        this.set(source);
    }
    static args(source) {
        if (source instanceof Vec1)
            return this.args([source.x, 0]);
        if (source instanceof Vec2)
            return this.args(source.xy);
        if (source instanceof Vec3 || source instanceof Vec4)
            return this.args([source.x, source.y, source.z]);
        if (Array.isArray(source)) {
            if (source.length === 1)
                return this.args([source[0], source[0], source[0]]);
            if (source.length === 2)
                return this.args([...source, 0]);
            return source.slice(0, 3);
        }
        if (typeof (source) === "object" && source)
            return [castNumber(source.x), castNumber(source.y), castNumber(source.z)];
        if (typeof (source) !== "number")
            return this.args(0);
        return this.args([source]);
    }
    set(source) {
        [this.x, this.y, this.z] = Vec3.args(source);
        return this;
    }
    clone() { return new Vec3(this); }
    get x() { return this._x; }
    set x(value) {
        if (this.x === value)
            return;
        this.change("x", this.x, this._x = value);
    }
    get y() { return this._y; }
    set y(value) {
        if (this.y === value)
            return;
        this.change("y", this.y, this._y = value);
    }
    get z() { return this._z; }
    set z(value) {
        if (this.z === value)
            return;
        this.change("z", this.z, this._z = value);
    }
    get xyz() { return [this.x, this.y, this.z]; }
    set xyz(value) { [this.x, this.y, this.z] = value; }
    add(addend) {
        let [x, y, z] = Vec3.args(addend);
        return new Vec3([this.x + x, this.y + y, this.z + z]);
    }
    sub(subtrahend) {
        let [x, y, z] = Vec3.args(subtrahend);
        return new Vec3([this.x - x, this.y - y, this.z - z]);
    }
    mul(factor) {
        let [x, y, z] = Vec3.args(factor);
        return new Vec3([this.x * x, this.y * y, this.z * z]);
    }
    div(divisor) {
        let [x, y, z] = Vec3.args(divisor);
        return new Vec3([this.x / x, this.y / y, this.z / z]);
    }
    pow(exponent) {
        let [x, y, z] = Vec3.args(exponent);
        return new Vec3([this.x ** x, this.y ** y, this.z ** z]);
    }
    map(callback) {
        return new Vec3([callback(this.x), callback(this.y), callback(this.z)]);
    }
    abs() { return this.map(Math.abs); }
    floor() { return this.map(Math.floor); }
    ceil() { return this.map(Math.ceil); }
    round() { return this.map(Math.round); }
    normalize() { return (this.dist(0) > 0) ? this.div(this.dist(0)) : new Vec3(this); }
    iadd(addend) {
        let [x, y, z] = Vec3.args(addend);
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }
    isub(subtrahend) {
        let [x, y, z] = Vec3.args(subtrahend);
        this.x -= x;
        this.y -= y;
        this.z -= z;
        return this;
    }
    imul(factor) {
        let [x, y, z] = Vec3.args(factor);
        this.x *= x;
        this.y *= y;
        this.z *= z;
        return this;
    }
    idiv(divisor) {
        let [x, y, z] = Vec3.args(divisor);
        this.x /= x;
        this.y /= y;
        this.z /= z;
        return this;
    }
    ipow(exponent) {
        let [x, y, z] = Vec3.args(exponent);
        this.x **= x;
        this.y **= y;
        this.z **= z;
        return this;
    }
    imap(callback) {
        this.x = callback(this.x);
        this.y = callback(this.y);
        this.z = callback(this.z);
        return this;
    }
    iabs() { return this.imap(Math.abs); }
    ifloor() { return this.imap(Math.floor); }
    iceil() { return this.imap(Math.ceil); }
    iround() { return this.imap(Math.round); }
    inormalize() { return (this.dist(0) > 0) ? this.idiv(this.dist(0)) : this; }
    distSquared(dest) {
        let [x, y, z] = Vec3.args(dest);
        return (this.x - x) ** 2 + (this.y - y) ** 2 + (this.z - z) ** 2;
    }
    dist(dest) { return Math.sqrt(this.distSquared(dest)); }
    equals(comparand) {
        let [x, y, z] = Vec3.args(comparand);
        return (this.x === x) && (this.y === y) && (this.z === z);
    }
    toString() { return "<" + this.xyz.join(", ") + ">"; }
}
class Vec4 extends Target {
    _w;
    _x;
    _y;
    _z;
    constructor(source) {
        super();
        this._w = this._x = this._y = this._z = 0;
        this.set(source);
    }
    static args(source) {
        if (source instanceof Vec1)
            return this.args([source.x, 0]);
        if (source instanceof Vec2)
            return this.args(source.xy);
        if (source instanceof Vec3)
            return this.args(source.xyz);
        if (source instanceof Vec4)
            return this.args([source.w, source.x, source.y, source.z]);
        if (Array.isArray(source)) {
            if (source.length === 1)
                return this.args([source[0], source[0], source[0], source[0]]);
            if (source.length === 2)
                return this.args([...source, 0]);
            if (source.length === 3)
                return this.args([0, ...source]);
            return source.slice(0, 4);
        }
        if (typeof (source) === "object" && source)
            return [castNumber(source.w), castNumber(source.x), castNumber(source.y), castNumber(source.z)];
        if (typeof (source) !== "number")
            return this.args(0);
        return this.args([source]);
    }
    set(source) {
        [this.w, this.x, this.y, this.z] = Vec4.args(source);
        return this;
    }
    clone() { return new Vec4(this); }
    get w() { return this._w; }
    set w(value) {
        if (this.w === value)
            return;
        this.change("w", this.w, this._w = value);
    }
    get x() { return this._x; }
    set x(value) {
        if (this.x === value)
            return;
        this.change("x", this.x, this._x = value);
    }
    get y() { return this._y; }
    set y(value) {
        if (this.y === value)
            return;
        this.change("y", this.y, this._y = value);
    }
    get z() { return this._z; }
    set z(value) {
        if (this.z === value)
            return;
        this.change("z", this.z, this._z = value);
    }
    get wxyz() { return [this.w, this.x, this.y, this.z]; }
    set wxyz(value) { [this.w, this.x, this.y, this.z] = value; }
    get t() { return this.w; }
    set t(v) { this.w = v; }
    get b() { return this.x; }
    set b(v) { this.x = v; }
    get l() { return this.y; }
    set l(v) { this.y = v; }
    get r() { return this.z; }
    set r(v) { this.z = v; }
    get tblr() { return [this.t, this.b, this.l, this.r]; }
    set tblr(value) { [this.t, this.b, this.l, this.r] = value; }
    add(addend) {
        let [w, x, y, z] = Vec4.args(addend);
        return new Vec4([this.w + w, this.x + x, this.y + y, this.z + z]);
    }
    sub(subtrahend) {
        let [w, x, y, z] = Vec4.args(subtrahend);
        return new Vec4([this.w - w, this.x - x, this.y - y, this.z - z]);
    }
    mul(factor) {
        let [w, x, y, z] = Vec4.args(factor);
        return new Vec4([this.w * w, this.x * x, this.y * y, this.z * z]);
    }
    div(divisor) {
        let [w, x, y, z] = Vec4.args(divisor);
        return new Vec4([this.w / w, this.x / x, this.y / y, this.z / z]);
    }
    pow(exponent) {
        let [w, x, y, z] = Vec4.args(exponent);
        return new Vec4([this.w ** w, this.x ** x, this.y ** y, this.z ** z]);
    }
    map(callback) {
        return new Vec4([callback(this.w), callback(this.x), callback(this.y), callback(this.z)]);
    }
    abs() { return this.map(Math.abs); }
    floor() { return this.map(Math.floor); }
    ceil() { return this.map(Math.ceil); }
    round() { return this.map(Math.round); }
    normalize() { return (this.dist(0) > 0) ? this.div(this.dist(0)) : new Vec4(this); }
    iadd(addend) { return this.set(this.add(addend)); }
    isub(subtrahend) { return this.set(this.sub(subtrahend)); }
    imul(factor) { return this.set(this.mul(factor)); }
    idiv(divisor) { return this.set(this.div(divisor)); }
    ipow(exponent) { return this.set(this.pow(exponent)); }
    imap(callback) { return this.set(this.map(callback)); }
    iabs() { return this.set(this.abs()); }
    ifloor() { return this.set(this.floor()); }
    iceil() { return this.set(this.ceil()); }
    iround() { return this.set(this.round()); }
    inormalize() { return this.set(this.normalize()); }
    distSquared(dest) {
        let [w, x, y, z] = Vec4.args(dest);
        return (this.w - w) ** 2 + (this.x - x) ** 2 + (this.y - y) ** 2 + (this.z - z) ** 2;
    }
    dist(dest) { return Math.sqrt(this.distSquared(dest)); }
    equals(comparand) {
        let [w, x, y, z] = Vec4.args(comparand);
        return (this.w === w) && (this.x === x) && (this.y === y) && (this.z === z);
    }
    toString() { return "<" + this.wxyz.join(", ") + ">"; }
}
class Resolver extends Target {
    _state;
    resolves;
    constructor(state) {
        super();
        this._state = state;
        this.resolves = [];
    }
    get state() { return this._state; }
    set state(value) {
        if (this.state == value)
            return;
        this.change("state", this.state, this._state = value);
        let filteredResolves = this.resolves.filter(o => o.resolveCondition(this.state));
        for (let resolve of filteredResolves) {
            this.resolves.splice(this.resolves.indexOf(resolve), 1);
            let stateChanged = false;
            const stateChange = () => (stateChanged = true);
            this.addHandler("change-state", stateChange);
            resolve.resolve();
            this.remHandler("change-state", stateChange);
            if (stateChanged)
                break;
        }
    }
    async whenCondition(condition) {
        if (condition(this.state))
            return;
        return await new Promise((resolve, reject) => this.resolves.push({
            resolveCondition: condition,
            resolve: resolve,
        }));
    }
    async when(value) { return await this.whenCondition(state => (state === value)); }
    async whenNot(value) { return await this.whenCondition(state => (state !== value)); }
}
class Timer extends Target {
    timeSum;
    timeStarted;
    _paused;
    constructor(autoStart = false) {
        super();
        this.timeSum = 0;
        this.timeStarted = 0;
        this._paused = true;
        if (autoStart)
            this.play();
    }
    get paused() { return this._paused; }
    set paused(value) {
        if (this.paused == value)
            return;
        if (value)
            this.timeSum += getTime() - this.timeStarted;
        else
            this.timeStarted = getTime();
        this.change("paused", this.paused, this._paused = value);
    }
    get playing() { return !this.paused; }
    set playing(value) { this.paused = !value; }
    pause() { return this.paused = true; }
    play() { return this.playing = true; }
    clear() {
        let time = this.time;
        this.timeSum = 0;
        this.timeStarted = getTime();
        return time;
    }
    add(value) {
        this.timeSum += value;
        return this;
    }
    sub(value) {
        this.timeSum -= value;
        return this;
    }
    get time() { return this.timeSum + (+this.playing) * (getTime() - this.timeStarted); }
    set time(value) {
        value = Math.max(0, value);
        this.timeSum += value - this.time;
    }
    pauseAndClear() { this.pause(); return this.clear(); }
    playAndClear() { this.play(); return this.clear(); }
    dequeue(periodTime) {
        periodTime = Math.max(0, periodTime);
        if (periodTime > this.time)
            return false;
        this.time -= periodTime;
        return true;
    }
    dequeueAll(periodTime) {
        periodTime = Math.max(0, periodTime);
        let n = Math.floor(this.time / periodTime);
        if (n > 0)
            this.time -= n * periodTime;
        return n;
    }
}

var util = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ALPHABETALL: ALPHABETALL,
    ALPHABETLOWER: ALPHABETLOWER,
    ALPHABETUPPER: ALPHABETUPPER,
    BASE16: BASE16,
    BASE256: BASE256,
    BASE64: BASE64,
    Color: Color,
    EPSILON: EPSILON,
    MAGIC: MAGIC,
    NUMBERS: NUMBERS,
    Range: Range,
    Resolver: Resolver,
    TEXTDECODER: TEXTDECODER,
    TEXTENCODER: TEXTENCODER,
    Target: Target,
    Timer: Timer,
    UNITVALUES: UNITVALUES,
    VARIABLE: VARIABLE,
    Vec1: Vec1,
    Vec2: Vec2,
    Vec3: Vec3,
    Vec4: Vec4,
    allOfArray: allOfArray,
    angleRelDegrees: angleRelDegrees,
    angleRelRadians: angleRelRadians,
    anyOfArray: anyOfArray,
    castArray: castArray,
    castBoolean: castBoolean$1,
    castNullishString: castNullishString,
    castNumber: castNumber,
    castNumberArray: castNumberArray,
    castObject: castObject,
    castString: castString,
    castStringArray: castStringArray,
    castVec1: castVec1,
    castVec2: castVec2$1,
    castVec3: castVec3,
    castVec4: castVec4,
    choose: choose,
    clampAngleDegrees: clampAngleDegrees,
    clampAngleRadians: clampAngleRadians,
    collapseArray: collapseArray,
    compareString: compareString,
    cos: cos,
    ease: ease,
    equals: equals,
    flattenArray: flattenArray,
    formatText: formatText,
    formatTime: formatTime,
    getStack: getStack,
    getTime: getTime,
    jargon: jargon,
    jargonAlphabetAll: jargonAlphabetAll,
    jargonAlphabetLower: jargonAlphabetLower,
    jargonAlphabetUpper: jargonAlphabetUpper,
    jargonBase16: jargonBase16,
    jargonBase256: jargonBase256,
    jargonBase64: jargonBase64,
    jargonNumbers: jargonNumbers,
    jargonVariable: jargonVariable,
    lerp: lerp,
    lerpE: lerpE,
    loadImage: loadImage,
    sin: sin,
    splitPath: splitPath,
    splitString: splitString,
    splitTimeUnits: splitTimeUnits,
    stringifyError: stringifyError,
    sumArray: sumArray,
    timeout: timeout,
    wait: wait
});

class Entity extends Target {
    id;
    parent;
    _addedToParent;
    engine;
    hasEngineParent;
    reqComputeReals;
    pos;
    vel;
    _dir;
    realPos;
    realVel;
    _realDir;
    collidings;
    _maxHealth;
    _health;
    _radius;
    _density;
    knockScale;
    knockIgnoreMass;
    damage;
    invincible;
    immortal;
    group;
    _z;
    alwaysRender;
    inRenderDistance;
    _entities;
    entitySort;
    constructor(options) {
        super();
        this.id = jargonBase64(1 << 8);
        this.parent = options.parent;
        this.hasEngineParent = this.parent instanceof Engine;
        this._addedToParent = this.hasEngineParent;
        this.engine = (this.hasEngineParent ? this.parent : this.parent.engine);
        this.reqComputeReals = false;
        this.addHandler("compute-reals", () => {
            this.reqComputeReals = true;
            this.post("change-chunks");
        });
        this.pos = new Vec2();
        this.pos.addHandler("change", (attribute, from, to) => this.post("compute-reals"));
        this.vel = new Vec2();
        this.vel.addHandler("change", (attribute, from, to) => this.post("compute-reals"));
        this._dir = 0;
        this.realPos = new Vec2();
        this.realVel = new Vec2();
        this._realDir = 0;
        this.collidings = new Set();
        this._maxHealth = 0;
        this._health = 0;
        this._radius = 0;
        this._density = 1;
        this.knockScale = 1;
        this.knockIgnoreMass = false;
        this.damage = 1;
        this.invincible = false;
        this.immortal = false;
        this.group = "";
        this._z = 0;
        this.alwaysRender = false;
        this.inRenderDistance = true;
        this._entities = [];
        this.entitySort = false;
        this.pos.set(options.pos);
        this.vel.set(options.vel);
        this.dir = options.dir ?? 0;
        this.maxHealth = options.maxHealth ?? 0;
        this.health = options.health ?? this.maxHealth;
        this.radius = options.radius ?? 0;
        this.group = options.group ?? "";
        this.z = options.z ?? 0;
        this.addHandler("add", () => {
            this._addedToParent = true;
            this.computeReals();
        });
        this.addHandler("rem", () => {
            this._addedToParent = false;
            this.engine.remFromChunks(this);
        });
    }
    get addedToParent() { return this._addedToParent; }
    get addedToEngine() {
        if (this.hasEngineParent)
            return true;
        return this.addedToParent && this.parent.addedToEngine;
    }
    get dir() { return this._dir; }
    set dir(value) {
        value = clampAngleDegrees(value);
        if (this.dir === value)
            return;
        this._dir = value;
        this.post("compute-reals");
    }
    get realDir() { return this._realDir; }
    computeReals() {
        this.engine.remFromChunks(this);
        this.realPos.set(this.getRealPos());
        this.realVel.set(this.getRealVel());
        this._realDir = this.getRealDir();
        this.engine.addToChunks(this);
        this._entities.forEach(entity => entity.computeReals());
    }
    getRealPos() {
        if (this.hasEngineParent)
            return this.pos.clone();
        return this.parent.realPos.add(this.pos);
    }
    getRealVel() {
        if (this.hasEngineParent)
            return this.vel.clone();
        return this.parent.realVel.add(this.vel);
    }
    getRealDir() {
        if (this.hasEngineParent)
            return this.dir;
        return clampAngleDegrees(this.parent.realDir + this.dir);
    }
    get maxHealth() { return this._maxHealth; }
    set maxHealth(value) {
        this._maxHealth = Math.max(0, value);
        this.health = this.health;
    }
    get health() { return this._health; }
    set health(value) { this._health = Math.min(this.maxHealth, Math.max(0, value)); }
    get radius() { return this._radius; }
    set radius(value) {
        value = Math.max(0, value);
        if (this.radius === value)
            return;
        if (this.addedToParent)
            this.engine.remFromChunks(this);
        this._radius = value;
        if (this.addedToParent)
            this.engine.addToChunks(this);
    }
    get chunkMinX() { return Math.round((this.realPos.x - this.radius) / this.engine.collisionChunkSize); }
    get chunkMaxX() { return Math.round((this.realPos.x + this.radius) / this.engine.collisionChunkSize); }
    get chunkMinY() { return Math.round((this.realPos.y - this.radius) / this.engine.collisionChunkSize); }
    get chunkMaxY() { return Math.round((this.realPos.y + this.radius) / this.engine.collisionChunkSize); }
    get density() { return this._density; }
    set density(value) { this._density = Math.max(0, value); }
    get mass() { return this.density * (4 / 3) * Math.PI * (this.radius ** 3); }
    get z() { return this._z; }
    set z(value) {
        if (this.z === value)
            return;
        this._z = value;
        this.post("z-change");
    }
    get entities() { return [...this._entities]; }
    set entities(entities) {
        this.clearEntities();
        entities.forEach(entity => this.addEntity(entity));
    }
    clearEntities() {
        const entities = this.entities;
        entities.forEach(entity => this.remEntity(entity));
        return entities;
    }
    hasEntity(entity) { return this._entities.includes(entity); }
    addEntity(entity) {
        if (entity.parent !== this)
            return null;
        if (this.hasEntity(entity))
            return entity;
        this._entities.push(entity);
        entity.addLinkedHandler(this, "z-change", () => {
            const index = this._entities.indexOf(entity);
            if (index - 1 >= 0 && entity.z < this._entities[index - 1].z)
                return this.entitySort = true;
            if (index + 1 < this._entities.length && entity.z > this._entities[index + 1].z)
                return this.entitySort = true;
        });
        this.entitySort = true;
        entity.onAdd();
        return entity;
    }
    remEntity(entity) {
        if (!this.hasEntity(entity))
            return null;
        this._entities.splice(this._entities.indexOf(entity), 1);
        entity.clearLinkedHandlers(this, "z-change");
        entity.onRem();
        return entity;
    }
    sortEntities() {
        this._entities.sort((a, b) => a.z - b.z);
    }
    move(value) {
        this.pos.iadd(value);
        return this;
    }
    moveDir(dir, mag) { return this.move(Vec2.dir(dir, mag)); }
    moveInDir(mag) { return this.moveDir(this.dir, mag); }
    knock(value) {
        this.vel.iadd(value);
        return this;
    }
    knockDir(dir, mag) { return this.knock(Vec2.dir(dir, mag)); }
    knockInDir(mag) { return this.knockDir(this.dir, mag); }
    lookAt(pos) {
        this.dir = this.realPos.towards(pos);
        return this;
    }
    gaze(value) {
        this.dir += value;
        return this;
    }
    gazeAt(pos, scale = 1, max = -1) {
        scale = Math.min(1, Math.max(0, scale));
        max = (max === -1) ? -1 : Math.max(max, 0);
        let angleRel = angleRelDegrees(this.dir, this.realPos.towards(pos));
        angleRel *= scale;
        if (max >= 0)
            angleRel = Math.min(max, Math.max(-max, angleRel));
        return this.gaze(angleRel);
    }
    handleCollision(other, dist, rule) {
        const knock = -dist * this.knockScale * other.knockScale * (this.knockIgnoreMass ? 1 : (other.mass / this.mass));
        if (rule & Engine.COLLISIONPUSH) {
            this.knockDir(other.realPos.towards(this.realPos), Math.min(8, knock * 0.01));
            this.post("push", other, dist);
        }
        if (rule & Engine.COLLISIONDAMAGE) {
            if (!this.invincible)
                this.health -= other.damage;
            this.knockDir(other.realPos.towards(this.realPos), Math.min(8, knock * 0.05));
            this.post("damage", other, dist);
        }
    }
    preUpdate() {
        if (!this.hasEngineParent) {
            if (this.health <= 0 && !this.immortal) {
                this.parent.remEntity(this);
                return;
            }
        }
        if (this.reqComputeReals) {
            this.reqComputeReals = false;
            this.computeReals();
        }
        this.collidings.clear();
        if (this.entitySort) {
            this.entitySort = false;
            this.sortEntities();
        }
        this._entities.forEach(entity => entity.preUpdate());
    }
    update(delta) {
        if (this.radius) {
            this.engine.forEachChunkEntity(this, entity => {
                if (entity === this)
                    return;
                if (!entity.radius)
                    return;
                const rule1 = this.engine.getCollisionRule(this.group, entity.group);
                const rule2 = this.engine.getCollisionRule(entity.group, this.group);
                if (!rule1 && !rule2)
                    return;
                if (this.collidings.has(entity.id))
                    return;
                this.collidings.add(entity.id);
                entity.collidings.add(this.id);
                const distSquared = this.realPos.distSquared(entity.realPos);
                if (distSquared > (this.radius + entity.radius) ** 2)
                    return;
                const dist = Math.sqrt(distSquared) - (this.radius + entity.radius);
                if (rule1)
                    this.handleCollision(entity, dist, rule1);
                if (rule2)
                    entity.handleCollision(this, dist, rule2);
            });
        }
        if (Math.abs(this.vel.x) < EPSILON)
            this.vel.x = 0;
        if (Math.abs(this.vel.y) < EPSILON)
            this.vel.y = 0;
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.vel.x *= 0.95;
        this.vel.y *= 0.95;
        this.internalUpdate(delta);
        this._entities.forEach(entity => entity.update(delta));
    }
    internalUpdate(delta) {
        this.inRenderDistance = this.realPos.distSquared(this.engine.cameraEntity?.getPos() ?? 0) < this.engine.renderDistanceSquared;
    }
    render() {
        const doRender = this.alwaysRender || this.inRenderDistance;
        this._entities.forEach((entity, i) => {
            if (entity.z >= 0) {
                if (i <= 0 || this._entities[i - 1].z < 0)
                    if (doRender)
                        this.internalRender();
            }
            entity.render();
            if (entity.z < 0) {
                if (i >= this._entities.length - 1)
                    if (doRender)
                        this.internalRender();
            }
        });
        if (this._entities.length <= 0)
            if (doRender)
                this.internalRender();
    }
    internalRender() { }
}
class CameraShake extends Target {
    pos;
    time;
    _dir;
    _mag;
    constructor(pos, mag) {
        super();
        this.pos = new Vec2(pos);
        this.time = 0;
        this._dir = 0;
        this._mag = Math.max(0, mag);
        this.randomDir();
    }
    get dir() { return this._dir; }
    get mag() { return this._mag; }
    randomDir() {
        this._dir = 360 * Math.random();
    }
    update(delta) {
        this.time += delta;
        while (this.time > 25) {
            this.time -= 25;
            this.randomDir();
            this._mag *= 0.9;
        }
    }
}
class Camera extends Entity {
    target;
    _targetFov;
    _fov;
    _configScrollP;
    shakes;
    shakeX;
    shakeY;
    constructor(options) {
        super({
            parent: options.parent,
            pos: options.pos,
            maxHealth: 1,
            group: ".CAMERA",
        });
        this._targetFov = 1;
        this._fov = 1;
        this._configScrollP = 0;
        this.target = options.target ?? null;
        this.targetFov = options.fov ?? 1;
        this.fov = this.targetFov;
        this.configScrollP = options.config?.scrollP ?? 0.1;
        this.shakes = new Set();
        this.shakeX = this.shakeY = 0;
    }
    get targetFov() { return this._targetFov; }
    set targetFov(value) { this._targetFov = Math.max(0, value); }
    get fov() { return this._fov; }
    set fov(value) { this._fov = Math.max(0, value); }
    get configScrollP() { return this._configScrollP; }
    set configScrollP(value) { this._configScrollP = Math.min(1, Math.max(0, value)); }
    addShake(shake) {
        if (this.shakes.has(shake))
            return shake;
        this.shakes.add(shake);
        return shake;
    }
    addShakeFrom(pos, mag) {
        return this.addShake(new CameraShake(pos, mag));
    }
    getPos() { return this.realPos.add([this.shakeX, this.shakeY]).round(); }
    getFov() { return this.fov; }
    internalUpdate(delta) {
        super.internalUpdate(delta);
        if (this.target) {
            const pos = (this.target instanceof Vec2) ? this.target : this.target.pos;
            this.pos.iadd(pos.sub(this.pos).imul(this.configScrollP));
        }
        const fov = this.targetFov;
        this.fov += (fov - this.fov) * this.configScrollP;
        this.shakeX = this.shakeY = 0;
        [...this.shakes].forEach(shake => {
            shake.update(delta);
            if (shake.mag < 0.1) {
                this.shakes.delete(shake);
                return;
            }
            const dist = shake.pos.dist(this.realPos);
            if (dist > 200)
                return;
            let p = 1;
            if (dist > 100)
                p = lerp(1, 0, (dist - 100) / (200 - 100));
            this.shakeX += p * shake.mag * Math.cos(shake.dir * (Math.PI / 180));
            this.shakeY += p * shake.mag * Math.sin(shake.dir * (Math.PI / 180));
        });
    }
}
class Engine extends Target {
    static COLLISIONPUSH = 1 << 0;
    static COLLISIONDAMAGE = 1 << 1;
    _ctx;
    _bindTarget;
    _keysDown;
    _keysDownNow;
    _keysUpNow;
    onKeyDown;
    onKeyUp;
    _buttonsDown;
    _buttonsDownNow;
    _buttonsUpNow;
    mouse;
    onMouseDown;
    onMouseUp;
    onMouseMove;
    collisionMatrix;
    collisionChunks;
    collisionChunkSize;
    rootEntity;
    cameraEntity;
    backgroundColor;
    constructor(options) {
        super();
        this._keysDown = new Set();
        this._keysDownNow = new Set();
        this._keysUpNow = new Set();
        this.onKeyDown = (e) => {
            this._keysDown.add(e.code);
            this._keysDownNow.add(e.code);
            this.post("keydown", e);
        };
        this.onKeyUp = (e) => {
            this._keysDown.delete(e.code);
            this._keysUpNow.add(e.code);
            this.post("keyup", e);
        };
        this._buttonsDown = new Set();
        this._buttonsDownNow = new Set();
        this._buttonsUpNow = new Set();
        this.mouse = new Vec2();
        this.onMouseDown = (e) => {
            this._buttonsDown.add(e.button);
            this._buttonsDownNow.add(e.button);
            this.post("mousedown", e);
        };
        this.onMouseUp = (e) => {
            this._buttonsDown.delete(e.button);
            this._buttonsUpNow.add(e.button);
            this.post("mouseup", e);
        };
        this.onMouseMove = (e) => {
            this.mouse.x = e.offsetX / this.ctx.canvas.offsetWidth;
            this.mouse.y = e.offsetY / this.ctx.canvas.offsetHeight;
        };
        this.collisionMatrix = {};
        this.collisionChunks = new Map();
        this.collisionChunkSize = 25;
        this._ctx = options.ctx;
        this._bindTarget = null;
        if (options.bindTarget)
            this.bindTarget = options.bindTarget;
        this.rootEntity = new Entity({ parent: this, group: ".ROOT" });
        this.cameraEntity = null;
        this.backgroundColor = new Color([0, 0, 0, 0]);
    }
    get ctx() { return this._ctx; }
    set ctx(value) {
        if (this.ctx === value)
            return;
        this._ctx = value;
        this.bindTarget = this.ctx.canvas;
    }
    get bindTarget() { return this._bindTarget; }
    set bindTarget(value) {
        if (this.bindTarget === value)
            return;
        this.unbind();
        this._bindTarget = value;
        this.bind();
    }
    bind() {
        if (!this.bindTarget)
            return;
        this.bindTarget.addEventListener("keydown", this.onKeyDown);
        this.bindTarget.addEventListener("keyup", this.onKeyUp);
        this.bindTarget.addEventListener("mousedown", this.onMouseDown);
        this.bindTarget.addEventListener("mouseup", this.onMouseUp);
        this.bindTarget.addEventListener("mousemove", this.onMouseMove);
    }
    unbind() {
        if (!this.bindTarget)
            return;
        this.bindTarget.removeEventListener("keydown", this.onKeyDown);
        this.bindTarget.removeEventListener("keyup", this.onKeyUp);
        this.bindTarget.removeEventListener("mousedown", this.onMouseDown);
        this.bindTarget.removeEventListener("mouseup", this.onMouseUp);
        this.bindTarget.removeEventListener("mousemove", this.onMouseMove);
    }
    get keysDown() { return [...this._keysDown]; }
    get keysDownNow() { return [...this._keysDownNow]; }
    get keysUpNow() { return [...this._keysUpNow]; }
    isKeyDown(key) { return this._keysDown.has(key); }
    isKeyDownNow(key) { return this._keysDownNow.has(key); }
    isKeyUpNow(key) { return this._keysUpNow.has(key); }
    get buttonsDown() { return [...this._buttonsDown]; }
    get buttonsDownNow() { return [...this._buttonsDownNow]; }
    get buttonsUpNow() { return [...this._buttonsUpNow]; }
    isButtonDown(button) { return this._buttonsDown.has(button); }
    isButtonDownNow(button) { return this._buttonsDownNow.has(button); }
    isButtonUpNow(button) { return this._buttonsUpNow.has(button); }
    setCollisionRule(target, other, rule) {
        if (rule < 0)
            return;
        if (rule % 1 !== 0)
            return;
        if (!this.collisionMatrix[target])
            this.collisionMatrix[target] = {};
        this.collisionMatrix[target][other] = rule;
    }
    getCollisionRule(target, other) {
        if (!this.collisionMatrix[target])
            return 0;
        return this.collisionMatrix[target][other] ?? 0;
    }
    setMutualCollisionRule(group1, group2, rule) {
        this.setCollisionRule(group1, group2, rule);
        this.setCollisionRule(group2, group1, rule);
    }
    addToChunks(entity) {
        for (let x = entity.chunkMinX; x <= entity.chunkMaxX; x++) {
            for (let y = entity.chunkMinY; y <= entity.chunkMaxY; y++) {
                if (!this.collisionChunks.has(x))
                    this.collisionChunks.set(x, new Map());
                if (!this.collisionChunks.get(x)?.has(y))
                    this.collisionChunks.get(x)?.set(y, new Set());
                this.collisionChunks.get(x)?.get(y)?.add(entity);
            }
        }
    }
    remFromChunks(entity) {
        for (let x = entity.chunkMinX; x <= entity.chunkMaxX; x++) {
            for (let y = entity.chunkMinY; y <= entity.chunkMaxY; y++) {
                if (!this.collisionChunks.has(x))
                    continue;
                if (!this.collisionChunks.get(x)?.has(y))
                    continue;
                this.collisionChunks.get(x)?.get(y)?.delete(entity);
                if (this.collisionChunks.get(x)?.get(y)?.size ?? 0 > 0)
                    continue;
                this.collisionChunks.get(x)?.delete(y);
                if (this.collisionChunks.get(x)?.size ?? 0 > 0)
                    continue;
                this.collisionChunks.delete(x);
            }
        }
    }
    forEachChunkEntity(entity, callback) {
        for (let x = entity.chunkMinX; x <= entity.chunkMaxX; x++) {
            for (let y = entity.chunkMinY; y <= entity.chunkMaxY; y++) {
                if (!this.collisionChunks.has(x))
                    continue;
                if (!this.collisionChunks.get(x)?.has(y))
                    continue;
                (this.collisionChunks.get(x)?.get(y) ?? []).forEach(callback);
            }
        }
    }
    get cameraFov() { return this.cameraEntity?.getFov() ?? 1; }
    worldToCtxLen(value) {
        return value / this.cameraFov;
    }
    worldToCtxPos(value) {
        return value
            .sub(this.cameraEntity?.getPos() ?? 0)
            .imul([1, -1])
            .idiv(this.cameraFov)
            .iadd([this.ctx.canvas.width / 2, this.ctx.canvas.height / 2]);
    }
    ctxToWorldLen(value) {
        return value * this.cameraFov;
    }
    ctxToWorldPos(value) {
        return value
            .sub([this.ctx.canvas.width / 2, this.ctx.canvas.height / 2])
            .imul(this.cameraFov)
            .imul([1, -1])
            .iadd(this.cameraEntity?.getPos() ?? 0);
    }
    get renderDistanceSquared() {
        return (this.ctxToWorldLen(this.ctx.canvas.width) ** 2 + this.ctxToWorldLen(this.ctx.canvas.height) ** 2) * (0.75 ** 2);
    }
    get renderDistance() { return Math.sqrt(this.renderDistanceSquared); }
    update(delta) {
        this.rootEntity.preUpdate();
        this.rootEntity.update(delta);
        this.internalUpdate(delta);
        this._keysDownNow.clear();
        this._keysUpNow.clear();
        this._buttonsDownNow.clear();
        this._buttonsUpNow.clear();
    }
    internalUpdate(delta) {
        if (this.cameraEntity && !this.cameraEntity.addedToEngine)
            this.cameraEntity = null;
    }
    render() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        if (this.backgroundColor.a > 0) {
            this.ctx.fillStyle = this.backgroundColor.toHex();
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }
        this.rootEntity.render();
        this.internalRender();
    }
    internalRender() { }
}

const PARSER = new DOMParser();
const DEFAULTFILE = "texturemap";
const EMPTYELEMENT = document.createElement("html");
function castVec2(data, def = [0, 0]) {
    data = data ?? EMPTYELEMENT;
    return [
        parseFloat(data.getAttribute("x") ?? String(def[0])),
        parseFloat(data.getAttribute("y") ?? String(def[1])),
    ];
}
function castBoolean(data, def = false) {
    if (data === null)
        return def;
    return !!JSON.parse(data);
}
function castLocation(data, defaultFile = DEFAULTFILE) {
    data = data ?? EMPTYELEMENT;
    return {
        file: data.getAttribute("file") ?? defaultFile,
        x: parseInt(data.getAttribute("x") ?? "0"),
        y: parseInt(data.getAttribute("y") ?? "0"),
        w: parseInt(data.getAttribute("w") ?? "0"),
        h: parseInt(data.getAttribute("h") ?? "0"),
    };
}
function castTexture(data, defaultFile = DEFAULTFILE) {
    data = data ?? EMPTYELEMENT;
    return {
        location: castLocation(data.querySelector(":scope > location") ?? null, defaultFile),
        crop: castBoolean(data.getAttribute("crop")),
    };
}
function castTextures(data, defaultFile = DEFAULTFILE) {
    data = data ?? EMPTYELEMENT;
    const textures = {};
    for (const child of data.children) {
        const name = child.getAttribute("name");
        if (!name)
            continue;
        const texture = castTexture(child, defaultFile);
        textures[name] = texture;
    }
    return textures;
}
async function loadThemeData() {
    const resp = await fetch("./assets/theme.xml");
    const text = await resp.text();
    const data = PARSER.parseFromString(text, "text/xml");
    const body = data.querySelector("body");
    if (!body)
        throw "Error loading theme.xml: No body found";
    return {
        texture: castTexture(body.querySelector(":scope > texture") ?? null),
    };
}
function castCommand(data) {
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
        if (of)
            return {
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
function castCommands(data) {
    data = data ?? EMPTYELEMENT;
    return Array.from(data.children).map(child => castCommand(child));
}
async function loadEnemyList() {
    const resp = await fetch("./assets/enemies/index.xml");
    const text = await resp.text();
    const data = PARSER.parseFromString(text, "text/xml");
    const body = data.querySelector("body");
    if (!body)
        throw "Error loading index.xml: No body found";
    return Array.from(body.children).filter(item => item.tagName === "i").map(item => item.textContent ?? "");
}
function castEnemyComponentData(data) {
    data = data ?? EMPTYELEMENT;
    return {
        texture: data.querySelector(":scope > texture")?.textContent ?? "",
        type: ((type) => {
            if (!["original", "outlined", "white", "white + outlined"].includes(type))
                return "original";
            return type;
        })(data.querySelector(":scope > type")?.textContent ?? ""),
        offset: castVec2(data.querySelector(":scope > offset")),
        scale: castVec2(data.querySelector(":scope > scale"), [1, 1]),
        opacity: parseFloat(data.querySelector(":scope > opacity")?.textContent ?? "1"),
        dir: parseFloat(data.querySelector(":scope > dir")?.textContent ?? "0"),
        isBody: castBoolean(data.getAttribute("body")),
    };
}
function castEnemyComponentDatas(data) {
    data = data ?? EMPTYELEMENT;
    const datas = {};
    for (const child of data.children) {
        const id = child.getAttribute("id");
        if (!id)
            continue;
        datas[id] = castEnemyComponentData(child);
    }
    return datas;
}
function castEnemyFunctionData(data) {
    data = data ?? EMPTYELEMENT;
    return {
        args: Array.from((data.querySelector(":scope > args") ?? EMPTYELEMENT).children).map(child => child.textContent ?? ""),
        commands: castCommands(data.querySelector(":scope > commands")),
    };
}
function castEnemyFunctionDatas(data) {
    data = data ?? EMPTYELEMENT;
    const datas = {};
    for (const child of data.children) {
        const name = child.getAttribute("name");
        if (!name)
            continue;
        datas[name] = castEnemyFunctionData(child);
    }
    return datas;
}
function castEnemyAnimationKeyframeData(data) {
    data = data ?? EMPTYELEMENT;
    return {
        continual: castCommands(data.querySelector(":scope > continual")),
        start: castCommands(data.querySelector(":scope > start")),
        stop: castCommands(data.querySelector(":scope > stop")),
        wait: parseFloat(data.getAttribute("wait") ?? "0"),
    };
}
function castEnemyAnimationKeyframeDatas(data) {
    data = data ?? EMPTYELEMENT;
    return Array.from(data.children).map(child => castEnemyAnimationKeyframeData(child));
}
function castEnemyAnimationData(data) {
    data = data ?? EMPTYELEMENT;
    return {
        keyframes: castEnemyAnimationKeyframeDatas(data.querySelector(":scope > keyframes")),
        loop: castBoolean(data.getAttribute("loop")),
    };
}
function castEnemyAnimationDatas(data) {
    data = data ?? EMPTYELEMENT;
    const datas = {};
    for (const child of data.children) {
        const name = child.getAttribute("name");
        if (!name)
            continue;
        datas[name] = castEnemyAnimationData(child);
    }
    return datas;
}
function castEnemyStateData(data) {
    data = data ?? EMPTYELEMENT;
    return {
        continual: castCommands(data.querySelector(":scope > continual")),
        start: castCommands(data.querySelector(":scope > start")),
        stop: castCommands(data.querySelector(":scope > stop")),
    };
}
function castEnemyStateDatas(data) {
    data = data ?? EMPTYELEMENT;
    const datas = {};
    for (const child of data.children) {
        const name = child.getAttribute("name");
        if (!name)
            continue;
        datas[name] = castEnemyStateData(child);
    }
    return datas;
}
async function loadEnemyData(type) {
    const resp = await fetch("./assets/enemies/" + type + ".xml");
    const text = await resp.text();
    const data = PARSER.parseFromString(text, "text/xml");
    const body = data.querySelector("body");
    if (!body)
        throw "Error loading " + type + ".xml: No body found";
    const location = castLocation(body.querySelector(":scope > location"));
    const textures = castTextures(body.querySelector(":scope > textures"));
    for (const name in textures) {
        textures[name].location.x += location.x;
        textures[name].location.y += location.y;
    }
    const eventsElem = body.querySelector(":scope > events") ?? EMPTYELEMENT;
    const events = {};
    for (const child of eventsElem.children) {
        const name = child.getAttribute("name");
        if (!name)
            continue;
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
async function loadParticlesData() {
    const resp = await fetch("./assets/particles/index.xml");
    const text = await resp.text();
    const data = PARSER.parseFromString(text, "text/xml");
    const body = data.querySelector("body");
    if (!body)
        throw "Error loading index.xml: No body found";
    return {
        list: Array.from((body.querySelector(":scope > types") ?? EMPTYELEMENT).children).filter(item => item.tagName === "i").map(item => item.textContent ?? ""),
        location: castLocation(body.querySelector(":scope > location")),
    };
}
async function loadParticleData(type, particlesData) {
    const resp = await fetch("./assets/particles/" + type + ".xml");
    const text = await resp.text();
    const data = PARSER.parseFromString(text, "text/xml");
    const body = data.querySelector("body");
    if (!body)
        throw "Error loading " + type + ".xml: No body found";
    const texture = castTexture(body.querySelector(":scope > texture"));
    texture.location.x += particlesData.location.x;
    texture.location.y += particlesData.location.y;
    return {
        texture: texture,
    };
}
async function loadProjectilesData() {
    const resp = await fetch("./assets/projectiles/index.xml");
    const text = await resp.text();
    const data = PARSER.parseFromString(text, "text/xml");
    const body = data.querySelector("body");
    if (!body)
        throw "Error loading index.xml: No body found";
    return {
        list: Array.from((body.querySelector(":scope > types") ?? EMPTYELEMENT).children).filter(item => item.tagName === "i").map(item => item.textContent ?? ""),
        location: castLocation(body.querySelector(":scope > location")),
    };
}
async function loadProjectileData(type, projectilesData) {
    const resp = await fetch("./assets/projectiles/" + type + ".xml");
    const text = await resp.text();
    const data = PARSER.parseFromString(text, "text/xml");
    const body = data.querySelector("body");
    if (!body)
        throw "Error loading " + type + ".xml: No body found";
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
async function loadFile(file = DEFAULTFILE) {
    return await loadImage("./assets/" + file + ".png");
}
function createCanvas() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx)
        throw "Canvas not supported";
    return { canvas, ctx };
}
function createOutline(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx)
        throw "How did we get here?";
    const width = canvas.width;
    const height = canvas.height;
    const { canvas: outlineCanvas, ctx: outlineCtx } = createCanvas();
    outlineCanvas.width = width;
    outlineCanvas.height = height;
    outlineCtx.drawImage(canvas, 0, 0);
    const outlineImageData = outlineCtx.getImageData(0, 0, width, height);
    const outline = new Array(width).fill(null).map(_ => new Array(height).fill(0));
    for (let x = 0; x < width; x++)
        for (let y = 0; y < height; y++)
            outline[x][y] = (outlineImageData.data[(x + y * width) * 4 + 3] > 0) ? 0 : 1;
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (outline[x][y])
                continue;
            for (let i = 0; i < 4; i++) {
                let rx = x + [1, -1, 0, 0][i];
                let ry = y + [0, 0, 1, -1][i];
                if (rx < 0 || rx >= width)
                    continue;
                if (ry < 0 || ry >= height)
                    continue;
                if (!outline[rx][ry])
                    continue;
                outline[rx][ry] = 2;
            }
        }
    }
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let i = (x + y * width) * 4;
            for (let j = 0; j < 3; j++)
                outlineImageData.data[i + j] = 0;
            outlineImageData.data[i + 3] = (outline[x][y] == 2) ? 255 : 0;
        }
    }
    outlineCtx.putImageData(outlineImageData, 0, 0);
    return outlineCanvas;
}
function createTextureSource(source, texture, padding = 8) {
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
                if (imageData.data[(textureX + y * canvas.width) * 4 + 3] > 0)
                    nSolid++;
            }
            if (nSolid > 0)
                break;
            textureX++;
        }
        while (textureX2 > textureX) {
            let nSolid = 0;
            for (let y = textureY; y < textureY2; y++) {
                if (imageData.data[((textureX2 - 1) + y * canvas.width) * 4 + 3] > 0)
                    nSolid++;
            }
            if (nSolid > 0)
                break;
            textureX2--;
        }
        while (textureY < textureY2) {
            let nSolid = 0;
            for (let x = textureX; x < textureX2; x++) {
                if (imageData.data[(x + textureY * canvas.width) * 4 + 3] > 0)
                    nSolid++;
            }
            if (nSolid > 0)
                break;
            textureY++;
        }
        while (textureY2 > textureY) {
            let nSolid = 0;
            for (let x = textureX; x < textureX2; x++) {
                if (imageData.data[(x + (textureY2 - 1) * canvas.width) * 4 + 3] > 0)
                    nSolid++;
            }
            if (nSolid > 0)
                break;
            textureY2--;
        }
        textureWidth = textureX2 - textureX;
        textureHeight = textureY2 - textureY;
    }
    const width = textureWidth + padding * 2;
    const height = textureHeight + padding * 2;
    originalCanvas.width = whiteCanvas.width = originalAndOutlineCanvas.width = whiteAndOutlineCanvas.width = width;
    originalCanvas.height = whiteCanvas.height = originalAndOutlineCanvas.height = whiteAndOutlineCanvas.height = height;
    originalCtx.drawImage(source, textureX, textureY, textureWidth, textureHeight, padding, padding, textureWidth, textureHeight);
    whiteCtx.drawImage(originalCanvas, 0, 0);
    const whiteImageData = whiteCtx.getImageData(0, 0, width, height);
    for (let x = 0; x < width; x++)
        for (let y = 0; y < height; y++)
            for (let i = 0; i < 3; i++)
                whiteImageData.data[(x + y * width) * 4 + i] = 255;
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
function createColorMappedTextureSource(source, texture, padding = 8) {
    const { original } = createTextureSource(source, texture, padding);
    const originalCtx = original.getContext("2d");
    if (!originalCtx)
        throw "How did this happen?";
    const originalImageData = originalCtx.getImageData(0, 0, original.width, original.height);
    const colors = {};
    return {
        texture: texture,
        padding: padding,
        generator: (color, outline) => {
            outline ??= false;
            if (color.toHex(false) in colors)
                return colors[color.toHex(false)][+outline];
            const newRGB = color.rgb;
            const { canvas, ctx } = createCanvas();
            canvas.width = original.width;
            canvas.height = original.height;
            ctx.putImageData(originalImageData, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let x = 0; x < canvas.width; x++) {
                for (let y = 0; y < canvas.height; y++) {
                    const oldRGB = new Array(3).fill(null).map((_, i) => imageData.data[(x + y * canvas.width) * 4 + i]);
                    if (oldRGB[0] !== oldRGB[1])
                        continue;
                    if (oldRGB[1] !== oldRGB[2])
                        continue;
                    const p = oldRGB[0] / 255;
                    for (let i = 0; i < 3; i++)
                        imageData.data[(x + y * canvas.width) * 4 + i] = lerp(newRGB[i], 255, p);
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

class ModifiedEntity extends Entity {
    zOffsetY;
    constructor(options) {
        super(options);
        this.zOffsetY = 0;
    }
    internalUpdate(delta) {
        super.internalUpdate(delta);
        let parentZ = 0;
        if (!this.hasEngineParent) {
            const parent = this.parent;
            parentZ = parent.pos.y - parent.radius + (parent.zOffsetY ?? 0);
        }
        let thisZ = this.pos.y - this.radius + this.zOffsetY;
        this.z = parentZ - thisZ;
    }
}
class Background extends ModifiedEntity {
    constructor(options) {
        super({
            parent: options.parent,
            maxHealth: 1,
            group: "deco",
        });
        this.zOffsetY = 1e10;
        this.alwaysRender = true;
    }
    internalRender() {
        super.internalRender();
        const ctx = this.engine.ctx;
        ctx.fillStyle = "#fff1";
        const grid = 8;
        const trueX = Math.round((this.engine.cameraEntity?.pos.x ?? 0) / grid);
        const trueY = Math.round((this.engine.cameraEntity?.pos.y ?? 0) / grid);
        const width = Math.ceil(this.engine.ctxToWorldLen(ctx.canvas.width) / grid);
        const height = Math.ceil(this.engine.ctxToWorldLen(ctx.canvas.height) / grid);
        const halfWidth = Math.ceil(width / 2);
        const halfHeight = Math.ceil(height / 2);
        for (let x = -halfWidth; x <= halfWidth; x++) {
            for (let y = -halfHeight; y <= halfHeight; y++) {
                let rx = trueX + x;
                let ry = trueY + y;
                if ((((rx + ry) % 2) + 2) % 2)
                    continue;
                ctx.fillRect(...this.engine.worldToCtxPos(new Vec2([rx * grid, ry * grid])).round().xy, this.engine.worldToCtxLen(grid), this.engine.worldToCtxLen(grid));
            }
        }
    }
}
class Particle extends ModifiedEntity {
    type;
    color;
    _opacity;
    time;
    constructor(options) {
        super({
            parent: options.parent,
            pos: options.pos,
            vel: options.vel,
            dir: options.dir,
            maxHealth: 1,
            radius: options.scale ?? 1,
            group: "deco",
            z: -1e10,
        });
        this._opacity = 0;
        this.time = options.time ?? 0;
        this.type = options.type;
        this.color = new Color();
        if (typeof (options.color) === "number")
            this.color.set(this.engine.getThemeColor(options.color) ?? 0);
        else
            this.color.set(options.color);
        this.opacity = options.opacity ?? 1;
    }
    get scale() { return this.radius; }
    set scale(value) { this.radius = value; }
    get opacity() { return this._opacity; }
    set opacity(value) { this._opacity = Math.min(1, Math.max(0, value)); }
    internalUpdate(delta) {
        super.internalUpdate(delta);
        if (!this.inRenderDistance)
            this.health = 0;
        this.time -= delta;
        if (this.time <= 0)
            this.health = 0;
    }
    internalRender() {
        super.internalRender();
        if (this.opacity <= 0)
            return;
        const textureSource = this.engine.getParticleTextureSource(this.type);
        if (!textureSource)
            return;
        const texture = textureSource.generator(this.color);
        const ctx = this.engine.ctx;
        ctx.save();
        const pos = this.engine.worldToCtxPos(this.realPos);
        ctx.translate(Math.round(pos.x), Math.round(pos.y));
        ctx.globalAlpha = this.opacity;
        if (this.dir !== 0)
            ctx.rotate(-this.dir * (Math.PI / 180));
        const textureWidth = this.engine.worldToCtxLen(texture.width * this.scale);
        const textureHeight = this.engine.worldToCtxLen(texture.height * this.scale);
        ctx.drawImage(texture, Math.round(-textureWidth / 2), Math.round(-textureHeight / 2), textureWidth, textureHeight);
        ctx.restore();
    }
}
class Splat extends Particle {
    maxTime;
    constructor(options) {
        super({
            parent: options.parent,
            type: "splat-" + options.type,
            color: options.color,
            scale: options.scale,
            opacity: options.opacity,
            time: options.time,
            pos: options.pos,
            vel: options.vel,
            dir: 360 * Math.random(),
        });
        this.zOffsetY = 1e10;
        this.maxTime = this.time;
    }
    get opacityScale() {
        if (typeof (this.maxTime) !== "number")
            return 1;
        return lerp(0, 1, this.time / this.maxTime);
    }
    get opacity() { return super.opacity * this.opacityScale; }
    set opacity(value) { super.opacity = value / this.opacityScale; }
}
class Projectile extends ModifiedEntity {
    type;
    color;
    speed;
    time;
    rotate;
    constructor(options) {
        super({
            parent: options.parent,
            pos: options.pos ?? options.source.pos,
            dir: options.dir ?? options.source.dir,
            maxHealth: 1,
            group: options.source.group + "-spawn",
        });
        this.damage = options.damage ?? 1;
        this.speed = Math.max(0, options.speed);
        this.time = options.time;
        this.type = options.type;
        this.color = new Color();
        if (typeof (options.color) === "number")
            this.color.set(this.engine.getThemeColor(options.color) ?? 0);
        else
            this.color.set(options.color);
        this.radius = this.engine.projectileDatas[this.type]?.size ?? 0;
        this.rotate = this.engine.projectileDatas[this.type]?.rotate ?? false;
    }
    internalUpdate(delta) {
        super.internalUpdate(delta);
        if (!this.inRenderDistance)
            this.health = 0;
        this.time -= delta;
        if (this.time <= 0)
            this.health = 0;
        this.knockInDir(this.speed);
        this.dir = 180 + this.vel.towards(0);
    }
    internalRender() {
        super.internalRender();
        const textureSource = this.engine.getProjectileTextureSource(this.type);
        if (!textureSource)
            return;
        const texture = textureSource.generator(this.color, this.engine.projectileDatas[this.type]?.outline);
        const ctx = this.engine.ctx;
        ctx.save();
        const pos = this.engine.worldToCtxPos(this.realPos);
        ctx.translate(Math.round(pos.x), Math.round(pos.y));
        if (this.rotate && this.dir !== 0)
            ctx.rotate(-this.dir * (Math.PI / 180));
        const textureWidth = this.engine.worldToCtxLen(texture.width);
        const textureHeight = this.engine.worldToCtxLen(texture.height);
        ctx.drawImage(texture, Math.round(-textureWidth / 2), Math.round(-textureHeight / 2), textureWidth, textureHeight);
        ctx.restore();
    }
}
class LaunchedProjectile extends Projectile {
    constructor(options) {
        super({
            parent: options.parent,
            source: options.source,
            type: options.type,
            color: options.color,
            speed: 0,
            time: options.time,
            damage: options.damage,
            pos: options.pos,
            dir: options.dir,
        });
        this.vel.set(Vec2.dir(this.dir, options.speed));
    }
    internalUpdate(delta) {
        super.internalUpdate(delta);
        if (this.vel.distSquared(0) < 0.1 ** 2)
            this.health = 0;
    }
}
class Explosion extends ModifiedEntity {
    color;
    time;
    constructor(options) {
        super({
            parent: options.parent,
            pos: options.pos ?? options.source.pos,
            maxHealth: 1,
            radius: options.radius,
            group: options.source.group + "-spawn",
        });
        this.zOffsetY = this.radius;
        this.knockScale = 0.01;
        this.invincible = true;
        this.color = new Color();
        if (typeof (options.color) === "number")
            this.color.set(this.engine.getThemeColor(options.color) ?? 0);
        else
            this.color.set(options.color);
        this.time = 500;
    }
    internalUpdate(delta) {
        super.internalUpdate(delta);
        this.time -= delta;
        if (this.time <= 0)
            this.health = 0;
    }
    internalRender() {
        super.internalRender();
        const ctx = this.engine.ctx;
        ctx.fillStyle = [this.color.toHex(false), this.color.toHex(false), "#fff"][Math.floor(((this.time / 100) % 1) * 3)];
        ctx.beginPath();
        ctx.arc(...this.engine.worldToCtxPos(this.realPos).xy, this.engine.worldToCtxLen(this.radius), 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }
}
class Player extends ModifiedEntity {
    constructor(options) {
        super({
            parent: options.parent,
            pos: options.pos,
            vel: options.vel,
            dir: options.dir,
            maxHealth: 100,
            radius: 4,
            group: "player",
        });
        this.invincible = true;
        this.density = 2;
    }
    internalUpdate(delta) {
        super.internalUpdate(delta);
        if (this.engine.isButtonDown(0))
            this.engine.rootEntity.addEntity(new Projectile({
                parent: this.engine.rootEntity,
                source: this,
                type: "power-4",
                color: 19,
                speed: 0.25,
                time: 5000,
                damage: 1,
            }));
    }
    internalRender() {
        super.internalRender();
        const ctx = this.engine.ctx;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(...this.engine.worldToCtxPos(this.realPos).xy, this.engine.worldToCtxLen(this.radius), 0, 2 * Math.PI);
        ctx.fill();
    }
}
class Command extends Target {
    static getObjectAndKey(commandObject, attr) {
        const enemy = commandObject.enemy;
        let object = enemy;
        if (attr.startsWith("Math")) {
            attr = attr.slice(5);
            object = Math;
        }
        else if (attr.startsWith("util")) {
            attr = attr.slice(5);
            object = util;
        }
        else if (attr.startsWith("arg:")) {
            return {
                object: commandObject.argValues,
                key: attr.slice(4),
            };
        }
        else if (attr.startsWith("func:")) {
            const func = enemy.getFunction(attr.slice(5));
            if (!func)
                return null;
            const funcCall = func.executeWithArgs.bind(func);
            return {
                object: { "": funcCall },
                key: "",
            };
        }
        else if (attr.startsWith("~")) {
            const id = attr.slice("~".length).split(".")[0];
            attr = attr.slice("~".length + id.length + 1);
            const component = enemy.getComponent(id);
            if (!component)
                return null;
            object = component;
        }
        if (attr.length <= 0)
            return null;
        const parts = attr.split(".");
        if (parts.length <= 0)
            return null;
        while (parts.length > 1) {
            const part = parts.shift();
            if (!(part in object))
                return null;
            object = castObject(object[part]);
        }
        const key = parts.at(-1);
        return { object, key };
    }
    static compileCommand(commandObject, command) {
        if (command.action === "get") {
            return () => {
                const objectAndKey = this.getObjectAndKey(commandObject, command.attr ?? "");
                if (!objectAndKey)
                    return null;
                const { object, key } = objectAndKey;
                let value = object[key];
                if (typeof (value) === "function")
                    value = value.bind(object);
                return value;
            };
        }
        if (command.action === "set") {
            if (!command.value)
                return () => null;
            const value = this.compileCommand(commandObject, command.value);
            return () => {
                const objectAndKey = this.getObjectAndKey(commandObject, command.prop ?? "");
                if (!objectAndKey)
                    return null;
                const { object, key } = objectAndKey;
                object[key] = value();
            };
        }
        if (command.action === "call") {
            if (!command.args)
                return () => null;
            const args = this.compileCommands(commandObject, command.args);
            return () => {
                const objectAndKey = this.getObjectAndKey(commandObject, command.func ?? "");
                if (!objectAndKey)
                    return null;
                const { object, key } = objectAndKey;
                let value = object[key];
                if (typeof (value) !== "function")
                    return null;
                return value.bind(object)(...args.map(arg => arg()));
            };
        }
        if (command.action === "op") {
            if (!command.op)
                return () => null;
            if (!command.left)
                return () => null;
            const left = this.compileCommand(commandObject, command.left);
            const right = command.right ? this.compileCommand(commandObject, command.right) : () => null;
            if (command.op === "+")
                return () => (left() + right());
            if (command.op === "-")
                return () => (left() - right());
            if (command.op === "*")
                return () => (left() * right());
            if (command.op === "/")
                return () => (left() / right());
            if (command.op === "**")
                return () => (left() ** right());
            if (command.op === "%")
                return () => (left() % right());
            if (command.op === "%%")
                return () => {
                    let r = right();
                    return ((left() % r) + r) % r;
                };
            if (command.op === "and")
                return () => (left() && right());
            if (command.op === "or")
                return () => (left() || right());
            if (command.op === "!")
                return () => (!left());
            if (command.op === "==")
                return () => (left() == right());
            if (command.op === "===")
                return () => (left() === right());
            if (command.op === "gt")
                return () => (left() > right());
            if (command.op === "gteq")
                return () => (left() >= right());
            if (command.op === "lt")
                return () => (left() < right());
            if (command.op === "lteq")
                return () => (left() <= right());
            if (command.op === "mx")
                return () => Math.max(left(), right());
            if (command.op === "mn")
                return () => Math.min(left(), right());
            if (command.op === "lerp")
                return () => lerp(...castVec2$1(left()), right());
            if (command.op === "map-rg")
                return () => {
                    let value = left();
                    const ranges = castArray(right());
                    if (ranges.length !== 2)
                        return null;
                    const range1 = castVec2$1(ranges[0]);
                    const range2 = castVec2$1(ranges[1]);
                    if (range1[0] === range1[1])
                        value = 0;
                    else
                        value = (value - range1[0]) / (range1[1] - range1[0]);
                    return lerp(...range2, value);
                };
            if (["rg", "rg-li", "rg-ri", "rg-i"].includes(command.op)) {
                const type = command.op.slice(3);
                if (type === "")
                    return () => {
                        const range = castVec2$1(right());
                        const value = left();
                        return value > range[0] && value < range[1];
                    };
                if (type === "li")
                    return () => {
                        const range = castVec2$1(right());
                        const value = left();
                        return value >= range[0] && value < range[1];
                    };
                if (type === "ri")
                    return () => {
                        const range = castVec2$1(right());
                        const value = left();
                        return value > range[0] && value <= range[1];
                    };
                if (type === "i")
                    return () => {
                        const range = castVec2$1(right());
                        const value = left();
                        return value >= range[0] && value <= range[1];
                    };
                return () => null;
            }
            return () => null;
        }
        if (command.action === "if") {
            if (!command.cond)
                return () => null;
            const cond = this.compileCommand(commandObject, command.cond);
            if (!command.true_ && !command.false_)
                return () => null;
            const true_ = this.compileCommands(commandObject, command.true_ ?? []);
            const false_ = this.compileCommands(commandObject, command.false_ ?? []);
            return () => {
                return (cond() ? true_ : false_).map(cmd => cmd());
            };
        }
        if (command.action === "for") {
            if (!command.of && !command.stop)
                return () => null;
            if (!command.body)
                return () => null;
            const start = command.start ? this.compileCommand(commandObject, command.start) : (() => 0);
            const stop = command.stop ? this.compileCommand(commandObject, command.stop) : (() => 0);
            const step = command.step ? this.compileCommand(commandObject, command.step) : (() => 1);
            const body = new Command(commandObject, command.body ?? []);
            if (command.of) {
                body.args = ["i", "value"];
                const of = this.compileCommand(commandObject, command.of);
                return () => {
                    const results = [];
                    castArray(of()).forEach((value, i) => results.push(body.executeWithArgs(i, value)));
                    return results;
                };
            }
            body.args = ["i"];
            return () => {
                const results = [];
                for (let i = start(); i < stop(); i += step())
                    results.push(body.executeWithArgs(i));
                return results;
            };
        }
        if (command.action === "json") {
            return () => (command.json ?? null);
        }
        if (command.action === "log") {
            const log = this.compileCommands(commandObject, command.log ?? []);
            return () => console.log(...log.map(cmd => cmd()));
        }
        return () => null;
    }
    static compileCommands(commandObject, commands) {
        return commands.map(command => this.compileCommand(commandObject, command));
    }
    enemy;
    _args;
    argValues;
    compiled;
    constructor(enemyOrCommand, commands) {
        super();
        this.enemy = (enemyOrCommand instanceof Enemy) ? enemyOrCommand : enemyOrCommand.enemy;
        this._args = [];
        this.argValues = {};
        this.compiled = Command.compileCommands(this, commands);
    }
    clearArgValues() {
        Object.keys(this.argValues).forEach(arg => {
            delete this.argValues[arg];
        });
    }
    get args() { return [...this._args]; }
    set args(value) {
        this._args.splice(0);
        this._args.push(...value);
        this.clearArgValues();
    }
    execute() {
        return this.compiled.map(cmd => cmd());
    }
    executeWithArgs(...args) {
        this.clearArgValues();
        for (let i = 0; i < this._args.length; i++)
            this.argValues[this._args[i]] = (i < args.length) ? args[i] : null;
        return this.execute();
    }
}
class EnemyComponent extends Target {
    enemy;
    texture;
    offset;
    scale;
    type;
    _opacity;
    _dir;
    isBody;
    constructor(enemy, data) {
        super();
        this.enemy = enemy;
        this._opacity = 1;
        this._dir = 0;
        this.texture = data.texture;
        this.offset = new Vec2(data.offset);
        this.scale = new Vec2(data.scale);
        this.type = data.type;
        this.opacity = data.opacity;
        this.dir = data.dir;
        this.isBody = data.isBody;
    }
    get opacity() { return this._opacity; }
    set opacity(value) { this._opacity = Math.min(1, Math.max(0, value)); }
    get dir() { return this._dir; }
    set dir(value) { this._dir = clampAngleDegrees(value); }
}
class EnemyAnimation extends Target {
    enemy;
    keyframes;
    loop;
    timer;
    index;
    constructor(enemy, data) {
        super();
        this.enemy = enemy;
        this.keyframes = data.keyframes.map(keyframe => new EnemyAnimationKeyframe(this, keyframe));
        this.loop = data.loop;
        this.timer = 0;
        this.index = 0;
    }
    start() {
        this.timer = 0;
        this.index = 0;
        this.startKeyframe();
    }
    continualKeyframe() {
        if (this.index < 0 || this.index >= this.keyframes.length)
            return;
        this.keyframes[this.index].continual.execute();
    }
    startKeyframe() {
        if (this.index < 0 || this.index >= this.keyframes.length)
            return;
        this.keyframes[this.index].start.execute();
    }
    stopKeyframe() {
        if (this.index < 0 || this.index >= this.keyframes.length)
            return;
        this.keyframes[this.index].stop.execute();
    }
    update(delta) {
        if (this.index >= this.keyframes.length) {
            if (!this.loop)
                return;
            this.stopKeyframe();
            this.index = 0;
            this.startKeyframe();
        }
        this.continualKeyframe();
        if (this.keyframes.length <= 0)
            return;
        this.timer += delta;
        if (this.timer < this.keyframes[this.index].wait)
            return;
        this.timer -= this.keyframes[this.index].wait;
        this.stopKeyframe();
        this.index++;
        this.startKeyframe();
    }
}
class EnemyAnimationKeyframe extends Target {
    animation;
    enemy;
    continual;
    start;
    stop;
    wait;
    constructor(animation, data) {
        super();
        this.animation = animation;
        this.enemy = this.animation.enemy;
        this.continual = new Command(this.enemy, data.continual);
        this.start = new Command(this.enemy, data.start);
        this.stop = new Command(this.enemy, data.stop);
        this.wait = data.wait * 1000;
    }
}
class EnemyState extends Target {
    enemy;
    continual;
    start;
    stop;
    constructor(enemy, data) {
        super();
        this.enemy = enemy;
        this.continual = new Command(this.enemy, data.continual);
        this.start = new Command(this.enemy, data.start);
        this.stop = new Command(this.enemy, data.stop);
    }
    update(delta) {
        this.continual.execute();
    }
}
class Enemy extends ModifiedEntity {
    type;
    env;
    components;
    functions;
    animations;
    states;
    events;
    _animation;
    _state;
    _nextState;
    latestDamage;
    constructor(options) {
        super({
            parent: options.parent,
            pos: options.pos,
            vel: options.vel,
            dir: options.dir,
            maxHealth: 1,
            radius: 0,
            group: "enemy",
        });
        this.type = options.type;
        this.env = {
            delta: 0,
        };
        this.components = {};
        this.functions = {};
        this.animations = {};
        this.states = {};
        this.events = {};
        this._animation = "";
        this._state = "";
        this._nextState = "";
        this.latestDamage = 0;
        this.addHandler("push", (enemy, dist) => {
            this.triggerEvent("push", { enemy, dist });
        });
        this.addHandler("damage", (enemy, dist) => {
            this.triggerEvent("damage", { enemy, dist });
        });
        const enemyData = this.engine.enemyDatas[this.type];
        if (!enemyData)
            return;
        this.radius = enemyData.size;
        this.maxHealth = enemyData.health;
        this.health = this.maxHealth;
        for (let id in enemyData.components)
            this.components[id] = new EnemyComponent(this, enemyData.components[id]);
        for (let name in enemyData.functions) {
            this.functions[name] = new Command(this, enemyData.functions[name].commands);
            this.functions[name].args = enemyData.functions[name].args;
        }
        for (let name in enemyData.animations)
            this.animations[name] = new EnemyAnimation(this, enemyData.animations[name]);
        for (let name in enemyData.states)
            this.states[name] = new EnemyState(this, enemyData.states[name]);
        this.state = enemyData.initialState;
        for (let name in enemyData.events)
            this.events[name] = new Command(this, enemyData.events[name]);
        this.addHandler("rem", () => {
            if (enemyData.colors.length <= 0)
                return;
            let size = Math.round(enemyData.size * lerp(1, 1.25, Math.random()));
            if (this.engine.cameraEntity)
                this.engine.cameraEntity.addShakeFrom(this.pos, size * 0.1);
            while (size > 0) {
                const color = choose(enemyData.colors);
                const time = lerp(5, 7.5, Math.random());
                if (size >= 10) {
                    this.engine.rootEntity.addEntity(this.createSplat("large-1", color, 2, 0.5, time, this.pos));
                    size -= 8;
                    continue;
                }
                if (size >= 8) {
                    this.engine.rootEntity.addEntity(this.createSplat("large-1", color, 1, 0.5, time, this.pos.add(Vec2.dir(360 * Math.random(), 2))));
                    size -= 6;
                    continue;
                }
                if (size >= 4) {
                    this.engine.rootEntity.addEntity(this.createSplat("mid-" + Math.ceil(3 * Math.random()), color, 1, 0.5, time, this.pos.add(Vec2.dir(360 * Math.random(), 4))));
                    size -= 3;
                    continue;
                }
                this.engine.rootEntity.addEntity(this.createSplat("small-" + Math.ceil(3 * Math.random()), color, 1, 0.5, time, this.pos.add(Vec2.dir(360 * Math.random(), 2))));
                size -= 1;
                continue;
            }
        });
    }
    get health() { return super.health; }
    set health(value) {
        if (value < super.health)
            this.latestDamage = getTime();
        if (value === 0)
            this.triggerEvent("death", {});
        super.health = value;
    }
    get damageFlash() { return getTime() - this.latestDamage < 50; }
    get animation() { return this._animation; }
    set animation(value) {
        if (this.animation === value)
            return;
        this._animation = value;
        if (this.animations[this.animation])
            this.animations[this.animation].start();
    }
    get state() { return this._state; }
    set state(value) { this._nextState = value; }
    checkState() {
        if (this._state === this._nextState)
            return;
        if (this.states[this.state])
            this.states[this.state].stop.execute();
        this._state = this._nextState;
        if (this.states[this.state])
            this.states[this.state].start.execute();
    }
    getComponent(id) {
        if (!(id in this.components))
            return null;
        return this.components[id];
    }
    getFunction(name) {
        if (!(name in this.functions))
            return null;
        return this.functions[name];
    }
    getEvent(name) {
        if (!this.events)
            return null;
        if (!(name in this.events))
            return null;
        return this.events[name];
    }
    triggerEvent(name, args) {
        const command = this.getEvent(name);
        if (!command)
            return;
        command.args = Object.keys(args);
        command.executeWithArgs(Object.values(args));
    }
    internalUpdate(delta) {
        super.internalUpdate(delta);
        this.env.delta = delta / 1000;
        this.checkState();
        if (this.animations[this.animation])
            this.animations[this.animation].update(delta);
        if (this.states[this.state])
            this.states[this.state].update(delta);
    }
    internalRender() {
        super.internalRender();
        const ctx = this.engine.ctx;
        ctx.save();
        const pos = this.engine.worldToCtxPos(this.realPos);
        ctx.translate(Math.round(pos.x), Math.round(pos.y));
        for (let id in this.components) {
            const component = this.components[id];
            if (component.opacity <= 0)
                continue;
            const textureSource = this.engine.getEnemyTextureSource(this.type, component.texture);
            if (!textureSource)
                continue;
            const texture = (component.isBody && this.damageFlash) ? textureSource.whiteAndOutline :
                (component.type === "original") ? textureSource.original :
                    (component.type === "outlined") ? textureSource.originalAndOutline :
                        (component.type === "white") ? textureSource.white :
                            textureSource.whiteAndOutline;
            ctx.save();
            ctx.translate(Math.round(this.engine.worldToCtxLen(component.offset.x)), Math.round(this.engine.worldToCtxLen(component.offset.y)));
            if (component.dir !== 0)
                ctx.rotate(component.dir * (Math.PI / 180));
            ctx.globalAlpha = component.opacity;
            const textureWidth = this.engine.worldToCtxLen(texture.width * component.scale.x);
            const textureHeight = this.engine.worldToCtxLen(texture.height * component.scale.y);
            ctx.drawImage(texture, Math.round(-textureWidth / 2), Math.round(-textureHeight / 2), textureWidth, textureHeight);
            ctx.restore();
        }
        ctx.restore();
    }
    copy(args) {
        return [...args];
    }
    concat(...args) {
        return args;
    }
    push(array, value) {
        array.push(value);
        return array;
    }
    pop(array) {
        return array.pop();
    }
    get(array, i) {
        return array[i];
    }
    getLookingOffset() {
        let x = 0, y = 0;
        if (Math.abs(angleRelDegrees(this.dir, 0)) < 45 + 22.5)
            x++;
        if (Math.abs(angleRelDegrees(this.dir, 180)) < 45 + 22.5)
            x--;
        if (Math.abs(angleRelDegrees(this.dir, 90)) < 45 + 22.5)
            y--;
        if (Math.abs(angleRelDegrees(this.dir, 270)) < 45 + 22.5)
            y++;
        return new Vec2([x, y]);
    }
    createSplat(type, color, scale, opacity, time, pos, vel) {
        return new Splat({
            parent: this.engine.rootEntity,
            type: type ?? "",
            color: color ?? [0, 0, 0, 255],
            scale: (scale ?? 1) * lerp(0.9, 1.1, Math.random()),
            opacity: opacity,
            time: (time ?? 0) * 1000,
            pos: pos,
            vel: vel,
        });
    }
    createEnemy(type, pos, vel, dir) {
        return new Enemy({
            parent: this.engine.rootEntity,
            pos: pos,
            vel: vel,
            dir: dir,
            type: type ?? "",
        });
    }
    createProjectile(type, color, speed, damage, pos, dir) {
        return new Projectile({
            parent: this.engine.rootEntity,
            source: this,
            type: type ?? "",
            color: color ?? 0,
            speed: speed ?? 0,
            time: 5000,
            damage: damage,
            pos: pos,
            dir: dir,
        });
    }
    createLaunchedProjectile(type, color, speed, damage, pos, dir) {
        return new LaunchedProjectile({
            parent: this.engine.rootEntity,
            source: this,
            type: type ?? "",
            color: color ?? 0,
            speed: speed ?? 0,
            time: 5000,
            damage: damage,
            pos: pos,
            dir: dir,
        });
    }
    createExplosion(color, damage, radius, pos) {
        return new Explosion({
            parent: this.engine.rootEntity,
            source: this,
            color: color ?? 0,
            damage: damage,
            pos: pos,
            radius: radius,
        });
    }
}
class Game extends Engine {
    _themeData;
    _enemyList;
    _enemyDatas;
    _particlesData;
    _particleDatas;
    _projectilesData;
    _projectileDatas;
    _textureMap;
    themeColors;
    enemyTextures;
    particleTextures;
    projectileTextures;
    playerEntity;
    constructor(options) {
        super(options);
        this._themeData = null;
        this._enemyList = null;
        this._enemyDatas = null;
        this._particlesData = null;
        this._particleDatas = null;
        this._projectilesData = null;
        this._projectileDatas = null;
        this._textureMap = null;
        this.themeColors = [];
        this.enemyTextures = {};
        this.particleTextures = {};
        this.projectileTextures = {};
        this.playerEntity = null;
    }
    init() {
        this.ctx.imageSmoothingEnabled = false;
        this.backgroundColor.set(this.getThemeColor(1));
        this.setCollisionRule("player", "player", Engine.COLLISIONPUSH);
        this.setCollisionRule("enemy", "enemy", Engine.COLLISIONPUSH);
        this.setCollisionRule("player", "enemy", Engine.COLLISIONPUSH | Engine.COLLISIONDAMAGE);
        this.setCollisionRule("enemy", "player", Engine.COLLISIONPUSH | Engine.COLLISIONDAMAGE);
        this.setCollisionRule("player-spawn", "enemy", Engine.COLLISIONPUSH | Engine.COLLISIONDAMAGE);
        this.setCollisionRule("player", "enemy-spawn", Engine.COLLISIONPUSH | Engine.COLLISIONDAMAGE);
        this.setCollisionRule("enemy-spawn", "player", Engine.COLLISIONPUSH | Engine.COLLISIONDAMAGE);
        this.setCollisionRule("enemy", "player-spawn", Engine.COLLISIONPUSH | Engine.COLLISIONDAMAGE);
        this.rootEntity.addEntity(new Background({ parent: this.rootEntity }));
        this.cameraEntity = this.rootEntity.addEntity(new Camera({
            parent: this.rootEntity,
        }));
        if (this.cameraEntity)
            this.cameraEntity.targetFov = 1;
        this.playerEntity = this.rootEntity.addEntity(new Player({
            parent: this.rootEntity,
        }));
        this.enemyList.forEach(type => {
            if (this.enemyDatas[type].part)
                return;
            const types = this.enemyDatas[type].type;
            let n = 3;
            if (types.includes("explosive"))
                n = 5;
            if (types.includes("swarm"))
                n = 10;
            if (types.includes("max") || types.includes("boss"))
                n = 1;
            for (let i = 0; i < n; i++)
                this.rootEntity.addEntity(new Enemy({
                    parent: this.rootEntity,
                    pos: [
                        lerp(-0.5, 0.5, Math.random()) * 200,
                        lerp(-0.5, 0.5, Math.random()) * 200,
                    ],
                    type: type,
                }));
        });
    }
    async load() {
        this._themeData = await loadThemeData();
        this._enemyList = await loadEnemyList();
        this._enemyDatas = {};
        await Promise.all(this.enemyList.map(async (type) => {
            this.enemyDatas[type] = await loadEnemyData(type);
        }));
        this._particlesData = await loadParticlesData();
        this._particleDatas = {};
        await Promise.all(this.particlesData.list.map(async (type) => {
            this.particleDatas[type] = await loadParticleData(type, this.particlesData);
        }));
        this._projectilesData = await loadProjectilesData();
        this._projectileDatas = {};
        await Promise.all(this.projectilesData.list.map(async (type) => {
            this.projectileDatas[type] = await loadProjectileData(type, this.projectilesData);
        }));
        this._textureMap = await loadFile();
        const themeSource = createTextureSource(this.textureMap, this.themeData.texture, 0);
        const themeImageData = themeSource.original.getContext("2d").getImageData(0, 0, this.themeData.texture.location.w, this.themeData.texture.location.h);
        for (let x = 0; x < this.themeData.texture.location.w; x++) {
            for (let y = 0; y < this.themeData.texture.location.h; y++) {
                let i = (x + y * this.themeData.texture.location.w) * 4;
                this.themeColors.push(new Color([
                    themeImageData.data[i + 0],
                    themeImageData.data[i + 1],
                    themeImageData.data[i + 2],
                    themeImageData.data[i + 3],
                ]));
            }
        }
        this.enemyList.forEach(type => {
            this.enemyTextures[type] = {};
            for (let name in this.enemyDatas[type].textures)
                this.enemyTextures[type][name] = createTextureSource(this.textureMap, this.enemyDatas[type].textures[name]);
        });
        this.particlesData.list.forEach(type => {
            this.particleTextures[type] = createColorMappedTextureSource(this.textureMap, this.particleDatas[type].texture);
        });
        this.projectilesData.list.forEach(type => {
            this.projectileTextures[type] = createColorMappedTextureSource(this.textureMap, this.projectileDatas[type].texture);
        });
        this.init();
    }
    get themeData() {
        if (!this._themeData)
            throw "Theme data not fully loaded yet";
        return this._themeData;
    }
    get enemyList() {
        if (!this._enemyList)
            throw "Enemy list map not fully loaded yet";
        return this._enemyList;
    }
    get enemyDatas() {
        if (!this._enemyDatas)
            throw "Enemy datas not fully loaded yet";
        return this._enemyDatas;
    }
    get particlesData() {
        if (!this._particlesData)
            throw "Particles data not fully loaded yet";
        return this._particlesData;
    }
    get particleDatas() {
        if (!this._particleDatas)
            throw "Particle datas not fully loaded yet";
        return this._particleDatas;
    }
    get textureMap() {
        if (!this._textureMap)
            throw "Texture map not fully loaded yet";
        return this._textureMap;
    }
    get projectilesData() {
        if (!this._projectilesData)
            throw "Projectiles data not fully loaded yet";
        return this._projectilesData;
    }
    get projectileDatas() {
        if (!this._projectileDatas)
            throw "Projectile datas not fully loaded yet";
        return this._projectileDatas;
    }
    get nThemeColors() { return this.themeColors.length; }
    getThemeColor(i) {
        if (i % 1 !== 0)
            return null;
        if (i < 0 || i >= this.themeColors.length)
            return null;
        return this.themeColors[i];
    }
    getEnemyTextureSource(type, textureName) {
        if (!this.enemyTextures[type])
            return null;
        if (!this.enemyTextures[type][textureName])
            return null;
        return this.enemyTextures[type][textureName];
    }
    getParticleTextureSource(type) {
        if (!this.particleTextures[type])
            return null;
        return this.particleTextures[type];
    }
    getProjectileTextureSource(type) {
        if (!this.projectileTextures[type])
            return null;
        return this.projectileTextures[type];
    }
    internalUpdate(delta) {
        super.internalUpdate(delta);
        if (this.playerEntity && !this.playerEntity.addedToEngine)
            this.playerEntity = null;
        const speed = 0.05;
        if (this.playerEntity) {
            let sx = +(this.isKeyDown("KeyD") || this.isKeyDown("ArrowRight")) - +(this.isKeyDown("KeyA") || this.isKeyDown("ArrowLeft"));
            let sy = +(this.isKeyDown("KeyW") || this.isKeyDown("ArrowUp")) - +(this.isKeyDown("KeyS") || this.isKeyDown("ArrowDown"));
            if (sx && sy) {
                sx /= Math.sqrt(2);
                sy /= Math.sqrt(2);
            }
            sx *= speed;
            sy *= speed;
            this.playerEntity.vel.x += sx;
            this.playerEntity.vel.y += sy;
            this.playerEntity.dir = this.playerEntity.realPos.towards(this.ctxToWorldPos(this.mouse.mul([
                this.ctx.canvas.width,
                this.ctx.canvas.height,
            ])));
        }
        if (this.cameraEntity && this.playerEntity)
            this.cameraEntity.target = this.playerEntity.pos;
    }
}

function fail(message) {
    document.body.innerHTML = message;
    return message;
}
function assertInline(value, failMessage) {
    if (!value) {
        const message = failMessage ;
        throw fail(message);
    }
    return value;
}
class App extends Target {
    static _instance = null;
    static get instance() {
        if (!this._instance)
            this._instance = new this();
        return this._instance;
    }
    canvas;
    ctx;
    game;
    constructor() {
        super();
        this.canvas = document.getElementById("game");
        this.ctx = assertInline(this.canvas.getContext("2d"), "Canvas is not supported");
        const onResize = () => {
            let scaleX = 300 / window.innerWidth;
            let scaleY = 150 / window.innerHeight;
            let scale = (scaleX + scaleY) / 2;
            this.ctx.canvas.width = Math.ceil(window.innerWidth * scale);
            this.ctx.canvas.height = Math.ceil(window.innerHeight * scale);
        };
        window.addEventListener("resize", e => onResize());
        onResize();
        this.game = new Game({
            ctx: this.ctx,
            bindTarget: document.body,
        });
        let t0 = null;
        const update = () => {
            window.requestAnimationFrame(update);
            if (t0 == null)
                return t0 = getTime();
            let t1 = getTime();
            this.update(t1 - t0);
            t0 = t1;
        };
        (async () => {
            await this.load();
            update();
        })();
    }
    async load() {
        this.game.load();
    }
    update(delta) {
        this.game.update(delta);
        this.game.render();
    }
}
App.instance;
