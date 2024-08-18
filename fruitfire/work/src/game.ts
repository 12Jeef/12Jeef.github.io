import * as util from "./util";

import Engine, { EngineOptions, Entity, EntityOptions, Camera } from "./engine";

import * as loader from "./loader";


class ModifiedEntity extends Entity {
    constructor(options: EntityOptions) {
        super(options);
    }

    protected internalUpdate(delta: number) {
        super.internalUpdate(delta);

        this.z = (this.hasEngineParent ? 0 : ((this.parent as Entity).pos.y - (this.parent as Entity).radius)) - (this.pos.y - this.radius);
    }
}


type BackgroundOptions = {
    parent: Entity,
};
class Background extends ModifiedEntity {
    constructor(options: BackgroundOptions) {
        super({
            parent: options.parent,

            maxHealth: 1,

            group: "deco",

            z: -1e10,
        });

        this.alwaysRender = true;
    }

    protected internalRender() {
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
                if ((((rx + ry) % 2) + 2) % 2) continue;
                ctx.fillRect(
                    ...this.engine.worldToCtxPos(new util.Vec2([rx * grid, ry * grid])).round().xy,
                    this.engine.worldToCtxLen(grid), this.engine.worldToCtxLen(grid),
                );
            }
        }
    }
}


type ParticleOptions = {
    parent: Entity,

    type: string,
    color: util.ColorLike | number,
    scale?: number,
    opacity?: number,

    time?: number,

    pos?: util.VectorLike,
    vel?: util.VectorLike,
    dir?: number,
};
class Particle extends Entity {
    public type;
    public readonly color;
    private _opacity;

    protected time;

    constructor(options: ParticleOptions) {
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
        this.color = new util.Color();
        if (typeof(options.color) === "number")
            this.color.set((this.engine as Game).getThemeColor(options.color) ?? 0);
        else this.color.set(options.color);
        this.opacity = options.opacity ?? 1;
    }

    public get scale() { return this.radius; }
    public set scale(value) { this.radius = value; }

    public get opacity() { return this._opacity; }
    public set opacity(value) { this._opacity = Math.min(1, Math.max(0, value)); }

    protected internalUpdate(delta: number) {
        super.internalUpdate(delta);

        if (!this.inRenderDistance) this.health = 0;

        this.time -= delta;
        if (this.time <= 0) this.health = 0;
    }
    protected internalRender() {
        super.internalRender();

        if (this.opacity <= 0) return;

        const textureSource = (this.engine as Game).getParticleTextureSource(this.type);
        if (!textureSource) return;
        const texture = textureSource.generator(this.color);
        
        const ctx = this.engine.ctx;

        ctx.save();

        const pos = this.engine.worldToCtxPos(this.realPos);
        ctx.translate(Math.round(pos.x), Math.round(pos.y));
        ctx.globalAlpha = this.opacity;
        if (this.dir !== 0) ctx.rotate(this.dir * (Math.PI / 180));
        const textureWidth = this.engine.worldToCtxLen(texture.width * this.scale);
        const textureHeight = this.engine.worldToCtxLen(texture.height * this.scale);
        ctx.drawImage(
            texture,
            Math.round(-textureWidth/2),
            Math.round(-textureHeight/2),
            textureWidth, textureHeight,
        );

        ctx.restore();
    }
}

type SplatOptions = {
    parent: Entity,

    type: string,
    color: util.ColorLike | number,
    scale?: number,
    opacity?: number,

    time?: number,

    pos?: util.VectorLike,
    vel?: util.VectorLike,
};
class Splat extends Particle {
    private readonly maxTime;

    constructor(options: SplatOptions) {
        super({
            parent: options.parent,

            type: "splat-"+options.type,
            color: options.color,
            scale: options.scale,
            opacity: options.opacity,

            time: options.time,

            pos: options.pos,
            vel: options.vel,
            dir: 360 * Math.random(),
        });

        this.maxTime = this.time;
    }

    private get opacityScale() {
        if (typeof(this.maxTime) !== "number") return 1;
        return util.lerp(0, 1, this.time / this.maxTime);
    }
    public get opacity() { return super.opacity * this.opacityScale; }
    public set opacity(value) { super.opacity = value / this.opacityScale; }
};


