gsap.registerPlugin(ScrollTrigger);

// Themes
const THEMES = {
  light: {
    url: "mapbox://styles/mapbox/light-v11",
    filter: "none",
    vars: {
      "--bg": "#f4f1ea",
      "--bone": "#1a1a1a",
      "--silver": "rgba(26, 26, 26, 0.7)",
      "--dim": "#d1cdc4",
      "--border": "rgba(26, 26, 26, 0.15)",
      "--glass": "rgba(244, 241, 234, 0.85)",
      "--vignette-bg":
        "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(244, 241, 234, 0.7) 100%)",
      "--grain-bg":
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      "--grain-op": "0.05",
      "--intro-bg": "#f4f1ea",
    },
  },
  original: {
    url: "mapbox://styles/mapbox/dark-v11",
    filter: "sepia(0.35) contrast(1.15) brightness(0.85)",
    vars: {
      "--bg": "#06080a",
      "--bone": "#dedad2",
      "--silver": "#5a6668",
      "--dim": "#354042",
      "--border": "rgba(90, 102, 104, 0.25)",
      "--glass": "rgba(6, 8, 10, 0.85)",
      "--vignette-bg":
        "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(6, 8, 10, 0.8) 100%)",
      "--grain-bg":
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      "--grain-op": "0.12",
      "--intro-bg": "#06080a",
    },
  },
  satellite: {
    url: "mapbox://styles/mapbox/satellite-v9",
    filter: "grayscale(0.6) sepia(0.2) contrast(1.1)",
    vars: {
      "--bg": "#06080a",
      "--bone": "#dedad2",
      "--silver": "#5a6668",
      "--dim": "#354042",
      "--border": "rgba(90, 102, 104, 0.25)",
      "--glass": "rgba(6, 8, 10, 0.85)",
      "--vignette-bg":
        "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(6, 8, 10, 0.8) 100%)",
      "--grain-bg": "none",
      "--grain-op": "0",
      "--intro-bg": "transparent",
    },
  },
};

// State
let narrativeData = [];
let routeGeoJSON = null;
let activeChapterIndex = -1;
let currentRevealIndex = -1;
let introDismissed = false;
let flyInProgress = false;
let typewriterTimer = null;
let lineDrawRaf = null;

const mapReady = new Promise((resolve) => {
  if (map.loaded()) resolve();
  else map.once("load", resolve);
});

function getThemeVar(prop) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(prop)
    .trim();
}

async function init() {
  try {
    const [narrative, route] = await Promise.all([
      fetch("data/narrative.json").then((r) => r.json()),
      fetch("data/route.geojson").then((r) => r.json()),
    ]);
    narrativeData = narrative;
    routeGeoJSON = route;
    renderChapters();
    setupMapLayers();
    setupScrollAnimations();
    setupUIListeners();
  } catch (err) {
    console.error(err);
  }
}

function renderChapters() {
  const container = document.getElementById("story-panel");
  const bottomSpacer = container.querySelector(".outro-spacer");

  narrativeData.forEach((chapter, index) => {
    const section = document.createElement("div");
    section.className = "chapter";
    section.id = chapter.triggerId;
    section.dataset.index = index;

    const proseCard = document.createElement("div");
    proseCard.className = "prose-card";

    const contentWrapper = document.createElement("div");
    contentWrapper.style.filter = "url(#inkbleed)";

    contentWrapper.innerHTML = `
      <div class="frag-id">${chapter.chapterLabel}</div>
      <span class="loc-tag">${chapter.location}</span>
    `;

    const img = document.createElement("img");
    img.src = `data/ch${index + 1}.png`;
    img.className = "chapter-img";
    img.onerror = function () {
      this.remove();
    };
    contentWrapper.appendChild(img);

    const textDiv = document.createElement("div");
    textDiv.innerHTML = chapter.content.map((p) => `<p>${p}</p>`).join("");
    contentWrapper.appendChild(textDiv);

    proseCard.appendChild(contentWrapper);
    section.appendChild(proseCard);
    container.insertBefore(section, bottomSpacer);

    // Initial state for the sweep-in animation
    gsap.set(proseCard, { opacity: 0, x: -32, clipPath: "inset(0 100% 0 0)" });
  });
}

