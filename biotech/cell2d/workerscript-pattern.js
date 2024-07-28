import * as util from "../../util.mjs";
import WorkerScript from "./workerscript.js";


// dA/dt = ρA + cA*A^2 / (1 + kA)*H - μA
// dH/dt = ρH + cH*A^2 - νH

let rhoA = 0;
let rhoH = 0;
let cA = 0;
let cH = 0;
let k = 0;
let mu = 0;
let nu = 0;


export default class PatternWorkerScript extends WorkerScript {
    channels = 3;
    channelsD = [0, 0, 0];

    getD(x, y, i) {
        if (this.space[this.getIdx(x, y, 2)]) return 0;
        return super.getD(x, y, i);
    }

    setup() {
        let callbackfs = {
            "0": (v, idx, x, y, i) => {
                if (i > 1) return;
                if (i === 0) {
                    this.space[idx] = util.lerp(-1, +1, Math.random());
                    return;
                }
            },
            "1": (v, idx, x, y, i) => {
                if (i > 1) return;
                this.space[idx] = (Math.sqrt((x-this.width/2) ** 2 + (y-this.height/2) ** 2) < 2.5) * 0.1;
            },
            "2": (v, idx, x, y, i) => {
                if (i !== 2) return;
                this.space[idx] = +!this.inButterfly(x, y);
            },
        };
        let callback = null;
        if (this.mode in callbackfs) callback = callbackfs[this.mode];
        this.forEach((v, idx, x, y, i) => {
            if (callback) callback(v, idx, x, y, i);
        });
    }
    updatePreDiffuse() {
        const { space, width, height } = this;
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let idxA = this.getIdx(x, y, 0);
                let idxH = this.getIdx(x, y, 1);
                let A = space[idxA];
                let H = space[idxH];
                let dAdt = rhoA + (cA * A**2) / ((1 + k * A**2) * Math.max(0.1, H)) - mu * A;
                let dHdt = rhoH + (cH * A**2) - nu * H;
                A += dAdt * this.dt;
                H += dHdt * this.dt;
                space[idxA] = A || 0;
                space[idxH] = H || 0;
            }
        }
    }
    applyChannel(i, v) { return v * 64; }

    applyFilter(data, dataIdx, x, y) {
        if (this.space[this.getIdx(x, y, 2)]) data[dataIdx + 3] /= 2;
    }

    inButterfly(x, y) {
        x -= this.width/2;
        y -= this.height*0.55;
        x /= 1.5;
        y /= 1.5;
        x = Math.abs(x);
        if (y < 0) {
            y = -y/1.25;
            if (x > this.width/4) return false;
            if (y < this.height*0.1) return true;
            y -= this.height*0.1;
            if (y > this.height/6) return false;
            return (x/(this.width/4))-(y/(this.height/4)) > 0;
        }
        if (x > this.width/6) return false;
        if (y < this.height*0.1) return true;
        y -= this.height*0.1;
        if (y > this.height/6) return false;
        return (x/(this.width/6))-(y/(this.height/4)) > 0;
    }

    constructor() {
        super();

        this.mode = 0;

        this.addHandler("message", ({ type, data }) => {
            if (type === "mode") {
                this.mode = data;
                this.fullSetup();
                return;
            }
            if (type === "rhoA")
                return rhoA = data;
            if (type === "rhoH")
                return rhoH = data;
            if (type === "cA")
                return cA = data;
            if (type === "cH")
                return cH = data;
            if (type === "k")
                return k = data;
            if (type === "mu")
                return mu = data;
            if (type === "nu")
                return nu = data;
        });
    }
}

new PatternWorkerScript();
