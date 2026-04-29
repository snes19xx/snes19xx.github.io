const RAW = [
  {
    title: "The Emigrants",
    creator: "W.G. Sebald",
    year: 2025,
    type: "Book",
    status: "Finished",
    rating: 3,
  },
  {
    title: "The Rings of Saturn",
    creator: "W.G. Sebald",
    year: 2025,
    type: "Book",
    status: "Finished",
    rating: 4,
  },
  {
    title: "Too Much of Life",
    creator: "Clarice Lispector",
    year: 2025,
    type: "Book",
    status: "Finished",
    rating: 5,
  },
  {
    title: "The Hour of the Star",
    creator: "Clarice Lispector",
    year: 2025,
    type: "Book",
    status: "Finished",
    rating: 4.5,
  },
  {
    title: "Vertigo",
    creator: "W.G. Sebald",
    year: 2025,
    type: "Book",
    status: "Finished",
    rating: 5,
  },
  {
    title: "The Encyclopedia of the Dead",
    creator: "Danilo Kiš",
    year: 2024,
    type: "Book",
    status: "Finished",
    rating: 4,
  },
  {
    title: "Dubliners",
    creator: "James Joyce",
    year: 2024,
    type: "Book",
    status: "Finished",
    rating: 3,
  },
  {
    title: "The Whalestoe Letters",
    creator: "Mark Z. Danielewski",
    year: 2024,
    type: "Book",
    status: "Finished",
    rating: 3,
  },
  {
    title: "Persona 3 Reload",
    creator: "Atlus",
    year: 2024,
    type: "Game",
    status: "Finished",
    rating: 2,
  },
  {
    title: "Final Fantasy VII Rebirth",
    creator: "Square Enix",
    year: 2024,
    type: "Game",
    status: "Unfinished",
    rating: 2,
  },
  {
    title: "Stellar Blade",
    creator: "Shift Up",
    year: 2024,
    type: "Game",
    status: "Unfinished",
    rating: 3.5,
  },
  {
    title: "Letters to Milena",
    creator: "Franz Kafka",
    year: 2023,
    type: "Book",
    status: "Finished",
    rating: 4.5,
  },
  {
    title: "Let the Great World Spin",
    creator: "Colum McCann",
    year: 2023,
    type: "Book",
    status: "Finished",
    rating: 2.5,
  },
  {
    title: "A Million Little Pieces",
    creator: "James Frey",
    year: 2023,
    type: "Book",
    status: "Finished",
    rating: 3,
  },
  {
    title: "The Color of Law",
    creator: "Richard Rothstein",
    year: 2023,
    type: "Book",
    status: "Finished",
    rating: 3.5,
  },
  {
    title: "Diaries",
    creator: "Franz Kafka",
    year: 2023,
    type: "Book",
    status: "Unfinished",
    rating: 4,
  },
  {
    title: "Katamari Damacy Reroll",
    creator: "Bandai Namco",
    year: 2023,
    type: "Game",
    status: "Finished",
    rating: 4,
  },
  {
    title: "Resident Evil 4 Remake",
    creator: "Capcom",
    year: 2023,
    type: "Game",
    status: "Finished",
    rating: 4,
  },
  {
    title: "Tears of the Kingdom",
    creator: "Nintendo",
    year: 2023,
    type: "Game",
    status: "Finished",
    rating: 4,
  },
  {
    title: "Final Fantasy XVI",
    creator: "Square Enix",
    year: 2023,
    type: "Game",
    status: "Finished",
    rating: 3.5,
  },
  {
    title: "Final Fantasy IX",
    creator: "Square Enix",
    year: 2023,
    type: "Game",
    status: "Finished",
    rating: 5,
  },
  {
    title: "Letters to a Young Poet",
    creator: "Rainer Maria Rilke",
    year: 2022,
    type: "Book",
    status: "Finished",
    rating: 4,
  },
  {
    title: "Kafka on the Shore",
    creator: "Haruki Murakami",
    year: 2022,
    type: "Book",
    status: "Finished",
    rating: 4,
  },
  {
    title: "After the Quake",
    creator: "Haruki Murakami",
    year: 2022,
    type: "Book",
    status: "Finished",
    rating: 4.5,
  },
  {
    title: "Men Without Women",
    creator: "Haruki Murakami",
    year: 2022,
    type: "Book",
    status: "Finished",
    rating: 4.5,
  },
  {
    title: "Hard-Boiled Wonderland",
    creator: "Haruki Murakami",
    year: 2022,
    type: "Book",
    status: "Finished",
    rating: 5,
  },
  {
    title: "The Complete Cosmicomics",
    creator: "Italo Calvino",
    year: 2022,
    type: "Book",
    status: "Finished",
    rating: 4,
  },
  {
    title: "The Sons",
    creator: "Franz Kafka",
    year: 2022,
    type: "Book",
    status: "Finished",
    rating: 3.5,
  },
  {
    title: "The Complete Stories",
    creator: "Clarice Lispector",
    year: 2022,
    type: "Book",
    status: "Unfinished",
    rating: 4,
  },
  {
    title: "The Complete Stories",
    creator: "Franz Kafka",
    year: 2022,
    type: "Book",
    status: "Unfinished",
    rating: 4.5,
  },
  {
    title: "God of War Ragnarök",
    creator: "Santa Monica Studio",
    year: 2022,
    type: "Game",
    status: "Finished",
    rating: 4.5,
  },
  {
    title: "Bayonetta 3",
    creator: "PlatinumGames",
    year: 2022,
    type: "Game",
    status: "Finished",
    rating: 3,
  },
  {
    title: "Persona 5 Royal",
    creator: "Atlus",
    year: 2022,
    type: "Game",
    status: "Finished",
    rating: 3.5,
  },
  {
    title: "Shin Megami Tensei V",
    creator: "Atlus",
    year: 2022,
    type: "Game",
    status: "Finished",
    rating: 4,
  },
  {
    title: "Kirby & the Forgotten Land",
    creator: "HAL Laboratory",
    year: 2022,
    type: "Game",
    status: "Finished",
    rating: 4,
  },
  {
    title: "Pokémon Legends: Arceus",
    creator: "Game Freak",
    year: 2022,
    type: "Game",
    status: "Dropped",
    rating: 2.5,
  },
  {
    title: "Pokémon Shining Pearl",
    creator: "ILCA",
    year: 2022,
    type: "Game",
    status: "Dropped",
    rating: 2,
  },
  {
    title: "Sonic Colors Ultimate",
    creator: "Blind Squirrel",
    year: 2022,
    type: "Game",
    status: "Dropped",
    rating: 2,
  },
  {
    title: "Soul Hackers 2",
    creator: "Atlus",
    year: 2022,
    type: "Game",
    status: "Dropped",
    rating: 3,
  },
  {
    title: "1Q84",
    creator: "Haruki Murakami",
    year: 2021,
    type: "Book",
    status: "Finished",
    rating: 3.5,
  },
  {
    title: "And the Mountains Echoed",
    creator: "Khaled Hosseini",
    year: 2021,
    type: "Book",
    status: "Finished",
    rating: 4,
  },
  {
    title: "Norwegian Wood",
    creator: "Haruki Murakami",
    year: 2021,
    type: "Book",
    status: "Finished",
    rating: 3,
  },
  {
    title: "The Castle",
    creator: "Franz Kafka",
    year: 2021,
    type: "Book",
    status: "Finished",
    rating: 5,
  },
  {
    title: "The Order of Time",
    creator: "Carlo Rovelli",
    year: 2021,
    type: "Book",
    status: "Finished",
    rating: 4,
  },
  {
    title: "The Log from the Sea of Cortez",
    creator: "John Steinbeck",
    year: 2021,
    type: "Book",
    status: "Finished",
    rating: 4,
  },
  {
    title: "Selected Stories",
    creator: "Virginia Woolf",
    year: 2021,
    type: "Book",
    status: "Unfinished",
    rating: 3.5,
  },
  {
    title: "Tropic of Cancer",
    creator: "Henry Miller",
    year: 2021,
    type: "Book",
    status: "Dropped",
    rating: 2,
  },
  {
    title: "Fire Emblem: Three Houses",
    creator: "Intelligent Systems",
    year: 2021,
    type: "Game",
    status: "Finished",
    rating: 4.5,
  },
  {
    title: "Pokémon Sword",
    creator: "Game Freak",
    year: 2021,
    type: "Game",
    status: "Finished",
    rating: 2,
  },
  {
    title: "New Pokémon Snap",
    creator: "Bandai Namco",
    year: 2021,
    type: "Game",
    status: "Finished",
    rating: 4,
  },
  {
    title: "Catherine: Full Body",
    creator: "Atlus",
    year: 2021,
    type: "Game",
    status: "Finished",
    rating: 3.5,
  },
  {
    title: "Final Fantasy XV",
    creator: "Square Enix",
    year: 2021,
    type: "Game",
    status: "Finished",
    rating: 2.5,
  },
  {
    title: "Gravity Rush 2",
    creator: "Japan Studio",
    year: 2021,
    type: "Game",
    status: "Finished",
    rating: 4.5,
  },
  {
    title: "Final Fantasy VII Remake",
    creator: "Square Enix",
    year: 2021,
    type: "Game",
    status: "Finished",
    rating: 4,
  },
];

