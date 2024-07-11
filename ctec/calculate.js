import * as util from "../util.mjs";
import { V } from "../util.mjs";

import { WorkerServer } from "./worker.js";


export class CalculateWorkerServer extends WorkerServer {
    constructor() {
        super(self);

        this.onReceive(({ pixels, size, channels }) => {
            let { cyto, nuclei, transf } = channels;
            size = new V(size);
            const get = (x, y, c) => pixels[(x + y*size.x) * 4 + c];
            const set = (x, y, c, v) => pixels[(x + y*size.x) * 4 + c] = v;
            const filled = (x, y, channels, f="any") => {
                let channelValues = [];
                for (let c of channels)
                    channelValues.push(get(x, y, c) > 128);
                if (f == "all")
                    return channelValues.all();
                if (f == "any")
                    return channelValues.any();
                if (!f) return false;
                return f(channelValues);
            };
            const floodfill = (x, y, channels, f="any") => {
                let n = 0;
                let bfs = [[x, y]];
                while (bfs.length > 0) {
                    let [x, y] = bfs.shift();
                    if (x < 0) continue;
                    if (x >= size.x) continue;
                    if (y < 0) continue;
                    if (y >= size.y) continue;
                    if (!filled(x, y, channels, f)) continue;
                    n++;
                    for (let c of channels) set(x, y, c, 0);
                    bfs.push([x+1, y]);
                    bfs.push([x-1, y]);
                    bfs.push([x, y+1]);
                    bfs.push([x, y-1]);
                }
                return n;
            };
            let cellBlobs = [];
            let meanCellBlobSize = null;
            for (let x = 0; x < size.x; x++) {
                for (let y = 0; y < size.y; y++) {
                    let cytoHit = 0;
                    let size = floodfill(x, y, [...cyto, ...nuclei], values => {
                        let cytoValues = values.slice(0, cyto.length);
                        cytoHit += cytoValues.any();
                        let nucleiValues = values.slice(cyto.length);
                        return nucleiValues.any();
                    });
                    if (size <= 0) continue;
                    if (cytoHit <= 0) continue;
                    cellBlobs.push({
                        pos: [x, y],
                        size: size,
                        cytoHit: cytoHit,
                    });
                    meanCellBlobSize = (meanCellBlobSize ?? 0) + size;
                }
            }
            if (meanCellBlobSize != null) meanCellBlobSize /= cellBlobs.length;
            this.send({
                isFinal: true,
                cellBlobs: cellBlobs,
                meanCellBlobSize: meanCellBlobSize,
            });
        });
    }
}
new CalculateWorkerServer();
