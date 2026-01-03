const dots = document.querySelectorAll(".dot");
const path = document.getElementById("path");
const undoBtn = document.getElementById("undo");
const resetBtn = document.getElementById("reset");

let selected = [];

function percentToSvg(value) {
    return (value / 100) * 1000;
}

dots.forEach(dot => {
    dot.addEventListener("click", () => {
        const n = Number(dot.dataset.n);

        // Oblige l’ordre
        const expected = selected.length + 1;
        if (n !== expected) return;

        selected.push(dot);
        dot.classList.add("selected");
        drawPath();
    });
});

function drawPath() {
    if (selected.length === 0) {
        path.setAttribute("d", "");
        return;
    }

    const d = selected.map((dot, i) => {
        const x = percentToSvg(parseFloat(dot.style.left));
        const y = percentToSvg(parseFloat(dot.style.top));
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");

    path.setAttribute("d", d);
}

undoBtn.onclick = () => {
    const dot = selected.pop();
    if (dot) dot.classList.remove("selected");
    drawPath();
};

resetBtn.onclick = () => {
    selected.forEach(d => d.classList.remove("selected"));
    selected = [];
    drawPath();
};
