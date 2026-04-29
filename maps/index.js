const CATALOG = { main: 0, stylized: 0, class: 0 };
const SRC_CACHE = {};
const PROBE_EXTS = ["webp", "png", "jpg"];

function getNumCols() {
  return (
    parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--cols")
        .trim(),
    ) || 6
  );
}

function drawPlaceholder(sourceImg, canvas) {
  const W = 20;
  const H = sourceImg.naturalHeight
    ? Math.round((20 * sourceImg.naturalHeight) / sourceImg.naturalWidth)
    : 14;
  canvas.width = W;
  canvas.height = H;
  try {
    canvas.getContext("2d").drawImage(sourceImg, 0, 0, W, H);
  } catch (_) {}
}

function loadWithBlurup(item, src) {
  const imgWrap = item.querySelector(".img-wrap");
  const canvas = imgWrap.querySelector("canvas");
  const img = imgWrap.querySelector("img");

  img.src = src;
  img.onload = () => {
    drawPlaceholder(img, canvas);
    const reveal = () => {
      img.classList.add("revealed");
      canvas.classList.add("hidden");
      item.classList.add("loaded");
    };
    img.decode ? img.decode().then(reveal).catch(reveal) : reveal();
  };
  img.onerror = () => item.classList.add("loaded");
}

function probeImage(folder, num) {
  return new Promise((resolve) => {
    let extIdx = 0;

    function tryNext() {
      if (extIdx >= PROBE_EXTS.length) {
        resolve(null);
        return;
      }
      const ext = PROBE_EXTS[extIdx++];
      const src = `${folder}/${num}.${ext}`;
      const thumbSrc = `${folder}/thumbnails/${num}_thumbnail.webp`;

      const img = new Image();
      img.onload = () =>
        resolve({
          src,
          thumbSrc,
          num,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      img.onerror = tryNext;
      img.src = thumbSrc;
    }

    tryNext();
  });
}

function addItem(result, cols, folder, numCols) {
  const { src, thumbSrc, num, width, height } = result;
  const colIdx = (num - 1) % numCols;

  SRC_CACHE[`${folder}-${num}`] = src;
  CATALOG[folder] = Math.max(CATALOG[folder], num);
  document.getElementById(`count-${folder}`).textContent =
    `${CATALOG[folder]} maps`;

  const item = document.createElement("div");
  item.className = "gallery-item";
  item.tabIndex = 0;
  item.setAttribute("role", "button");
  item.setAttribute("aria-label", `View ${folder} map ${num}`);
  item._src = src;
  item._thumbSrc = thumbSrc;
  item._folder = folder;
  item._num = num;

  const imgWrap = document.createElement("div");
  imgWrap.className = "img-wrap";
  if (width && height) imgWrap.style.aspectRatio = `${width} / ${height}`;

  const canvas = document.createElement("canvas");
  const realImg = document.createElement("img");
  realImg.alt = `${folder} map ${num}`;
  realImg.decoding = "async";

  imgWrap.appendChild(canvas);
  imgWrap.appendChild(realImg);
  item.appendChild(imgWrap);
  cols[colIdx].appendChild(item);

  const idx = num - 1;
  item.addEventListener("click", () => openLB(folder, idx));
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") openLB(folder, idx);
  });

  lazyObs.observe(item);
}

async function loadGallery(folder, wrapperId) {
  const wrap = document.getElementById(wrapperId);
  wrap.innerHTML = "";

  const numCols = getNumCols();
  const cols = [];
  for (let c = 0; c < numCols; c++) {
    const col = document.createElement("div");
    col.className = "masonry-col";
    wrap.appendChild(col);
    cols.push(col);
  }

  const BATCH_SIZE = 6;
  let base = 1;
  let running = true;

  while (running) {
    const nums = Array.from({ length: BATCH_SIZE }, (_, k) => base + k);
    const results = await Promise.all(nums.map((n) => probeImage(folder, n)));

    for (const result of results) {
      if (!result) {
        running = false;
        break;
      }
      addItem(result, cols, folder, numCols);
    }

    base += BATCH_SIZE;
  }

  if (CATALOG[folder] === 0) {
    document.getElementById(`count-${folder}`).textContent = "0 maps";
  }
}

const lazyObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      lazyObs.unobserve(e.target);
      const item = e.target;
      const siblings = Array.from(item.parentElement.children);
      item.style.transitionDelay = (siblings.indexOf(item) % 5) * 40 + "ms";
      item.classList.add("visible");
      loadWithBlurup(item, item._thumbSrc);
    });
  },
  { threshold: 0.01, rootMargin: "0px 0px 300px 0px" },
);

const sectionObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      sectionObs.unobserve(e.target);

      if (e.target.classList.contains("int-preview")) {
        const iframe = e.target.querySelector("iframe");
        const src = e.target.dataset.src;
        if (iframe && src && !iframe.src.endsWith(src)) {
          iframe.src = src;
        }
      }
    });
  },
  { threshold: 0.06 },
);
document
  .querySelectorAll(".section-head, .int-preview")
  .forEach((el) => sectionObs.observe(el));

const lightbox = document.getElementById("lightbox");
const lbInner = document.getElementById("lbInner");
const lbCounter = document.getElementById("lbCounter");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");
let lbFolder = null,
  lbIdx = 0,
  lbCount = 0,
  lbIsInt = false;

function openLB(folder, idx) {
  lbIsInt = false;
  lbFolder = folder;
  lbIdx = idx;
  lbCount = CATALOG[folder];
  lbPrev.style.display = lbNext.style.display = "";
  renderLB();
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}

function openInteractive(src, title) {
  lbIsInt = true;
  lbInner.innerHTML = `<iframe src="${src}"></iframe>`;
  lbCounter.textContent = title;
  lbPrev.style.display = lbNext.style.display = "none";
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}

function renderLB() {
  const num = lbIdx + 1;
  const src = SRC_CACHE[`${lbFolder}-${num}`] || `${lbFolder}/${num}.webp`;

  const img = new Image();
  img.alt = `Map ${num}`;
  img.decoding = "async";
  const show = () => {
    lbInner.innerHTML = "";
    lbInner.appendChild(img);
  };
  img.onload = () =>
    img.decode ? img.decode().then(show).catch(show) : show();
  img.onerror = () => {
    if (src.endsWith(".webp")) img.src = src.replace(".webp", ".png");
    else if (src.endsWith(".png")) img.src = src.replace(".png", ".jpg");
  };
  img.src = src;

  lbCounter.textContent = `${lbFolder} · ${num} / ${lbCount}`;
  lbPrev.disabled = lbIdx === 0;
  lbNext.disabled = lbIdx === lbCount - 1;
}

function navigate(dir) {
  const n = lbIdx + dir;
  if (n < 0 || n >= lbCount) return;
  lbIdx = n;
  lbInner.style.opacity = "0";
  setTimeout(() => {
    renderLB();
    lbInner.style.opacity = "1";
  }, 160);
}

function closeLB() {
  lightbox.classList.remove("open");
  setTimeout(() => {
    lbInner.innerHTML = "";
  }, 300);
  document.body.style.overflow = "";
}

document.getElementById("lbClose").addEventListener("click", closeLB);
lbPrev.addEventListener("click", () => navigate(-1));
lbNext.addEventListener("click", () => navigate(1));
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLB();
});
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeLB();
  if (e.key === "ArrowLeft" && !lbIsInt) navigate(-1);
  if (e.key === "ArrowRight" && !lbIsInt) navigate(1);
});

["intPreview1", "intPreview2"].forEach((id, idx) => {
  const el = document.getElementById(id);
  if (!el) return;
  const src = el.dataset.src;
  const lbl = `Interactive Map ${idx + 1}`;
  el.addEventListener("click", () => openInteractive(src, lbl));
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") openInteractive(src, lbl);
  });
});

Promise.all([
  loadGallery("main", "main-masonry"),
  loadGallery("stylized", "stylized-masonry"),
  loadGallery("class", "class-masonry"),
]);
