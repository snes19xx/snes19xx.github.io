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
    title: "Toronto Urban Heat Island Explorer",
    desc: "Interactive explorer for Toronto's urban heat islands.",
    tags: ["Python", "JavaScript"],
    image: "UH_exp/tb.png",
    link: "UH_exp/index.htm",
  },
  {
    title: "Earth in Hues",
    desc: "A geospatial project for computing area-weighted mean spectral signatures across land cover categories using satellite imagery, elevation data, and land classification rasters.",
    tags: ["Python", "D3.js"],
    image: "images/tb_eart.png",
    link: "earth_hues/index.html",
  },
  {
    title: "Re-Zoning the Yard",
    desc: "An ArcGIS storymaps project showing potential for small scale urban gardening in Toronto",
    tags: ["ArcGIS"],
    image: "images/story.png",
    link: "https://arcg.is/zOG1P",
  },
  {
    title: "Improving the 510 Spadina Streetcar",
    desc: "Simulation model to quantify the cumulative impact of improvements on Toronto's 510 Spadina Streetcar route",
    tags: ["Python"],
    image: "images/510.jpg",
    link: "https://github.com/snes19xx/510-SPADINA-MODEL",
  },
  {
    title: "MAPS",
    desc: "Maps I made on my spare time and as part of my courses at the University of Toronto",
    tags: ["ArcGIS", "Python", "JavaScript"],
    image: "images/maps.png",
    link: "maps/index.html",
  },
  {
    title: "Better Geophysics",
    desc: "Better Geophysics is an interactive project that transforms raw, irregular geophysical survey data into clear, modern, and scientifically accurate visualizations",
    tags: ["D3.js"],
    video: "images/5.mp4",
    link: "https://observablehq.com/d/ec14d0aa25e9f007",
  },
  {
    title:
      "Crowdsourced Graduate Admissions Data: Patterns, Biases, and Predictive Limits",
    desc: "A study showing GradCafe data is biased and weak at predicting admissions.",
    tags: ["Python"],
    image: "images/gradcafe.png",
    link: "gradcafe_analysis/web.html",
  },
  {
    title: "Critical Analysis of the Kensington Market HCD Plan",
    desc: "Research Presentation I gave as part of my fourth year course GGR482 at the University of Toronto",
    tags: ["presentation"],
    image: "images/thumbnail.png",
    link: "images/slides/slides.html",
  },
];

let currentPage = "page-projects";
let gradeVizGenerated = false;

