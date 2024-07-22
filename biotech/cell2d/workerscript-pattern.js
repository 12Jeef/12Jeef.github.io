import * as util from "../../util.mjs";
import WorkerScript from "./workerscript.js";


function quadratic(a, r1, r2) {
    return x => a * (x - r1) * (x - r2);
}
const keyPoints = [-10, 1, 30];
const [a, b, c] = keyPoints;
const quadratic1 = quadratic(-1, a, b+(b-a));
const quadratic2 = quadratic(-1, c, b-(c-b));
const quadratic1Mx = quadratic1(b);
const quadratic2Mx = quadratic2(b);
function promotionFunc(x) {
    if (x < a) return 0;
    if (x < b) return quadratic1(x) / quadratic1Mx;
    return quadratic2(x) / quadratic2Mx;
}

const normalDist = WorkerScript.makeNormalDistMat(0.5);

export default class PatternWorkerScript extends WorkerScript {
    get channels() { return 5; }
    get channelsDoDiffuse() { return [true, true, true, false, false]; }

    get degradeFactor() { return 0.5; }

    meterScaler(v) { return util.lerp(0.25, 0.75, v/25); }

    getNormalDist() { return normalDist; }

    setup() {
        this.forEach((v, idx, x, y, i) => {
            if (i < 3) return;
            this.space[idx] = util.lerp(-1, +1, Math.random());
        });
    }
    updatePreDiffuse() {
        let cache = {};
        this.forEach((v, idx, x, y, i) => {
            if (i < 3) return;
            let idx1 = this.getIdx(x, y, 0);
            let idx2 = this.getIdx(x, y, 1);
            let v1 = (idx1 in cache) ? cache[idx1] : this.space[idx1];
            let v2 = (idx2 in cache) ? cache[idx2] : this.space[idx2];
            cache[idx1] = v1;
            cache[idx2] = v2;
            if (i == 3) {
                if (this.space[idx] > 0) this.space[idx1] += 5 * this.space[idx];
                this.space[idx] += 0.25 * promotionFunc(v1) - 0.01 * v2;
            } else if (i == 4) {
                if (this.space[idx] > 0) this.space[idx2] += 5 * this.space[idx];
                this.space[idx] += 0.25 * promotionFunc(v2) - 0.01 * v1;
            }
            this.space[idx] = Math.min(1, Math.max(-1, this.space[idx]));
        });
        let x = 0, y = 0;
        let idx1 = this.getIdx(x, y, 0);
        let idx2 = this.getIdx(x, y, 1);
        let v1 = (idx1 in cache) ? cache[idx1] : this.space[idx1];
        let v2 = (idx2 in cache) ? cache[idx2] : this.space[idx2];
        cache[idx1] = v1;
        cache[idx2] = v2;
        console.log(...[v1, v2, promotionFunc(v1), promotionFunc(v2), this.space[this.getIdx(x, y, 3)], this.space[this.getIdx(x, y, 4)]].map(v => Math.round(v*100)/100));
    }
    applyChannel(v) { return v * 5; }

    constructor() {
        super();
    }
}

new PatternWorkerScript();