// Clone so simulation can mutate x/y
const data = RAW.map((d, i) => ({ ...d, _id: i }));

const colors = {
  Finished: "#10b981",
  Unfinished: "#f59e0b",
  Dropped: "#ef4444",
};

const container = document.getElementById("viz-container");
const tooltip = d3.select("#tooltip");

const BUBBLE_R = 13;
const SCATTER_R = 8;

function getW() {
  return container.clientWidth;
}
function getH() {
  return Math.max(420, Math.min(580, Math.round(window.innerHeight * 0.6)));
}

let W = getW(),
  H = getH();

const svg = d3
  .select("#viz-container")
  .append("svg")
  .attr("width", W)
  .attr("height", H);

const axisLayer = svg.append("g");
const nodeLayer = svg.append("g");

// --- Nodes ---
const nodeEls = nodeLayer
  .selectAll(".node")
  .data(data)
  .enter()
  .append("circle")
  .attr("class", "node")
  .attr("r", BUBBLE_R)
  .attr("fill", (d) => colors[d.status])
  .attr("cx", W / 2)
  .attr("cy", H / 2);

// --- Tooltip ---
function starHTML(rating) {
  let s = "";
  for (let i = 1; i <= 5; i++) {
    const v = rating - (i - 1);
    s +=
      v >= 1
        ? '<span class="star-t">★</span>'
        : v >= 0.5
          ? '<span class="star-t">⯨</span>'
          : '<span class="star-t empty">★</span>';
  }
  return `<div class="rating-row">${s}<span class="rating-num">${rating % 1 === 0 ? rating + ".0" : rating}</span></div>`;
}

