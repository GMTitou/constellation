const dots = Array.from(document.querySelectorAll(".dot"));
const playerPath = document.getElementById("playerPath");
const constellationPath = document.getElementById("constellationPath");

const undoBtn = document.getElementById("undo");
const resetBtn = document.getElementById("reset");
const toggleAnswerBtn = document.getElementById("toggleAnswer");

let selectedSegments = []; // Liste des segments [a,b] tracés par le joueur
let lastDot = null; // Dernier point cliqué
let showAnswer = false;

function percentToSvg(valuePercent) {
    return (valuePercent / 100) * 1000;
}

function getDotByN(n) {
    return dots.find(d => Number(d.dataset.n) === n);
}

function dotCenterToSvg(dotEl) {
    const left = parseFloat(dotEl.style.left);
    const top = parseFloat(dotEl.style.top);
    return [percentToSvg(left), percentToSvg(top)];
}

function drawSegmentsPath(pathEl, segments) {
    if (!pathEl) return;

    if (!segments || !segments.length) {
        pathEl.setAttribute("d", "");
        return;
    }

    const parts = [];
    for (const [a, b] of segments) {
        const da = getDotByN(a);
        const db = getDotByN(b);
        if (!da || !db) continue;

        const [x1, y1] = dotCenterToSvg(da);
        const [x2, y2] = dotCenterToSvg(db);
        parts.push(`M ${x1} ${y1} L ${x2} ${y2}`);
    }

    pathEl.setAttribute("d", parts.join(" "));
}

function segmentExists(a, b) {
    return selectedSegments.some(([x, y]) =>
        (x === a && y === b) || (x === b && y === a)
    );
}

function isSegmentValid(a, b) {
    // Vérifie si ce segment existe dans la constellation de référence
    if (!window.CONSTELLATION_SEGMENTS) return true;

    return window.CONSTELLATION_SEGMENTS.some(([x, y]) =>
        (x === a && y === b) || (x === b && y === a)
    );
}

function checkWin() {
    if (!window.CONSTELLATION_SEGMENTS) return false;

    // Le joueur gagne s'il a tracé tous les segments de la constellation
    if (selectedSegments.length !== window.CONSTELLATION_SEGMENTS.length) return false;

    return window.CONSTELLATION_SEGMENTS.every(([a, b]) => segmentExists(a, b));
}

function update() {
    drawSegmentsPath(playerPath, selectedSegments);

    // Marquer tous les points connectés
    const connectedDots = new Set();
    selectedSegments.forEach(([a, b]) => {
        connectedDots.add(a);
        connectedDots.add(b);
    });

    dots.forEach(dot => {
        const n = Number(dot.dataset.n);
        dot.classList.toggle("selected", connectedDots.has(n));
        dot.classList.toggle("last", lastDot && Number(lastDot.dataset.n) === n);
    });

    if (constellationPath) {
        constellationPath.setAttribute("opacity", showAnswer ? "1" : "0");
    }

    // Vérifier la victoire
    if (checkWin() && toggleAnswerBtn) {
        toggleAnswerBtn.textContent = "🎉 Bravo ! (afficher la constellation)";
    }
}

function handleDotClick(dot) {
    const n = Number(dot.dataset.n);

    if (!lastDot) {
        // Premier point cliqué
        lastDot = dot;
        update();
        return;
    }

    const lastN = Number(lastDot.dataset.n);

    if (n === lastN) {
        // Clic sur le même point : on le désélectionne
        lastDot = null;
        update();
        return;
    }

    // Vérifier si le segment existe déjà
    if (segmentExists(lastN, n)) {
        // Segment déjà tracé : on se déplace juste sur ce point
        lastDot = dot;
        update();
        return;
    }

    // Nouveau segment : on le trace
    selectedSegments.push([lastN, n]);
    lastDot = dot;
    update();
}

dots.forEach(dot => {
    dot.addEventListener("click", () => handleDotClick(dot));
});

if (undoBtn) {
    undoBtn.addEventListener("click", () => {
        if (selectedSegments.length > 0) {
            const lastSegment = selectedSegments.pop();
            // Remettre lastDot sur le début du dernier segment
            lastDot = getDotByN(lastSegment[0]);
            update();
        }
    });
}

if (resetBtn) {
    resetBtn.addEventListener("click", () => {
        selectedSegments = [];
        lastDot = null;
        showAnswer = false;
        if (toggleAnswerBtn) toggleAnswerBtn.textContent = "Afficher la constellation";
        update();
    });
}

if (toggleAnswerBtn) {
    toggleAnswerBtn.addEventListener("click", () => {
        showAnswer = !showAnswer;
        toggleAnswerBtn.textContent = showAnswer ? "Masquer la constellation" : "Afficher la constellation";
        update();
    });
}

// Dessine la "réponse constellation"
drawSegmentsPath(constellationPath, window.CONSTELLATION_SEGMENTS || []);
update();