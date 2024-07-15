import * as util from "../util.mjs";


const epsilon = 0.01;

function makeNormalDist(stDev, mean=0) {
    const denom = stDev * Math.sqrt(2 * Math.PI);
    function normalDist(x) {
        let exp = 0.5 * ((x - mean) / stDev) ** 2;
        return 1 / (denom * Math.E ** exp);
    }
    function invNormalDist(y) {
        return [Math.sqrt(2 * Math.log(1 / (y * denom))) * stDev + mean, -Math.sqrt(2 * Math.log(1 / (y * denom))) * stDev + mean];
    }
    const [mx, mn] = invNormalDist(0.01).map(v => Math.sign(v) * Math.ceil(Math.abs(v)));
    const sum = (() => {
        let sum = 0;
        for (let rx = mn; rx <= mx; rx++)
            for (let ry = mn; ry <= mx; ry++)
                sum += normalDist(rx) * normalDist(ry);
        return sum;
    })();
    return { normalDist, invNormalDist, mx, mn, sum };
}

const pen = 3;

const drawQueue = [];
const moveQueue = [];
const eraseQueue = [];

self.addEventListener("message", e => {
    const { type, data } = e.data;
    if (type === "start") {
        const { eCanvas } = data;
        const ctx = eCanvas.getContext("2d", { willReadFrequently: true });

        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        function clampX(x) { return ((x % width) + width) % width; }
        function clampY(y) { return ((y % height) + height) % height; }
        function clampI(i) { return ((i % 3) + 3) % 3; }
        function getIdx(x, y, i) { return (x * height + y) * 3 + i; }

        const space = new Float64Array(width * height * 3);

        const normalDist1 = makeNormalDist(2);
        const normalDist2 = makeNormalDist(1);

        function getNormalDist(x, y, i) {
            return (x < width / 2 || i != 0) ? normalDist1 : normalDist2;
        }

        setInterval(() => {
            while (drawQueue.length > 0) {
                const draw = drawQueue.shift();
                const { pos, i } = draw;
                let x = Math.round(pos[0]);
                let y = Math.round(pos[1]);
                i.forEach(i => {
                    for (let rx = -pen; rx <= pen; rx++) {
                        for (let ry = -pen; ry <= pen; ry++) {
                            if (rx**2 + ry**2 > pen**2) continue;
                            space[getIdx(clampX(x + rx), clampY(y + ry), clampI(i))] += 100;
                        }
                    }
                });
            }
            while (moveQueue.length > 0) {
                const move = moveQueue.shift();
                const { pos, shift, i } = move;
                let x = Math.round(pos[0]);
                let y = Math.round(pos[1]);
                let sx = Math.round(shift[0]);
                let sy = Math.round(shift[1]);
                i.forEach(i => {
                    const values = [];
                    for (let rx = -pen; rx <= pen; rx++) {
                        for (let ry = -pen; ry <= pen; ry++) {
                            if (rx**2 + ry**2 > pen**2) continue;
                            let idx = getIdx(clampX(x + rx), clampY(y + ry), clampI(i));
                            values.push(space[idx]);
                            space[idx] = 0;
                        }
                    }
                    for (let rx = -pen; rx <= pen; rx++) {
                        for (let ry = -pen; ry <= pen; ry++) {
                            if (rx**2 + ry**2 > pen**2) continue;
                            let idx = getIdx(clampX(x + rx + sx), clampY(y + ry + sy), clampI(i));
                            space[idx] += values.shift();
                        }
                    }
                });
            }
            while (eraseQueue.length > 0) {
                const erase = eraseQueue.shift();
                const { pos, i } = erase;
                let x = Math.round(pos[0]);
                let y = Math.round(pos[1]);
                i.forEach(i => {
                    for (let rx = -pen; rx <= pen; rx++) {
                        for (let ry = -pen; ry <= pen; ry++) {
                            if (rx**2 + ry**2 > pen**2) continue;
                            space[getIdx(clampX(x + rx), clampY(y + ry), clampI(i))] = 0;
                        }
                    }
                });
            }
            const space2 = new Float64Array(space.length);
            for (let i = 0; i < 3; i++) {
                for (let x = 0; x < width; x++) {
                    for (let y = 0; y < height; y++) {
                        let idx = getIdx(x, y, i);
                        if (space[idx] < epsilon) continue;
                        const { normalDist, mx, mn, sum } = getNormalDist(x, y, i);
                        for (let rx = mn; rx <= mx; rx++) {
                            for (let ry = mn; ry <= mx; ry++) {
                                let nd = normalDist(rx) * normalDist(ry) / sum;
                                let aidx = getIdx(clampX(x + rx), clampY(y + ry), i);
                                space2[aidx] += space[idx] * nd;
                            }
                        }
                    }
                }
            }
            space.set(space2);
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, width, height);
            const data = ctx.getImageData(0, 0, width, height);
            let sums = [0, 0, 0];
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    let dataIdx = (y * width + x) * 4;
                    for (let i = 0; i < 3; i++) {
                        let idx = getIdx(x, y, i);
                        data.data[dataIdx + i] = Math.min(255, Math.max(0, space[idx] / 1e1));
                        sums[i] += space[idx];
                    }
                    data.data[dataIdx + 3] = 255;
                }
            }
            ctx.putImageData(data, 0, 0);
        }, 10);
        return;
    }
    if (type === "draw") {
        drawQueue.push(data);
        return;
    }
    if (type === "move") {
        moveQueue.push(data);
        return;
    }
    if (type === "erase") {
        eraseQueue.push(data);
        return;
    }
});