nodeEls
  .on("mouseover", function (event, d) {
    d3.select(this)
      .attr("stroke", "var(--text-main)")
      .attr("stroke-width", 3.5);
    tooltip
      .html(
        `
      <div class="meta-top">
        <span class="status ${d.status.toLowerCase()}">${d.status}</span>
        <span class="yr">${d.year}</span>
      </div>
      <div class="ttitle">${d.title}</div>
      <div class="creator">${d.creator}</div>
      ${starHTML(d.rating)}
    `,
      )
      .attr("class", `tooltip ${d.type.toLowerCase()}`)
      .style("opacity", 1);
  })
  .on("mousemove", function (event) {
    const tn = tooltip.node();
    const tw = tn.offsetWidth,
      th = tn.offsetHeight;
    const [rx, ry] = d3.pointer(event, container);
    let x = rx + 16,
      y = ry - 16;
    if (x + tw > W) x = rx - tw - 16;
    if (y + th > H) y = ry - th - 16;
    else if (y < 0) y = ry + 16;
    tooltip.style("left", x + "px").style("top", y + "px");
  })
  .on("mouseout", function () {
    d3.select(this).attr("stroke", "var(--surface)").attr("stroke-width", 2);
    tooltip.style("opacity", 0);
  });

// --- Simulation ---
const sim = d3
  .forceSimulation(data)
  .force("charge", d3.forceManyBody().strength(0.5))
  .force(
    "collide",
    d3
      .forceCollide()
      .radius(BUBBLE_R + 2.5)
      .iterations(5),
  )
  .alphaDecay(0.04)
  .on("tick", () => {
    nodeEls.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });

