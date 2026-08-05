// --- Stars ---
let _uid = 0;
const STAR_PTS =
  "10,1 12.2,6.9 18.6,7.2 13.6,11.2 15.3,17.3 10,13.8 4.7,17.3 6.4,11.2 1.4,7.2 7.8,6.9";
const NS = "http://www.w3.org/2000/svg";

function el(tag, attrs = {}) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

function makeStar(fillType, uid) {
  const svg = el("svg", {
    viewBox: "0 0 20 20",
    width: "9",
    height: "9",
    "aria-hidden": "true",
  });
  svg.classList.add("star");

  if (fillType === "empty") {
    svg.appendChild(
      el("polygon", {
        points: STAR_PTS,
        fill: "#f5f4f1",
        stroke: "#ccc8c4",
        "stroke-width": "1.2",
        "stroke-linejoin": "round",
      }),
    );
  } else if (fillType === "full") {
    svg.classList.add("filled");
    const defs = el("defs");
    const grad = el("linearGradient", {
      id: `sg-${uid}`,
      x1: "0%",
      y1: "0%",
      x2: "0%",
      y2: "100%",
    });
    grad.append(
      el("stop", { offset: "0%", "stop-color": "#e8c060" }),
      el("stop", { offset: "100%", "stop-color": "#c07428" }),
    );
    defs.append(grad);
    svg.append(defs);
    svg.appendChild(
      el("polygon", {
        points: STAR_PTS,
        fill: `url(#sg-${uid})`,
        stroke: "#a8661a",
        "stroke-width": "0.6",
        "stroke-linejoin": "round",
      }),
    );
  } else if (fillType === "half") {
    svg.classList.add("filled");
    const defs = el("defs");
    const grad = el("linearGradient", {
      id: `sg-${uid}`,
      x1: "0%",
      y1: "0%",
      x2: "0%",
      y2: "100%",
    });
    grad.append(
      el("stop", { offset: "0%", "stop-color": "#e8c060" }),
      el("stop", { offset: "100%", "stop-color": "#c07428" }),
    );
    const clipL = el("clipPath", { id: `cl-${uid}` });
    clipL.appendChild(el("rect", { x: "0", y: "0", width: "10", height: "20" }));
    const clipR = el("clipPath", { id: `cr-${uid}` });
    clipR.appendChild(
      el("rect", { x: "10", y: "0", width: "10", height: "20" }),
    );
    defs.append(grad, clipL, clipR);
    svg.append(defs);
    svg.append(
      el("polygon", {
        points: STAR_PTS,
        fill: "#f5f4f1",
        stroke: "#ccc8c4",
        "stroke-width": "1.2",
        "stroke-linejoin": "round",
        "clip-path": `url(#cr-${uid})`,
      }),
      el("polygon", {
        points: STAR_PTS,
        fill: `url(#sg-${uid})`,
        "clip-path": `url(#cl-${uid})`,
        stroke: "none",
      }),
      el("polygon", {
        points: STAR_PTS,
        fill: "none",
        stroke: "#a8661a",
        "stroke-width": "0.6",
        "stroke-linejoin": "round",
        "clip-path": `url(#cl-${uid})`,
      }),
    );
  }
  return svg;
}

function buildStars(rating) {
  const row = document.createElement("div");
  row.className = "stars-row";
  const group = document.createElement("div");
  group.className = "stars-group";
  for (let i = 1; i <= 5; i++) {
    const fill = rating - (i - 1);
    _uid++;
    group.appendChild(
      makeStar(fill >= 1 ? "full" : fill >= 0.5 ? "half" : "empty", _uid),
    );
  }
  row.append(group);
  return row;
}

// --- Card rendering from data.json ---
function buildCard(item) {
  const card = document.createElement("div");
  card.className = `card ${item.type.toLowerCase()}`;
  card.dataset.rating = item.rating;

  const cover = document.createElement("div");
  cover.className = "cover";
  const img = document.createElement("img");
  img.src = item.cover;
  img.alt = "";
  img.loading = "lazy";
  img.decoding = "async";
  cover.appendChild(img);

  const info = document.createElement("div");
  info.className = "info";

  const statusBar = document.createElement("div");
  statusBar.className = "status-bar";
  const status = document.createElement("span");
  status.className = `status ${item.status.toLowerCase()}`;
  status.textContent = item.status;
  const typeLabel = document.createElement("span");
  typeLabel.className = "type-label";
  typeLabel.textContent = item.type;
  statusBar.append(status, typeLabel);

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = item.title;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = item.creator;

  info.append(statusBar, title, meta, buildStars(item.rating));
  card.append(cover, info);
  return card;
}

function render(data) {
  const timeline = document.getElementById("timeline");
  const years = [...new Set(data.map((d) => d.year))].sort((a, b) => b - a);
  years.forEach((year) => {
    const section = document.createElement("div");
    section.className = "year-section";
    const label = document.createElement("div");
    label.className = "year-label";
    label.textContent = year;
    const grid = document.createElement("div");
    grid.className = "grid";
    data
      .filter((d) => d.year === year)
      .forEach((item) => grid.appendChild(buildCard(item)));
    section.append(label, grid);
    timeline.appendChild(section);
  });
}

// --- Animation ---
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const EASE = "cubicBezier(0.16, 1, 0.3, 1)";
const DISTANCE = 10;

function hold(els) {
  els.forEach((el) => el.classList.add("is-revealing"));
  anime.set(els, { opacity: 0, translateY: DISTANCE });
  return els;
}

function reveal(els, { duration, stagger, start = 0 }) {
  anime({
    targets: els,
    opacity: [0, 1],
    translateY: [DISTANCE, 0],
    duration,
    delay: anime.stagger(stagger, { start }),
    easing: EASE,
    complete: () => {
      els.forEach((el) => {
        el.style.transform = "";
        el.style.opacity = "";
        el.classList.remove("is-revealing");
      });
    },
  });
}

function holdTimeline() {
  document.querySelectorAll(".year-section").forEach((s) => {
    hold([s.querySelector(".year-label"), ...s.querySelectorAll(".card")]);
  });
}

function animateTimeline() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        reveal([entry.target.querySelector(".year-label")], {
          duration: 700,
          stagger: 0,
        });
        reveal([...entry.target.querySelectorAll(".card")], {
          duration: 800,
          stagger: 55,
          start: 90,
        });
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
  );
  document
    .querySelectorAll(".year-section")
    .forEach((s) => observer.observe(s));
}

if (!reduceMotion) {
  const header = hold([
    document.querySelector("h1"),
    document.querySelector(".subtitle"),
    document.querySelector(".nav__viz"),
  ]);
  document.fonts.ready.then(() =>
    reveal(header, { duration: 900, stagger: 90 }),
  );
}

fetch("data.json")
  .then((r) => r.json())
  .then((data) => {
    render(data);
    if (reduceMotion) return;
    holdTimeline();
    document.fonts.ready.then(animateTimeline);
  })
  .catch((err) => {
    console.error("Failed to load archive data:", err);
    document.getElementById("timeline").innerHTML =
      '<p style="text-align:center;color:var(--text-muted)">Could not load archive data.</p>';
  });
