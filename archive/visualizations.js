// data.json
fetch("data.json")
  .then((r) => r.json())
  .then(init)
  .catch((err) => {
    console.error("Failed to load visualization data:", err);
  });

function init(RAW) {
  // Clone so simulation can mutate x/y
  const data = RAW.map((d, i) => ({ ...d, _id: i }));

  const colors = {
    Finished: "#10b981",
    Unfinished: "#f59e0b",
    Dropped: "#ef4444",
  };

  const container = document.getElementById("viz-container");
  const tooltip = d3.select("#tooltip");

  function getW() {
    return container.clientWidth;
  }
  function getH() {
    return Math.max(420, Math.min(580, Math.round(window.innerHeight * 0.6)));
  }

  let W = getW(),
    H = getH();

  // Radii shrink on phones
  let BUBBLE_R, SCATTER_R;
  const isNarrow = () => W < 780;
  function setRadii() {
    const s = Math.min(1, W / 900);
    BUBBLE_R = Math.max(6.5, +(13 * s).toFixed(1));
    SCATTER_R = Math.max(5, +(8 * s).toFixed(1));
  }
  setRadii();

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
    .attr("r", 0)
    .attr("fill", (d) => colors[d.status])
    .attr("cx", W / 2)
    .attr("cy", H / 2)
    .style("opacity", 0);

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
      nodeEls.attr("stroke", "var(--surface)").attr("stroke-width", 2);
      d3.select(this)
        .attr("stroke", "var(--text-main)")
        .attr("stroke-width", 3.5);
      tooltip
        .html(
          `
        <div class="tt-body">
          <img class="tt-cover" src="${d.cover}" alt="" decoding="async" />
          <div class="tt-text">
            <div class="meta-top">
              <span class="status ${d.status.toLowerCase()}">${d.status}</span>
              <span class="yr">${d.year}</span>
            </div>
            <div class="ttitle">${d.title}</div>
            <div class="creator">${d.creator}</div>
            ${starHTML(d.rating)}
          </div>
        </div>
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
      tooltip
        .style("left", Math.max(4, Math.min(x, W - tw - 4)) + "px")
        .style("top", Math.max(4, y) + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", "var(--surface)").attr("stroke-width", 2);
      tooltip.style("opacity", 0);
    });

  // Legend filters by status
  let activeStatus = null;
  const legendItems = d3.selectAll(".legend__item");

  function applyFilter() {
    nodeEls
      .style("opacity", (d) =>
        !activeStatus || d.status === activeStatus ? 1 : 0.12,
      )
      .style("pointer-events", (d) =>
        !activeStatus || d.status === activeStatus ? null : "none",
      );
    legendItems
      .attr("aria-pressed", function () {
        return this.dataset.status === activeStatus;
      })
      .classed("is-muted", function () {
        return activeStatus !== null && this.dataset.status !== activeStatus;
      });
  }

  legendItems.on("click", function () {
    activeStatus =
      activeStatus === this.dataset.status ? null : this.dataset.status;
    tooltip.style("opacity", 0);
    applyFilter();
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

  // --- Scatter---
  function scatterPositions() {
    const step = SCATTER_R * 2 + 3;

    // Bucket by (year, rating)
    const buckets = {};
    data.forEach((d) => {
      const key = `${d.year}_${d.rating}`;
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(d);
    });

    function maxHalfSpread(yr) {
      const groups = Object.values(buckets).filter((g) => g[0].year === yr);
      return groups.length
        ? Math.max(...groups.map((g) => ((g.length - 1) / 2) * step))
        : 0;
    }
    const LABEL_X = 38;
    const gap = 10;
    const LEGEND_W = isNarrow() ? 0 : 108; // width of legend block

    const firstYr = [...new Set(data.map((d) => d.year))].sort(
      (a, b) => a - b,
    )[0];
    const lastYr = [...new Set(data.map((d) => d.year))]
      .sort((a, b) => a - b)
      .slice(-1)[0];
    const pL = LABEL_X + maxHalfSpread(firstYr) + SCATTER_R + gap;
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
    const keys =
      mode === "year"
        ? [...new Set(data.map((d) => d.year))].sort((a, b) => a - b)
        : mode === "type"
          ? ["Book", "Game"]
          : ["Finished", "Unfinished", "Dropped"];
    const obj = {};

    // Phones stack groups as lanes
    if (isNarrow()) {
      const pT = 18,
        pB = 14,
        LW = 92;
      const lane = (H - pT - pB) / keys.length;
      keys.forEach((key, i) => {
        const y = pT + lane * (i + 0.5);
        obj[key] = { x: (LW + W) / 2, y, labelY: y };
      });
      return obj;
    }

    const spread =
      mode === "year"
        ? keys.map((_, i) => 0.1 + 0.8 * (i / Math.max(keys.length - 1, 1)))
        : mode === "type"
          ? [0.35, 0.65]
          : [0.22, 0.5, 0.78];
    keys.forEach((key, i) => {
      obj[key] = { x: W * spread[i], y: H / 2, labelY: H * 0.15 };
    });
    return obj;
  }

  // --- By Creator:---
  function creatorPositions() {
    const counts = d3.rollup(
      data,
      (v) => v.length,
      (d) => d.creator,
    );
    const recurring = [...counts.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1]);
    const named = new Set(recurring.map(([name]) => name));
    const rows = recurring.map(([name]) => ({
      name,
      items: data.filter((d) => d.creator === name),
    }));
    rows.push({
      name: "Others",
      items: data.filter((d) => !named.has(d.creator)),
    });

    const r = SCATTER_R;
    const narrow = isNarrow();
    const pT = narrow ? 32 : 46,
      pB = 28;
    const LABEL_W = narrow ? 0 : Math.min(150, Math.max(96, W * 0.18));
    const xStart = narrow ? 2 : LABEL_W;
    const rowGap = rows.length > 1 ? (H - pT - pB) / (rows.length - 1) : 0;
    const maxLen = d3.max(rows, (row) => row.items.length);
    const availW = W - LABEL_W - 2 * r - 12;
    const step = Math.min(r * 2 + 3, availW / Math.max(maxLen - 1, 1));

    const positions = {};
    const rowMeta = [];
    rows.forEach((row, ri) => {
      const y = pT + ri * rowGap;
      rowMeta.push({ name: row.name, count: row.items.length, y });
      row.items.forEach((d, i) => {
        positions[d._id] = { x: xStart + r + i * step, y };
      });
    });
    return { positions, rows: rowMeta, r, xStart };
  }

  // --- Distribution ---
  function distributionPositions() {
    const r = SCATTER_R;
    const pL = 40,
      pR = 24,
      pT = 40,
      pB = 50;
    const bins = [...new Set(data.map((d) => d.rating))].sort((a, b) => a - b);
    const xS = d3
      .scalePoint()
      .domain(bins)
      .range([pL + 30, W - pR])
      .padding(0.6);
    const baseline = H - pB;

    const buckets = {};
    data.forEach((d) => {
      (buckets[d.rating] ||= []).push(d);
    });
    const maxStack = d3.max(Object.values(buckets), (b) => b.length);
    const step = Math.min(
      r * 2 + 2,
      (baseline - pT - r) / Math.max(maxStack - 1, 1),
    );

    const positions = {};
    Object.entries(buckets).forEach(([rt, items]) => {
      const x = xS(+rt);
      items.forEach((d, i) => {
        positions[d._id] = { x, y: baseline - r - i * step };
      });
    });
    return { positions, xS, bins, baseline, r, pL };
  }

  // --- Summary ---
  const SUM_ORDER = ["Finished", "Unfinished", "Dropped"];
  const MEDIUM_COLORS = { Book: "#3d5a80", Game: "#9c6644" };

  function summaryLayout() {
    const narrow = isNarrow();

    // Sort data for color clustering in the grid
    const sortedData = [...data].sort((a, b) => {
      if (a.status !== b.status) return a.status.localeCompare(b.status);
      return b.rating - a.rating;
    });

    const positions = {};

    const cols = Math.ceil(Math.sqrt(sortedData.length));
    const rows = Math.ceil(sortedData.length / cols);

    const leftPaneW = narrow ? W : W * 0.45;
    const step = narrow
      ? Math.max(12, Math.min(26, (W - 40) / cols))
      : Math.min(34, (leftPaneW - 48) / cols);
    const r = narrow ? Math.max(4, step * 0.3) : Math.max(6, step * 0.3);

    const gridW = (cols - 1) * step;
    const gridH = (rows - 1) * step;
    const startX = leftPaneW / 2 - gridW / 2;
    const startY = narrow ? 24 + r : H / 2 - gridH / 2;

    sortedData.forEach((d, i) => {
      positions[d._id] = {
        x: startX + (i % cols) * step,
        y: startY + Math.floor(i / cols) * step,
      };
    });

    const valPx = narrow ? Math.min(46, W * 0.13) : 68;
    const unitPx = narrow ? 10 : 12;

    let corners, height;
    if (narrow) {
      const gap = 14;
      const colW = (W - gap) / 2;
      const rowGap = valPx * 2.2;
      const top = startY + gridH + valPx + 40;
      corners = [
        { x: 0, y: top, w: colW },
        { x: colW + gap, y: top, w: colW },
        { x: 0, y: top + rowGap, w: colW },
        { x: colW + gap, y: top + rowGap, w: colW },
      ];
      height = top + rowGap + valPx * 0.7 + 20;
    } else {
      const paneX = W * 0.45;
      const gap = 28;
      const colW = (W - paneX - 48 - gap - 24) / 2;
      const col1 = paneX + 48;
      const col2 = col1 + colW + gap;
      const top = H / 2 - 70;
      corners = [
        { x: col1, y: top, w: colW },
        { x: col2, y: top, w: colW },
        { x: col1, y: top + 200, w: colW },
        { x: col2, y: top + 200, w: colW },
      ];
      height = H;
    }

    return { positions, r, corners, narrow, leftPaneW, valPx, unitPx, height };
  }

  function drawSummary() {
    const layout = summaryLayout();
    const { corners, narrow, leftPaneW, valPx, unitPx } = layout;

    const count = (fn) => data.filter(fn).length;
    const finished = count((d) => d.status === "Finished");
    const books = count((d) => d.type === "Book");
    const games = data.length - books;
    const avg = d3.mean(data, (d) => d.rating).toFixed(1);

    const fade = (g, delay) =>
      g
        .attr("opacity", 0)
        .transition()
        .duration(1200)
        .delay(delay)
        .ease(d3.easeCubicOut)
        .attr("opacity", 1);

    const g = axisLayer.append("g");

    // Very large text
    const valStyle = {
      "font-family": '"Inter", sans-serif',
      "font-weight": "200",
      "font-size": valPx + "px",
      fill: "var(--text-main)",
      "letter-spacing": "-0.04em",
    };
    const unitStyle = {
      "font-family": '"Inter", sans-serif',
      "font-weight": "600",
      "font-size": unitPx + "px",
      fill: "var(--text-muted)",
      "letter-spacing": "0.15em",
      "text-transform": "uppercase",
    };

    const fitText = (sel, maxW, px) => {
      const len = sel.node().getComputedTextLength();
      if (len > maxW && len > 0) sel.style("font-size", (px * maxW) / len + "px");
    };

    const drawText = (val, unit, cell, delay) => {
      const t = g
        .append("text")
        .attr("x", cell.x)
        .attr("y", cell.y)
        .attr("text-anchor", "start");
      Object.entries(valStyle).forEach(([k, v]) => t.style(k, v));
      t.text(val);
      fitText(t, cell.w, valPx);
      fade(t, delay);

      const u = g
        .append("text")
        .attr("x", cell.x)
        .attr("y", cell.y + valPx * 0.45)
        .attr("text-anchor", "start");
      Object.entries(unitStyle).forEach(([k, v]) => u.style(k, v));
      u.text(unit);
      fitText(u, cell.w, unitPx);
      fade(u, delay + 150);
    };

    // 4 big stats
    drawText(data.length, "Total Entries", corners[0], 100);
    drawText(
      Math.round((finished / data.length) * 100) + "%",
      "Finished",
      corners[1],
      200,
    );
    drawText(avg, "Avg Rating", corners[2], 300);
    drawText(`${books} / ${games}`, "Books / Games", corners[3], 400);

    if (!narrow) {
      const line = axisLayer
        .append("line")
        .attr("x1", leftPaneW)
        .attr("x2", leftPaneW)
        .attr("y1", Math.max(40, H * 0.15))
        .attr("y2", Math.min(H - 40, H * 0.85))
        .attr("stroke", "var(--line-color)")
        .attr("stroke-dasharray", "4 6")
        .attr("opacity", 0);
      fade(line, 500);
    }
  }

  // --- Draw axis decorations ---
  function drawAxes(mode) {
    axisLayer.selectAll("*").remove();

    if (mode === "summary") {
      drawSummary();
    } else if (mode === "scatter") {
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
        const col = type === "Book" ? "#3d5a80" : "#9c6644";
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

      // Legend
      [
        ["Books", "#3d5a80"],
        ["Games", "#9c6644"],
      ].forEach(([lbl, col], i) => {
        const narrow = isNarrow();
        const lgX = narrow ? pL : W - pR + hs_last + SCATTER_R + gap;
        const lgY = narrow ? 2 + i * 16 : 8 + i * 20;
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
      // Two swim-lanes
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

      // Rating labels only
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
    } else if (mode === "creator") {
      const { rows, xStart } = creatorPositions();
      const narrow = isNarrow();
      rows.forEach((row) => {
        const g = axisLayer.append("g").attr("opacity", 0);
        if (narrow) {
          g.append("text")
            .attr("class", "creator-label")
            .attr("x", 2)
            .attr("y", row.y - 15)
            .text(`${row.name} · ${row.count}`);
        } else {
          g.append("text")
            .attr("class", "creator-label")
            .attr("x", 8)
            .attr("y", row.y)
            .attr("dominant-baseline", "middle")
            .text(row.name);
          g.append("text")
            .attr("class", "creator-count")
            .attr("x", xStart - 12)
            .attr("y", row.y)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .text(row.count);
        }
        g.transition().duration(500).delay(150).attr("opacity", 1);
      });
    } else if (mode === "distribution") {
      const { xS, bins, baseline, pL } = distributionPositions();
      axisLayer
        .append("line")
        .attr("x1", pL)
        .attr("x2", W - 20)
        .attr("y1", baseline + 11)
        .attr("y2", baseline + 11)
        .attr("stroke", "var(--line-color)")
        .attr("stroke-width", 1)
        .attr("opacity", 0)
        .transition()
        .duration(400)
        .attr("opacity", 1);
      bins.forEach((b) => {
        axisLayer
          .append("text")
          .attr("class", "axis-label")
          .attr("x", xS(b))
          .attr("y", baseline + 27)
          .attr("text-anchor", "middle")
          .text(b % 1 === 0 ? b + ".0" : b)
          .attr("opacity", 0)
          .transition()
          .duration(450)
          .delay(150)
          .attr("opacity", 1);
      });
      axisLayer
        .append("text")
        .attr("class", "axis-label")
        .attr("x", (pL + W - 20) / 2)
        .attr("y", baseline + 42)
        .attr("text-anchor", "middle")
        .text("rating")
        .attr("opacity", 0)
        .transition()
        .duration(450)
        .delay(250)
        .attr("opacity", 1);
    } else {
      // Bubble group labels
      const gp = groupPositions(mode);
      const narrow = isNarrow();
      Object.entries(gp).forEach(([key, pos]) => {
        axisLayer
          .append("text")
          .attr("class", "group-label")
          .attr("x", narrow ? 2 : pos.x)
          .attr("y", pos.labelY)
          .attr("text-anchor", narrow ? "start" : "middle")
          .attr("dominant-baseline", narrow ? "middle" : "auto")
          .text(key)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .attr("opacity", 1);
      });
    }
  }

  // sync
  function setExact(positions, radius, { stagger = 0, duration = 800 } = {}) {
    sim.stop();
    nodeEls.interrupt();
    nodeEls
      .transition()
      .duration(duration)
      .delay((d, i) => stagger * i)
      .ease(d3.easeCubicInOut)
      .attr("r", radius)
      .attrTween("cx", function (d) {
        const x0 = +this.getAttribute("cx");
        const x1 = positions[d._id].x;
        return (t) => (d.x = x0 + (x1 - x0) * t);
      })
      .attrTween("cy", function (d) {
        const y0 = +this.getAttribute("cy");
        const y1 = positions[d._id].y;
        return (t) => (d.y = y0 + (y1 - y0) * t);
      });
  }

  // Cluster dots with the force
  function setForce({
    fx,
    fy,
    radius = BUBBLE_R,
    xStr = 0.12,
    yStr = 0.12,
    collide = BUBBLE_R + 2.5,
    alpha = 0.85,
    alphaDecay = 0.035,
  }) {
    nodeEls.interrupt();
    nodeEls
      .transition()
      .duration(450)
      .delay((d, i) => i * 5)
      .ease(d3.easeCubicOut)
      .attr("r", radius);
    sim
      .force("x", d3.forceX(fx).strength(xStr))
      .force("y", d3.forceY(fy).strength(yStr))
      .force("collide", d3.forceCollide().radius(collide).iterations(4))
      .velocityDecay(0.5)
      .alphaDecay(alphaDecay)
      .alpha(alpha)
      .restart();
  }

  // --- Activate a mode ---
  function updateMode(mode) {
    svg.attr("height", mode === "summary" ? summaryLayout().height : H);
    drawAxes(mode);

    if (mode === "summary") {
      const { positions, r } = summaryLayout();
      setExact(positions, r, { stagger: 4 });
    } else if (mode === "scatter") {
      setExact(scatterPositions().positions, SCATTER_R, { stagger: 6 });
    } else if (mode === "creator") {
      const { positions, r } = creatorPositions();
      setExact(positions, r, { stagger: 5 });
    } else if (mode === "distribution") {
      const { positions, r } = distributionPositions();
      setExact(positions, r, { stagger: 5 });
    } else if (mode === "rating") {
      const pL = Math.round(W * 0.07),
        pR = Math.round(W * 0.04);
      const xS = d3
        .scaleLinear()
        .domain([1.75, 5.25])
        .range([pL, W - pR]);
      setForce({
        fx: (d) => xS(d.rating),
        fy: (d) => (d.type === "Book" ? H * 0.25 : H * 0.75),
        xStr: 0.2,
        yStr: 0.16,
        alpha: 0.7,
        alphaDecay: 0.018,
      });
    } else {
      const gp = groupPositions(mode);
      const narrow = isNarrow();
      const tight = mode === "year";
      setForce({
        fx: (d) => gp[d[mode]].x,
        fy: (d) => gp[d[mode]].y,
        xStr: narrow ? 0.09 : tight ? 0.5 : 0.12,
        yStr: narrow ? 0.42 : tight ? 0.14 : 0.12,
        collide: tight && !narrow ? BUBBLE_R + 1.5 : BUBBLE_R + 2.5,
      });
    }
  }

  // --- Resize ---
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      W = getW();
      H = getH();
      setRadii();
      svg.attr("width", W).attr("height", H);
      updateMode(d3.select(".controls button.active").attr("data-mode"));
    }, 120);
  });

  // --- Init ---
  updateMode("year");
  requestAnimationFrame(() => nodeEls.style("opacity", 1));

  d3.selectAll(".controls button").on("click", function () {
    d3.selectAll(".controls button").classed("active", false);
    d3.select(this).classed("active", true);
    updateMode(d3.select(this).attr("data-mode"));
  });
}
