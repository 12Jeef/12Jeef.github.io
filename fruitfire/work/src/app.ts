import * as util from "./util";

import Game from "./game";


function fail(message: string) {
    document.body.innerHTML = message;
    return message;
}
function assert(value: boolean, failMessage: string | (() => string)): void {
    if (value) return;
    const message = (typeof(failMessage) === "string") ? failMessage : failMessage();
    throw fail(message);
}
function assertInline<T>(value: T | null, failMessage: string | (() => string)): T {
    if (!value) {
        const message = (typeof(failMessage) === "string") ? failMessage : failMessage();
        throw fail(message);
    }
    return value;
}

export default class App extends util.Target {
    private static _instance: App | null = null;
    public static get instance() {
        if (!this._instance) this._instance = new this();
        return this._instance;
    }

    // public readonly realCanvas;
    // public readonly gl;
    // public readonly tex;
    // private readonly idNode;
    // private readonly bgNode;
    // private readonly threshNode;
    // private readonly blurNode;
    // private readonly mergeNode;
    // private readonly filterNode;

    // public readonly virtualCanvas;
    // public readonly ctx;

    public readonly canvas;
    public readonly ctx;
    public readonly canvas2;
    public readonly ctx2;

    public readonly eMainMenu;
    public readonly eMainMenuPlayBtn;

    public readonly game;