// --- Scatter: precise beeswarm positions ---
function scatterPositions() {
  const step = SCATTER_R * 2 + 3;

  // Bucket by (year, rating)
  const buckets = {};
  data.forEach((d) => {
    const key = `${d.year}_${d.rating}`;
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(d);
  });

  // Max half-spread for a given year column (how far dots fan out from center)
  function maxHalfSpread(yr) {
    const groups = Object.values(buckets).filter((g) => g[0].year === yr);
    return groups.length
      ? Math.max(...groups.map((g) => ((g.length - 1) / 2) * step))
      : 0;
  }

  // Correct geometry:
  // Left label sits at fixed x = LABEL_X, text-anchor end.
  // 2021 column center = pL. Leftmost dot LEFT edge = pL - hs2021 - SCATTER_R.
  // We need: LABEL_X < pL - hs2021 - SCATTER_R
  // => pL = LABEL_X + hs2021 + SCATTER_R + gap
  const LABEL_X = 38;
  const gap = 10;
  const hs2021 = maxHalfSpread(2021);
  const hs2025 = maxHalfSpread(2025);
  const LEGEND_W = 108; // width of legend block

  const firstYr = [...new Set(data.map((d) => d.year))].sort(
    (a, b) => a - b,
  )[0];
  const lastYr = [...new Set(data.map((d) => d.year))]
    .sort((a, b) => a - b)
    .slice(-1)[0];
  const pL = LABEL_X + maxHalfSpread(firstYr) + SCATTER_R + gap;
  // 2025 column center = W - pR. Rightmost dot RIGHT edge = W - pR + hs2025 + SCATTER_R.
  // Legend starts at W - pR + hs2025 + SCATTER_R + gap.
  // pR must ensure legend fits: W - pR + hs2025 + SCATTER_R + gap + LEGEND_W <= W
  // => pR >= hs2025 + SCATTER_R + gap + LEGEND_W
  const hs_last = maxHalfSpread(lastYr);
  const pR = hs_last + SCATTER_R + gap + LEGEND_W;
  const pT = 65;
  const pB = 42;

  const years = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);
  const xS = d3
    .scaleLinear()
    .domain([years[0], years[years.length - 1]])
    .range([pL, W - pR]);
  const yS = d3
    .scaleLinear()
    .domain([1.75, 5.25])
    .range([H - pB, pT]);

  const positions = {};
  Object.values(buckets).forEach((group) => {
    const cx = xS(group[0].year);
    const cy = yS(group[0].rating);
    group.forEach((d, i) => {
      const offset = (i - (group.length - 1) / 2) * step;
      positions[d._id] = { x: cx + offset, y: cy };
    });
  });
  // Also expose helper values for drawAxes
  return { positions, xS, yS, pL, pR, pT, pB, LABEL_X, hs_last, gap };
}

// --- Group positions for bubble modes ---
function groupPositions(mode) {
  switch (mode) {
    case "year": {
      const yrs = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);
      const n = yrs.length;
      const obj = {};
      yrs.forEach((yr, i) => {
        obj[yr] = {
          x: W * (0.1 + 0.8 * (i / Math.max(n - 1, 1))),
          y: H / 2,
        };
      });
      return obj;
    }
    case "type":
      return {
        Book: { x: W * 0.35, y: H / 2 },
        Game: { x: W * 0.65, y: H / 2 },
      };
    case "status":
      return {
        Finished: { x: W * 0.22, y: H / 2 },
        Unfinished: { x: W * 0.5, y: H / 2 },
        Dropped: { x: W * 0.78, y: H / 2 },
      };
  }
}

