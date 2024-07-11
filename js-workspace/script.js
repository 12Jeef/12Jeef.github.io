for (let length = 1; length < 25; length++) {
    const eInfo = document.createElement("p");
    document.body.appendChild(eInfo);
    eInfo.style.fontFamily = "monospace";
    const worker = new Worker("./workerscript.js");
    worker.postMessage({
        length: length,
        prob: { f: 0.5, b: 0.5 },
        trials: 1e6,
    });
    worker.addEventListener("message", e => {
        const { type, output } = e.data;
        if (type == "message") {
            eInfo.textContent = `Worker ${length} @ ${output}`;
            return;
        }
        if (type == "output") {
            const { sims, simsAvg } = output;
            eInfo.textContent = `Worker ${length} : simsAvg = ${simsAvg}`;
            return;
        }
    });
}