    private constructor() {
        super();

        const devicePixelRatio = window.devicePixelRatio;

        // this.realCanvas = document.getElementById("game") as HTMLCanvasElement;
        this.canvas = document.getElementById("game") as HTMLCanvasElement;
        // this.gl = assertInline(this.realCanvas.getContext("webgl"), "WebGL: Is not supported");
        // this.tex = assertInline(this.gl.createTexture(), "WebGL: Could not create texture");
        this.canvas2 = document.getElementById("game2") as HTMLCanvasElement;

        // const createShader = (type: number, src: string) => {
        //     const shader = assertInline(this.gl.createShader(type), "WebGL: Could not create shader");

        //     //@ts-ignore
        //     src = resolveLygia(src);
        //     // sketchy af

        //     this.gl.shaderSource(shader, src);
        //     this.gl.compileShader(shader);
        //     assert(
        //         this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS),
        //         () => {
        //             const message = "WebGL: Could not compile shader: "+this.gl.getShaderInfoLog(shader);
        //             this.gl.deleteShader(shader);
        //             return message;
        //         },
        //     );    
        //     return shader;
        // };
        // const createProgram = (vertShader: WebGLShader, fragShader: WebGLShader) => {
        //     const program = assertInline(this.gl.createProgram(), "WebGL: Could not create shader program");
        //     this.gl.attachShader(program, vertShader);
        //     this.gl.attachShader(program, fragShader);
        //     this.gl.linkProgram(program);
        //     assert(
        //         this.gl.getProgramParameter(program, this.gl.LINK_STATUS),
        //         () => {
        //             const message = "WebGL: Could not link shader program: "+this.gl.getProgramInfoLog(program);
        //             this.gl.deleteProgram(program);
        //             return message;
        //         },
        //     );
        //     const attribLocVertPos = this.gl.getAttribLocation(program, "aVertPos");
        //     const attribLocTexCoord = this.gl.getAttribLocation(program, "aTexCoord");
        //     this.gl.enableVertexAttribArray(attribLocVertPos);
        //     this.gl.enableVertexAttribArray(attribLocTexCoord);
        //     const unifLocRes = this.gl.getUniformLocation(program, "uRes");
        //     const unifLocTex = this.gl.getUniformLocation(program, "uTex");
        //     return {
        //         program,
        //         attribLoc: {
        //             vertPos: attribLocVertPos,
        //             texCoord: attribLocTexCoord,
        //         },
        //         unifLoc: {
        //             res: unifLocRes,
        //             tex: unifLocTex,
        //         },
        //     };
        // };
        // const createProgramFromId = (vertShaderId: string, fragShaderId: string) => {
        //     const vertShader = createShader(this.gl.VERTEX_SHADER, (document.getElementById(vertShaderId) as HTMLScriptElement).innerHTML);
        //     const fragShader = createShader(this.gl.FRAGMENT_SHADER, (document.getElementById(fragShaderId) as HTMLScriptElement).innerHTML);
        //     return createProgram(vertShader, fragShader);
        // };

        // const createFramebuff = (width: number, height: number) => {
        //     const framebuff = this.gl.createFramebuffer();
        //     this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuff);

        //     const tex = assertInline(this.gl.createTexture(), "WebGL: Could not create texture");
        //     this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        //     this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        //     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        //     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        //     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        //     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        
        //     this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, tex, 0);
            
        //     return { framebuff, tex };
        // };

        // const createRenderNode = (vertShaderId: string, fragShaderId: string) => {
        //     const programData = createProgramFromId(vertShaderId, fragShaderId);

        //     const unifLoc: util.StringMap<WebGLUniformLocation> = {};

        //     let prevVertPosBuffer: WebGLBuffer | null = null;
        //     let prevTexCoordBuffer: WebGLBuffer | null = null;

        //     const framebuffData = createFramebuff(0, 0);

        //     const onResize = () => {
        //         this.gl.useProgram(programData.program);

        //         if (prevVertPosBuffer) this.gl.deleteBuffer(prevVertPosBuffer);
        //         const vertPosBuffer = prevVertPosBuffer = this.gl.createBuffer();
        //         this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertPosBuffer);
        //         this.gl.bufferData(
        //             this.gl.ARRAY_BUFFER,
        //             new Float32Array([
        //                 -1, -1,
        //                 +1, -1,
        //                 -1, +1,
        //                 -1, +1,
        //                 +1, -1,
        //                 +1, +1,
        //             ]),
        //             this.gl.STATIC_DRAW,
        //         );
        //         this.gl.vertexAttribPointer(programData.attribLoc.vertPos, 2, this.gl.FLOAT, false, 0, 0);

        //         if (prevTexCoordBuffer) this.gl.deleteBuffer(prevTexCoordBuffer);
        //         const texCoordBuffer = prevTexCoordBuffer = this.gl.createBuffer();
        //         this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
        //         this.gl.bufferData(
        //             this.gl.ARRAY_BUFFER,
        //             new Float32Array([
        //                 0,  0,
        //                 1,  0,
        //                 0,  1,
        //                 0,  1,
        //                 1,  0,
        //                 1,  1,
        //             ]),
        //             this.gl.STATIC_DRAW,
        //         );
        //         this.gl.vertexAttribPointer(programData.attribLoc.texCoord, 2, this.gl.FLOAT, false, 0, 0);

        //         this.gl.uniform2f(programData.unifLoc.res, this.gl.canvas.width, this.gl.canvas.height);

        //         this.gl.deleteFramebuffer(framebuffData.framebuff);
        //         this.gl.deleteTexture(framebuffData.tex);
        //         const newFramebuffData = createFramebuff(this.gl.canvas.width, this.gl.canvas.height);
        //         framebuffData.framebuff = newFramebuffData.framebuff;
        //         framebuffData.tex = newFramebuffData.tex;
        //     };

        //     const onRender = (tex: WebGLTexture, unifs: util.StringMap<number | util.vecn | WebGLTexture>) => {
        //         this.gl.useProgram(programData.program);

        //         let n = 1;

        //         for (const [name, value] of Object.entries(unifs)) {
        //             const loc = unifLoc[name] = unifLoc[name] || this.gl.getUniformLocation(programData.program, name);
        //             if (typeof(value) === "number") {
        //                 this.gl.uniform1f(loc, value);
        //                 continue;
        //             }
        //             if (Array.isArray(value)) {
        //                 if (value.length === 1) {
        //                     this.gl.uniform1fv(loc, value);
        //                     continue;
        //                 }
        //                 if (value.length === 2) {
        //                     this.gl.uniform2fv(loc, value);
        //                     continue;
        //                 }
        //                 if (value.length === 3) {
        //                     this.gl.uniform3fv(loc, value);
        //                     continue;
        //                 }
        //                 this.gl.uniform4fv(loc, value);
        //                 continue;
        //             }
        //             this.gl.activeTexture(this.gl.TEXTURE0 + n);
        //             this.gl.bindTexture(this.gl.TEXTURE_2D, value);
        //             this.gl.uniform1i(loc, n);
        //             n++;
        //         }

        //         this.gl.activeTexture(this.gl.TEXTURE0);
        //         this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        //         this.gl.uniform1i(programData.unifLoc.tex, 0);

        //         this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        //     };
            
        //     return {
        //         programData,
        //         framebuffData: framebuffData,
        //         on: {
        //             resize: onResize,
        //             render: onRender,
        //         },
        //     };
        // };

        // this.idNode = createRenderNode("vert-id", "frag-id");
        // this.bgNode = createRenderNode("vert-id", "frag-bg");
        // this.threshNode = createRenderNode("vert-id", "frag-thresh");
        // this.blurNode = createRenderNode("vert-id", "frag-blur");
        // this.mergeNode = createRenderNode("vert-id", "frag-merge");
        // this.filterNode = createRenderNode("vert-id", "frag-filter");

        // this.virtualCanvas = document.createElement("canvas");
        // this.ctx = assertInline(this.virtualCanvas.getContext("2d"), "Canvas is not supported");
        this.ctx = assertInline(this.canvas.getContext("2d"), "Canvas is not supported");
        // this.ctx.canvas.width = 2000;
        // this.ctx.canvas.height = 1200;
        this.ctx2 = assertInline(this.canvas2.getContext("2d"), "Canvas is not supported");

        const eMainMenu = document.getElementById("main-menu");
        if (!(eMainMenu instanceof HTMLDivElement)) throw "Could not find #main-menu div element";
        this.eMainMenu = eMainMenu;

        const eMainMenuPlayBtn = document.getElementById("main-menu-play-btn");
        if (!(eMainMenuPlayBtn instanceof HTMLButtonElement)) throw "Could not find #main-menu-play-btn div element";
        this.eMainMenuPlayBtn = eMainMenuPlayBtn;

        const onResize = () => {
            // this.gl.canvas.width = window.innerWidth * devicePixelRatio;
            // this.gl.canvas.height = window.innerHeight * devicePixelRatio;
            // this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

            // {
            //     this.idNode.on.resize();
            //     this.bgNode.on.resize();
            //     this.threshNode.on.resize();
            //     this.blurNode.on.resize();
            //     this.mergeNode.on.resize();
            //     this.filterNode.on.resize();
            // }
            let scaleX = 300 / window.innerWidth;
            let scaleY = 150 / window.innerHeight;
            let scale = (scaleX + scaleY) / 2;
            this.ctx.canvas.width = Math.ceil(window.innerWidth * scale);
            this.ctx.canvas.height = Math.ceil(window.innerHeight * scale);
            this.ctx2.canvas.width = this.ctx.canvas.width;
            this.ctx2.canvas.height = this.ctx.canvas.height;
            this.game.post("resize", scale);
        };
        window.addEventListener("resize", e => onResize());

        const observer = new MutationObserver(() => {
            this.game.post("mutation");
        });
        observer.observe(document.body, {
            subtree: true,
            childList: true,
            attributes: true,
            characterData: true,
        });

        this.game = new Game({
            app: this,
            ctx: this.ctx,
            bindTarget: document.body,
        });

        onResize();

        let t0: number | null = null;
        const update = () => {
            
            window.requestAnimationFrame(update);

            if (t0 == null) return t0 = util.getTime();

            let t1 = util.getTime();
            // if (t1-t0 < 1000) return;
            this.update(t1 - t0);
            t0 = t1;

        };
        (async () => {
            await this.load();
            update();
        })();
    }

