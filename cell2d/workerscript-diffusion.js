import * as util from "../util.mjs";
import WorkerScript from "./workerscript.js";


const normalDist1 = WorkerScript.makeNormalDistMat(2);
const normalDist2 = WorkerScript.makeNormalDistMat(1);
const normalDist3 = WorkerScript.makeNormalDistMat(0.5);
const normalDist4 = WorkerScript.makeNormalDistMat(0.25);
const normalDist = WorkerScript.makeNormalDistMat(1);


export default class DiffusionWorkerScript extends WorkerScript {
    get epsilon() { return 1; }

    get channels() { return 3; }
    get channelsDoDiffuse() { return [true, true, true]; }

    meterScaler(v) { return util.lerp(0.25, 0.75, v/256); }

    getPenAdd(x, y, i) { return 10; }

    getNormalDist(x, y, i) {
        // if (i == 0) return [normalDist1, normalDist2, normalDist3, normalDist4][Math.floor(4 * x / width)];
        // if (i == 2) return [normalDist1, normalDist2, normalDist3, normalDist4][Math.floor(4 * y / height)];
        // return normalDist1;
        return normalDist;
    }

    applyChannel(v) { return v; }

    constructor() {
        super();
    }
}

new DiffusionWorkerScript();
