(() => {
    const board = document.querySelector(".board");
    if (!board) return;

    const dots = Array.from(document.querySelectorAll(".dot"));
    const playerPath = document.getElementById("playerPath");
    const answerPath = document.getElementById("constellationPath");

    const undoBtn = document.getElementById("undo");
    const resetBtn = document.getElementById("reset");
    const toggleAnswerBtn = document.getElementById("toggleAnswer");

    // Popup elements
    const popup = document.getElementById("popup");
    const popupTitle = document.getElementById("popupTitle");
    const popupText = document.getElementById("popupText");
    const popupClose = document.getElementById("popupClose");

    // Constellation definition (segments)
    const requiredSegments = (window.CONSTELLATION_SEGMENTS || []).map(([a, b]) => [
        Number(a),
        Number(b),
    ]);

    // ===== Helpers =====
    const getDotByN = (n) => dots.find((d) => Number(d.dataset.n) === Number(n));
    const percentToViewBox = (pct) => (pct / 100) * 1000;

    const getDotPos = (dotEl) => {
        const left = parseFloat(dotEl.style.left);
        const top = parseFloat(dotEl.style.top);
        return { x: percentToViewBox(left), y: percentToViewBox(top) };
    };

    const segKeyUndirected = (a, b) => {
        const x = Math.min(a, b);
        const y = Math.max(a, b);
        return `${x}-${y}`;
    };

    // ===== Popup (contenu lu depuis le HTML) =====
    const readPopupContent = (kind) => {
        // kind: "info" | "success" | "answer"
        if (!popup) return { title: "", text: "" };
        return {
            title: popup.dataset[`${kind}Title`] || "",
            text: popup.dataset[`${kind}Text`] || "",
        };
    };

    const showPopup = (type, kind) => {
        if (!popup) return;

        const { title, text } = readPopupContent(kind);

        popup.classList.remove("success", "info");
        popup.classList.add(type);

        if (popupTitle) popupTitle.textContent = title;
        if (popupText) popupText.textContent = text;

        popup.classList.add("show");
    };

    const hidePopup = () => popup?.classList.remove("show");
    popupClose?.addEventListener("click", hidePopup);

    // ===== Player drawing state =====
    let clicked = [];
    let answerVisible = false;
    let popupLocked = false; // évite de ré-afficher 50 fois

    const updateDotStates = () => {
        dots.forEach((d) => d.classList.remove("selected", "last"));

        clicked.forEach((n) => {
            const el = getDotByN(n);
            if (el) el.classList.add("selected");
        });

        const last = getDotByN(clicked[clicked.length - 1]);
        if (last) last.classList.add("last");
    };

    const updatePlayerPath = () => {
        if (!playerPath) return;

        if (clicked.length < 2) {
            playerPath.setAttribute("d", "");
            return;
        }

        const pts = clicked
            .map((n) => getDotByN(n))
            .filter(Boolean)
            .map(getDotPos);

        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x} ${pts[i].y}`;
        playerPath.setAttribute("d", d);
    };

    const computePlayerSegmentSet = () => {
        const set = new Set();
        for (let i = 0; i < clicked.length - 1; i++) {
            set.add(segKeyUndirected(clicked[i], clicked[i + 1]));
        }
        return set;
    };

    const computeRequiredSegmentSet = () => {
        const set = new Set();
        requiredSegments.forEach(([a, b]) => set.add(segKeyUndirected(a, b)));
        return set;
    };

    const isCompleted = () => {
        const req = computeRequiredSegmentSet();
        const got = computePlayerSegmentSet();
        for (const key of req) {
            if (!got.has(key)) return false;
        }
        return req.size > 0;
    };

    // ===== Answer drawing =====
    const drawAnswerPath = () => {
        if (!answerPath) return;

        let d = "";
        requiredSegments.forEach(([a, b]) => {
            const A = getDotByN(a);
            const B = getDotByN(b);
            if (!A || !B) return;

            const pA = getDotPos(A);
            const pB = getDotPos(B);
            d += `M ${pA.x} ${pA.y} L ${pB.x} ${pB.y} `;
        });

        answerPath.setAttribute("d", d.trim());
    };

    const setAnswerVisible = (visible) => {
        answerVisible = visible;
        if (!answerPath) return;

        if (visible) {
            drawAnswerPath();
            answerPath.style.opacity = "1";
        } else {
            answerPath.style.opacity = "0";
        }
    };

    // ===== Events =====
    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const n = Number(dot.dataset.n);
            if (!n) return;

            if (clicked.length && clicked[clicked.length - 1] === n) return;

            clicked.push(n);
            updateDotStates();
            updatePlayerPath();

            // ✅ Quand c'est complété -> popup DESCRIPTION (info)
            if (!popupLocked && isCompleted()) {
                popupLocked = true;
                showPopup("info", "info"); // ✅ description
            }
        });
    });

    undoBtn?.addEventListener("click", () => {
        clicked.pop();
        updateDotStates();
        updatePlayerPath();
    });

    resetBtn?.addEventListener("click", () => {
        clicked = [];
        popupLocked = false;
        hidePopup();
        updateDotStates();
        updatePlayerPath();
    });

    toggleAnswerBtn?.addEventListener("click", () => {
        const next = !answerVisible;
        setAnswerVisible(next);

        // ✅ Quand on affiche la constellation -> popup DESCRIPTION (info)
        if (next) showPopup("info", "info"); // ✅ description
        else hidePopup();
    });

    // init
    setAnswerVisible(false);
    updateDotStates();
    updatePlayerPath();
})();