    public async load() {
        this.game.load();
    }

    public update(delta: number) {
        this.game.update(delta);
        this.game.render();

        this.ctx2.filter = "blur(8px)";
        this.ctx2.drawImage(this.ctx.canvas, 0, 0);

        // this.game.ctx.fillStyle = "#f001";
        // this.game.ctx.fillRect(10, 10, this.game.ctx.canvas.width-20, this.game.ctx.canvas.height-20);

        // this.gl.activeTexture(this.gl.TEXTURE0);
        // this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);

        // this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.virtualCanvas);
        // this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        // this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        // this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        // this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

        // // this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        // // this.idNode.on.render(this.tex, {});

        // // this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.bgNode.framebuffData.framebuff);
        // // this.bgNode.on.render(this.tex, {
        // //     uResTex: [this.ctx.canvas.width, this.ctx.canvas.height],
        // //     uCamera: this.game.cameraEntity?.pos.xy ?? [0, 0],
        // // });

        // // this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.mergeNode.framebuffData.framebuff);
        // // this.mergeNode.on.render(this.tex, {
        // //     uBgTex: this.bgNode.framebuffData.tex,
        // // });

        // this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.filterNode.framebuffData.framebuff);
        // // this.filterNode.on.render(this.mergeNode.framebuffData.tex, {
        // this.filterNode.on.render(this.tex, {
        //     uResTex: [this.ctx.canvas.width, this.ctx.canvas.height],
        // });

        // this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.threshNode.framebuffData.framebuff);
        // this.threshNode.on.render(this.filterNode.framebuffData.tex, {
        //     uThreshold: 0.25,
        // });

        // this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.blurNode.framebuffData.framebuff);
        // this.blurNode.on.render(this.threshNode.framebuffData.tex, {
        //     uRadius: 25*devicePixelRatio,
        // });

        // this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        // this.mergeNode.on.render(this.filterNode.framebuffData.tex, {
        //     uAddTex: this.blurNode.framebuffData.tex,
        // });
    }
}

App.instance;
