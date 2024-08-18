import * as util from "./util";


export type EntityOptions = {
    parent: Entity | Engine,

    pos?: util.VectorLike,
    vel?: util.VectorLike,
    dir?: number,

    maxHealth?: number,
    health?: number,

    radius?: number,
    group?: string,

    z?: number,
};
export class Entity extends util.Target {
    private readonly id;

    public readonly parent;
    private _addedToParent;
    public readonly engine;
    public readonly hasEngineParent;

    private reqComputeReals;

    public readonly pos;
    public readonly vel;
    private _dir;
    public readonly realPos;
    public readonly realVel;
    private _realDir;
    public readonly chunkPos;
    private readonly collidings;

    private _maxHealth;
    private _health;

    private _radius;
    private _density;
    public knockScale;
    public knockIgnoreMass;
    public damage;
    public invincible;
    public group;

    private _z;
    private readonly _entities: Entity[];

    public constructor(options: EntityOptions) {
        super();

        this.id = util.jargonBase64(1 << 8);

        this.parent = options.parent;
        this.hasEngineParent = this.parent instanceof Engine;
        this._addedToParent = this.hasEngineParent;
        this.engine = (this.hasEngineParent ? this.parent : (this.parent as Entity).engine) as Engine;

        this.reqComputeReals = false;
        this.addHandler("compute-reals", () => {
            this.reqComputeReals = true;
            this.post("change-chunks");
        });

        this.pos = new util.Vec2();
        this.pos.addHandler("change", (attribute, from, to) => this.post("compute-reals"));
        this.vel = new util.Vec2();
        this.vel.addHandler("change", (attribute, from, to) => this.post("compute-reals"));
        this._dir = 0;

        this.realPos = new util.Vec2();
        this.realVel = new util.Vec2();
        this._realDir = 0;

        this.chunkPos = new util.Vec2();
        this.collidings = new Set<string>();

        this._maxHealth = 0;
        this._health = 0;

        this._radius = 0;
        this._density = 1;
        this.knockScale = 1;
        this.knockIgnoreMass = false;
        this.damage = 1;
        this.invincible = false;
        this.group = "";

        this._z = 0;
        this._entities = [];

        this.pos.set(options.pos);
        this.vel.set(options.vel);
        this.dir = options.dir ?? 0;

        this.maxHealth = options.maxHealth ?? 0;
        this.health = options.health ?? this.maxHealth;

        this.radius = options.radius ?? 0;
        this.group = options.group ?? "";

        this.z = options.z ?? 0;

        this.addHandler("add", () => {
            this._addedToParent = true;
            this.computeReals();
        });
        this.addHandler("rem", () => {
            this._addedToParent = false;
            this.engine.remFromChunks(this);
        });
    }

    public get addedToParent() { return this._addedToParent; }
    public get addedToEngine(): boolean {
        if (this.hasEngineParent) return true;
        return this.addedToParent && (this.parent as Entity).addedToEngine;
    }
    
    public get dir() { return this._dir; }
    public set dir(value) {
        value = util.clampAngleDegrees(value);
        if (this.dir === value) return;
        this._dir = value;
        this.post("compute-reals");
    }

    public get realDir() { return this._realDir; }

    private computeReals() {
        this.realPos.set(this.getRealPos());
        this.realVel.set(this.getRealVel());
        this._realDir = this.getRealDir();

        this.engine.remFromChunks(this);
        this.chunkPos.set(this.realPos.div(this.engine.collisionChunkSize).iround());
        this.engine.addToChunks(this);

        this._entities.forEach(entity => entity.computeReals());
    }
    private getRealPos(): util.Vec2 {
        if (this.hasEngineParent) return this.pos.clone();
        return (this.parent as Entity).realPos.add(this.pos);
    }
    private getRealVel(): util.Vec2 {
        if (this.hasEngineParent) return this.vel.clone();
        return (this.parent as Entity).realVel.add(this.vel);
    }
    private getRealDir(): number {
        if (this.hasEngineParent) return this.dir;
        return util.clampAngleDegrees((this.parent as Entity).realDir + this.dir);
    }

    public get maxHealth() { return this._maxHealth; }
    public set maxHealth(value) {
        this._maxHealth = Math.max(0, value);
        this.health = this.health;
    }
    public get health() { return this._health; }
    public set health(value) { this._health = Math.min(this.maxHealth, Math.max(0, value)); }