function setupMapLayers() {
  const addLayers = () => {
    const bgColor = getThemeVar("--bg") || "#f4f1ea";
    const boneColor = getThemeVar("--bone") || "#1a1a1a";
    const allCoords = routeGeoJSON.features[0].geometry.coordinates;
    const allPointsGeoJSON = {
      type: "FeatureCollection",
      features: allCoords.map((coord, i) => ({
        type: "Feature",
        properties: { index: i },
        geometry: { type: "Point", coordinates: coord },
      })),
    };
    const emptyFC = { type: "FeatureCollection", features: [] };

    if (!map.getSource("route"))
      map.addSource("route", { type: "geojson", data: routeGeoJSON });
    if (!map.getSource("route-ghost"))
      map.addSource("route-ghost", { type: "geojson", data: allPointsGeoJSON });
    if (!map.getSource("route-reveal"))
      map.addSource("route-reveal", { type: "geojson", data: emptyFC });
    if (!map.getSource("route-visited"))
      map.addSource("route-visited", { type: "geojson", data: emptyFC });

    if (!map.getLayer("route-ghost-line")) {
      map.addLayer({
        id: "route-ghost-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": boneColor,
          "line-width": 1,
          "line-dasharray": [1, 5],
          "line-opacity": 0.15,
        },
      });
    }
    if (!map.getLayer("route-ghost-points")) {
      map.addLayer({
        id: "route-ghost-points",
        type: "circle",
        source: "route-ghost",
        paint: {
          "circle-radius": 2.5,
          "circle-color": bgColor,
          "circle-stroke-width": 1,
          "circle-stroke-color": boneColor,
          "circle-opacity": 0.3,
          "circle-stroke-opacity": 0.3,
        },
      });
    }
    if (!map.getLayer("route-line")) {
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route-reveal",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": boneColor,
          "line-width": 2,
          "line-opacity": 0.9,
        },
      });
    }
    if (!map.getLayer("route-points")) {
      map.addLayer({
        id: "route-points",
        type: "circle",
        source: "route-visited",
        paint: {
          "circle-radius": ["case", ["get", "isCurrent"], 6, 3.5],
          "circle-color": bgColor,
          "circle-stroke-width": ["case", ["get", "isCurrent"], 2, 1.5],
          "circle-stroke-color": boneColor,
        },
      });
    }
    if (currentRevealIndex >= 0) revealRoute(currentRevealIndex, false);
  };
  if (map.loaded()) addLayers();
  else map.on("load", addLayers);
  map.on("style.load", addLayers);
}

function revealRoute(targetIndex, animate = true) {
  const coords = routeGeoJSON.features[0].geometry.coordinates;

  if (lineDrawRaf) cancelAnimationFrame(lineDrawRaf);

  const startIndex = Math.max(currentRevealIndex, 0);
  const endIndex = Math.min(targetIndex + 1, coords.length - 1);
  currentRevealIndex = targetIndex;

  if (!animate || startIndex >= endIndex) {
    flushLine(coords, endIndex);
    flushPoints(coords, targetIndex);
    return;
  }

  const duration = 900;
  const startTime = performance.now();

  const tick = (now) => {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const currentEnd = Math.round(startIndex + (endIndex - startIndex) * eased);
    flushLine(coords, currentEnd);
    if (t < 1) {
      lineDrawRaf = requestAnimationFrame(tick);
    } else {
      flushPoints(coords, targetIndex);
      lineDrawRaf = null;
    }
  };

  lineDrawRaf = requestAnimationFrame(tick);
}

function flushLine(coords, endIndex) {
  const lineSource = map.getSource("route-reveal");
  if (!lineSource) return;
  const visibleCoords = coords.slice(0, endIndex + 1);
  if (visibleCoords.length < 2) return;
  lineSource.setData({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: visibleCoords },
      },
    ],
  });
}

function flushPoints(coords, targetIndex) {
  const pointsSource = map.getSource("route-visited");
  if (!pointsSource) return;
  pointsSource.setData({
    type: "FeatureCollection",
    features: coords.slice(0, targetIndex + 1).map((coord, i) => ({
      type: "Feature",
      properties: { isCurrent: i === targetIndex },
      geometry: { type: "Point", coordinates: coord },
    })),
  });
}

