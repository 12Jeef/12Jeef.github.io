import * as util from "../util.mjs";


export default class WorkerScript extends util.Target {
    get epsilon() { return 0.01; }

    get channels() { return 0; }
    get channelsDoDiffuse() { return []; }

    get wrapDiffuse() { return true; }
    get wrapPen() { return true; }

    get degradeFactor() { return 1; }

    get eCanvas() { return this.ctx.canvas; }
    get eCanvas2() { return this.ctx2.canvas; }
    get width() { return this.eCanvas.width; }
    get height() { return this.eCanvas.height; }
    get width2() { return this.eCanvas2.width; }
    get height2() { return this.eCanvas2.height; }

    meterScaler(v) { return v; }

    clampX(x) { return ((x % this.width) + this.width) % this.width; }
    clampY(y) { return ((y % this.height) + this.height) % this.height; }
    clampI(i) { return ((i % this.channels) + this.channels) % this.channels; }
    getIdx(x, y, i) { return (x * this.height + y) * this.channels + i; }

    get length() { return this.width * this.height * this.channels; }

    getNormalDist(x, y, i) { return null; }
    getPenAdd(x, y, i) { return 100; }

    setup() {}
    updateFirst() {}
    updatePreDiffuse() {}
    updatePostDiffuse() {}
    updateLast() {}
    applyChannel(v) { return v * 256; }
    applyFilter(data, dataIdx, x, y) {}

    static makeNormalDist(stDev, mean=0) {
        const denom = stDev * Math.sqrt(2 * Math.PI);
        function normalDist(x) {
            let exp = 0.5 * ((x - mean) / stDev) ** 2;
            return 1 / (denom * Math.E ** exp);
        }
        function invNormalDist(y) {
            return [Math.sqrt(2 * Math.log(1 / (y * denom))) * stDev + mean, -Math.sqrt(2 * Math.log(1 / (y * denom))) * stDev + mean];
        }
        const [mx, mn] = invNormalDist(0.01).map(v => (Math.sign(v) * Math.ceil(Math.abs(v))) || 0);
        const sum = (() => {
            let sum = 0;
            for (let rx = mn; rx <= mx; rx++)
                for (let ry = mn; ry <= mx; ry++)
                    sum += normalDist(rx) * normalDist(ry);
            return sum;
        })();
        return { normalDist, invNormalDist, mx, mn, sum };
    }
    static makeNormalDistMat(stDev, mean=0) {
        const { normalDist, invNormalDist, mx, mn, sum } = this.makeNormalDist(stDev, mean);
        const mat = new Array(mx-mn+1).fill(null).map(() => new Array(mx-mn+1).fill(null).map(() => 0));
        for (let rx = mn; rx <= mx; rx++)
            for (let ry = mn; ry <= mx; ry++)
                mat[rx-mn][ry-mn] = normalDist(rx) * normalDist(ry) / sum;
        function get(rx, ry) {
            if (rx < mn) return 0;
            if (rx > mx) return 0;
            if (ry < mn) return 0;
            if (ry > mx) return 0;
            return mat[rx-mn][ry-mn];
        }
        return { normalDist, invNormalDist, mx, mn, sum, mat, get };
    }