    public get radius() { return this._radius; }
    public set radius(value) {
        value = Math.max(0, value);
        if (this.radius === value) return;
        if (this.addedToParent) this.engine.remFromChunks(this);
        this._radius = value;
        if (this.addedToParent) this.engine.addToChunks(this);
    }
    public get chunkRadius() { return Math.ceil(this.radius / this.engine.collisionChunkSize); }

    public get density() { return this._density; }
    public set density(value) { this._density = Math.max(0, value); }

    public get mass() { return this.density * (4/3) * Math.PI * (this.radius ** 3); }

    public get z() { return this._z; }
    public set z(value) {
        if (this.z === value) return;
        this._z = value;
        this.post("z-change");
    }

    public get entities() { return [...this._entities]; }
    public set entities(entities) {
        this.clearEntities();
        entities.forEach(entity => this.addEntity(entity));
    }
    public clearEntities() {
        const entities = this.entities;
        entities.forEach(entity => this.remEntity(entity));
        return entities;
    }
    public hasEntity(entity: Entity) { return this._entities.includes(entity); }
    public addEntity<T extends Entity>(entity: T): T | null {
        if (entity.parent !== this) return null;
        if (this.hasEntity(entity)) return entity;
        this._entities.push(entity);
        entity.addLinkedHandler(this, "z-change", () => this.sortEntities());
        this.sortEntities();
        entity.onAdd();
        return entity;
    }
    public remEntity<T extends Entity>(entity: T): T | null {
        if (!this.hasEntity(entity)) return null;
        this._entities.splice(this._entities.indexOf(entity), 1);
        entity.clearLinkedHandlers(this, "z-change");
        entity.onRem();
        return entity;
    }
    private sortEntities() {
        this._entities.sort((a, b) => a.z-b.z);
    }

    public move(value: util.VectorLike) {
        this.pos.iadd(value);
        return this;
    }
    public moveDir(dir: number, mag: number) { return this.move(util.Vec2.dir(dir, mag)); }
    public moveInDir(mag: number) { return this.moveDir(this.dir, mag); }

    public knock(value: util.VectorLike) {
        this.vel.iadd(value);
        return this;
    }
    public knockDir(dir: number, mag: number) { return this.knock(util.Vec2.dir(dir, mag)); }
    public knockInDir(mag: number) { return this.knockDir(this.dir, mag); }

    public lookAt(pos: util.Vec2) {
        this.dir = this.realPos.towards(pos);
        return this;
    }

    public gaze(value: number) {
        this.dir += value;
        return this;
    }
    public gazeAt(pos: util.Vec2, scale: number = 1, max: number = -1) {
        scale = Math.min(1, Math.max(0, scale));
        max = (max === -1) ? -1 : Math.max(max, 0);

        let angleRel = util.angleRelDegrees(this.dir, this.realPos.towards(pos));
        angleRel *= scale;
        if (max >= 0) angleRel = Math.min(max, Math.max(-max, angleRel));
        return this.gaze(angleRel);
    }

    private handleCollision(other: Entity, dist: number, rule: number) {
        if (rule & Engine.COLLISIONPUSH) {
            this.knockDir(other.realPos.towards(this.realPos), -dist*other.knockScale*(this.knockIgnoreMass ? 1 : (other.mass/this.mass))*0.01);
        }
        if (rule & Engine.COLLISIONDAMAGE) {
            if (!this.invincible) this.health -= other.damage;
            this.knockDir(other.realPos.towards(this.realPos), -dist*other.knockScale*(this.knockIgnoreMass ? 1 : (other.mass/this.mass))*0.05);
        }
    }

