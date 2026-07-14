(function () {
  "use strict";

  const KIDS = {
    yaer: {
      name: "Yaer",
      avatar: "🦖",
      colors: { a: "#35c1e0", b: "#2e9de0" }
    },
    tamar: {
      name: "Tamar",
      avatar: "🦄",
      colors: { a: "#ff8fd6", b: "#c084fc" }
    }
  };

  const TASKS = [
    { id: "wake", label: "Wake up", emoji: "🌞" },
    { id: "modeh-ani", label: "Say Modeh Ani", emoji: "🙏" },
    { id: "wash-hands", label: "Wash hands", emoji: "🧼" },
    { id: "brush-teeth", label: "Brush teeth", emoji: "🦷" },
    { id: "get-dressed", label: "Get dressed", emoji: "👕" },
    { id: "make-bed", label: "Make bed", emoji: "🛏️" },
    { id: "eat-breakfast", label: "Eat breakfast", emoji: "🥣" },
    { id: "put-on-shoes", label: "Put on shoes", emoji: "👟" }
  ];

  const STORAGE_KEY = "sunrise-squad-v1";

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function yesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function loadState() {
    let raw;
    try {
      raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      raw = null;
    }
    if (!raw || typeof raw !== "object") raw = {};
    Object.keys(KIDS).forEach((kidId) => {
      if (!raw[kidId]) {
        raw[kidId] = { date: todayStr(), done: {}, streak: 0, lastFullDate: null, celebratedToday: false };
      }
    });
    return raw;
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const state = loadState();
  let currentKid = localStorage.getItem(STORAGE_KEY + "-current") || "yaer";

  // Roll over each kid's data if the day has changed.
  function rollOverIfNeeded(kidId) {
    const kidState = state[kidId];
    const today = todayStr();
    if (kidState.date === today) return;

    // Day changed: if yesterday wasn't fully completed, streak resets.
    if (kidState.lastFullDate !== yesterdayStr()) {
      kidState.streak = 0;
    }
    kidState.date = today;
    kidState.done = {};
    kidState.celebratedToday = false;
  }

  Object.keys(KIDS).forEach(rollOverIfNeeded);
  saveState();

  const todayLabelEl = document.getElementById("today-label");
  const kidPickerEl = document.getElementById("kid-picker");
  const taskListEl = document.getElementById("task-list");
  const progressFillEl = document.getElementById("progress-fill");
  const progressTextEl = document.getElementById("progress-text");
  const streakCountEl = document.getElementById("streak-count");
  const resetBtn = document.getElementById("reset-btn");
  const celebrationEl = document.getElementById("celebration");
  const celebrationTitleEl = document.getElementById("celebration-title");
  const celebrationCloseEl = document.getElementById("celebration-close");

  todayLabelEl.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  function applyKidTheme(kidId) {
    const c = KIDS[kidId].colors;
    document.documentElement.style.setProperty("--accent", c.a);
    document.documentElement.style.setProperty("--accent-b", c.b);
  }

  function renderKidPicker() {
    Array.from(kidPickerEl.querySelectorAll(".kid-btn")).forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.kid === currentKid);
    });
  }

  function renderTasks() {
    taskListEl.innerHTML = "";
    const kidState = state[currentKid];
    TASKS.forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item" + (kidState.done[task.id] ? " done" : "");
      li.dataset.taskId = task.id;
      li.innerHTML =
        '<span class="task-emoji">' + task.emoji + '</span>' +
        '<span class="task-label">' + task.label + '</span>' +
        '<span class="task-check">' + (kidState.done[task.id] ? "✓" : "") + '</span>';
      li.addEventListener("click", () => toggleTask(task.id, li));
      taskListEl.appendChild(li);
    });
    updateProgress();
  }

  function updateProgress() {
    const kidState = state[currentKid];
    const doneCount = TASKS.filter((t) => kidState.done[t.id]).length;
    const pct = Math.round((doneCount / TASKS.length) * 100);
    progressFillEl.style.width = pct + "%";
    progressTextEl.textContent = doneCount + " / " + TASKS.length + " done";
    streakCountEl.textContent = kidState.streak;
  }

  function toggleTask(taskId, li) {
    const kidState = state[currentKid];
    const nowDone = !kidState.done[taskId];
    kidState.done[taskId] = nowDone;
    li.classList.toggle("done", nowDone);
    if (nowDone) {
      li.classList.add("pop");
      setTimeout(() => li.classList.remove("pop"), 350);
      li.querySelector(".task-check").textContent = "✓";
      playChime(false);
    } else {
      li.querySelector(".task-check").textContent = "";
    }
    updateProgress();

    const allDone = TASKS.every((t) => kidState.done[t.id]);
    if (allDone && !kidState.celebratedToday) {
      kidState.celebratedToday = true;
      const today = todayStr();
      if (kidState.lastFullDate !== today) {
        kidState.streak += 1;
        kidState.lastFullDate = today;
      }
      updateProgress();
      celebrate();
    } else if (!allDone) {
      kidState.celebratedToday = false;
    }

    saveState();
  }

  function resetToday() {
    const kidState = state[currentKid];
    kidState.done = {};
    kidState.celebratedToday = false;
    saveState();
    renderTasks();
  }

  function celebrate() {
    celebrationTitleEl.textContent = "Great job, " + KIDS[currentKid].name + "!";
    celebrationEl.classList.add("show");
    launchConfetti();
    playChime(true);
  }

  celebrationCloseEl.addEventListener("click", () => {
    celebrationEl.classList.remove("show");
  });

  kidPickerEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".kid-btn");
    if (!btn) return;
    currentKid = btn.dataset.kid;
    localStorage.setItem(STORAGE_KEY + "-current", currentKid);
    applyKidTheme(currentKid);
    renderKidPicker();
    renderTasks();
  });

  resetBtn.addEventListener("click", resetToday);

  // ---- Sound: simple cheerful chime via Web Audio API (no asset files needed) ----
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
    }
    return audioCtx;
  }

  function playChime(big) {
    try {
      const ctx = getAudioCtx();
      const notes = big ? [523.25, 659.25, 783.99, 1046.5] : [880];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {
      // audio not available; fail silently
    }
  }

  // ---- Confetti ----
  const canvas = document.getElementById("confetti-canvas");
  const ctx2d = canvas.getContext("2d");
  let confettiPieces = [];
  let confettiAnimFrame = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  const CONFETTI_COLORS = ["#ff8fd6", "#c084fc", "#35c1e0", "#ffd166", "#06d6a0"];

  function launchConfetti() {
    const count = 120;
    confettiPieces = [];
    for (let i = 0; i < count; i++) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.3,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 3,
        size: 6 + Math.random() * 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10
      });
    }
    if (!confettiAnimFrame) animateConfetti();
    setTimeout(() => { confettiPieces = []; }, 3200);
  }

  function animateConfetti() {
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    confettiPieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;
      ctx2d.save();
      ctx2d.translate(p.x, p.y);
      ctx2d.rotate((p.rotation * Math.PI) / 180);
      ctx2d.fillStyle = p.color;
      ctx2d.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx2d.restore();
    });
    if (confettiPieces.length > 0) {
      confettiAnimFrame = requestAnimationFrame(animateConfetti);
    } else {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      confettiAnimFrame = null;
    }
  }

  // ---- init ----
  applyKidTheme(currentKid);
  renderKidPicker();
  renderTasks();
})();
