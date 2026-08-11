document.documentElement.className = "js";

// default is light mode
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}

(function () {
  const projectsRadio = document.getElementById("control-projects");
  if (projectsRadio) projectsRadio.checked = true;
})();

const portfolioItems = [
  {
    title: "three.lab",
    desc: "Browser-based 3D toolkit built with Three.js for model inspection, OpenStreetMap city extraction, and geometry editing. Renders true hidden-line vector art, exports straight to React Three Fiber code, and simplifies, crops, or isolates parts on demand.",
    tags: ["JavaScript"],
    video: "images/three.webm",
    poster: "images/three_poster.webp",
    link: "https://snes19xx.github.io/three.lab/",
    featured: true,
  },
  {
    title: "Toronto Urban Heat Island Explorer",
    desc: "Interactive explorer for Toronto's urban heat islands, mapping which parts of the city run hottest and how heat varies across neighbourhoods.",
    tags: ["Python", "JavaScript"],
    image: "images/tb_uh.webp",
    link: "https://snes19xx.github.io/Toronto_urbanheatislands",
  },
  {
    title: "Earth in Hues",
    desc: "A geospatial project for computing area-weighted mean spectral signatures across land cover categories using satellite imagery, elevation data, and land classification rasters.",
    tags: ["Python", "JavaScript"],
    image: "images/tb_eart.webp",
    link: "https://snes19xx.github.io/earth-in-hues/",
  },
  {
    title: "Atlas of Canadian Wildfires",
    desc: "An interactive atlas built from the Canadian National Fire Database showcasing the spatial distribution and temporal trends of wildfires across Canada, 1959–2025.",
    tags: ["Python", "JavaScript"],
    video: "images/tb_cawf.mp4",
    poster: "images/5_poster.webp",
    link: "https://snes19xx.github.io/canadian-wildfires-atlas/",
  },
  {
    title: "Improving the 510 Spadina Streetcar",
    desc: "Simulation model to quantify the cumulative impact of improvements on Toronto's 510 Spadina Streetcar route, alone and in combination.",
    tags: ["Python", "JavaScript"],
    image: "images/510.webp",
    link: "https://snes19xx.github.io/510-SPADINA-MODEL",
  },
  {
    title: "MAPS",
    desc: "Maps I made in my spare time and as part of my courses at the University of Toronto.",
    tags: ["ArcGIS", "Python", "JavaScript"],
    image: "images/maps.webp",
    link: "https://snes19xx.github.io/maps/",
  },
  {
    title:
      "Crowdsourced Graduate Admissions Data: Patterns, Biases, and Predictive Limits",
    desc: "A study showing GradCafe data is biased and weak at predicting admissions. I look at who self-reports and how far the data can be trusted.",
    tags: ["Python", "SQL"],
    image: "images/gradcafe.webp",
    link: "https://snes19xx.github.io/grad-admissions-bias-and-predictive-limits/",
  },
  {
    title: "Re-Zoning the Yard",
    desc: "An ArcGIS StoryMaps project on the potential for small scale urban gardening in Toronto and where it could realistically take root.",
    tags: ["ArcGIS"],
    image: "images/story.webp",
    link: "https://arcg.is/zOG1P",
  },
  {
    title: "Critical Analysis of the Kensington Market HCD Plan",
    desc: "A critical analysis of the Kensington Market Heritage Conservation District Plan. Presented as part of my fourth year course GGR482 at the University of Toronto.",
    tags: ["presentation"],
    image: "images/thumbnail.webp",
    link: "images/slides/slides.html",
  },
];

let currentPage = "page-projects";