    public preUpdate() {
        if (!this.hasEngineParent) {
            if (this.health <= 0) {
                (this.parent as Entity).remEntity(this);
                return;
            }
        }
        if (this.reqComputeReals) {
            this.reqComputeReals = false;
            this.computeReals();
        }
        this.collidings.clear();
        this._entities.forEach(entity => entity.preUpdate());
    }
    public update(delta: number) {
        if (this.radius) {
            this.engine.getChunkEntities(this).forEach(entity => {
                if (entity === this) return;

                if (!entity.radius) return;

                const rule1 = this.engine.getCollisionRule(this.group, entity.group);
                const rule2 = this.engine.getCollisionRule(this.group, entity.group);
                if (!rule1 && !rule2) return;

                if (this.collidings.has(entity.id)) return;
                this.collidings.add(entity.id);
                entity.collidings.add(this.id);

                const distSquared = this.realPos.distSquared(entity.realPos);
                if (distSquared > (this.radius + entity.radius) ** 2) return;

                const dist = Math.sqrt(distSquared) - (this.radius + entity.radius);
                if (rule1) this.handleCollision(entity, dist, rule1);
                if (rule2) entity.handleCollision(this, dist, rule2);
            });
        }
        if (Math.abs(this.vel.x) < util.EPSILON) this.vel.x = 0;
        if (Math.abs(this.vel.y) < util.EPSILON) this.vel.y = 0;
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.vel.x *= 0.95;
        this.vel.y *= 0.95;
        this.internalUpdate(delta);
        this._entities.forEach(entity => entity.update(delta));
    }
    protected internalUpdate(delta: number) {}
    public render() {
        this._entities.forEach((entity, i) => {
            if (entity.z >= 0) {
                if (i <= 0 || this._entities[i-1].z < 0)
                    this.internalRender();
            }
            entity.render();
            if (entity.z < 0) {
                if (i >= this._entities.length-1)
                    this.internalRender();
            }
        });
        if (this._entities.length <= 0) this.internalRender();
    }
    protected internalRender() {}
}

export class CameraShake extends util.Target {
    public readonly pos;

    private time;

    private _dir;
    private _mag;

    constructor(pos: util.VectorLike, mag: number) {
        super();

        this.pos = new util.Vec2(pos);

        this.time = 0;

        this._dir = 0;
        this._mag = Math.max(0, mag);

        this.randomDir();
    }

    public get dir() { return this._dir; }
    public get mag() { return this._mag; }

    private randomDir() {
        this._dir = 360 * Math.random();
    }

    public update(delta: number) {
        this.time += delta;
        while (this.time > 25) {
            this.time -= 25;
            this.randomDir();
            this._mag *= 0.9;
        }
    }
}

export type CameraOptions = {
    parent: Entity,

    pos?: util.VectorLike,
    fov?: number,

    target?: Entity | util.Vec2 | null,

    config?: {
        scrollP?: number,
    },
};
export class Camera extends Entity {
    public target: Entity | util.Vec2 | null;

    private _targetFov;
    private _fov;

    private _configScrollP;

    private shakes;
    private shakeX;
    private shakeY;

    constructor(options: CameraOptions) {
        super({
            parent: options.parent,
            pos: options.pos,
            maxHealth: 1,
            group: ".CAMERA",
        });

        this._targetFov = 1;
        this._fov = 1;

        this._configScrollP = 0;

        this.target = options.target ?? null;

        this.targetFov = options.fov ?? 1;
        this.fov = this.targetFov;

        this.configScrollP = options.config?.scrollP ?? 0.1;

        this.shakes = new Set<CameraShake>();
        this.shakeX = this.shakeY = 0;
    }

    public get targetFov() { return this._targetFov; }
    public set targetFov(value) { this._targetFov = Math.max(0, value); }
    public get fov() { return this._fov; }
    public set fov(value) { this._fov = Math.max(0, value); }
    
    public get configScrollP() { return this._configScrollP; }
    public set configScrollP(value) { this._configScrollP = Math.min(1, Math.max(0, value)); }

    public addShake(shake: CameraShake): CameraShake {
        if (this.shakes.has(shake)) return shake;
        this.shakes.add(shake);
        return shake;
    }
    public addShakeFrom(pos: util.VectorLike, mag: number) {
        return this.addShake(new CameraShake(pos, mag));
    }

    public getPos() { return this.realPos.add([this.shakeX, this.shakeY]).round(); }
    public getFov() { return this.fov; }

    protected internalUpdate(delta: number) {
        super.internalUpdate(delta);

        if (this.target) {
            const pos = (this.target instanceof util.Vec2) ? this.target : this.target.pos;
            this.pos.iadd(pos.sub(this.pos).imul(this.configScrollP));
        }

        const fov = this.targetFov;
        this.fov += (fov - this.fov) * this.configScrollP;

        this.shakeX = this.shakeY = 0;
        [...this.shakes].forEach(shake => {
            shake.update(delta);
            if (shake.mag < 0.1) {
                this.shakes.delete(shake);
                return;
            }
            const dist = shake.pos.dist(this.realPos);
            if (dist > 200) return;
            let p = 1;
            if (dist > 100)
                p = util.lerp(1, 0, (dist - 100) / (200 - 100));
            this.shakeX += p * shake.mag * Math.cos(shake.dir * (Math.PI / 180));
            this.shakeY += p * shake.mag * Math.sin(shake.dir * (Math.PI / 180));
        });
    }
}