// --- Draw axis decorations ---
function drawAxes(mode) {
  axisLayer.selectAll("*").remove();

  if (mode === "scatter") {
    const { xS, yS, pL, pR, pT, pB, LABEL_X, hs_last, gap } =
      scatterPositions();
    const years = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);
    const rTicks = [2, 2.5, 3, 3.5, 4, 4.5, 5];

    // Horizontal grid lines + left labels
    rTicks.forEach((r) => {
      axisLayer
        .append("line")
        .attr("x1", pL)
        .attr("x2", W - pR)
        .attr("y1", yS(r))
        .attr("y2", yS(r))
        .attr("stroke", "var(--line-color)")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3 5")
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(200)
        .attr("opacity", 0.65);

      axisLayer
        .append("text")
        .attr("class", "axis-label")
        .attr("x", LABEL_X)
        .attr("y", yS(r))
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .text(r % 1 === 0 ? r + ".0" : r)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(200)
        .attr("opacity", 1);
    });

    // Bottom axis baseline + year labels
    axisLayer
      .append("line")
      .attr("x1", pL)
      .attr("x2", W - pR)
      .attr("y1", H - pB)
      .attr("y2", H - pB)
      .attr("stroke", "var(--line-color)")
      .attr("stroke-width", 1)
      .attr("opacity", 0)
      .transition()
      .duration(400)
      .attr("opacity", 1);

    years.forEach((yr) => {
      axisLayer
        .append("line")
        .attr("x1", xS(yr))
        .attr("x2", xS(yr))
        .attr("y1", H - pB)
        .attr("y2", H - pB + 5)
        .attr("stroke", "var(--line-color)")
        .attr("stroke-width", 1)
        .attr("opacity", 0)
        .transition()
        .duration(400)
        .delay(200)
        .attr("opacity", 1);

      axisLayer
        .append("text")
        .attr("class", "axis-label")
        .attr("x", xS(yr))
        .attr("y", H - pB + 18)
        .attr("text-anchor", "middle")
        .text(yr)
        .attr("opacity", 0)
        .transition()
        .duration(400)
        .delay(200)
        .attr("opacity", 1);
    });

    // Trend lines per type
    ["Book", "Game"].forEach((type) => {
      const col = type === "Book" ? "#D906BD" : "#6366f1";
      const pts = years
        .map((yr) => {
          const g = data.filter((d) => d.type === type && d.year === yr);
          return g.length
            ? { year: yr, avg: d3.mean(g, (d) => d.rating) }
            : null;
        })
        .filter(Boolean);
      if (pts.length < 2) return;
      const line = d3
        .line()
        .x((d) => xS(d.year))
        .y((d) => yS(d.avg))
        .curve(d3.curveCatmullRom.alpha(0.5));
      axisLayer
        .append("path")
        .datum(pts)
        .attr("fill", "none")
        .attr("stroke", col)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5 4")
        .attr("d", line)
        .attr("opacity", 0)
        .transition()
        .duration(700)
        .delay(400)
        .attr("opacity", 0.5);
    });

    // Legend — anchored just right of the rightmost 2025 dot
    [
      ["Books", "#D906BD"],
      ["Games", "#6366f1"],
    ].forEach(([lbl, col], i) => {
      const lgX = W - pR + hs_last + SCATTER_R + gap;
      const lgY = 8 + i * 20;
      const g = axisLayer.append("g").attr("opacity", 0);
      g.append("line")
        .attr("x1", lgX)
        .attr("x2", lgX + 16)
        .attr("y1", lgY + 4)
        .attr("y2", lgY + 4)
        .attr("stroke", col)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5 4");
      g.append("text")
        .attr("class", "axis-label")
        .attr("x", lgX + 22)
        .attr("y", lgY + 8)
        .text(`avg. ${lbl.toLowerCase()}`);
      g.transition().duration(500).delay(500).attr("opacity", 1);
    });
  } else if (mode === "rating") {
    // Two swim-lanes — NO vertical lines
    const pL = Math.round(W * 0.07),
      pR = Math.round(W * 0.04);
    const xS = d3
      .scaleLinear()
      .domain([1.75, 5.25])
      .range([pL, W - pR]);
    const rTicks = [2, 2.5, 3, 3.5, 4, 4.5, 5];

    // Center divider
    axisLayer
      .append("line")
      .attr("x1", 0)
      .attr("x2", W)
      .attr("y1", H / 2)
      .attr("y2", H / 2)
      .attr("stroke", "var(--line-color)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4 6")
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .delay(150)
      .attr("opacity", 0.45);

    // Row labels
    [
      ["BOOKS", H * 0.25 - 52],
      ["GAMES", H * 0.75 - 52],
    ].forEach(([lbl, y]) => {
      axisLayer
        .append("text")
        .attr("class", "row-label")
        .attr("x", pL)
        .attr("y", y)
        .text(lbl)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(200)
        .attr("opacity", 1);
    });

    // Rating labels only (no lines) — one set shared, shown near bottom
    rTicks.forEach((r) => {
      axisLayer
        .append("text")
        .attr("class", "axis-label")
        .attr("x", xS(r))
        .attr("y", H - 10)
        .attr("text-anchor", "middle")
        .text(r % 1 === 0 ? r + ".0" : r)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay(200)
        .attr("opacity", 1);
    });
  } else {
    // Bubble group labels
    const gp = groupPositions(mode);
    Object.entries(gp).forEach(([key, pos]) => {
      axisLayer
        .append("text")
        .attr("class", "group-label")
        .attr("x", pos.x)
        .attr("y", H * 0.15)
        .text(key)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 1);
    });
  }
}