function startAmbientDrift(chapter, forIndex) {
  if (activeChapterIndex !== forIndex) return;
  map.easeTo({
    bearing: (chapter.bearing || 0) + 9,
    pitch: Math.min((chapter.pitch || 45) + 4, 65),
    duration: 14000,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
}

function setupScrollAnimations() {
  narrativeData.forEach((chapter, index) => {
    ScrollTrigger.create({
      trigger: `#${chapter.triggerId}`,
      scroller: "#story-panel",
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        updateActiveChapter(index);
        animateCardIn(chapter.triggerId);
      },
      onEnterBack: () => {
        updateActiveChapter(index);
        animateCardIn(chapter.triggerId);
      },
    });
  });

  gsap.to("#outro-screen", {
    scrollTrigger: {
      trigger: ".outro-spacer",
      scroller: "#story-panel",
      start: "top bottom",
      end: "top top",
      scrub: true,
      onUpdate: (self) => {
        const activeTheme =
          document.querySelector(".style-btn.active").dataset.style;
        const mapEl = document.getElementById("map");
        const blurVal = self.progress * 4;
        if (activeTheme === "satellite") {
          mapEl.style.filter = `${THEMES.satellite.filter} blur(${blurVal}px)`;
        }
        gsap.set("#outro-content-container", {
          scale: 0.95 + self.progress * 0.05,
        });
      },
    },
    opacity: 1,
    visibility: "visible",
    ease: "none",
  });
}

// Sweep in from the left
function animateCardIn(triggerId) {
  const card = document.querySelector(`#${triggerId} .prose-card`);
  if (!card) return;
  gsap.fromTo(
    card,
    { opacity: 0, x: -32, clipPath: "inset(0 100% 0 0)" },
    {
      opacity: 1,
      x: 0,
      clipPath: "inset(0 0% 0 0)",
      duration: 0.9,
      ease: "expo.out",
      overwrite: true,
    },
  );
}

function typewriterCoord(text) {
  const el = document.getElementById("hud-coord");
  if (!el) return;
  if (typewriterTimer) clearInterval(typewriterTimer);
  el.innerText = "";
  let i = 0;
  typewriterTimer = setInterval(() => {
    el.innerText = text.slice(0, ++i);
    if (i >= text.length) clearInterval(typewriterTimer);
  }, 28);
}

async function updateActiveChapter(index) {
  if (activeChapterIndex === index) return;
  activeChapterIndex = index;
  const chapter = narrativeData[index];

  await mapReady;

  if (flyInProgress) map.stop();
  flyInProgress = true;

  map.flyTo({
    center: chapter.center,
    zoom: chapter.zoom,
    pitch: chapter.pitch,
    bearing: chapter.bearing,
    duration: 3500,
    speed: 0.8,
    curve: 1.2,
    essential: true,
  });

  map.once("moveend", () => {
    flyInProgress = false;
    startAmbientDrift(chapter, index);
  });

  revealRoute(index, true);

  document.getElementById("hud-chapter").innerText =
    chapter.title.toUpperCase();
  typewriterCoord(
    `LAT ${chapter.center[1].toFixed(4)}° N, LNG ${chapter.center[0].toFixed(4)}° E`,
  );
}

// dismissIntro only fades the overlay and scrolls the panel.

function setupUIListeners() {
  const intro = document.getElementById("intro-screen");
  const panel = document.getElementById("story-panel");

  const dismissIntro = () => {
    if (introDismissed) return;
    introDismissed = true;

    const mapEl = document.getElementById("map");
    const activeThemeKey =
      document.querySelector(".style-btn.active").dataset.style;
    mapEl.style.filter = THEMES[activeThemeKey].filter;

    gsap.to(intro, {
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: () => {
        intro.style.visibility = "hidden";
        intro.style.pointerEvents = "none";
      },
    });

    const firstChapter = document.getElementById("chap-0");
    if (firstChapter) {
      setTimeout(() => {
        firstChapter.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 180);
    }
  };

  intro.addEventListener("click", dismissIntro);

  const onPanelScroll = () => {
    if (panel.scrollTop > 20 && !introDismissed) {
      dismissIntro();
      panel.removeEventListener("scroll", onPanelScroll);
    }
  };
  panel.addEventListener("scroll", onPanelScroll, { passive: true });

  intro.addEventListener(
    "wheel",
    () => {
      if (!introDismissed) dismissIntro();
    },
    { once: true, passive: true },
  );

  intro.addEventListener(
    "touchmove",
    () => {
      if (!introDismissed) dismissIntro();
    },
    { once: true, passive: true },
  );

  window.addEventListener("keydown", (e) => {
    const forward = ["ArrowDown", "ArrowRight", " ", "PageDown", "Enter"];
    const backward = ["ArrowUp", "ArrowLeft", "PageUp"];
    if (!introDismissed) {
      if (forward.includes(e.key)) {
        e.preventDefault();
        dismissIntro();
      }
      return;
    }
    if (forward.includes(e.key)) {
      e.preventDefault();
      panel.scrollBy({ top: window.innerHeight, behavior: "smooth" });
    } else if (backward.includes(e.key)) {
      e.preventDefault();
      panel.scrollBy({ top: -window.innerHeight, behavior: "smooth" });
    }
  });

  document.querySelectorAll(".style-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const themeKey = e.target.dataset.style;
      applyTheme(themeKey);
      document
        .querySelectorAll(".style-btn")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
    });
  });
}

function applyTheme(key) {
  const t = THEMES[key];
  const mapEl = document.getElementById("map");
  const introContent = document.getElementById("intro-content-container");
  const outroContent = document.getElementById("outro-content-container");

  for (const [prop, value] of Object.entries(t.vars)) {
    document.documentElement.style.setProperty(prop, value);
  }

  gsap.to(mapEl, {
    opacity: 0,
    duration: 0.35,
    onComplete: () => {
      let currentFilter = t.filter;
      if (key === "satellite") {
        introContent.classList.add("satellite-text-bg");
        outroContent.classList.add("satellite-text-bg");
        if (!introDismissed) {
          currentFilter += " blur(3px)";
          map.flyTo({ center: [-1.5, 52.5], zoom: 5.5, duration: 0 });
        }
      } else {
        introContent.classList.remove("satellite-text-bg");
        outroContent.classList.remove("satellite-text-bg");
      }
      mapEl.style.filter = currentFilter;
      map.setStyle(t.url);
      map.once("style.load", () => {
        gsap.to(mapEl, { opacity: 1, duration: 0.6 });
      });
    },
  });
}

map.on("move", () => {
  if (!map.loaded()) return;
  const bearing = map.getBearing();
  const compass = document.getElementById("compass-svg");
  if (compass) compass.style.transform = `rotate(${bearing * -1}deg)`;
});

init();
