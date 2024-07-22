import * as util from "../../util.mjs";


//// CANVAS DISPLAY

const eDisplay = document.getElementById("display");

//// REAL CANVASES

const eCanvasReal = document.getElementById("main");
const ctxReal = eCanvasReal.getContext("2d");
const eCanvas2Real = document.getElementById("meter");
const ctx2Real = eCanvas2Real.getContext("2d");
ctxReal.imageSmoothingEnabled = ctx2Real.imageSmoothingEnabled = false;

//// VIRTUAL CANVASES

let eCanvas = null;
let eOffCanvas = null;

let eCanvas2 = null;
let eOffCanvas2 = null;

//// WORKER

let worker = null;
let simulator = "diffusion";
const updateSim = () => {
    eSimSelect.textContent = document.getElementById("sim-"+simulator).textContent;

    eCanvas = document.createElement("canvas");
    eCanvas.width = 100;
    eCanvas.height = 60;
    eOffCanvas = eCanvas.transferControlToOffscreen();

    eCanvas2 = document.createElement("canvas");
    eCanvas2.width = eCanvas2Real.width;
    eCanvas2.height = eCanvas2Real.height;
    eOffCanvas2 = eCanvas2.transferControlToOffscreen();

    worker = new Worker("./workerscript-"+simulator+".js", { type: "module" });
    worker.postMessage({ type: "start", data: { eCanvas: eOffCanvas, eCanvas2: eOffCanvas2 } }, [eOffCanvas, eOffCanvas2]);

    updateWorkerSimMode();
    updateWorkerPen();
    updateMeter();
};
const closeSimulatorDropdown = e => {
    if (e) {
        if (eSimSelect.parentElement.contains(e.target)) return;
        e.stopPropagation();
    }
    document.body.removeEventListener("click", closeSimulatorDropdown, true);
    eSimSelect.parentElement.classList.remove("open");
};
const eSimSelect = document.getElementById("sim-select");
eSimSelect.addEventListener("click", e => {
    if (eSimSelect.parentElement.classList.contains("open"))
        return closeSimulatorDropdown();
    eSimSelect.parentElement.classList.add("open");
    document.body.addEventListener("click", closeSimulatorDropdown, true);
});
["diffusion", "pattern", "heart"].forEach(sim => {
    const elem = document.getElementById("sim-"+sim);
    elem.addEventListener("click", e => {
        simulator = sim;
        updateSim();
        closeSimulatorDropdown();
    });
});

let mode = 0;
const updateSimMode = () => {
    eSimMode.value = mode;
};
const updateWorkerSimMode = () => {
    worker.postMessage({ type: "mode", data: mode });
};
const eSimMode = document.getElementById("sim-mode");
eSimMode.addEventListener("change", e => {
    mode = parseInt(eSimMode.value);
    updateSimMode();
    updateWorkerSimMode();
});
updateSimMode();

//// PEN

let pen = 3;
const ePenSizeInput = document.getElementById("pensize-input");
const ePenSizeRange = document.getElementById("pensize-range");
const updatePen = () => {
    ePenSizeInput.value = pen;
    ePenSizeRange.value = pen;
};
const updateWorkerPen = () => {
    worker.postMessage({ type: "pen", data: pen });
};
ePenSizeInput.addEventListener("change", () => {
    pen = parseFloat(ePenSizeInput.value);
    updatePen();
    updateWorkerPen();
});
ePenSizeRange.addEventListener("input", () => {
    pen = parseFloat(ePenSizeRange.value);
    updatePen();
    updateWorkerPen();
});
updatePen();

//// METER

let meter = new util.V(20);
const updateMeter = () => {
    worker.postMessage({ type: "meter", data: meter.xy });
};

//// ACTIVE CHANNELS

let activeChannels = new Array(3).fill(true);
const updateActiveChannels = () => {
    activeChannels.forEach((active, i) => {
        const elem = document.getElementById("channel-"+i);
        if (active)
            elem.classList.add("active");
        else elem.classList.remove("active");
    });
};
updateActiveChannels();
activeChannels.forEach((_, i) => {
    const elem = document.getElementById("channel-"+i);
    elem.addEventListener("click", e => {
        if (e.shiftKey) {
            for (let j = 0; j < activeChannels.length; j++)
                activeChannels[j] = false;
            activeChannels[i] = true;
        } else activeChannels[i] = !activeChannels[i];
        updateActiveChannels();
    });
});