export type EngineOptions = {
    ctx: CanvasRenderingContext2D,
    bindTarget?: HTMLElement,
};
export default class Engine extends util.Target {
    public static readonly COLLISIONPUSH = 1 << 0;
    public static readonly COLLISIONDAMAGE = 1 << 1;

    private _ctx;
    private _bindTarget: HTMLElement | null;
    private readonly _keysDown;
    private readonly _keysDownNow;
    private readonly _keysUpNow;
    private readonly onKeyDown;
    private readonly onKeyUp;
    private readonly _buttonsDown;
    private readonly _buttonsDownNow;
    private readonly _buttonsUpNow;
    private readonly onMouseDown;
    private readonly onMouseUp;

    private readonly collisionMatrix: Map<string, Map<string, number>>;
    private readonly collisionChunks: Map<number, Map<number, Set<Entity>>>;
    public readonly collisionChunkSize;

    public readonly rootEntity;
    public cameraEntity: Camera | null;

    public readonly backgroundColor;

    public constructor(options: EngineOptions) {
        super();

        this._keysDown = new Set<string>();
        this._keysDownNow = new Set<string>();
        this._keysUpNow = new Set<string>();
        this.onKeyDown = (e: KeyboardEvent) => {
            this._keysDown.add(e.code);
            this._keysDownNow.add(e.code);
            this.post("keydown", e);
        };
        this.onKeyUp = (e: KeyboardEvent) => {
            this._keysDown.delete(e.code);
            this._keysUpNow.add(e.code);
            this.post("keyup", e);
        };
        this._buttonsDown = new Set<number>();
        this._buttonsDownNow = new Set<number>();
        this._buttonsUpNow = new Set<number>();
        this.onMouseDown = (e: MouseEvent) => {
            this._buttonsDown.add(e.button);
            this._buttonsDownNow.add(e.button);
            this.post("mousedown", e);
        };
        this.onMouseUp = (e: MouseEvent) => {
            this._buttonsDown.delete(e.button);
            this._buttonsUpNow.add(e.button);
            this.post("mouseup", e);
        };

        this.collisionMatrix = new Map();
        this.collisionChunks = new Map();
        this.collisionChunkSize = 100;

        this._ctx = options.ctx;
        this._bindTarget = null;
        if (options.bindTarget) this.bindTarget = options.bindTarget;

        this.rootEntity = new Entity({ parent: this, group: ".ROOT" });
        this.cameraEntity = null;

        this.backgroundColor = new util.Color([0, 0, 0, 0]);
    }

    public get ctx() { return this._ctx; }
    public set ctx(value) {
        if (this.ctx === value) return;
        this._ctx = value;
        this.bindTarget = this.ctx.canvas;
    }

    public get bindTarget() { return this._bindTarget; }
    public set bindTarget(value) {
        if (this.bindTarget === value) return;
        this.unbind();
        this._bindTarget = value;
        this.bind();
    }
    private bind() {
        if (!this.bindTarget) return;
        this.bindTarget.addEventListener("keydown", this.onKeyDown);
        this.bindTarget.addEventListener("keyup", this.onKeyUp);
        this.bindTarget.addEventListener("mousedown", this.onMouseDown);
        this.bindTarget.addEventListener("mouseup", this.onMouseUp);
    }
    private unbind() {
        if (!this.bindTarget) return;
        this.bindTarget.removeEventListener("keydown", this.onKeyDown);
        this.bindTarget.removeEventListener("keyup", this.onKeyUp);
        this.bindTarget.removeEventListener("mousedown", this.onMouseDown);
        this.bindTarget.removeEventListener("mouseup", this.onMouseUp);
    }
    public get keysDown() { return [...this._keysDown]; }
    public get keysDownNow() { return [...this._keysDownNow]; }
    public get keysUpNow() { return [...this._keysUpNow]; }
    public isKeyDown(key: string) { return this._keysDown.has(key); }
    public isKeyDownNow(key: string) { return this._keysDownNow.has(key); }
    public isKeyUpNow(key: string) { return this._keysUpNow.has(key); }

    public get buttonsDown() { return [...this._buttonsDown]; }
    public get buttonsDownNow() { return [...this._buttonsDownNow]; }
    public get buttonsUpNow() { return [...this._buttonsUpNow]; }
    public isButtonDown(button: number) { return this._buttonsDown.has(button); }
    public isButtonDownNow(button: number) { return this._buttonsDownNow.has(button); }
    public isButtonUpNow(button: number) { return this._buttonsUpNow.has(button); }

