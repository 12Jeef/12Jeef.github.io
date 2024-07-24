import * as util from "../../util.mjs";
import WorkerScript from "./workerscript.js";


// dA/dt = ρA + cA*A^2 / (1 + kA)*I - μA
// dI/dt = ρI + cI*A^2 - νI

let dt = 0;
let rhoA = 0;
let rhoI = 0;
let cA = 0;
let cI = 0;
let k = 0;
let mu = 0;
let nu = 0;

const normalDistA = WorkerScript.makeNormalDistMat(0.5);
const normalDistI = WorkerScript.makeNormalDistMat(2);
const normalDistNone = WorkerScript.makeNormalDistMat(0);


export default class PatternWorkerScript extends WorkerScript {
    get channels() { return 2; }
    get channelsDoDiffuse() { return [true, true]; }

    get degradeFactor() { return 1; }

    meterScaler(v) { return util.lerp(0.25, 0.75, v/2); }

    getNormalDist(x, y, i) {
        if (i === 0) return normalDistA;
        if (i === 1) return normalDistI;
        return normalDistNone;
    }

    setup() {
        let callbackfs = {
            "0": (v, idx, x, y, i) => {
                if (i > 1) return;
                if (i === 0) {
                    this.space[idx] = util.lerp(-0.025, +0.025, Math.random());
                    return;
                }
            },
            "1": (v, idx, x, y, i) => {
                if (i > 1) return;
                this.space[idx] = (Math.sqrt((x-this.width/2) ** 2 + (y-this.height/2) ** 2) < 2.5) * 0.1;
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
                let idxI = this.getIdx(x, y, 1);
                let A = space[idxA];
                let I = space[idxI];
                let dAdt = rhoA + (cA * A**2) / ((1 + k * A**2) * Math.max(0.01, I)) - mu * A;
                let dIdt = rhoI + (cI * A**2) - nu * I;
                A += dAdt * dt;
                I += dIdt * dt;
                space[idxA] = A || 0;
                space[idxI] = I || 0;
            }
        }
    }
    applyChannel(v) { return v * 128; }

    constructor() {
        super();

        this.mode = 0;

        this.addHandler("message", ({ type, data }) => {
            if (type === "mode") {
                this.mode = data;
                this.fullSetup();
                return;
            }
            if (type === "dt") {
                console.log(dt, data);
                return dt = data;
            }
            if (type === "rhoA")
                return rhoA = data;
            if (type === "rhoI")
                return rhoI = data;
            if (type === "cA")
                return cA = data;
            if (type === "cI")
                return cI = data;
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
