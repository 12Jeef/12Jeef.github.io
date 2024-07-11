self.addEventListener("message", e => {
    const { length, prob, trials } = e.data;
    const { f, b } = prob;
    const sim = () => {
        let x = 0, n = 0;
        while (x < length) {
            n++;
            x = Math.max(x, 0);
            let prob = Math.random();
            if (prob < f) {
                x++;
                continue;
            }
            prob -= f;
            if (prob < b) {
                x--;
                continue;
            }
            prob -= b;
        }
        return n;
    };
    let sims = [];
    let simsAvg = 0;
    for (let i = 0; i < trials; i++) {
        let n = sim();
        // sims.push(n);
        simsAvg += n / trials;
        if (i % 1000 == 0) self.postMessage({ type: "message", output: i });
    }
    self.postMessage({ type: "output", output: { sims: sims, simsAvg: simsAvg } });
});