//// ACTIVE TOOL

let activeTool = "draw";
const updateActiveTool = () => {
    ["draw", "erase", "move", "meter"].forEach(tool => {
        const elem = document.getElementById("tool-"+tool);
        if (tool === activeTool)
            elem.classList.add("this");
        else elem.classList.remove("this");
    });
};
updateActiveTool();
["draw", "erase", "move", "meter"].forEach(tool => {
    const elem = document.getElementById("tool-"+tool);
    elem.addEventListener("click", e => {
        activeTool = tool;
        updateActiveTool();
    });
});

updateSim();

//// MOUSE

let mouseDown = false;
let prevMouse = new util.V();
let mouse = new util.V();

//// CANVAS HOOKS

eCanvasReal.addEventListener("mousedown", e => (mouseDown = true));
eCanvasReal.addEventListener("mouseup", e => (mouseDown = false));
eCanvasReal.addEventListener("mousemove", e => {
    let currMouse = new util.V(e.offsetX, e.offsetY);
    const r = eCanvasReal.getBoundingClientRect();
    currMouse.x *= eCanvas.width / r.width;
    currMouse.y *= eCanvas.height / r.height;
    prevMouse.set(mouse);
    mouse.set(currMouse);
});

//// UPDATE

const update = () => {
    window.requestAnimationFrame(update);
    if (mouseDown) {
        let i = [];
        activeChannels.forEach((active, j) => {
            if (!active) return;
            i.push(j);
        })
        if (activeTool === "draw") worker.postMessage({ type: "draw", data: { pos: mouse.xy, i: i } });
        if (activeTool === "erase") worker.postMessage({ type: "erase", data: { pos: mouse.xy, i: i }});
        if (activeTool === "move") worker.postMessage({ type: "move", data: { pos: mouse.xy, shift: mouse.sub(prevMouse).xy, i: i }});
        if (activeTool === "meter") {
            meter.set(mouse);
            meter.iround();
            updateMeter();
        }
    }

    const r = eDisplay.getBoundingClientRect();
    const em = parseFloat(getComputedStyle(eDisplay).fontSize);
    const canvas2ToCanvas = eCanvasReal.width / eCanvas2Real.width;
    const globalScale = Math.min(
        r.width / eCanvasReal.width,
        (r.height - em) / (eCanvasReal.height + eCanvas2Real.height*canvas2ToCanvas),
    );
    eCanvasReal.style.width = (eCanvasReal.width * globalScale) + "px";
    eCanvasReal.style.height = (eCanvasReal.height * globalScale) + "px";
    eCanvas2Real.style.width = (eCanvas2Real.width * globalScale) + "px";
    eCanvas2Real.style.height = (eCanvas2Real.height * globalScale) + "px";

    const virtualToReal = [ctxReal.canvas.width / eCanvas.width, ctxReal.canvas.height / eCanvas.height];

    ctxReal.clearRect(0, 0, ctxReal.canvas.width, ctxReal.canvas.height);
    ctxReal.drawImage(eCanvas, 0, 0, ctxReal.canvas.width, ctxReal.canvas.height);
    ctxReal.strokeStyle = "#fff8";
    ctxReal.lineWidth = 2;
    ctxReal.strokeRect(
        ...meter.mul(virtualToReal).xy,
        ...new util.V(1).mul(virtualToReal).xy,
    );
    if (activeTool !== "meter") {
        ctxReal.beginPath();
        ctxReal.ellipse(
            ...mouse.mul(virtualToReal).xy,
            ...new util.V(pen).mul(virtualToReal).xy,
            0, 0, 2*Math.PI,
        );
        ctx2Real.closePath();
        ctxReal.stroke();
    }

    ctx2Real.clearRect(0, 0, ctx2Real.canvas.width, ctx2Real.canvas.height);
    ctx2Real.drawImage(eCanvas2, 0, 0, ctx2Real.canvas.width, ctx2Real.canvas.height);
};
update();
