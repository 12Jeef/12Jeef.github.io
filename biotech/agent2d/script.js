import * as util from "../../util.mjs";


const eCanvas = document.getElementById("canvas");
const ctx = eCanvas.getContext("2d");


const avoidK = 0.05;
const centeringK = 0.0005;
const matchingK = 0.05;

const turnK = 0.5;
const margin = 20;


let width = ctx.canvas.width;
let height = ctx.canvas.height;


class Agent extends util.Target {
    #protectedRange;
    #visualRange;

    #pos;
    #vel;

    #npos;
    #nvel;

    constructor(opts) {
        super();

        this.#protectedRange = 0;
        this.#visualRange = 0;

        this.#pos = new util.V();
        this.#vel = new util.V();

        this.#npos = new util.V();
        this.#nvel = new util.V();

        const { protectedRange, visualRange, pos, vel } = opts;

        this.protectedRange = protectedRange;
        this.visualRange = visualRange;

        this.pos = pos;
        this.vel = vel;
    }

    get protectedRange() { return this.#protectedRange; }
    set protectedRange(v) { this.#protectedRange = Math.max(0, Number(v) || 0); }
    get visualRange() { return this.#visualRange; }
    set visualRange(v) { this.#visualRange = Math.max(0, Number(v) || 0); }

    get pos() { return this.#pos; }
    set pos(v) { this.#pos.set(v); }
    get x() { return this.pos.x; }
    set x(v) { this.pos.x = v; }
    get y() { return this.pos.y; }
    set y(v) { this.pos.y = v; }

    get vel() { return this.#vel; }
    set vel(v) { this.#vel.set(v); }
    get velX() { return this.vel.x; }
    set velX(v) { this.vel.x = v; }
    get velY() { return this.vel.y; }
    set velY(v) { this.vel.y = v; }

    get dir() { return util.clampAngle(this.vel.towards() + 180); }

    get npos() { return this.#npos; }
    set npos(v) { this.#npos.set(v); }
    get nx() { return this.npos.x; }
    set nx(v) { this.npos.x = v; }
    get ny() { return this.npos.y; }
    set ny(v) { this.npos.y = v; }

    get nvel() { return this.#nvel; }
    set nvel(v) { this.#nvel.set(v); }
    get nvelX() { return this.nvel.x; }
    set nvelX(v) { this.nvel.x = v; }
    get nvelY() { return this.nvel.y; }
    set nvelY(v) { this.nvel.y = v; }

    get ndir() { return util.clampAngle(this.nvel.towards() + 180); }

    update() {
        [this.npos, this.nvel] = [this.pos, this.vel];

        // const dir = this.dir;

        let neighborCloseDx = 0;
        let neighborCloseDy = 0;

        let neighborAvgX = 0;
        let neighborAvgY = 0;

        let neighborAvgVelX = 0;
        let neighborAvgVelY = 0;
        
        let nNeighborAgents = 0;

        let scans = [];

        let xMin = this.x - this.visualRange < 0;
        let xMax = this.x + this.visualRange > width;
        let yMin = this.y - this.visualRange < 0;
        let yMax = this.y + this.visualRange > height;
        for (let x = xMin * -1; x <= xMax * +1; x++)
            for (let y = yMin * -1; y <= yMax * +1; y++)
                scans.push([x, y]);

        agents.forEach(agent => {
            if (agent === this) return;

            // const dir2 = this.pos.towards(agent.pos);
            // const dirRel = Math.abs(util.angleRel(dir, dir2));
            const rangeScale = 1; // dirRel < 90 ? 1 : util.lerp(1, 0, (dirRel-90)/90); // (util.cos(dirRel) + 1) / 2;
            const { dist, shift: [shiftX, shiftY] } = (() => {
                let distMn = Infinity;
                let shift = [0, 0];
                scans.forEach(([sx, sy]) => {
                    let dist = this.pos.dist(agent.pos.add(sx * width, sy * height));
                    if (dist > distMn) return;
                    distMn = dist;
                    shift = [sx, sy];
                });
                return { dist: distMn, shift: shift };
            })();

            if (dist < this.protectedRange * rangeScale) {
                neighborCloseDx += this.x - (agent.x + width * shiftX);
                neighborCloseDy += this.y - (agent.y + height * shiftY);
                return;
            }

            if (dist > this.visualRange * rangeScale) return;

            neighborAvgX += (agent.x + width * shiftX);
            neighborAvgY += (agent.y + height * shiftY);

            neighborAvgVelX += agent.velX;
            neighborAvgVelY += agent.velY;

            nNeighborAgents++;
        });

        this.nvelX += neighborCloseDx * avoidK;
        this.nvelY += neighborCloseDy * avoidK;

        if (nNeighborAgents > 0) {
            neighborAvgX /= nNeighborAgents;
            neighborAvgY /= nNeighborAgents;

            this.nvelX += (neighborAvgX - this.x) * centeringK;
            this.nvelY += (neighborAvgY - this.y) * centeringK;

            neighborAvgVelX /= nNeighborAgents;
            neighborAvgVelY /= nNeighborAgents;

            this.nvelX += (neighborAvgVelX - this.nvelX) * matchingK;
            this.nvelY += (neighborAvgVelY - this.nvelY) * matchingK;
        }

        // if (this.x < margin) this.nvelX += turnK;
        // if (this.x > width - margin) this.nvelX -= turnK;
        // if (this.y < margin) this.nvelY += turnK;
        // if (this.y > height - margin) this.nvelY -= turnK;
    }
    postUpdate() {
        [this.pos, this.vel] = [this.npos, this.nvel];

        this.pos.iadd(this.vel);

        this.x = ((this.x % width) + width) % width;
        this.y = ((this.y % height) + height) % height;
    }
}
const agents = [];
for (let i = 0; i < 200; i++)
    agents.push(new Agent({
        protectedRange: 8,
        visualRange: 40,
        pos: [Math.random() * width, Math.random() * height],
        vel: util.V.dir(360 * Math.random(), 10),
    }));


const update = () => {
    window.requestAnimationFrame(update);

    agents.forEach(agent => agent.update());
    agents.forEach(agent => agent.postUpdate());

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.lineWidth = 1;
    agents.forEach(agent => {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(...agent.pos.xy, 5, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fill();

        return;

        ctx.strokeStyle = "#f004";
        ctx.beginPath();
        ctx.arc(...agent.pos.xy, agent.protectedRange, 0, 2*Math.PI);
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = "#0f04";
        ctx.beginPath();
        ctx.arc(...agent.pos.xy, agent.visualRange, 0, 2*Math.PI);
        ctx.closePath();
        ctx.stroke();
    });
};
update();