// --- Activate a mode ---
function updateMode(mode) {
  drawAxes(mode);

  if (mode === "scatter") {
    const { positions } = scatterPositions();
    sim.stop();
    nodeEls.interrupt(); // cancel any running transitions
    nodeEls.transition().duration(350).attr("r", SCATTER_R);
    // Animate each dot to its precise position after radius settles
    setTimeout(() => {
      nodeEls
        .transition()
        .duration(650)
        .ease(d3.easeCubicInOut)
        .attr("cx", (d) => positions[d._id].x)
        .attr("cy", (d) => positions[d._id].y);
    }, 200);
  } else if (mode === "rating") {
    const pL = Math.round(W * 0.07),
      pR = Math.round(W * 0.04);
    const xS = d3
      .scaleLinear()
      .domain([1.75, 5.25])
      .range([pL, W - pR]);
    nodeEls.transition().duration(350).attr("r", BUBBLE_R);
    sim
      .force("x", d3.forceX((d) => xS(d.rating)).strength(0.3))
      .force(
        "y",
        d3
          .forceY((d) => (d.type === "Book" ? H * 0.25 : H * 0.75))
          .strength(0.3),
      )
      .force(
        "collide",
        d3
          .forceCollide()
          .radius(BUBBLE_R + 2.5)
          .iterations(5),
      )
      .alpha(0.9)
      .restart();
  } else {
    const gp = groupPositions(mode);
    nodeEls.transition().duration(350).attr("r", BUBBLE_R);
    sim
      .force("x", d3.forceX((d) => gp[d[mode]].x).strength(0.12))
      .force("y", d3.forceY((d) => gp[d[mode]].y).strength(0.12))
      .force(
        "collide",
        d3
          .forceCollide()
          .radius(BUBBLE_R + 2.5)
          .iterations(5),
      )
      .alpha(0.85)
      .restart();
  }
}

// --- Resize ---
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    W = getW();
    H = getH();
    svg.attr("width", W).attr("height", H);
    updateMode(d3.select("button.active").attr("data-mode"));
  }, 120);
});

// --- Init ---
updateMode("year");

d3.selectAll("button").on("click", function () {
  d3.selectAll("button").classed("active", false);
  d3.select(this).classed("active", true);
  updateMode(d3.select(this).attr("data-mode"));
});