function generateProjectsGrid() {
  const grid = document.querySelector(".page-projects");
  if (!grid) return;
  const existingItems = grid.querySelectorAll(".grid__item");
  if (existingItems.length > 0) return;

  portfolioItems.forEach((item) => {
    const gridItem = document.createElement("div");
    gridItem.className = "grid__item";
    if (item.video) gridItem.classList.add("has-video");

    let mediaElement;
    if (item.video) {
      mediaElement = `
                    <video class="grid__img" autoplay loop muted playsinline preload="metadata"
                           onloadeddata="this.classList.add('loaded')">
                      <source src="${item.video}" type="video/mp4">
                    </video>`;
    } else {
      mediaElement = `
                    <img src="${item.image}"
                         alt="${item.title}"
                         class="grid__img"
                         loading="lazy"
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

  setTimeout(() => animateProjectsGrid(), 100);
}

function animateProjectsGrid() {
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
    complete: () => {
      if (!gradeVizGenerated) {
        generateGradeViz();
        gradeVizGenerated = true;
      }
    },
  });
}

function generateGradeViz() {
  const grades = [
    94, 90, 77, 95, 88, 93, 83, 96, 92, 76, 87, 85, 90, 86, 92, 95, 87, 86, 87,
    90, 94, 82, 88, 82, 86, 92, 86, 90, 94, 81, 85, 95, 80, 90, 85, 85,
  ];

  const container = document.getElementById("grade-viz");

  const tooltipDiv = document.createElement("div");
  tooltipDiv.id = "grade-viz-tooltip";
  tooltipDiv.style.cssText =
    "position:absolute;background:rgba(253,251,247,0.95);border:1px solid #d0c9ba;" +
    "padding:4px 8px;border-radius:4px;font-size:11px;font-family:\'JetBrains Mono\',monospace;" +
    "pointer-events:none;opacity:0;transition:opacity 0.15s;z-index:10;";
  container.style.position = "relative";
  container.appendChild(tooltipDiv);

  const W = 400;
  const H = 240;
  const m = { top: 36, right: 20, bottom: 12, left: 30 };
  const iW = W - m.left - m.right;
  const iH = H - m.top - m.bottom;

  const yBaseline = 70;
  const yMax = 100;

  function getGradeColor(grade) {
    if (grade >= 90) return "#3a5a30";
    if (grade >= 85) return "#2b6cb0";
    if (grade >= 82) return "#d69e2e";
    return "#9b2c2c";
  }

  const svg = d3
    .select("#grade-viz")
    .append("svg")
    .attr("width", W)
    .attr("height", H)
    .attr("viewBox", [0, 0, W, H])
    .style("max-width", "100%")
    .style("height", "auto")
    .style("font-family", '"EB Garamond", Georgia, serif');

  const defs = svg.append("defs");
  const gradient = defs
    .append("linearGradient")
    .attr("id", "area-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");
  gradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#9BAD8C")
    .attr("stop-opacity", 0.3);
  gradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#879cae")
    .attr("stop-opacity", 0);

  svg
    .append("text")
    .attr("x", W / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("letter-spacing", "0.5px")
    .attr("fill", "#1a1918")
    .text("Undergraduate Grades");

  const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

  const xScale = d3
    .scalePoint()
    .domain(grades.map((_, i) => i + 1))
    .range([0, iW])
    .padding(0.2);

  const yScale = d3
    .scaleLinear()
    .domain([yBaseline, yMax])
    .nice()
    .range([iH, 0]);

  yScale.ticks(4).forEach((t) => {
    if (t < yBaseline) return;
    g.append("line")
      .attr("x1", 0)
      .attr("x2", iW)
      .attr("y1", yScale(t))
      .attr("y2", yScale(t))
      .attr("stroke", "#e8e5de")
      .attr("stroke-width", 0.5);
    g.append("text")
      .attr("x", -6)
      .attr("y", yScale(t))
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "9px")
      .attr("fill", "#999")
      .attr("font-family", "system-ui, sans-serif")
      .text(t);
  });

  const areaGen = d3
    .area()
    .x((_, i) => xScale(i + 1))
    .y0(iH)
    .y1((d) => yScale(d))
    .curve(d3.curveMonotoneX);

  g.append("path")
    .datum(grades)
    .attr("fill", "url(#area-gradient)")
    .attr("opacity", 0)
    .attr("d", areaGen)
    .transition()
    .duration(2000)
    .attr("opacity", 1);

  const lineGen = d3
    .line()
    .x((_, i) => xScale(i + 1))
    .y((d) => yScale(d))
    .curve(d3.curveMonotoneX);

  const path = g
    .append("path")
    .datum(grades)
    .attr("fill", "none")
    .attr("stroke", "#879cae")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.8)
    .attr("d", lineGen);

  const totalLength = path.node().getTotalLength();
  path
    .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(2000)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);

  const tooltip = d3.select("#grade-viz-tooltip");

  g.selectAll(".dot")
    .data(grades)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (_, i) => xScale(i + 1))
    .attr("cy", (d) => yScale(d))
    .attr("r", 2.5)
    .attr("fill", (d) => getGradeColor(d))
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .attr("opacity", 0)
    .attr("pointer-events", "none")
    .transition()
    .delay((_, i) => (i / (grades.length - 1)) * 2000)
    .duration(300)
    .attr("opacity", 1);

  const points = grades.map((d, i) => [xScale(i + 1), yScale(d)]);
  const delaunay = d3.Delaunay.from(points);
  const voronoi = delaunay.voronoi([0, 0, iW, iH]);

  g.selectAll(".voronoi-cell")
    .data(grades)
    .enter()
    .append("path")
    .attr("class", "voronoi-cell")
    .attr("d", (_, i) => voronoi.renderCell(i))
    .attr("fill", "transparent")
    .attr("cursor", "pointer")
    .on("mouseover", function (event, d) {
      const i = g.selectAll(".voronoi-cell").nodes().indexOf(this);
      d3.selectAll(".dot")
        .filter((_, j) => j === i)
        .attr("r", 5)
        .attr("stroke", "#1a1918");
      const containerRect = document
        .getElementById("grade-viz")
        .getBoundingClientRect();
      let leftPos = event.pageX - containerRect.left + 10;
      let topPos = event.pageY - containerRect.top - 30;
      if (leftPos > W - 80) leftPos = event.pageX - containerRect.left - 60;
      tooltip.transition().duration(100).style("opacity", 1);
      tooltip
        .html(`<strong style="color:${getGradeColor(d)}">${d}</strong>`)
        .style("left", leftPos + "px")
        .style("top", topPos + "px");
    })
    .on("mouseout", function () {
      const i = g.selectAll(".voronoi-cell").nodes().indexOf(this);
      d3.selectAll(".dot")
        .filter((_, j) => j === i)
        .attr("r", 2.5)
        .attr("stroke", "#fff");
      tooltip.transition().duration(200).style("opacity", 0);
    });

  g.append("line")
    .attr("x1", 0)
    .attr("x2", iW)
    .attr("y1", iH)
    .attr("y2", iH)
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1);
}

function animateAboutPage() {
  const profileImg = document.querySelector(".about-profile-image");
  const intro = document.querySelector(".about-intro");
  anime.set(profileImg, { opacity: 0, scale: 0.8 });
  anime.set(intro, { opacity: 0, translateY: 20 });

  anime({
    targets: profileImg,
    opacity: [0, 1],
    scale: [0.8, 1],
    duration: 800,
    easing: "easeOutQuad",
  });

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

window.addEventListener("load", () => {
  document.body.classList.remove("loading");
  generateProjectsGrid();
  animateSocialIcons();

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