function generateProjectsGrid() {
  const grid = document.querySelector(".page-projects");
  if (!grid) return;
  const existingItems = grid.querySelectorAll(".grid__item");
  if (existingItems.length > 0) return;

  portfolioItems.forEach((item, index) => {
    const gridItem = document.createElement("div");
    gridItem.className = "grid__item";
    if (item.video) gridItem.classList.add("has-video");
    if (item.featured) gridItem.classList.add("grid__item--feature");

    let mediaElement;
    if (item.video) {
      mediaElement = `
                    <video class="grid__img" loop muted playsinline preload="none" poster="${item.poster}"
                           data-src="${item.video}"></video>`;
    } else {
      // First cards are above the fold: lazy-loading them only delays LCP
      const aboveFold = index < 4;
      mediaElement = `
                    <img src="${item.image}"
                         alt="${item.title}"
                         class="grid__img"
                         loading="${aboveFold ? "eager" : "lazy"}"
                         ${aboveFold ? 'fetchpriority="high"' : ""}
                         decoding="async"
                         onload="this.classList.add('loaded')">`;
    }

    gridItem.innerHTML = `
                  <a href="${item.link}" class="grid__link">
                    ${mediaElement}
                    <div class="grid__overlay">
                      <h3 class="grid__title">${item.title}</h3>
                      <p class="grid__description">${item.desc}</p>
                      <div class="grid__tags">
                        ${item.tags.map((tag) => `<span class="grid__tag">${tag}</span>`).join("")}
                      </div>
                    </div>
                  </a>`;
    grid.appendChild(gridItem);
  });

  initLazyVideos();
  setTimeout(() => animateProjectsGrid(), 100);
}

function initLazyVideos() {
  const videos = document.querySelectorAll("video[data-src]");
  if (!videos.length) return;

  const loadVideo = (video) => {
    const src = video.dataset.src;
    delete video.dataset.src;
    const source = document.createElement("source");
    source.src = src;
    source.type = src.endsWith(".webm") ? "video/webm" : "video/mp4";
    video.appendChild(source);
    video.addEventListener("loadeddata", () => video.classList.add("loaded"), {
      once: true,
    });
    video.load();
    video.play().catch(() => {});
  };

  if (!("IntersectionObserver" in window)) {
    videos.forEach(loadVideo);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          loadVideo(entry.target);
        }
      });
    },
    { rootMargin: "300px" },
  );
  videos.forEach((video) => observer.observe(video));
}

function fitOverlayText() {
  document
    .querySelectorAll(".page-projects .grid__overlay")
    .forEach((overlay) => {
      let fit = 1;
      overlay.style.setProperty("--fit", fit);
      while (fit > 0.7 && overlay.scrollHeight > overlay.clientHeight + 1) {
        fit -= 0.05;
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
  fitOverlayText();
  const items = document.querySelectorAll(".page-projects .grid__item");
  anime.set(items, { opacity: 0, scale: 0.8 });
  anime({
    targets: items,
    opacity: [0, 1],
    scale: [0.8, 1],
    duration: 600,
    delay: anime.stagger(60, { grid: [4, 3], from: "center" }),
    easing: "spring(1, 80, 10, 0)",
  });
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

document.querySelectorAll(".control__radio").forEach((radio) => {
  radio.addEventListener("change", function () {
    if (this.checked) {
      const newPage = this.value;
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
              setTimeout(() => {
                if (newPage === "page-projects") {
                  animateProjectsGrid();
                } else if (newPage === "page-cv") {
                  animateCVSections();
                } else if (newPage === "page-about") {
                  animateAboutPage();
                }
              }, 50);
            },
          });
        },
      });
    }
  });
});

function animateSocialIcons() {
  const icons = document.querySelectorAll(".social-icon");
  anime({
    targets: icons,
    opacity: [0, 1],
    translateX: [20, 0],
    duration: 800,
    delay: anime.stagger(150, { start: 600 }),
    easing: "easeOutCubic",
  });
}

document.addEventListener("DOMContentLoaded", () => {
  generateProjectsGrid();
  animateSocialIcons();
  document.fonts.ready.then(fitOverlayText);

  // theme toggle
  document
    .getElementById("theme-toggle")
    .addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem(
        "theme",
        document.body.classList.contains("dark-mode") ? "dark" : "light",
      );
    });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      // no modal
    }
  });
});