    public setCollisionRule(target: string, other: string, rule: number) {
        if (rule < 0) return;
        if (rule % 1 !== 0) return;
        if (!this.collisionMatrix.has(target))
            this.collisionMatrix.set(target, new Map());
        this.collisionMatrix.get(target)?.set(other, rule);
    }
    public getCollisionRule(target: string, other: string) {
        if (!this.collisionMatrix.has(target))
            return 0;
        return this.collisionMatrix.get(target)?.get(other) ?? 0;
    }
    public setMutualCollisionRule(group1: string, group2: string, rule: number) {
        this.setCollisionRule(group1, group2, rule);
        this.setCollisionRule(group2, group1, rule);
    }
    public addToChunks(entity: Entity) {
        const chunkPos = entity.chunkPos;
        for (let x = -entity.chunkRadius; x <= entity.chunkRadius; x++) {
            for (let y = -entity.chunkRadius; y <= entity.chunkRadius; y++) {
                let rx = x + chunkPos.x;
                let ry = y + chunkPos.y;

                if (!this.collisionChunks.has(rx))
                    this.collisionChunks.set(rx, new Map());

                if (!this.collisionChunks.get(rx)?.has(ry))
                    this.collisionChunks.get(rx)?.set(ry, new Set());

                this.collisionChunks.get(rx)?.get(ry)?.add(entity);
            }
        }
    }
    public remFromChunks(entity: Entity) {
        const chunkPos = entity.chunkPos;
        for (let x = -entity.chunkRadius; x <= entity.chunkRadius; x++) {
            for (let y = -entity.chunkRadius; y <= entity.chunkRadius; y++) {
                let rx = x + chunkPos.x;
                let ry = y + chunkPos.y;

                if (!this.collisionChunks.has(rx)) continue;
                if (!this.collisionChunks.get(rx)?.has(ry)) continue;

                this.collisionChunks.get(rx)?.get(ry)?.delete(entity);

                if (this.collisionChunks.get(rx)?.get(ry)?.size ?? 0 > 0) continue;
                this.collisionChunks.get(rx)?.delete(ry);

                if (this.collisionChunks.get(rx)?.size ?? 0 > 0) continue;
                this.collisionChunks.delete(rx);
            }
        }
    }
    public getChunkEntities(entity: Entity) {
        let entities = [];
        const chunkPos = entity.chunkPos;
        for (let x = -entity.chunkRadius; x <= entity.chunkRadius; x++) {
            for (let y = -entity.chunkRadius; y <= entity.chunkRadius; y++) {
                let rx = chunkPos.x + x;
                let ry = chunkPos.y + y;

                if (!this.collisionChunks.has(rx)) continue;
                if (!this.collisionChunks.get(rx)?.has(ry)) continue;

                entities.push(...this.collisionChunks.get(rx)?.get(ry) ?? []);
            }
        }
        return entities;
    }

    private get cameraFov() { return this.cameraEntity ? this.cameraEntity.getFov() : 1; }
    public worldToCtxLen(value: number) {
        return value / this.cameraFov;
    }
    public worldToCtxPos(value: util.Vec2) {
        return value
            .sub(this.cameraEntity ? this.cameraEntity.getPos() : 0)
            .imul([1, -1])
            .idiv(this.cameraFov)
            .iadd([this.ctx.canvas.width/2, this.ctx.canvas.height/2]);
    }
    public ctxToWorldLen(value: number) {
        return value * this.cameraFov;
    }
    public ctxToWorldPos(value: util.Vec2) {
        return value
            .sub([this.ctx.canvas.width/2, this.ctx.canvas.height/2])
            .imul(this.cameraFov)
            .imul([1, -1])
            .iadd(this.cameraEntity ? this.cameraEntity.getPos() : 0);
    }

    public update(delta: number) {
        this.rootEntity.preUpdate();
        this.rootEntity.update(delta);
        this.internalUpdate(delta);

        this._keysDownNow.clear();
        this._keysUpNow.clear();
        this._buttonsDownNow.clear();
        this._buttonsUpNow.clear();
    }
    protected internalUpdate(delta: number) {
        if (this.cameraEntity && !this.cameraEntity.addedToEngine)
            this.cameraEntity = null;
    }
    public render() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        if (this.backgroundColor.a > 0) {
            this.ctx.fillStyle = this.backgroundColor.toHex();
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }
        this.rootEntity.render();
        this.internalRender();
    }
    protected internalRender() {}
}