type PlayerOptions = {
    parent: Entity,

    pos?: util.VectorLike,
    vel?: util.VectorLike,
    dir?: number,
};
class Player extends ModifiedEntity {
    constructor(options: PlayerOptions) {
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

    protected internalUpdate(delta: number) {
        super.internalUpdate(delta);
    }
    protected internalRender() {
        super.internalRender();

        const ctx = this.engine.ctx;

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(...this.engine.worldToCtxPos(this.realPos).xy, this.engine.worldToCtxLen(this.radius), 0, 2*Math.PI);
        ctx.fill();
    }
}

class Command extends util.Target {
    private static getObjectAndKey(commandObject: Command, attr: string): { object: util.StringMap<any>, key: string } | null {
        const enemy = commandObject.enemy;
        let object: util.StringMap<any> = enemy;
        if (attr.startsWith("Math")) {
            attr = attr.slice(5);
            object = Math;
        } else if (attr.startsWith("util")) {
            attr = attr.slice(5);
            object = util;
        } else if (attr.startsWith("arg:")) {
            return {
                object: commandObject.argValues,
                key: attr.slice(4),
            };
        } else if (attr.startsWith("func:")) {
            const func = enemy.getFunction(attr.slice(5));
            if (!func) return null;
            const funcCall = func.executeWithArgs.bind(func);
            return {
                object: { "": funcCall },
                key: "",
            };
        } else if (attr.startsWith("~")) {
            const id = attr.slice("~".length).split(".")[0];
            attr = attr.slice("~".length + id.length + 1);
            const component = enemy.getComponent(id);
            if (!component) return null;
            object = component;
        }
        if (attr.length <= 0) return null;
        const parts = attr.split(".");
        if (parts.length <= 0) return null;
        while (parts.length > 1) {
            const part = parts.shift() as string;
            if (!(part in object)) return null;
            object = util.castObject(object[part]);
        }
        const key = parts.at(-1) as string;
        return { object, key };
    }
    private static compileCommand(commandObject: Command, command: loader.Command): () => any {
        if (command.action === "get") {
            // const objectAndKey = this.getObjectAndKey(commandObject, command.attr ?? "");
            // if (!objectAndKey) return () => null;
            // const { object, key } = objectAndKey;
            return () => {
                const objectAndKey = this.getObjectAndKey(commandObject, command.attr ?? "");
                if (!objectAndKey) return null;
                const { object, key } = objectAndKey;
                let value = object[key];
                if (typeof(value) === "function") value = value.bind(object);
                return value;
            };
        }
        if (command.action === "set") {
            if (!command.value) return () => null;
            const value = this.compileCommand(commandObject, command.value);
            // const objectAndKey = this.getObjectAndKey(commandObject, command.prop ?? "");
            // if (!objectAndKey) return () => null;
            // const { object, key } = objectAndKey;
            return () => {
                const objectAndKey = this.getObjectAndKey(commandObject, command.prop ?? "");
                if (!objectAndKey) return null;
                const { object, key } = objectAndKey;
                object[key] = value();
            };
        }
        if (command.action === "call") {
            if (!command.args) return () => null;
            const args = this.compileCommands(commandObject, command.args);
            // const objectAndKey = this.getObjectAndKey(commandObject, command.func ?? "");
            // if (!objectAndKey) return () => null;
            // const { object, key } = objectAndKey;
            return () => {
                const objectAndKey = this.getObjectAndKey(commandObject, command.func ?? "");
                if (!objectAndKey) return null;
                const { object, key } = objectAndKey;
                let value = object[key];
                if (typeof(value) !== "function") return null;
                return value.bind(object)(...args.map(arg => arg()));
            };
        }
        if (command.action === "op") {
            if (!command.op) return () => null;
            if (!command.left) return () => null;
            const left = this.compileCommand(commandObject, command.left);
            const right = command.right ? this.compileCommand(commandObject, command.right) : () => null;
            if (command.op === "+") return () => (left() + right());
            if (command.op === "-") return () => (left() - right());
            if (command.op === "*") return () => (left() * right());
            if (command.op === "/") return () => (left() / right());
            if (command.op === "**") return () => (left() ** right());
            if (command.op === "%") return () => (left() % right());
            if (command.op === "%%") return () => {
                let r = right();
                return ((left() % r) + r) % r;
            };
            if (command.op === "and") return () => (left() && right());
            if (command.op === "or") return () => (left() || right());
            if (command.op === "!") return () => (!left());
            if (command.op === "==") return () => (left() == right());
            if (command.op === "===") return () => (left() === right());
            if (command.op === "gt") return () => (left() > right());
            if (command.op === "gteq") return () => (left() >= right());
            if (command.op === "lt") return () => (left() < right());
            if (command.op === "lteq") return () => (left() <= right());
            if (command.op === "mx") return () => Math.max(left(), right());
            if (command.op === "mn") return () => Math.min(left(), right());
            if (command.op === "lerp") return () => util.lerp(...util.castVec2(left()), right());
            if (command.op === "map-rg") return () => {
                let value = left();
                const ranges = util.castArray(right());
                if (ranges.length !== 2) return null;
                const range1 = util.castVec2(ranges[0]);
                const range2 = util.castVec2(ranges[1]);
                if (range1[0] === range1[1]) value = 0;
                else value = (value - range1[0]) / (range1[1] - range1[0]);
                return util.lerp(...range2, value);
            };
            if (["rg", "rg-li", "rg-ri", "rg-i"].includes(command.op)) {
                const type = command.op.slice(3);
                if (type === "") return () => {
                    const range = util.castVec2(right());
                    const value = left();
                    return value > range[0] && value < range[1];
                };
                if (type === "li") return () => {
                    const range = util.castVec2(right());
                    const value = left();
                    return value >= range[0] && value < range[1];
                };
                if (type === "ri") return () => {
                    const range = util.castVec2(right());
                    const value = left();
                    return value > range[0] && value <= range[1];
                };
                if (type === "i") return () => {
                    const range = util.castVec2(right());
                    const value = left();
                    return value >= range[0] && value <= range[1];
                };
                return () => null;
            }
            return () => null;
        }
        if (command.action === "if") {
            if (!command.cond) return () => null;
            const cond = this.compileCommand(commandObject, command.cond);
            if (!command.true_ && !command.false_) return () => null;
            const true_ = this.compileCommands(commandObject, command.true_ ?? []);
            const false_ = this.compileCommands(commandObject, command.false_ ?? []);
            return () => {
                return (cond() ? true_ : false_).map(cmd => cmd());
            };
        }
        if (command.action === "for") {
            if (!command.of && !command.stop) return () => null;
            if (!command.body) return () => null;
            const start = command.start ? this.compileCommand(commandObject, command.start) : (() => 0);
            const stop = command.stop ? this.compileCommand(commandObject, command.stop) : (() => 0);
            const step = command.step ? this.compileCommand(commandObject, command.step) : (() => 1);
            const body = new Command(commandObject, command.body ?? []);
            if (command.of) {
                body.args = ["i", "value"];
                const of = this.compileCommand(commandObject, command.of);
                return () => {
                    const results: any[] = [];
                    util.castArray(of()).forEach((value, i) => results.push(body.executeWithArgs(i, value)));
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
    private static compileCommands(commandObject: Command, commands: loader.Commands): (() => any)[] {
        return commands.map(command => this.compileCommand(commandObject, command));
    }

    public readonly enemy: Enemy;
    private readonly _args: string[];
    private readonly argValues: util.StringMap<any>;

    private readonly compiled: (() => any)[];

    constructor(enemyOrCommand: Enemy | Command, commands: loader.Commands) {
        super();

        this.enemy = (enemyOrCommand instanceof Enemy) ? enemyOrCommand : enemyOrCommand.enemy;
        this._args = [];
        this.argValues = {};

        this.compiled = Command.compileCommands(this, commands);
    }

    private clearArgValues() {
        Object.keys(this.argValues).forEach(arg => {
            delete this.argValues[arg];
        });
    }

    public get args() { return [...this._args]; }
    public set args(value) {
        this._args.splice(0);
        this._args.push(...value);
        this.clearArgValues();
    }

    public execute() {
        return this.compiled.map(cmd => cmd());
    }
    public executeWithArgs(...args: any[]) {
        this.clearArgValues();
        for (let i = 0; i < this._args.length; i++)
            this.argValues[this._args[i]] = (i < args.length) ? args[i] : null;
        return this.execute();
    }
}

class EnemyComponent extends util.Target {
    public readonly enemy;

    public texture;
    public readonly offset;
    public readonly scale;
    public type: "original" | "outlined" | "white" | "white + outlined";
    private _opacity;
    private _dir;
    public isBody;

    constructor(enemy: Enemy, data: loader.EnemyComponentData) {
        super();

        this.enemy = enemy;

        this._opacity = 1;
        this._dir = 0;

        this.texture = data.texture;
        this.offset = new util.Vec2(data.offset);
        this.scale = new util.Vec2(data.scale);
        this.type = data.type;
        this.opacity = data.opacity;
        this.dir = data.dir;
        this.isBody = data.isBody;
    }

    public get opacity() { return this._opacity; }
    public set opacity(value) { this._opacity = Math.min(1, Math.max(0, value)); }

    public get dir() { return this._dir; }
    public set dir(value) { this._dir = util.clampAngleDegrees(value); }
}
class EnemyAnimation extends util.Target {
    public readonly enemy;

    public readonly keyframes: EnemyAnimationKeyframe[];
    public readonly loop;

    private timer;
    private index;

    constructor(enemy: Enemy, data: loader.EnemyAnimationData) {
        super();

        this.enemy = enemy;

        this.keyframes = data.keyframes.map(keyframe => new EnemyAnimationKeyframe(this, keyframe));
        this.loop = data.loop;

        this.timer = 0;
        this.index = 0;

        this.start();
    }

    public start() {
        this.timer = 0;
        this.index = 0;
    }

    private continualKeyframe() {
        if (this.index < 0 || this.index >= this.keyframes.length) return;
        this.keyframes[this.index].continual.execute();
    }
    private startKeyframe() {
        if (this.index < 0 || this.index >= this.keyframes.length) return;
        this.keyframes[this.index].start.execute();
    }
    private stopKeyframe() {
        if (this.index < 0 || this.index >= this.keyframes.length) return;
        this.keyframes[this.index].stop.execute();
    }

    public update(delta: number) {
        if (this.index >= this.keyframes.length) {
            if (!this.loop) return;
            this.stopKeyframe();
            this.index = 0;
            this.startKeyframe();
        }
        this.continualKeyframe();
        if (this.keyframes.length <= 0) return;
        this.timer += delta;
        if (this.timer < this.keyframes[this.index].wait) return;
        this.timer -= this.keyframes[this.index].wait;
        this.stopKeyframe();
        this.index++;
        this.startKeyframe();
    }
}
class EnemyAnimationKeyframe extends util.Target {
    public readonly animation;
    public readonly enemy;

    public readonly continual;
    public readonly start;
    public readonly stop;
    public readonly wait;

    constructor(animation: EnemyAnimation, data: loader.EnemyAnimationKeyframeData) {
        super();

        this.animation = animation;
        this.enemy = this.animation.enemy;

        this.continual = new Command(this.enemy, data.continual);
        this.start = new Command(this.enemy, data.start);
        this.stop = new Command(this.enemy, data.stop);
        this.wait = data.wait * 1000;
    }
}
class EnemyState extends util.Target {
    public readonly enemy;

    public readonly continual;
    public readonly start;
    public readonly stop;

    constructor(enemy: Enemy, data: loader.EnemyStateData) {
        super();

        this.enemy = enemy;

        this.continual = new Command(this.enemy, data.continual);
        this.start = new Command(this.enemy, data.start);
        this.stop = new Command(this.enemy, data.stop);
    }

    public update(delta: number) {
        this.continual.execute();
    }
}

type EnemyOptions = {
    parent: Entity,

    pos?: util.VectorLike,
    vel?: util.VectorLike,
    dir?: number,

    type: string,
};
class Enemy extends ModifiedEntity {
    public readonly type;

    private readonly env: {
        delta: number,
    };

    private readonly components: util.StringMap<EnemyComponent>;
    private readonly functions: util.StringMap<Command>;
    private readonly animations: util.StringMap<EnemyAnimation>;
    private readonly states: util.StringMap<EnemyState>;
    private _animation;
    private _state;
    private _nextState;

    private latestDamage;

    constructor(options: EnemyOptions) {
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
        this._animation = "";
        this._state = "";
        this._nextState = "";

        this.latestDamage = 0;

        const enemyData = (this.engine as Game).enemyDatas[this.type];
        if (!enemyData) return;

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

        this.addHandler("rem", () => {
            if (enemyData.colors.length <= 0) return;
            let size = Math.round(enemyData.size * util.lerp(1, 1.25, Math.random()));
            if (this.engine.cameraEntity)
                this.engine.cameraEntity.addShakeFrom(this.pos, size * 0.1);
            while (size > 0) {
                const color = util.choose(enemyData.colors);
                const time = util.lerp(5, 7.5, Math.random());
                if (size >= 10) {
                    this.engine.rootEntity.addEntity(this.createSplat(
                        "large-1",
                        color, 2, 0.25, time,
                        this.pos,
                    ));
                    size -= 8;
                    continue;
                }
                if (size >= 8) {
                    this.engine.rootEntity.addEntity(this.createSplat(
                        "large-1",
                        color, 1, 0.25, time,
                        this.pos.add(util.Vec2.dir(360*Math.random(), 2)),
                    ));
                    size -= 6;
                    continue;
                }
                if (size >= 4) {
                    this.engine.rootEntity.addEntity(this.createSplat(
                        "mid-"+Math.ceil(3*Math.random()),
                        color, 1, 0.25, time,
                        this.pos.add(util.Vec2.dir(360*Math.random(), 4)),
                    ));
                    size -= 3;
                    continue;
                }
                this.engine.rootEntity.addEntity(this.createSplat(
                    "small-"+Math.ceil(3*Math.random()),
                    color, 1, 0.25, time,
                    this.pos.add(util.Vec2.dir(360*Math.random(), 2)),
                ));
                size -= 1;
                continue;
            }
        });
    }

    public get health() { return super.health; }
    public set health(value) {
        if (value < super.health) this.latestDamage = util.getTime();
        super.health = value;
    }

    public get damageFlash() { return util.getTime() - this.latestDamage < 50; }

    public get animation() { return this._animation; }
    public set animation(value) {
        if (this.animation === value) return;
        this._animation = value;
        if (this.animations[this.animation])
            this.animations[this.animation].start();
    }

    public get state() { return this._state; }
    public set state(value) { this._nextState = value; }
    private checkState() {
        if (this._state === this._nextState) return;
        if (this.states[this.state])
            this.states[this.state].stop.execute();
        this._state = this._nextState;
        if (this.states[this.state])
            this.states[this.state].start.execute();
    }

    public getComponent(id: string): EnemyComponent | null {
        if (!(id in this.components)) return null;
        return this.components[id];
    }
    public getFunction(name: string): Command | null {
        if (!(name in this.functions)) return null;
        return this.functions[name];
    }

    protected internalUpdate(delta: number) {
        super.internalUpdate(delta);

        this.env.delta = delta / 1000;

        this.checkState();

        if (this.animations[this.animation])
            this.animations[this.animation].update(delta);
        if (this.states[this.state])
            this.states[this.state].update(delta);
    }
    protected internalRender() {
        super.internalRender();

        const ctx = this.engine.ctx;

        ctx.save();

        const pos = this.engine.worldToCtxPos(this.realPos);
        ctx.translate(Math.round(pos.x), Math.round(pos.y));

        for (let id in this.components) {
            const component = this.components[id];
            if (component.opacity <= 0) continue;
            const textureSource = (this.engine as Game).getEnemyTextureSource(this.type, component.texture);
            if (!textureSource) continue;
            const texture =
                (component.isBody && this.damageFlash) ? textureSource.whiteAndOutline :
                (component.type === "original") ? textureSource.original :
                (component.type === "outlined") ? textureSource.originalAndOutline :
                (component.type === "white") ? textureSource.white :
                textureSource.whiteAndOutline;
            
            ctx.save();

            ctx.translate(
                Math.round(this.engine.worldToCtxLen(component.offset.x)),
                Math.round(this.engine.worldToCtxLen(component.offset.y)),
            );
            if (component.dir !== 0) ctx.rotate(component.dir * (Math.PI / 180));
            ctx.globalAlpha = component.opacity;
            const textureWidth = this.engine.worldToCtxLen(texture.width * component.scale.x);
            const textureHeight = this.engine.worldToCtxLen(texture.height * component.scale.y);
            ctx.drawImage(
                texture,
                Math.round(-textureWidth/2),
                Math.round(-textureHeight/2),
                textureWidth, textureHeight,
            );

            ctx.restore();
        }

        ctx.restore();
    }

    public copy(args: any[]) {
        return [...args];
    }
    public concat(...args: any[]) {
        return args;
    }
    public push(array: any[], value: any) {
        array.push(value);
        return array;
    }
    public pop(array: any[]) {
        return array.pop();
    }
    public get(array: any[], i: number) {
        return array[i];
    }

    public getLookingOffset() {
        let x = 0, y = 0;
        if (Math.abs(util.angleRelDegrees(this.dir, 0)) < 45+22.5) x++;
        if (Math.abs(util.angleRelDegrees(this.dir, 180)) < 45+22.5) x--;
        if (Math.abs(util.angleRelDegrees(this.dir, 90)) < 45+22.5) y--;
        if (Math.abs(util.angleRelDegrees(this.dir, 270)) < 45+22.5) y++;
        return new util.Vec2([x, y]);
    }
    public createSplat(type?: string, color?: number, scale?: number, opacity?: number, time?: number, pos?: util.VectorLike, vel?: util.VectorLike) {
        return new Splat({
            parent: this.engine.rootEntity,

            type: type ?? "",
            color: color ?? [0, 0, 0, 255],

            scale: (scale ?? 1) * util.lerp(0.9, 1.1, Math.random()),
            opacity: opacity,

            time: (time ?? 0) * 1000,

            pos: pos,
            vel: vel,
        });
    }
    public createEnemy(type?: string, pos?: util.VectorLike, vel?: util.VectorLike, dir?: number) {
        return new Enemy({
            parent: this.engine.rootEntity,

            pos: pos,
            vel: vel,
            dir: dir,

            type: type ?? "",
        });
    }
}


export default class Game extends Engine {
    private _themeData: loader.ThemeData | null;
    private _enemyList: loader.EnemyList | null;
    private _enemyDatas: util.StringMap<loader.EnemyData> | null;
    private _particlesData: loader.ParticlesData | null;
    private _particleDatas: util.StringMap<loader.ParticleData> | null;
    private _textureMap: HTMLImageElement | null;

    private readonly themeColors: util.Color[];
    private readonly enemyTextures: util.StringMap<util.StringMap<loader.TextureSource>>;
    private readonly particleTextures: util.StringMap<loader.ColorMappedTextureSource>;

    private playerEntity: Player | null;

    constructor(options: EngineOptions) {
        super(options);

        this._themeData = null;
        this._enemyList = null;
        this._enemyDatas = null;
        this._particlesData = null;
        this._particleDatas = null;
        this._textureMap = null;
        
        this.themeColors = [];
        this.enemyTextures = {};
        this.particleTextures = {};

        this.playerEntity = null;
    }

    public init() {
        this.ctx.imageSmoothingEnabled = false;

        this.backgroundColor.set(this.getThemeColor(1) as util.Color);

        this.setCollisionRule("player", "player", Engine.COLLISIONPUSH);
        this.setCollisionRule("enemy", "enemy", Engine.COLLISIONPUSH);

        this.setCollisionRule("player", "enemy", Engine.COLLISIONPUSH | Engine.COLLISIONDAMAGE);
        this.setCollisionRule("enemy", "player", Engine.COLLISIONPUSH | Engine.COLLISIONDAMAGE);

        this.rootEntity.addEntity(new Background({ parent: this.rootEntity }));

        this.cameraEntity = this.rootEntity.addEntity(new Camera({
            parent: this.rootEntity,
        }));

        this.playerEntity = this.rootEntity.addEntity(new Player({
            parent: this.rootEntity,
        }));

        this.enemyList.forEach(type => {
            if (this.enemyDatas[type].part) return;
            const types = this.enemyDatas[type].type;
            let n = 3;
            if (types.includes("explosive")) n = 5;
            if (types.includes("swarm")) n = 10;
            if (types.includes("max") || types.includes("boss")) n = 1;
            n *= 10;
            for (let i = 0; i < n; i++)
                this.rootEntity.addEntity(new Enemy({
                    parent: this.rootEntity,
                    pos: [
                        util.lerp(-0.5, 0.5, Math.random()) * 200,
                        util.lerp(-0.5, 0.5, Math.random()) * 200,
                    ],
                    type: type,
                }));
        });
    }

    public async load() {
        this._themeData = await loader.loadThemeData();
        this._enemyList = await loader.loadEnemyList();
        this._enemyDatas = {};
        await Promise.all(this.enemyList.map(async type => {
            this.enemyDatas[type] = await loader.loadEnemyData(type);
        }));
        this._particlesData = await loader.loadParticleList();
        this._particleDatas = {};
        await Promise.all(this.particlesData.list.map(async type => {
            this.particleDatas[type] = await loader.loadParticleData(type, this.particlesData);
        }));
        this._textureMap = await loader.loadFile();

        const themeSource = loader.createTextureSource(this.textureMap, this.themeData.texture, 0);
        const themeImageData = (themeSource.original.getContext("2d") as CanvasRenderingContext2D).getImageData(0, 0, this.themeData.texture.location.w, this.themeData.texture.location.h);
        for (let x = 0; x < this.themeData.texture.location.w; x++) {
            for (let y = 0; y < this.themeData.texture.location.h; y++) {
                let i = (x + y*this.themeData.texture.location.w)*4;
                this.themeColors.push(new util.Color([
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
                this.enemyTextures[type][name] = loader.createTextureSource(this.textureMap, this.enemyDatas[type].textures[name]);
        });

        this.particlesData.list.forEach(type => {
            this.particleTextures[type] = loader.createColorMappedTextureSource(this.textureMap, this.particleDatas[type].texture);
        });

        this.init();
    }

    public get themeData() {
        if (!this._themeData) throw "Theme data not fully loaded yet";
        return this._themeData;
    }
    public get enemyList() {
        if (!this._enemyList) throw "Enemy list map not fully loaded yet";
        return this._enemyList;
    }
    public get enemyDatas() {
        if (!this._enemyDatas) throw "Enemy datas not fully loaded yet";
        return this._enemyDatas;
    }
    public get particlesData() {
        if (!this._particlesData) throw "Particles data not fully loaded yet";
        return this._particlesData;
    }
    public get particleDatas() {
        if (!this._particleDatas) throw "Particle datas not fully loaded yet";
        return this._particleDatas;
    }
    public get textureMap() {
        if (!this._textureMap) throw "Texture map not fully loaded yet";
        return this._textureMap;
    }

    public get nThemeColors() { return this.themeColors.length; }
    public getThemeColor(i: number): util.Color | null {
        if (i % 1 !== 0) return null;
        if (i < 0 || i >= this.themeColors.length) return null;
        return this.themeColors[i];
    }
    public getEnemyTextureSource(type: string, textureName: string): loader.TextureSource | null {
        if (!this.enemyTextures[type]) return null;
        if (!this.enemyTextures[type][textureName]) return null;
        return this.enemyTextures[type][textureName];
    }
    public getParticleTextureSource(type: string): loader.ColorMappedTextureSource | null {
        if (!this.particleTextures[type]) return null;
        return this.particleTextures[type];
    }

    protected internalUpdate(delta: number) {
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
        }

        if (this.cameraEntity && this.playerEntity)
            this.cameraEntity.target = this.playerEntity.pos;
    }
}