    forEach(f) {
        for (let i = 0; i < this.channels; i++) {
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    let idx = this.getIdx(x, y, i);
                    f(this.space[idx], idx, x, y, i);
                }
            }
        }
    }

    constructor() {
        super();

        this.ctx = null;
        this.ctx2 = null;

        this.space = new Float64Array(0);
        this.space2 = new Float64Array(0);

        this.meter = new util.V();
        this.pen = 0;
        
        this.drawQueue = [];
        this.moveQueue = [];
        this.eraseQueue = [];

        self.addEventListener("message", e => {
            const { type, data } = e.data;
            if (type === "start") {
                const { eCanvas, eCanvas2 } = data;
                this.ctx = eCanvas.getContext("2d", { willReadFrequently: true });
                this.ctx2 = eCanvas2.getContext("2d");

                this.ctx2.fillStyle = "#000";
                this.ctx2.fillRect(0, 0, this.width2, this.height2);
                let x = 0;
                let pX = 0;
                let pValues = [0, 0, 0];

                this.space = new Float64Array(this.length);
                this.space2 = new Float64Array(this.length);

                this.setup();

                const id = setInterval(() => {
                    const { width, height, channels, ctx, ctx2, pen, drawQueue, moveQueue, eraseQueue } = this;
                    let { space, space2 } = this;
                    
                    this.updateFirst();

                    while (drawQueue.length > 0) {
                        const draw = drawQueue.shift();
                        const { pos, i } = draw;
                        let x = Math.round(pos[0]);
                        let y = Math.round(pos[1]);
                        i.forEach(i => {
                            for (let rx = -pen; rx <= pen; rx++) {
                                for (let ry = -pen; ry <= pen; ry++) {
                                    if (rx**2 + ry**2 > pen**2) continue;
                                    let ax = x + rx;
                                    let ay = y + ry;
                                    let aidx = 0;
                                    if (!this.wrapPen) {
                                        if (ax < 0 || ax >= width) continue;
                                        if (ay < 0 || ay >= height) continue;
                                        aidx = this.getIdx(ax, ay, this.clampI(i));
                                    } else {
                                        aidx = this.getIdx(this.clampX(ax), this.clampY(ay), this.clampI(i));
                                    }
                                    space[aidx] += this.getPenAdd(x, y, i);
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
                                    let ax = x + rx;
                                    let ay = y + ry;
                                    let outside = false;
                                    if (!this.wrapPen) {
                                        if (ax < 0 || ax >= width) outside = true;
                                        if (ay < 0 || ay >= height) outside = true;
                                    }
                                    if (outside) {
                                        values.push(0);
                                    } else {
                                        let idx = this.getIdx(this.clampX(x + rx), this.clampY(y + ry), this.clampI(i));
                                        values.push(space[idx]);
                                        space[idx] = 0;
                                    }
                                }
                            }
                            for (let rx = -pen; rx <= pen; rx++) {
                                for (let ry = -pen; ry <= pen; ry++) {
                                    if (rx**2 + ry**2 > pen**2) continue;
                                    let ax = x + rx + sx;
                                    let ay = y + ry + sy;
                                    let outside = false;
                                    if (!this.wrapPen) {
                                        if (ax < 0 || ax >= width) outside = true;
                                        if (ay < 0 || ay >= height) outside = true;
                                    }
                                    if (outside) {
                                        values.shift();
                                    } else {
                                        let idx = this.getIdx(this.clampX(x + rx + sx), this.clampY(y + ry + sy), this.clampI(i));
                                        space[idx] += values.shift();
                                    }
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
                                    let ax = x + rx;
                                    let ay = y + ry;
                                    let aidx = 0;
                                    if (!this.wrapPen) {
                                        if (ax < 0 || ax >= width) continue;
                                        if (ay < 0 || ay >= height) continue;
                                        aidx = this.getIdx(ax, ay, this.clampI(i));
                                    } else {
                                        aidx = this.getIdx(this.clampX(ax), this.clampY(ay), this.clampI(i));
                                    }
                                    space[aidx] = 0;
                                }
                            }
                        });
                    }

                    this.updatePreDiffuse();

                    space2.fill(0);
                    for (let i = 0; i < channels; i++) {
                        for (let x = 0; x < width; x++) {
                            for (let y = 0; y < height; y++) {
                                let idx = this.getIdx(x, y, i);
                                if (!this.channelsDoDiffuse[i]) {
                                    space2[idx] = space[idx];
                                    continue;
                                }
                                if (space[idx] < this.epsilon) continue;
                                space2[idx] += space[idx];
                                const { get, mx, mn } = this.getNormalDist(x, y, i);
                                for (let rx = mn; rx <= mx; rx++) {
                                    for (let ry = mn; ry <= mx; ry++) {
                                        let nd = get(rx, ry) * this.degradeFactor;
                                        let ax = x + rx;
                                        let ay = y + ry;
                                        let aidx = 0;
                                        if (!this.wrapDiffuse) {
                                            if (ax < 0 || ax >= width) continue;
                                            if (ay < 0 || ay >= height) continue;
                                            aidx = this.getIdx(ax, ay, i);
                                        } else {
                                            aidx = this.getIdx(this.clampX(ax), this.clampY(ay), i);
                                        }
                                        space2[aidx] += space[idx] * nd;
                                        space2[idx] -= space[idx] * nd;
                                    }
                                }
                            }
                        }
                    }
                    [space, space2] = [space2, space];
                    [this.space, this.space2] = [space, space2];

                    this.updatePostDiffuse();

                    ctx.clearRect(0, 0, width, height);
                    ctx.fillStyle = "#000";
                    ctx.fillRect(0, 0, width, height);
                    const data = ctx.getImageData(0, 0, width, height);
                    let sums = [0, 0, 0];
                    for (let x = 0; x < width; x++) {
                        for (let y = 0; y < height; y++) {
                            let dataIdx = (y * width + x) * 4;
                            for (let i = 0; i < Math.min(3, channels); i++) {
                                let idx = this.getIdx(x, y, i);
                                data.data[dataIdx + i] = Math.min(255, Math.max(0, this.applyChannel(space[idx])));
                                sums[i] += space[idx];
                            }
                            data.data[dataIdx + 3] = 255;
                            if (this.meter.x === x && this.meter.y === y) data.data[dataIdx + 3] *= 0.5;
                            this.applyFilter(data.data, dataIdx, x, y);
                        }
                    }
                    ctx.putImageData(data, 0, 0);

                    ctx2.fillStyle = "#000";
                    ctx2.fillRect(x, 0, 1, this.height2);

                    ctx2.lineWidth = 5;
                    for (let i = 0; i < Math.min(3, channels); i++) {
                        ctx2.strokeStyle = "#"+["f00", "0f0", "00f"][i];
                        let y = util.lerp(this.height2, 0, this.meterScaler(space[this.getIdx(...this.meter.xy, i)]));
                        ctx2.beginPath();
                        ctx2.moveTo(Math.min(x, pX), pValues[i]);
                        ctx2.lineTo(x, y);
                        ctx2.stroke();
                        pValues[i] = y;
                    }

                    pX = x;
                    x = (x + 0.25) % this.width2;

                    this.updateLast();
                }, 0);
                return;
            }
            if (type === "draw") {
                this.drawQueue.push(data);
                return;
            }
            if (type === "move") {
                this.moveQueue.push(data);
                return;
            }
            if (type === "erase") {
                this.eraseQueue.push(data);
                return;
            }
            if (type === "meter") {
                this.meter.set(data);
                return;
            }
            if (type === "pen") {
                this.pen = data;
                return;
            }
        });
    }
}