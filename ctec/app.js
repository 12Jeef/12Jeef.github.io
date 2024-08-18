import * as util from "../util.mjs";
import { V } from "../util.mjs";

import { WorkerClient } from "./worker.js";


const IMAGE_QUOTA = 50;


export default class App extends util.Target {
    constructor() {
        super();

        window.app = this;

        this.addHandler("start", () => {
            let id = setInterval(async () => {
                if (document.readyState != "complete") return;
                this.setup();
                clearInterval(id);
                let t0 = null;
                const update = async () => {
                    window.requestAnimationFrame(update);
                    let t1 = util.getTime();
                    if (t0 == null) return t0 = t1;
                    this.update(t1-t0);
                    t0 = t1;
                };
                update();
            }, 10);
        });

        this.addHandler("setup", () => {

            function getCanvasFromTIFFBuffer(buffer, page=0) {
                const ifds = UTIF.decode(buffer);
                UTIF.decodeImage(buffer, ifds[page]);
                const width = ifds[page].width, height = ifds[page].height;
                const rgbData = UTIF.toRGBA8(ifds[page]);
                return getCanvasFromUint8Buffer(rgbData, width, height);
            }
            function getCanvasFromImage(image) {
                const canvas = document.createElement("canvas");
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0);
                return canvas;
            }
            function getCanvasFromUint8Buffer(buffer, width, height) {
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                const imgData = ctx.createImageData(width, height);
                imgData.data.set(buffer);
                ctx.putImageData(imgData, 0, 0);
                return canvas;
            }
            function getUint8BufferFromCanvas(canvas) {
                const imageData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
                return new Uint8Array(imageData.data);
            }
            function scaleCanvas(canvas) {
                let widthScale = 1000 / canvas.width;
                let heightScale = 1000 / canvas.height;
                let scale = (widthScale + heightScale) / 2;
                let newWidth = Math.round(canvas.width * scale);
                let newHeight = Math.round(canvas.height * scale);
                const newCanvas = document.createElement("canvas");
                newCanvas.width = newWidth;
                newCanvas.height = newHeight;
                const ctx = newCanvas.getContext("2d");
                ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
                return newCanvas;
            }
            function scaleCanvasTiny(canvas) {
                let widthScale = 100 / canvas.width;
                let heightScale = 100 / canvas.height;
                let scale = (widthScale + heightScale) / 2;
                let newWidth = Math.round(canvas.width * scale);
                let newHeight = Math.round(canvas.height * scale);
                const newCanvas = document.createElement("canvas");
                newCanvas.width = newWidth;
                newCanvas.height = newHeight;
                const ctx = newCanvas.getContext("2d");
                ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
                return newCanvas;
            }
            async function extractChannels(canvas) {
                const imgData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
                const rCanvas = document.createElement("canvas");
                const gCanvas = document.createElement("canvas");
                const bCanvas = document.createElement("canvas");
                rCanvas.width = gCanvas.width = bCanvas.width = canvas.width;
                rCanvas.height = gCanvas.height = bCanvas.height = canvas.height;
                const rCtx = rCanvas.getContext("2d");
                const gCtx = gCanvas.getContext("2d");
                const bCtx = bCanvas.getContext("2d");
                const rImgData = rCtx.createImageData(canvas.width, canvas.height);
                const gImgData = gCtx.createImageData(canvas.width, canvas.height);
                const bImgData = bCtx.createImageData(canvas.width, canvas.height);
                const [rImgDataBuff, gImgDataBuff, bImgDataBuff] = await commandWorker("extractChannels", { buffer: imgData.data });
                rImgData.data.set(rImgDataBuff);
                gImgData.data.set(gImgDataBuff);
                bImgData.data.set(bImgDataBuff);
                rCtx.putImageData(rImgData, 0, 0);
                gCtx.putImageData(gImgData, 0, 0);
                bCtx.putImageData(bImgData, 0, 0);
                return [rCanvas, gCanvas, bCanvas];
            }

            function createShader(gl, type, source) {
                const shader = gl.createShader(type);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, viewerGl.COMPILE_STATUS)) {
                    gl.deleteShader(shader);
                    return null;
                }
                return shader;
            }
            function createProgram(gl, vsSource, fsSource) {
                const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
                const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
                const program = gl.createProgram();
                gl.attachShader(program, vs);
                gl.attachShader(program, fs);
                gl.linkProgram(program);
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    gl.deleteProgram(program);
                    return null;
                }
                return program;
            }
            function createFrameBuffer(gl, w, h) {
                const frameBuffer = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
            
                const tex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            
                const renderBuffer = gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
            
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);
            
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            
                return { frameBuffer, tex };
            }
            function renderPass(gl, program, frameBuffer, tex) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
                gl.useProgram(program);
            
                const texLocation = gl.getUniformLocation(program, "u_canvas");
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.uniform1i(texLocation, 0);
            
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }

            ////////////////////////////////

            UTIF.replaceIMG();

            window.addEventListener("beforeunload", e => {
                images = {};
                saveImages();
                return;
                e.preventDefault();
                e.returnValue = "Still waiting on some tasks...";
                return "Still waiting on some tasks...";
            });

            ////////////////////////////////

            let theme = "dark";
            const setTheme = newTheme => {
                theme = newTheme;
                this.post("theme-changed");
            };
            const loadTheme = () => {
                setTheme(localStorage.getItem("ctec.theme") ?? "dark");
            };
            const saveTheme = () => {
                localStorage.setItem("ctec.theme", theme);
            };
            this.addHandler("theme-changed", saveTheme);

            let images = {};
            let _imagesChanged = false;

            const imagesChanged = () => {
                _imagesChanged = true;
                setActiveImage(activeImage);
                this.post("images-changed");
            };
            const loadImages = () => {
                images = {};
                for (const key in localStorage) {
                    if (!key.startsWith("ctec.image.")) continue;
                    const imageKey = key.slice("ctec.image.".length);
                    let image = null;
                    try {
                        image = JSON.parse(localStorage.getItem(key));
                    } catch (e) {}
                    images[imageKey] = image;
                }
                _imagesChanged = false;
                this.post("images-changed");
            };
            const saveImages = () => {
                for (const key in localStorage) {
                    if (!key.startsWith("ctec.image.")) continue;
                    const imageKey = key.slice("ctec.image.".length);
                    if (imageKey in images) continue;
                    localStorage.removeItem(key);
                }
                for (const imageKey in images) {
                    let image = images[imageKey];
                    localStorage.setItem("ctec.image."+imageKey, JSON.stringify({
                        meta: image.meta,
                        input: image.input,
                        output: image.output,
                    }));
                }
                _imagesChanged = false;
            };
            let imageTimer = 0;
            this.addHandler("update", delta => {
                imageTimer += delta;
                if (imageTimer < 1000) return;
                imageTimer = 0;
                if (_imagesChanged) saveImages();
            });

            const addImage = image => {
                const key = (() => {
                    if ("key" in image) return image.key; // for override support
                    let key;
                    do {
                        key = util.jargonBase64(8);
                    } while (key in images);
                    return key;
                })();

                image.key = key;
                images[key] = image;
                imagesChanged();

                const keys = Object.keys(images)
                    .sort((keyA, keyB) => {
                        let timeA = images[keyA].meta.time;
                        let timeB = images[keyB].meta.time;
                        return timeB - timeA;
                    }); // newest to oldest
                if (keys.length < IMAGE_QUOTA) return;
                remImage(keys.slice(IMAGE_QUOTA));
            };
            const addImages = images => images.map(addImage);
            const remImage = image => {
                if (typeof(image) == "string") {
                    delete images[key];
                    imagesChanged();
                    return;
                }
                remImage(image.key);
            };
            const remImages = images => images.map(remImage);

            let activeImage = null;
            const setActiveImage = key => {
                if (!(key in images)) key = null;
                if (key == null && Object.keys(images).length > 0) key = Object.keys(images)[0];
                if (activeImage == key) return;
                activeImage = key;
                this.post("active-image-changed");
            };

            let showChannels = [true, true, true];
            const setShowChannel = (i, value) => {
                if (showChannels[i] == value) return;
                showChannels[i] = value;
                this.post("show-channels-changed");
            };
            const setShowChannels = values => {
                let changed = false;
                for (let i = 0; i < 3; i++) {
                    if (showChannels[i] == values[i]) continue;
                    showChannels[i] = values[i];
                    changed = true;
                }
                if (!changed) return;
                this.post("show-channels-changed");
            };

            ////////////////////////////////

            const eDarkStyle = document.getElementById("dark-style");
            const eThemeButton = document.querySelector("body > header > button.theme");
            const eThemeButtonIcon = document.querySelector("body > header > button.theme > ion-icon");
            const eThemeDropdown = document.querySelector("body > header > div.theme-dropdown");
            const themeDropdownClear = e => {
                if (e) {
                    if (eThemeDropdown.contains(e.target)) return;
                    e.stopPropagation();
                }
                eThemeDropdown.classList.remove("active");
                document.body.removeEventListener("click", themeDropdownClear, true);
            };
            eThemeButton.addEventListener("click", e => {
                if (eThemeDropdown.classList.contains("active")) {
                    themeDropdownClear();
                    return;
                }
                eThemeDropdown.classList.add("active");
                document.body.addEventListener("click", themeDropdownClear, true);
            });
            Array.from(eThemeDropdown.querySelectorAll(":scope > button")).forEach(eButton => {
                const theme = eButton.className;
                eButton.addEventListener("click", e => {
                    themeDropdownClear();
                    setTheme(theme);
                });
            });

            const updateTheme = () => {
                const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
                eDarkStyle.href = (theme == "dark") ? "./style-dark.css" : (theme == "light") ? "" : darkMode ? "./style-dark.css" : "";
                eThemeButtonIcon.name = (theme == "dark") ? "moon" : (theme == "light") ? "sunny" : "cloudy";
            };
            this.addHandler("theme-changed", updateTheme);
            window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateTheme);

            ////////////////////////////////

            const eIntro = document.querySelector("body > article.intro");
            const eUploadManualButton = document.querySelector("body > article.intro > article.intro-card > button");

            this.addHandler("images-changed", () => {
                if (Object.keys(images).length > 0)
                    eIntro.classList.remove("empty");
                else eIntro.classList.add("empty");
            });
            eUploadManualButton.addEventListener("click", e => {
            });

            ////////////////////////////////

            const eImagesBody = document.querySelector("body > article.images-body");
            const eImagesViewer = document.querySelector("body > article.images-body > article.viewer");
            const eImagesViewerCanvas1Gl = document.querySelector("body > article.images-body > article.viewer > article > article.image > canvas:first-of-type");
            const eImagesViewerCanvas1Ctx = document.querySelector("body > article.images-body > article.viewer > article > article.image > canvas:last-of-type");

            const viewerGl1 = eImagesViewerCanvas1Gl.getContext("webgl");
            const viewerTex1 = viewerGl1.createTexture();
            const viewerCtx1 = eImagesViewerCanvas1Ctx.getContext("2d");

            const eImagesViewerChannelsR = document.querySelector("body > article.images-body > article.viewer > article > article.editor > span.channels > button.r");
            const eImagesViewerChannelsG = document.querySelector("body > article.images-body > article.viewer > article > article.editor > span.channels > button.g");
            const eImagesViewerChannelsB = document.querySelector("body > article.images-body > article.viewer > article > article.editor > span.channels > button.b");
            [eImagesViewerChannelsR, eImagesViewerChannelsG, eImagesViewerChannelsB].forEach((eButton, i) => {
                eButton.addEventListener("click", e => {
                    if (e.shiftKey) {
                        for (let j = 0; j < 3; j++)
                            setShowChannel(j, j == i);
                        return;
                    }
                    setShowChannel(i, !showChannels[i]);
                });
            });
            const eImagesNavigator = document.querySelector("body > article.images-body > article.navigator");
            const eImages = {};
            const updateEImagesBody = () => {
                if (Object.keys(images).length > 0)
                    eImagesBody.classList.remove("empty");
                else eImagesBody.classList.add("empty");
            };
            let calculateWorker = null;
            const updateEImagesViewer = async e => {
                let image = images[activeImage];
                let source = image?.source ? image.source() : null;

                if (e == "show-channels")
                    if (image && image.input)
                        image.input.showChannels = [...showChannels];
                setShowChannels(image?.input?.showChannels ?? [true, true, true]);
                
                for (const [viewerGl, viewerTex, viewerCtx] of [
                    [viewerGl1, viewerTex1, viewerCtx1],
                    // [viewerGl2, viewerTex2, viewerCtx2],
                ]) {
                    viewerGl.canvas.width = viewerCtx.canvas.width = source?.width ?? 0;
                    viewerGl.canvas.height = viewerCtx.canvas.height = source?.height ?? 0;
                    viewerGl.viewport(0, 0, viewerGl.canvas.width, viewerGl.canvas.height);

                    if (source) {
                        
                        /*
                        const vertSource = `
                        precision highp float;
            
                        attribute vec2 a_pos;
                        attribute vec2 a_tex_coord;
                        
                        uniform vec2 u_res;
                        
                        varying vec2 v_tex_coord;
                        
                        void main() {
                            vec2 zero_to_one = a_pos / u_res;
                            vec2 zero_to_two = zero_to_one * 2.0;
                            vec2 clip_space = zero_to_two - 1.0;
                            
                            gl_Position = vec4(clip_space * vec2(1, -1), 0, 1);
            
                            v_tex_coord = a_tex_coord;
                        }`;
                        const fragSources = [
                            `precision highp float;

                            uniform vec2 u_res;
                            uniform sampler2D u_canvas;

                            const vec2 u_sample = vec2(15.0, 15.0);
                            uniform vec3 u_max;
                            uniform vec3 u_bright;
                            uniform vec3 u_weight;
                            uniform vec3 u_pow;

                            varying vec2 v_tex_coord;
                            varying vec4 frag_color;
                            
                            void main() {
                                vec2 tex_coord = v_tex_coord * u_res;
                                vec4 color = texture(u_tex, v_tex_coord);

                                float w = (min(v_tex_coord.x + u_sample.x, u_res.x) - max(v_tex_coord.x - u_sample.x, 0.0));
                                float h = (min(v_tex_coord.y + u_sample.y, u_res.y) - max(v_tex_coord.y - u_sample.y, 0.0));
                                float n_pix = w * h;
                                vec4 avg_color = vec4(0.0, 0.0, 0.0, 0.0);
                                for (float x = -u_sample.x; x <= u_sample.x; x++) {
                                    for (float y = -u_sample.y; y <= u_sample.y; y++) {
                                        vec2 offset = vec2(x, y) / u_res;
                                        avg_color += texture2D(u_canvas, v_tex_coord + offset) / n_pix;
                                    }
                                }
                                float r = min(u_max.r, mix(avg_color.r, 1.0, float(avg_color.r == 0.0))) / u_bright.r;
                                float g = min(u_max.g, mix(avg_color.g, 1.0, float(avg_color.g == 0.0))) / u_bright.g;
                                float b = min(u_max.b, mix(avg_color.b, 1.0, float(avg_color.b == 0.0))) / u_bright.b;
                                color = mix(color, color / vec4(r, g, b, 1.0), vec4(u_weight, 1.0));
                                color = pow(color, vec4(u_pow, 1.0));
                            }`,
                            `
                            precision highp float;
                
                            uniform sampler2D u_canvas;
                
                            uniform vec3 u_thresh;
                        
                            varying vec2 v_tex_coord;
                            varying vec4 frag_color;
                        
                            void main() {
                                vec4 color = texture2D(u_canvas, v_tex_coord);

                                color.r = float(color.r > u_thresh.r);
                                color.g = float(color.g > u_thresh.g);
                                color.b = float(color.b > u_thresh.b);

                                frag_color = color;
                            }`,
                            `
                            precision highp float;
                
                            uniform sampler2D u_canvas;
                
                            uniform vec3 u_mult;
                        
                            varying vec2 v_tex_coord;
                            varying vec4 frag_color;
                        
                            void main() {
                                vec4 color = texture2D(u_canvas, v_tex_coord);
                                
                                frag_color = color * vec4(u_mult, 1.0);
                            }`,
                        ];
                        */

                        const viewerProgram = twgl.createProgramFromScripts(viewerGl, ["vs-def", "fs-3"]);
                        viewerGl.useProgram(viewerProgram);
                        
                        const viewerPosLocation = viewerGl.getAttribLocation(viewerProgram, "a_pos");
                        const viewerTexCoordLocation = viewerGl.getAttribLocation(viewerProgram, "a_tex_coord");

                        viewerGl.enableVertexAttribArray(viewerPosLocation);
                        viewerGl.enableVertexAttribArray(viewerTexCoordLocation);

                        const viewerPosBuffer = viewerGl.createBuffer();
                        viewerGl.bindBuffer(viewerGl.ARRAY_BUFFER, viewerPosBuffer);
                        viewerGl.bufferData(
                            viewerGl.ARRAY_BUFFER,
                            new Float32Array([
                                0, 0,
                                viewerGl.canvas.width, 0,
                                0, viewerGl.canvas.height,
                                0, viewerGl.canvas.height,
                                viewerGl.canvas.width, 0,
                                viewerGl.canvas.width, viewerGl.canvas.height,
                            ]),
                            viewerGl.STATIC_DRAW,
                        );
                        viewerGl.vertexAttribPointer(viewerPosLocation, 2, viewerGl.FLOAT, false, 0, 0);

                        const viewerTexCoordBuffer = viewerGl.createBuffer();
                        viewerGl.bindBuffer(viewerGl.ARRAY_BUFFER, viewerTexCoordBuffer);
                        viewerGl.bufferData(
                            viewerGl.ARRAY_BUFFER,
                            new Float32Array([
                                0,  0,
                                1,  0,
                                0,  1,
                                0,  1,
                                1,  0,
                                1,  1,
                            ]),
                            viewerGl.STATIC_DRAW,
                        );
                        viewerGl.vertexAttribPointer(viewerTexCoordLocation, 2, viewerGl.FLOAT, false, 0, 0);

                        const viewerResLocation = viewerGl.getUniformLocation(viewerProgram, "u_res");
                        viewerGl.uniform2f(viewerResLocation, viewerGl.canvas.width, viewerGl.canvas.height);

                        const viewerTexLocation = viewerGl.getUniformLocation(viewerProgram, "u_canvas");

                        viewerGl.activeTexture(viewerGl.TEXTURE0);
                        viewerGl.bindTexture(viewerGl.TEXTURE_2D, viewerTex);
                        viewerGl.texImage2D(viewerGl.TEXTURE_2D, 0, viewerGl.RGBA, viewerGl.RGBA, viewerGl.UNSIGNED_BYTE, source);

                        viewerGl.texParameteri(viewerGl.TEXTURE_2D, viewerGl.TEXTURE_WRAP_S, viewerGl.CLAMP_TO_EDGE);
                        viewerGl.texParameteri(viewerGl.TEXTURE_2D, viewerGl.TEXTURE_WRAP_T, viewerGl.CLAMP_TO_EDGE);
                        viewerGl.texParameteri(viewerGl.TEXTURE_2D, viewerGl.TEXTURE_MIN_FILTER, viewerGl.NEAREST);
                        viewerGl.texParameteri(viewerGl.TEXTURE_2D, viewerGl.TEXTURE_MAG_FILTER, viewerGl.NEAREST);
                        
                        viewerGl.uniform1i(viewerTexLocation, 0);

                        const viewerMultLocation = viewerGl.getUniformLocation(viewerProgram, "u_mult");
                        viewerGl.uniform3f(viewerMultLocation, ...showChannels.map(value => +!!value));
                        const viewerSampleLocation = viewerGl.getUniformLocation(viewerProgram, "u_sample");
                        viewerGl.uniform2f(viewerSampleLocation, 15, 15);
                        const viewerMaxLocation = viewerGl.getUniformLocation(viewerProgram, "u_max");
                        viewerGl.uniform3f(viewerMaxLocation, 2, 2, 2);
                        const viewerBrightLocation = viewerGl.getUniformLocation(viewerProgram, "u_bright");
                        viewerGl.uniform3f(viewerBrightLocation, 2, 2, 2);
                        const viewerWeightLocation = viewerGl.getUniformLocation(viewerProgram, "u_weight");
                        viewerGl.uniform3f(viewerWeightLocation, 1, 1, 1);
                        const viewerPowLocation = viewerGl.getUniformLocation(viewerProgram, "u_pow");
                        viewerGl.uniform3f(viewerPowLocation, 3, 3, 3);
                        const viewerThreshLocation = viewerGl.getUniformLocation(viewerProgram, "u_thresh");
                        viewerGl.uniform3f(viewerThreshLocation, 0.125, 0.375, 0.375);

                        viewerGl.drawArrays(viewerGl.TRIANGLES, 0, 6);

                        viewerCtx.clearRect(0, 0, viewerCtx.canvas.width, viewerCtx.canvas.height);

                        const pixels = new Uint8Array(viewerGl.canvas.width * viewerGl.canvas.height * 4);
                        viewerGl.readPixels(0, 0, viewerGl.canvas.width, viewerGl.canvas.height, viewerGl.RGBA, viewerGl.UNSIGNED_BYTE, pixels);

                        if (calculateWorker) calculateWorker.terminate();
                        calculateWorker = new WorkerClient("./calculate.js");
                        calculateWorker.onReceive(output => {
                            console.log(output);
                            if (!output.isFinal) return;
                            const cellBlobs = output.cellBlobs;
                            viewerCtx.fillStyle = "#fff";
                            cellBlobs.forEach(blob => {
                                if (blob.size <= 50) return;
                                if (blob.cytoHit <= 15) return;
                                viewerCtx.beginPath();
                                viewerCtx.arc(blob.pos[0], viewerCtx.canvas.height-blob.pos[1], 3, 0, 2*Math.PI);
                                viewerCtx.fill();
                            });
                        });
                        calculateWorker.send({
                            pixels: pixels,
                            size: [viewerGl.canvas.width, viewerGl.canvas.height],
                            channels: {
                                cyto: [0],
                                nuclei: [2],
                                transf: [1],
                            },
                        });
                    }
                }

                [eImagesViewerChannelsR, eImagesViewerChannelsG, eImagesViewerChannelsB].forEach((eButton, i) => {
                    if (showChannels[i])
                        eButton.classList.add("this");
                    else eButton.classList.remove("this");
                });
            };
            const updateEImages = () => {
                for (const key in images) {
                    if (key in eImages) continue;

                    const eButton = document.createElement("button");
                    eButton.classList.add("image");
                    eButton.addEventListener("click", e => setActiveImage(key));
                    eImagesNavigator.appendChild(eButton);

                    eImages[key] = {
                        eButton: eButton,
                    };
                }
                for (const key in eImages) {
                    if (key in images) continue;
                    let eImage = eImages[key];

                    eImage.eButton.remove();
                }
                for (const key in images) {
                    let image = images[key];
                    let eImage = eImages[key];

                    if (activeImage == key)
                        eImage.eButton.classList.add("this");
                    else eImage.eButton.classList.remove("this");

                    if (image?.source)
                        eImage.eButton.style.backgroundImage = "url(\"" + image.source(true).toDataURL() + "\")";
                }
            };
            this.addHandler("images-changed", () => {
                updateEImagesBody();
                updateEImagesViewer("images");
                updateEImages();
            });
            this.addHandler("active-image-changed", () => {
                updateEImagesViewer("active-image");
                updateEImages();
            });
            this.addHandler("show-channels-changed", () => {
                updateEImagesViewer("show-channels");
            });

            ////////////////////////////////

            const eDragOverlay = document.querySelector("body > div.drag-overlay");
            const dragOver = e => {
                e.preventDefault();
                eDragOverlay.classList.remove("active");
            };
            const dragNotOver = e => {
                e.preventDefault();
                eDragOverlay.classList.add("active");
            };
            document.body.addEventListener("dragenter", dragNotOver);
            document.body.addEventListener("dragover", dragNotOver);
            document.body.addEventListener("dragleave", dragOver);
            document.body.addEventListener("drop", dragOver);
            document.body.addEventListener("drop", async e => {
                let images = Array.from(e.dataTransfer.items)
                    .filter(item => item.kind == "file")
                    .map(item => item.getAsFile())
                    .filter(item => [
                        "image/jpg",
                        "image/jpeg",
                        "image/png",
                        "image/gif",
                        "image/tiff",
                    ].includes(item.type));
                
                images = await Promise.all(images.map(file => new Promise((res, rej) => {
                    const reader = new FileReader();
                    reader.addEventListener("load", e => {
                        let cachedSource = null;
                        let cachedSourceTiny = null;
                        const image = {
                            meta: {
                                name: file.name,
                                time: Date.now(),
                            },

                            input: {
                                showChannels: [true, true, true],
                                cellMarkers: [0, 1],
                                transfMarkers: [2],
                            },
                        };

                        if (file.type == "image/tiff") {
                            image.source = (tiny=false) => {
                                if (tiny) {
                                    if (cachedSourceTiny) return cachedSourceTiny;
                                    return cachedSourceTiny = scaleCanvasTiny(image.source());
                                }
                                if (cachedSource) return cachedSource;
                                return cachedSource = scaleCanvas(getCanvasFromTIFFBuffer(e.target.result));
                            };
                            return res(image);
                        }
                        
                        const eImage = new Image();
                        eImage.addEventListener("load", () => {
                            image.source = (tiny=false) => {
                                if (tiny) {
                                    if (cachedSourceTiny) return cachedSourceTiny;
                                    return cachedSourceTiny = scaleCanvasTiny(image.source());
                                }
                                if (cachedSource) return cachedSource;
                                return cachedSource = scaleCanvas(getCanvasFromImage(eImage));
                            };
                            return res(image);
                        });
                        eImage.src = e.target.result;
                    });

                    if (file.type == "image/tiff")
                        reader.readAsArrayBuffer(file);
                    else reader.readAsDataURL(file);
                })));

                addImages(images);
            });

            loadTheme();
            loadImages();
            setActiveImage(null);

        });
    }

    start() { this.post("start"); }

    setup() { this.post("setup"); }

    update(delta) { this.post("update", delta); }
}