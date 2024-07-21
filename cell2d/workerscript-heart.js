import * as util from "../util.mjs";
import WorkerScript from "./workerscript.js";


// dV/dt = kV(1-V)(V-a) - W + D * (diffusion)
// dW/dt = ε(ßV - W)

const dt = 0.5;
const k = 2;
const a = 0.25;
const epsilon = 0.075;
const beta = 0.85;
const D = 0.5;


const normalDist = WorkerScript.makeNormalDistMat(1);
const normalDistAtrium = WorkerScript.makeNormalDistMat(1);
const normalDistVentricle = WorkerScript.makeNormalDistMat(2);
const normalDistAVNode = WorkerScript.makeNormalDistMat(0.5);
const normalDistBarrier = WorkerScript.makeNormalDistMat(0);


const doDiffuse = [false, false, false, false];
export default class HeartWorkerScript extends WorkerScript {
    get channels() { return 4; }
    get channelsDoDiffuse() { return doDiffuse; }

    get wrapDiffuse() { return false; }
    get wrapPen() { return false; }

    meterScaler(v) { return util.lerp(0.25, 0.75, v); }

    getNormalDist(x, y, i) {
        if (this.mode != 2) return normalDist;
        if (this.inChannel(x, y)) return normalDistAVNode;
        if (this.inAtrium(x, y)) return normalDistAtrium;
        if (this.inVentricle(x, y)) return normalDistVentricle;
        return normalDistBarrier;
    }
    getPenAdd(x, y, i) { return a/10; }

    setup() {
        let callbackfs = {
            "0": (v, idx, x, y, i) => {
                let dir = Math.atan2(y-this.height/2, x-this.width/2) * 180/Math.PI;
                dir = ((dir % 360) + 360) % 360;
                let dist = Math.sqrt((x-this.width/2) ** 2 + (y-this.height/2) ** 2);
                let inner = dist < (this.width+this.height)/2 * 0.1;
                if (i === 0) {
                    this.space[idx] = (Math.abs(util.angleRel(dir, 0)) < this.fireDeg/2 && !inner) * (a*2);
                    return;
                }
                if (i === 2) {
                    this.space[idx] = (Math.abs(util.angleRel(dir, this.tiredDeg/2 + this.fireDeg/2)) < this.tiredDeg/2 && !inner) * 1;
                    return;
                }
            },
            "1": (v, idx, x, y, i) => {
                if (i === 0) {
                    this.space[idx] = (Math.abs(x-this.width/2) < this.fireW && y < this.height/2 && y > this.height/4) * (a*2);
                    return;
                }
                if (i === 2) {
                    this.space[idx] = (x <= this.width/2-this.fireW && y < this.height/2) * 1;
                    return;
                }
            },
            "2": (v, idx, x, y, i) => {
            },
            "3": (v, idx, x, y, i) => {
                if (i === 0) {
                    this.space[idx] = (Math.sqrt((x-this.width/2) ** 2 + (y-this.height/2) ** 2) < this.fireSize) * (a*2);
                    return;
                }
            },
            "4": (v, idx, x, y, i) => {
            },
        };
        let callback = null;
        if (this.mode in callbackfs) callback = callbackfs[this.mode];
        this.forEach((v, idx, x, y, i) => {
            if (i === 1) {
                return;
            }
            if (i === 3) {
                this.space[idx] = +(this.mode === 2 && this.onBarrier(x, y) && !this.inChannel(x, y));
                return;
            }
            if (callback) callback(v, idx, x, y, i);
        });
    }
    updateFirst() { this.time += dt; }
    updatePreDiffuse() {
        const { space, width, height, mode, time } = this;
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let idxV = this.getIdx(x, y, 0);
                let idxW = this.getIdx(x, y, 2);
                let V = space[idxV];
                let W = space[idxW];
                let I = 0;
                const { get, mx, mn } = this.getNormalDist(x, y, 2);
                for (let rx = mn; rx <= mx; rx++) {
                    for (let ry = mn; ry <= mx; ry++) {
                        let ax = x + rx, ay = y + ry;
                        if (ax < 0 || ax >= width) continue;
                        if (ay < 0 || ay >= height) continue;
                        if (space[this.getIdx(ax, ay, 3)]) continue;
                        let nd = get(rx, ry);
                        let aidx = this.getIdx(ax, ay, 0);
                        I += Math.max(0, space[aidx]) * nd;
                    }
                }
                I *= D;
                let dV = k * V * (1 - V) * (V - a) - W + I;
                let dW = epsilon * (beta * V - W);
                V += dV * dt;
                W += dW * dt;
                if (mode === 2)
                    V += a * this.inSinusNode(x, y) * (Math.max(this.sinusPulseThresh, Math.sin(2*Math.PI * time/this.sinusPulsePeriod)) - this.sinusPulseThresh) / (1-this.sinusPulseThresh);
                space[idxV] = V || 0;
                space[idxW] = W || 0;
            }
        }
    }

    applyFilter(data, dataIdx, x, y) {
        if (this.space[this.getIdx(x, y, 3)]) data[dataIdx + 3] *= 0.75;
    }

    get mode() { return 4; }
    
    get fireDeg() { return 10; }
    get tiredDeg() { return 45; }
    
    get fireW() { return 2; }
    
    get fireSize() { return 3; }
    
    get barrierX() { return this.width/3; }
    get barrierW() { return 5; }
    get channelY() { return this.height/2; }
    get channelW() { return 5; }

    get sinusPulsePeriod() { return 200; }
    get sinusPulseThresh() { return 0.75; }

    onBarrier(x, y) {
        return this.mode === 2 && Math.abs(x - this.barrierX) <= this.barrierW;
    }
    inChannel(x, y) {
        return this.mode === 2 && this.onBarrier(x, y) && Math.abs(y - this.channelY) <= this.channelW;
    }
    inAtrium(x, y) {
        return this.mode === 2 && !this.onBarrier(x, y) && x < this.barrierX;
    }
    inVentricle(x, y) {
        return this.mode === 2 && !this.onBarrier(x, y) && x > this.barrierX;
    }
    inSinusNode(x, y) {
        return this.mode === 2 && Math.abs(x - 3) < 2 && Math.abs(y - this.height/4) < 2;
    }

    constructor() {
        super();

        this.time = 0;
    }
}

new HeartWorkerScript();
