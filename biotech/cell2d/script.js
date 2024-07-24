import * as util from "../../util.mjs";


//// CANVAS DISPLAY

const eDisplay = document.getElementById("display");

//// REAL CANVASES

const eCanvasReal = document.getElementById("main");
const ctxReal = eCanvasReal.getContext("2d");
const eCanvas2Real = document.getElementById("meter");
const ctx2Real = eCanvas2Real.getContext("2d");

//// VIRTUAL CANVASES

let eCanvas = null;
let eOffCanvas = null;

let eCanvas2 = null;
let eOffCanvas2 = null;

//// WORKER

const context = new util.Target();

let worker = null;
let simulator = "diffusion";
const updateSim = () => {
    eSimSelect.textContent = document.getElementById("sim-"+simulator).textContent;

    eCanvas = document.createElement("canvas");
    eCanvas.width = spaceWidth;
    eCanvas.height = spaceHeight;
    eOffCanvas = eCanvas.transferControlToOffscreen();

    eCanvas2 = document.createElement("canvas");
    eCanvas2.width = eCanvas2Real.width;
    eCanvas2.height = eCanvas2Real.height;
    eOffCanvas2 = eCanvas2.transferControlToOffscreen();

    const scaleX = 1000 / spaceWidth;
    const scaleY = 600 / spaceHeight;
    const scale = (scaleX + scaleY) / 2;
    eCanvasReal.width = spaceWidth * scale;
    eCanvasReal.height = spaceHeight * scale;

    if (worker) worker.terminate();
    worker = new Worker("./workerscript-"+simulator+".js", { type: "module" });
    worker.postMessage({ type: "init", data: { eCanvas: eOffCanvas, eCanvas2: eOffCanvas2 } }, [eOffCanvas, eOffCanvas2]);

    updateWorkerPenSize();
    updateWorkerPenWeight();
    updateMeter();
    updateWorkerVisibleChannels();

    Array.from(document.querySelectorAll(".sim-param")).forEach(elem => (elem.style.display = "none"));
    Array.from(document.querySelectorAll(".sim-param."+simulator)).forEach(elem => (elem.style.display = ""));
    context.post("update-sim");

    worker.postMessage({ type: "start", data: null });

    channels = {
        "diffusion": 3,
        "pattern": 2,
        "heart": 4,
    }[simulator] ?? 0;
    updateActiveChannels();
    updateVisibleChannels();
};
const closeSimulatorDropdown = e => {
    if (e) {
        if (eSims.contains(e.target)) return;
        e.stopPropagation();
    }
    document.body.removeEventListener("click", closeSimulatorDropdown, true);
    eSims.classList.remove("open");
};
const eSims = document.getElementById("sims");
const eSimSelect = document.getElementById("sim-select");
eSimSelect.addEventListener("click", e => {
    if (eSims.classList.contains("open"))
        return closeSimulatorDropdown();
    eSims.classList.add("open");
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

const eSimParams = document.getElementById("sim-params");
const eSimParamsToggle = document.getElementById("sim-params-toggle");
eSimParamsToggle.addEventListener("click", e => {
    if (eSimParams.classList.contains("open"))
        eSimParams.classList.remove("open");
    else eSimParams.classList.add("open");
});

const createSimParameter = (sim, name, value, cast=parseFloat) => {
    const update = () => {
        elem.value = value;
    };
    const updateWorker = () => {
        if (simulator !== sim) return;
        worker.postMessage({ type: name, data: value });
    };
    const elem = document.getElementById(sim+"-"+name);
    elem.addEventListener("change", e => {
        value = cast(elem.value);
        update();
        updateWorker();
    });
    update();
    return {
        update: update,
        updateWorker: updateWorker,
        get value() { return value; },
    };
};

//// DIFFUSION
{
    context.addHandler("update-sim", () => {
        if (simulator !== "diffusion") return;
        penWeight = 25;
        updatePenWeight();
        updateWorkerPenWeight();
    });
}

//// PATTERN
{
    const createParameter = (name, value, cast=parseFloat) => createSimParameter("pattern", name, value, cast);

    const mode = createParameter("mode", 0, parseInt);
    const dt = createParameter("dt", 0.5);
    const rhoA = createParameter("rhoA", 0);
    const rhoI = createParameter("rhoI", 0);
    const cA = createParameter("cA", 1);
    const cI = createParameter("cI", 1);
    const k = createParameter("k", 0.2);
    const mu = createParameter("mu", 0.7);
    const nu = createParameter("nu", 1);

    context.addHandler("update-sim", () => {
        mode.updateWorker();
        dt.updateWorker();
        rhoA.updateWorker();
        rhoI.updateWorker();
        cA.updateWorker();
        cI.updateWorker();
        k.updateWorker();
        mu.updateWorker();
        nu.updateWorker();
        if (simulator !== "pattern") return;
        penWeight = 0.01;
        updatePenWeight();
        updateWorkerPenWeight();
    });
}
//// HEART
{
    const createParameter = (name, value, cast=parseFloat) => createSimParameter("heart", name, value, cast);

    const mode = createParameter("mode", 0, parseInt);
    const dt = createParameter("dt", 0.5);
    const r = createParameter("r", 2);
    const a = createParameter("a", 0.25);
    const epsilon = createParameter("epsilon", 0.075);
    const beta = createParameter("beta", 0.85);
    const D = createParameter("D", 0.5);

    context.addHandler("update-sim", () => {
        mode.updateWorker();
        dt.updateWorker();
        r.updateWorker();
        a.updateWorker();
        epsilon.updateWorker();
        beta.updateWorker();
        D.updateWorker();
        if (simulator !== "heart") return;
        penWeight = a.value / 2;
        updatePenWeight();
        updateWorkerPenWeight();
    });
}

//// SPACE

let spaceWidth = 100;
const eSpaceWidth = document.getElementById("space-width");
const updateSpaceWidth = () => {
    eSpaceWidth.value = spaceWidth;
};
const updateWorkerSpaceWidth = () => {
    updateSim();
};
eSpaceWidth.addEventListener("change", () => {
    spaceWidth = parseFloat(eSpaceWidth.value);
    updateSpaceWidth();
    updateWorkerSpaceWidth();
});
updateSpaceWidth();

let spaceHeight = 60;
const eSpaceHeight = document.getElementById("space-height");
const updateSpaceHeight = () => {
    eSpaceHeight.value = spaceHeight;
};
const updateWorkerSpaceHeight = () => {
    updateSim();
};
eSpaceHeight.addEventListener("change", () => {
    spaceHeight = parseFloat(eSpaceHeight.value);
    updateSpaceHeight();
    updateWorkerSpaceHeight();
});
updateSpaceHeight();

//// PEN

const savePenProfile = () => {
    return {
        size: penSize,
        weight: penWeight,
    };
};
const loadPenProfile = profile => {
    const { size, weight } = profile;
    if (size != null) {
        penSize = size;
        updatePenSize();
        updateWorkerPenSize();
    }
    if (weight != null) {
        penWeight = weight;
        updatePenWeight();
        updateWorkerPenWeight();
    }
};

let penSize = 3;
const ePenSizeInput = document.getElementById("pensize-input");
const ePenSizeRange = document.getElementById("pensize-range");
const updatePenSize = () => {
    ePenSizeInput.value = penSize;
    ePenSizeRange.value = penSize;
};
const updateWorkerPenSize = () => {
    worker.postMessage({ type: "pen-size", data: penSize });
};
ePenSizeInput.addEventListener("change", () => {
    penSize = parseFloat(ePenSizeInput.value);
    updatePenSize();
    updateWorkerPenSize();
});
ePenSizeRange.addEventListener("input", () => {
    penSize = parseFloat(ePenSizeRange.value);
    updatePenSize();
    updateWorkerPenSize();
});
updatePenSize();

let penWeight = 1;
const ePenWeightInput = document.getElementById("penweight-input");
const ePenWeightRange = document.getElementById("penweight-range");
const updatePenWeight = () => {
    ePenWeightInput.value = penWeight;
    ePenWeightRange.value = penWeight;
};
const updateWorkerPenWeight = () => {
    worker.postMessage({ type: "pen-weight", data: penWeight });
};
ePenWeightInput.addEventListener("change", () => {
    penWeight = parseFloat(ePenWeightInput.value);
    updatePenWeight();
    updateWorkerPenWeight();
});
ePenWeightRange.addEventListener("input", () => {
    penWeight = parseFloat(ePenWeightRange.value);
    updatePenWeight();
    updateWorkerPenWeight();
});
updatePenWeight();

//// METER

let meter = new util.V(20);
const updateMeter = () => {
    worker.postMessage({ type: "meter", data: meter.xy });
};

//// ACTIVE CHANNELS

let channels = 0;
let activeChannels = new Array(3).fill(true);
const updateActiveChannels = () => {
    activeChannels.forEach((active, i) => {
        const elem = document.getElementById("channel-active-"+i);
        if (active)
            elem.classList.add("active");
        else elem.classList.remove("active");
        elem.disabled = i >= channels;
    });
};
updateActiveChannels();
activeChannels.forEach((_, i) => {
    const elem = document.getElementById("channel-active-"+i);
    elem.addEventListener("click", e => {
        if (i >= channels) return;
        if (e.shiftKey) {
            for (let j = 0; j < activeChannels.length; j++)
                activeChannels[j] = false;
            activeChannels[i] = true;
        } else activeChannels[i] = !activeChannels[i];
        updateActiveChannels();
    });
});
let visibleChannels = new Array(3).fill(true);
const updateVisibleChannels = () => {
    visibleChannels.forEach((visible, i) => {
        const elem = document.getElementById("channel-visible-"+i);
        if (visible)
            elem.classList.add("active");
        else elem.classList.remove("active");
        elem.disabled = i >= channels;
    });
};
const updateWorkerVisibleChannels = () => {
    worker.postMessage({ type: "v-channels", data: visibleChannels });
};
updateVisibleChannels();
visibleChannels.forEach((_, i) => {
    const elem = document.getElementById("channel-visible-"+i);
    elem.addEventListener("click", e => {
        if (i >= channels) return;
        if (e.shiftKey) {
            for (let j = 0; j < visibleChannels.length; j++)
            visibleChannels[j] = false;
            visibleChannels[i] = true;
        } else visibleChannels[i] = !visibleChannels[i];
        updateVisibleChannels();
        updateWorkerVisibleChannels();
    });
});

//// ACTIVE TOOL

let toolProfiles = {};
let activeTool = "draw";
const updateActiveTool = () => {
    ["draw", "erase", "move", "meter"].forEach(tool => {
        const elem = document.getElementById("tool-"+tool);
        if (tool === activeTool)
            elem.classList.add("this");
        else elem.classList.remove("this");
    });
    ePenSizeInput.parentElement.style.display = ePenSizeRange.style.display = (activeTool === "meter") ? "none" : "";
    ePenWeightInput.parentElement.style.display = ePenWeightRange.style.display = (activeTool === "draw") ? "" : "none";
};
updateActiveTool();
["draw", "erase", "move", "meter"].forEach(tool => {
    const elem = document.getElementById("tool-"+tool);
    elem.addEventListener("click", e => {
        toolProfiles[activeTool] = savePenProfile();
        activeTool = tool;
        loadPenProfile(toolProfiles[activeTool] ?? {});
        updateActiveTool();
    });
});
document.body.addEventListener("keydown", e => {
    if (e.target instanceof HTMLInputElement) return;
    let codes = {
        "KeyD": "draw",
        "KeyE": "erase",
        "KeyW": "move",
        "KeyM": "meter",

        "Digit1": "draw",
        "Digit2": "erase",
        "Digit3": "move",
        "Digit4": "meter",
    };
    if (e.code in codes) {
        activeTool = codes[e.code];
        updateActiveTool();
        return;
    }
});

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

updateSim();
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
    eCanvas2Real.style.width = (eCanvas2Real.width * globalScale * canvas2ToCanvas) + "px";
    eCanvas2Real.style.height = (eCanvas2Real.height * globalScale * canvas2ToCanvas) + "px";

    const virtualToReal = [ctxReal.canvas.width / eCanvas.width, ctxReal.canvas.height / eCanvas.height];

    ctxReal.imageSmoothingEnabled = ctx2Real.imageSmoothingEnabled = false;

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
            ...new util.V(penSize).mul(virtualToReal).xy,
            0, 0, 2*Math.PI,
        );
        ctx2Real.closePath();
        ctxReal.stroke();
    }

    ctx2Real.clearRect(0, 0, ctx2Real.canvas.width, ctx2Real.canvas.height);
    ctx2Real.drawImage(eCanvas2, 0, 0, ctx2Real.canvas.width, ctx2Real.canvas.height);
};
update();

// 10, 0.1, a/2
