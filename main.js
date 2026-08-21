let currentPage = "page-projects";

const projectsRadio = document.getElementById("control-projects");
if (projectsRadio) projectsRadio.checked = true;

function whenIdle(fn) {
  if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 2000 });
  else setTimeout(fn, 200);
}

let animePromise;
function loadAnime() {
  if (!animePromise) {
    animePromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "anime.min.js";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return animePromise;
}

let cvFontsRequested = false;
function loadCVFonts() {
  if (cvFontsRequested) return;
  cvFontsRequested = true;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "fonts-cv.css";
  document.head.appendChild(link);
}

function initLazyVideos() {
  const videos = document.querySelectorAll("video[data-src]");
  if (!videos.length) return;

  const queue = [];
  let draining = false;

  const attach = (video) => {
    const src = video.dataset.src;
    delete video.dataset.src;
    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      video.addEventListener(
        "loadeddata",
        () => {
          video.classList.add("loaded");
          finish();
        },
        { once: true },
      );
      video.addEventListener("error", finish, { once: true });
      setTimeout(finish, 1200);

      const source = document.createElement("source");
      source.src = src;
      source.type = src.endsWith(".webm") ? "video/webm" : "video/mp4";
      video.appendChild(source);
      video.load();
      video.play().catch(() => {});
    });
  };

  async function drain() {
    if (draining) return;
    draining = true;
    while (queue.length) await attach(queue.shift());
    draining = false;
  }

  const enqueue = (video) => {
    if (!video.dataset.src) return;
    queue.push(video);
    drain();
  };

  if (!("IntersectionObserver" in window)) {
    videos.forEach(enqueue);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (video.dataset.src) enqueue(video);
          else video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      });
    },
    { rootMargin: "300px" },
  );
  videos.forEach((video) => observer.observe(video));
}

function startVideos() {
  const c = navigator.connection;
  if (c && (c.saveData || /2g/.test(c.effectiveType || ""))) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  initLazyVideos();
}

function fitOverlayText() {
  document
    .querySelectorAll(".page-projects .grid__overlay")
    .forEach((overlay) => {
      let fit = 1;
      overlay.style.setProperty("--fit", fit);
      while (fit > 0.6 && overlay.scrollHeight > overlay.clientHeight + 1) {
        fit -= 0.02;
        overlay.style.setProperty("--fit", fit.toFixed(2));
      }
    });
}

let fitResizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(fitResizeTimer);
  fitResizeTimer = setTimeout(() => {
    if (currentPage === "page-projects") fitOverlayText();
  }, 150);
});

function animateProjectsGrid() {
  const grid = document.querySelector(".page-projects");
  if (!grid) return;
  const items = grid.querySelectorAll(".grid__item");
  items.forEach((el) => (el.style.animation = "none"));
  void grid.offsetWidth;
  items.forEach((el) => (el.style.animation = ""));
  fitOverlayText();
}

function animateCVSections() {
  const sections = document.querySelectorAll(".cv-section");
  anime.set(sections, { opacity: 0, translateY: 20 });
  anime({
    targets: sections,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 200,
    delay: anime.stagger(100),
    easing: "easeOutQuad",
  });
}

function animateAboutPage() {
  const profileImg = document.querySelector(".about-profile-image");
  const intro = document.querySelector(".about-intro");
  anime.set(profileImg, { opacity: 0, scale: 0.8 });
  anime.set(intro, { opacity: 0, translateY: 20 });

  const runProfileAnim = () =>
    anime({
      targets: profileImg,
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 800,
      easing: "easeOutQuad",
    });

  if (profileImg.dataset.src) {
    profileImg.addEventListener("load", runProfileAnim, { once: true });
    profileImg.src = profileImg.dataset.src;
    delete profileImg.dataset.src;
  } else if (profileImg.complete) {
    runProfileAnim();
  } else {
    profileImg.addEventListener("load", runProfileAnim, { once: true });
  }

  anime({
    targets: intro,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 800,
    delay: 200,
    easing: "easeOutQuad",
  });
}

function revealPage(newPage) {
  setTimeout(() => {
    if (newPage === "page-projects") animateProjectsGrid();
    else if (newPage === "page-cv") animateCVSections();
    else if (newPage === "page-about") animateAboutPage();
  }, 50);
}

function switchPageInstantly(newPage) {
  const oldPageEl = document.querySelector(`.${currentPage}`);
  const newPageEl = document.querySelector(`.${newPage}`);
  if (oldPageEl) oldPageEl.classList.add("grid--hidden");
  if (newPageEl) newPageEl.classList.remove("grid--hidden");
  currentPage = newPage;
}

document.querySelectorAll(".control__radio").forEach((radio) => {
  radio.addEventListener("change", async function () {
    if (!this.checked) return;
    const newPage = this.value;
    if (newPage !== "page-projects") loadCVFonts();

    try {
      await loadAnime();
    } catch (e) {
      switchPageInstantly(newPage);
      return;
    }

    const oldPageEl = document.querySelector(`.${currentPage}`);
    const newPageEl = document.querySelector(`.${newPage}`);

    anime({
      targets: oldPageEl,
      scale: [1, 0.95],
      opacity: [1, 0],
      rotateX: [0, -10],
      duration: 260,
      easing: "easeInCubic",
      complete: () => {
        if (oldPageEl) oldPageEl.classList.add("grid--hidden");
        if (newPageEl) newPageEl.classList.remove("grid--hidden");

        anime({
          targets: newPageEl,
          scale: [1.05, 1],
          opacity: [0, 1],
          rotateX: [10, 0],
          duration: 375,
          easing: "easeOutExpo",
          complete: () => {
            currentPage = newPage;
            revealPage(newPage);
          },
        });
      },
    });
  });
});

const nav = document.querySelector(".control--grids");
if (nav) {
  nav.addEventListener("pointerenter", () => loadAnime().catch(() => {}), {
    once: true,
  });
}

const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const dark = document.documentElement.classList.toggle("dark-mode");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch (e) {}
  });
}

window.addEventListener("load", () => {
  whenIdle(() => {
    document.fonts.ready.then(fitOverlayText);
    startVideos();
    loadCVFonts();
    loadAnime().catch(() => {});
  });
});
