// Configuration
let geoData, scatterData, selectedNeighborhood = '';

// Everforest color palette
const colors = {
    bg0: "#2d353b",
    bg1: "#343f44",
    bg2: "#3d484d",
    bg3: "#475258",
    bg4: "#4f585e",
    fg: "#d3c6aa",
    red: "#e67e80",
    orange: "#e69875",
    yellow: "#dbbc7f",
    green: "#a7c080",
    aqua: "#83c092",
    blue: "#7fbbb3",
    purple: "#d699b6",
    grey0: "#7a8478",
    grey1: "#859289",
    grey2: "#9da9a0"
};

// Initialize the visualization
async function initVisualization() {
    try {
        // Load data
        await loadData();
        
        // Initialize neighborhood selector
        initNeighborhoodSelector();
        
        // Create initial visualization
        updateVisualization();
        
    } catch (error) {
        console.error('Error initializing visualization:', error);
        document.getElementById('visualization').innerHTML = `
            <div style="color: #e67e80; text-align: center; padding: 40px;">
                Error loading visualization. Please check console for details.
            </div>
        `;
    }
}

// Load data from local files
async function loadData() {
    try {
        // Load GeoJSON data
        const geoResponse = await fetch('/Toronto_UH/toronto_heat_canopy_final.geojson');
        geoData = await geoResponse.json();
        
        // Load CSV data
        const scatterResponse = await fetch('/Toronto_UH/scatter_data.csv');
        const csvText = await scatterResponse.text();
        scatterData = d3.csvParse(csvText);
        
        // VALIDATE DATA - ADD THIS
        console.log('First row of scatter data:', scatterData[0]);
        console.log('Available columns:', Object.keys(scatterData[0]));
        
        // Check if required fields exist, use fallbacks
        scatterData.forEach(d => {
            // Use new field names or fall back to old names
            d.lst_mean = d.lst_mean || d.temperature || 0;
            d.greenspace_pct = d.greenspace_pct || d.vegetation || d.total_vegetation_pct || 0;
            d.cooling_score = d.cooling_score || 0;
            d.HOOD = d.HOOD || d.neighborhood || 'Unknown';
        });
        
        console.log('Data loaded successfully:', {
            geoFeatures: geoData.features.length,
            scatterData: scatterData.length
        });
        
    } catch (error) {
        console.error('Error loading data:', error);
        throw new Error('Failed to load data files. Make sure scatter_data.csv and toronto_heat_canopy_final.geojson are in the same folder.');
    }
}
// Initialize neighborhood selector dropdown
function initNeighborhoodSelector() {
    const selector = document.getElementById('neighborhood-selector');
    
    // Clear existing options except the first one
    while (selector.children.length > 1) {
        selector.removeChild(selector.lastChild);
    }
    
    // Add neighborhood options
    scatterData.forEach(d => {
        const option = document.createElement('option');
        option.value = d.HOOD;
        option.textContent = d.HOOD;
        selector.appendChild(option);
    });
    
    // Add event listener
    selector.addEventListener('change', function() {
        selectedNeighborhood = this.value;
        updateVisualization();
    });
}

// Main visualization function (your code adapted for standalone use)
function updateVisualization() {
    const container = d3.select('#visualization');
    container.html(''); // Clear previous content
    
    // Your visualization code here - wrapped in a try-catch for error handling
    try {
        const vizContainer = createVisualization();
        container.node().appendChild(vizContainer);
    } catch (error) {
        console.error('Error creating visualization:', error);
        container.html(`
            <div style="color: #e67e80; text-align: center; padding: 40px;">
                Error creating visualization: ${error.message}
            </div>
        `);
    }
}

// Your visualization code (slightly modified for standalone use)
function createVisualization() {
    const container = d3.create("div")
        .style("background", `linear-gradient(135deg, ${colors.bg0} 0%, ${colors.bg1} 100%)`)
        .style("padding", "5px")
        .style("border-radius", "16px")
        .style("font-family", "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif")
        .style("width", "100%")
        .style("max-width", "auto")
        .style("margin", "0 auto");

    // Main grid layout
    const mainGrid = container.append("div")
        .style("display", "grid")
        .style("grid-template-columns", selectedNeighborhood ? "1fr 1fr" : "1fr")
        .style("gap", "30px")
        .style("width", "100%");

    // ==================== MAP SECTION ====================
    const mapContainer = mainGrid.append("div")
        .style("background", colors.bg2)
        .style("padding", "35px")
        .style("border-radius", "12px")
        .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)")
        .style("height", "fit-content");

    const mapWidth = 900;
    const mapHeight = 900;
    const margin = {top: 70, right: 20, bottom: 30, left: 20};

    const mapSvg = mapContainer.append("svg")
        .attr("width", "100%")
        .attr("height", "auto")
        .attr("viewBox", [0, 0, mapWidth, mapHeight])
        .style("max-width", "100%")
        .style("height", "auto");

    const defs = mapSvg.append("defs");

    // Add shadow filter
    const shadow = defs.append("filter")
        .attr("id", "shadow")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
    
    shadow.append("feDropShadow")
        .attr("dx", "0")
        .attr("dy", "2")
        .attr("stdDeviation", "3")
        .attr("flood-color", "#000000")
        .attr("flood-opacity", "0.3");

    mapSvg.append("rect")
        .attr("width", mapWidth)
        .attr("height", mapHeight)
        .attr("fill", "#282828")
        .attr("rx", 12);

    // Title
    mapSvg.append("text")
        .attr("x", mapWidth / 2)
        .attr("y", 35)
        .attr("text-anchor", "middle")
        .attr("font-size", "28px")
        .attr("font-weight", "800")
        .attr("fill", "#d3c6aa")
        .attr("filter", "url(#shadow)")
        .text("Toronto Neighborhood Heat Map");

    mapSvg.append("text")
        .attr("x", mapWidth / 2)
        .attr("y", 58)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .attr("font-weight", "500")
        .attr("fill", "#999")
        .text("Click on a neighborhood to explore");

    // Vibrant red color scale
    const colorScaleTemp = d3.scaleSequential()
        .domain(d3.extent(scatterData, d => +d.lst_mean))
        .interpolator(d3.interpolateRgbBasis(["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"]));

    // Map projection
    const projection = d3.geoIdentity()
        .reflectY(true)
        .angle(-17)
        .fitSize([mapWidth - 180, mapHeight - margin.top - 40], geoData);

    const path = d3.geoPath().projection(projection);

    const mapGroup = mapSvg.append("g")
        .attr("transform", `translate(${margin.left + 10}, ${margin.top})`);

    // Draw neighborhoods
    mapGroup.selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", d => {
            const hood = scatterData.find(h => h.HOOD === d.properties.HOOD);
            return hood ? colorScaleTemp(+hood.lst_mean) : "#444";
        })
        .attr("stroke", d => d.properties.HOOD === selectedNeighborhood ? colors.green : "#1a1a1a")
        .attr("stroke-width", 0.8)
        .attr("opacity", d => selectedNeighborhood && d.properties.HOOD !== selectedNeighborhood ? 0.5 : 1)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            if (d.properties.HOOD !== selectedNeighborhood) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("stroke", "#666")
                    .attr("stroke-width", 2.5)
                    .attr("opacity", 1);
            }
        })
        .on("mouseout", function(event, d) {
            if (d.properties.HOOD !== selectedNeighborhood) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("stroke", "#1a1a1a")
                    .attr("stroke-width", 0.8)
                    .attr("opacity", selectedNeighborhood ? 0.5 : 1);
            }
        })
        .on("click", function(event, d) {
            const select = document.getElementById('neighborhood-selector');
            if (select) {
                select.value = d.properties.HOOD;
                selectedNeighborhood = d.properties.HOOD;
                updateVisualization();
            }
        })
        .append("title")
        .text(d => {
            const hood = scatterData.find(h => h.HOOD === d.properties.HOOD);
            return hood ? `${d.properties.HOOD}\n${hood.lst_mean}°C` : d.properties.HOOD;
        });

    // Selected label
    if (selectedNeighborhood) {
        const selectedFeature = geoData.features.find(f => f.properties.HOOD === selectedNeighborhood);
        if (selectedFeature) {
            const centroid = path.centroid(selectedFeature);
            const bbox = {width: 160, height: 32};
            
            mapGroup.append("rect")
                .attr("x", centroid[0] - bbox.width/2)
                .attr("y", centroid[1] + 18)
                .attr("width", bbox.width)
                .attr("height", bbox.height)
                .attr("fill", colors.bg1)
                .attr("stroke", colors.green)
                .attr("stroke-width", 2.5)
                .attr("rx", 8)
                .attr("opacity", 0.95)
                .attr("filter", "url(#shadow)");
            
            mapGroup.append("text")
                .attr("x", centroid[0])
                .attr("y", centroid[1] + 38)
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("font-weight", "700")
                .attr("fill", colors.green)
                .text(selectedNeighborhood.length > 22 ? selectedNeighborhood.substring(0, 20) + "..." : selectedNeighborhood);
        }
    }

    // Compact Legend
    const legendWidth = 140;
    const legendHeight = 200;
    const legendX = mapWidth - legendWidth - 30;
    const legendY = margin.top + 30;

    const legend = mapSvg.append("g")
        .attr("transform", `translate(${legendX}, ${legendY})`);

    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("fill", colors.bg1)
        .attr("stroke", colors.bg4)
        .attr("stroke-width", 2)
        .attr("rx", 12)
        .attr("filter", "url(#shadow)");

    legend.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", 22)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .attr("font-weight", "700")
        .attr("fill", colors.fg)
        .text("Surface Temperature");

    // Temperature gradient
    const tempGradient = defs.append("linearGradient")
        .attr("id", "temp-gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

    const tempExtent = d3.extent(scatterData, d => +d.lst_mean);
    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const temp = tempExtent[0] + t * (tempExtent[1] - tempExtent[0]);
        tempGradient.append("stop")
            .attr("offset", `${i * 10}%`)
            .attr("stop-color", colorScaleTemp(temp));
    }

    const gradientHeight = 110;
    const gradientX = 25;
    const gradientY = 40;

    legend.append("rect")
        .attr("x", gradientX)
        .attr("y", gradientY)
        .attr("width", 30)
        .attr("height", gradientHeight)
        .attr("fill", "url(#temp-gradient)")
        .attr("stroke", colors.bg4)
        .attr("stroke-width", 1.5)
        .attr("rx", 4);

    const legendScale = d3.scaleLinear()
        .domain(tempExtent)
        .range([gradientY + gradientHeight, gradientY]);

    const legendAxis = d3.axisRight(legendScale)
        .ticks(5)
        .tickFormat(d => `${d.toFixed(1)}°C`);

    legend.append("g")
        .attr("transform", `translate(${gradientX + 30}, 0)`)
        .call(legendAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
            .attr("x2", 6)
            .attr("stroke", colors.bg4))
        .call(g => g.selectAll(".tick text")
            .attr("x", 10)
            .attr("font-size", "10px")
            .attr("fill", colors.grey1)
            .attr("font-weight", "500"));

    legend.append("line")
        .attr("x1", 15)
        .attr("x2", legendWidth - 15)
        .attr("y1", gradientY + gradientHeight + 18)
        .attr("y2", gradientY + gradientHeight + 18)
        .attr("stroke", colors.bg4)
        .attr("stroke-width", 1);

    legend.append("rect")
        .attr("x", 25)
        .attr("y", gradientY + gradientHeight + 26)
        .attr("width", 22)
        .attr("height", 16)
        .attr("fill", "none")
        .attr("stroke", colors.green)
        .attr("stroke-width", 2.5)
        .attr("rx", 3);

    legend.append("text")
        .attr("x", 52)
        .attr("y", gradientY + gradientHeight + 38)
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .attr("fill", colors.green)
        .text("Selected");

    // ==================== RIGHT PANEL (Scatterplot + Stats) ====================
    if (selectedNeighborhood) {
        const rightPanel = mainGrid.append("div")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("gap", "25px")
            .style("min-width", "0");

        // ========== SCATTERPLOT ==========
        const scatterContainer = rightPanel.append("div")
            .style("background", colors.bg2)
            .style("padding", "20px")
            .style("border-radius", "12px")
            .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)")
            .style("overflow", "hidden");

        const scatterWidth = 700;
        const scatterHeight = 400;
        const scatterMargin = {top: 50, right: 40, bottom: 60, left: 70};

        const scatterSvg = scatterContainer.append("svg")
            .attr("width", "100%")
            .attr("height", "auto")
            .attr("viewBox", [0, 0, scatterWidth, scatterHeight])
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("max-width", "100%")
            .style("height", "auto")
            .style("display", "block");

        // Background
        scatterSvg.append("rect")
            .attr("width", scatterWidth)
            .attr("height", scatterHeight)
            .attr("fill", colors.bg1)
            .attr("rx", 12);

        // Title
        scatterSvg.append("text")
            .attr("x", scatterWidth / 2)
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .attr("font-weight", "700")
            .attr("fill", colors.fg)
            .text("Temperature vs Greenspace Coverage");

        const x = d3.scaleLinear()
            .domain([0, d3.max(scatterData, d => +d.greenspace_pct) * 1.05])
            .range([scatterMargin.left, scatterWidth - scatterMargin.right]);

        const y = d3.scaleLinear()
            .domain([d3.min(scatterData, d => +d.lst_mean) * 0.98, d3.max(scatterData, d => +d.lst_mean) * 1.02])
            .range([scatterHeight - scatterMargin.bottom, scatterMargin.top]);

        // Grid lines
        scatterSvg.selectAll("line.vertical")
            .data(x.ticks(8))
            .join("line")
            .attr("x1", d => x(d))
            .attr("x2", d => x(d))
            .attr("y1", scatterMargin.top)
            .attr("y2", scatterHeight - scatterMargin.bottom)
            .attr("stroke", colors.bg3)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3");

        scatterSvg.selectAll("line.horizontal")
            .data(y.ticks(6))
            .join("line")
            .attr("x1", scatterMargin.left)
            .attr("x2", scatterWidth - scatterMargin.right)
            .attr("y1", d => y(d))
            .attr("y2", d => y(d))
            .attr("stroke", colors.bg3)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3");

        // Trend line
        const xMean = d3.mean(scatterData, d => +d.greenspace_pct);
        const yMean = d3.mean(scatterData, d => +d.lst_mean);
        let num = 0, den = 0;
        scatterData.forEach(d => {
            const dx = +d.greenspace_pct - xMean;
            const dy = +d.lst_mean - yMean;
            num += dx * dy;
            den += dx * dx;
        });
        const slope = num / den;
        const intercept = yMean - slope * xMean;
        const correlation = num / Math.sqrt(den * d3.sum(scatterData, d => Math.pow(+d.lst_mean - yMean, 2)));

        const xExtent = d3.extent(scatterData, d => +d.greenspace_pct);
        scatterSvg.append("line")
            .attr("x1", x(xExtent[0]))
            .attr("y1", y(slope * xExtent[0] + intercept))
            .attr("x2", x(xExtent[1]))
            .attr("y2", y(slope * xExtent[1] + intercept))
            .attr("stroke", colors.aqua)
            .attr("stroke-width", 2.5)
            .attr("stroke-dasharray", "6,4")
            .attr("opacity", 0.7);

        // Points
        scatterSvg.selectAll("circle")
            .data(scatterData)
            .join("circle")
            .attr("cx", d => x(+d.greenspace_pct))
            .attr("cy", d => y(+d.lst_mean))
            .attr("r", d => d.HOOD === selectedNeighborhood ? 9 : 6)
            .attr("fill", d => colorScaleTemp(+d.lst_mean))
            .attr("stroke", d => d.HOOD === selectedNeighborhood ? colors.green : colors.bg0)
            .attr("stroke-width", d => d.HOOD === selectedNeighborhood ? 3.5 : 2)
            .attr("opacity", d => d.HOOD === selectedNeighborhood ? 1 : 0.7)
            .style("cursor", "pointer")
            .on("mouseenter", function(event, d) {
                if (d.HOOD !== selectedNeighborhood) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", 8)
                        .attr("opacity", 1);
                }
            })
            .on("mouseleave", function(event, d) {
                if (d.HOOD !== selectedNeighborhood) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", 6)
                        .attr("opacity", 0.7);
                }
            })
            .on("click", function(event, d) {
                const select = document.getElementById('neighborhood-selector');
                if (select) {
                    select.value = d.HOOD;
                    selectedNeighborhood = d.HOOD;
                    updateVisualization();
                }
            })
            .append("title")
            .text(d => `${d.HOOD}\nTemp: ${d.lst_mean}°C\nGreenspace: ${d.greenspace_pct}%`);

        // Axes
        const xAxis = scatterSvg.append("g")
            .attr("transform", `translate(0, ${scatterHeight - scatterMargin.bottom})`)
            .call(d3.axisBottom(x).ticks(8).tickFormat(d => `${d}%`));

        xAxis.selectAll("text")
            .attr("font-size", "11px")
            .attr("fill", colors.grey1)
            .attr("font-weight", "500");

        xAxis.selectAll("line, path")
            .attr("stroke", colors.bg4);

        const yAxis = scatterSvg.append("g")
            .attr("transform", `translate(${scatterMargin.left}, 0)`)
            .call(d3.axisLeft(y).ticks(6).tickFormat(d => `${d.toFixed(1)}°C`));

        yAxis.selectAll("text")
            .attr("font-size", "11px")
            .attr("fill", colors.grey1)
            .attr("font-weight", "500");

        yAxis.selectAll("line, path")
            .attr("stroke", colors.bg4);

        // Axis labels
        scatterSvg.append("text")
            .attr("x", scatterWidth / 2)
            .attr("y", scatterHeight - 15)
            .attr("text-anchor", "middle")
            .attr("font-size", "13px")
            .attr("font-weight", "600")
            .attr("fill", colors.fg)
            .text("Greenspace Coverage (%)");

        scatterSvg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -scatterHeight / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "13px")
            .attr("font-weight", "600")
            .attr("fill", colors.fg)
            .text("Surface Temperature (°C)");

        // Correlation
        scatterSvg.append("text")
            .attr("x", scatterWidth - scatterMargin.right - 10)
            .attr("y", scatterMargin.top + 15)
            .attr("text-anchor", "end")
            .attr("font-size", "12px")
            .attr("font-weight", "600")
            .attr("fill", colors.aqua)
            .text(`r = ${correlation.toFixed(3)}`);

        // ========== STATS PANEL ==========
        const selectedData = scatterData.find(d => d.HOOD === selectedNeighborhood);

        const statsPanel = rightPanel.append("div")
            .style("background", colors.bg2)
            .style("padding", "25px")
            .style("border-radius", "12px")
            .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)");

        statsPanel.append("h2")
            .style("font-size", "22px")
            .style("font-weight", "800")
            .style("margin", "0 0 18px 0")
            .style("color", colors.fg)
            .text(`${selectedNeighborhood}`);

        const statsGrid = statsPanel.append("div")
            .style("display", "grid")
            .style("grid-template-columns", "repeat(auto-fit, minmax(180px, 1fr))")
            .style("gap", "15px");

        // Temperature stat
        const tempStat = statsGrid.append("div")
            .style("background", colors.bg3)
            .style("padding", "18px")
            .style("border-radius", "10px")
            .style("border-left", `4px solid ${colors.red}`);

        tempStat.append("div")
            .style("font-size", "10px")
            .style("color", colors.grey1)
            .style("margin-bottom", "6px")
            .style("font-weight", "600")
            .style("text-transform", "uppercase")
            .style("letter-spacing", "0.5px")
            .text("Surface Temperature");

        tempStat.append("div")
            .style("font-size", "28px")
            .style("font-weight", "800")
            .style("color", colors.red)
            .style("line-height", "1")
            .text(`${selectedData.lst_mean}°C`);

        // Greenspace stat
        const greenStat = statsGrid.append("div")
            .style("background", colors.bg3)
            .style("padding", "18px")
            .style("border-radius", "10px")
            .style("border-left", `4px solid ${colors.green}`);

        greenStat.append("div")
            .style("font-size", "10px")
            .style("color", colors.grey1)
            .style("margin-bottom", "6px")
            .style("font-weight", "600")
            .style("text-transform", "uppercase")
            .style("letter-spacing", "0.5px")
            .text("Greenspace Coverage");

        greenStat.append("div")
            .style("font-size", "28px")
            .style("font-weight", "800")
            .style("color", colors.green)
            .style("line-height", "1")
            .text(`${selectedData.greenspace_pct}%`);

        // Cooling stat
        const coolStat = statsGrid.append("div")
            .style("background", colors.bg3)
            .style("padding", "18px")
            .style("border-radius", "10px")
            .style("border-left", `4px solid ${colors.aqua}`);

        coolStat.append("div")
            .style("font-size", "10px")
            .style("color", colors.grey1)
            .style("margin-bottom", "6px")
            .style("font-weight", "600")
            .style("text-transform", "uppercase")
            .style("letter-spacing", "0.5px")
            .text("Cooling Score");

        coolStat.append("div")
            .style("font-size", "28px")
            .style("font-weight", "800")
            .style("color", colors.aqua)
            .style("line-height", "1")
            .text(`${selectedData.cooling_score}`);
    }

    // ==================== OVERALL STATS ====================
    const overallStats = container.append("div")
        .style("background", colors.bg2)
        .style("padding", "25px")
        .style("border-radius", "12px")
        .style("margin-top", "25px")
        .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)");

    overallStats.append("h3")
        .style("font-size", "18px")
        .style("font-weight", "700")
        .style("margin", "0 0 18px 0")
        .style("color", colors.fg)
        .text("Overall Statistics (City of Toronto)");

    const overallGrid = overallStats.append("div")
        .style("display", "grid")
        .style("grid-template-columns", "repeat(auto-fit, minmax(300px, 1fr))")
        .style("gap", "15px");

    const statItems = [
        { label: "Total Neighborhoods", value: scatterData.length, color: colors.aqua },
        { 
            label: "Temperature Range", 
            value: `${d3.min(scatterData, d => +d.lst_mean).toFixed(1)}°C - ${d3.max(scatterData, d => +d.lst_mean).toFixed(1)}°C`,
            color: colors.red 
        },
        { 
            label: "Greenspace Range", 
            value: `${d3.min(scatterData, d => +d.greenspace_pct).toFixed(1)}% - ${d3.max(scatterData, d => +d.greenspace_pct).toFixed(1)}%`,
            color: colors.green 
        }
    ];

    statItems.forEach(item => {
        const statDiv = overallGrid.append("div")
            .style("background", colors.bg3)
            .style("padding", "16px 20px")
            .style("border-radius", "10px")
            .style("display", "flex")
            .style("justify-content", "space-between")
            .style("align-items", "center");

        statDiv.append("strong")
            .style("color", colors.fg)
            .style("font-size", "14px")
            .text(`${item.label}:`);

        statDiv.append("span")
            .style("font-weight", "600")
            .style("color", item.color)
            .style("font-size", "14px")
            .text(item.value);
    });

    return container.node();
}

// Start the visualization when the page loads
document.addEventListener('DOMContentLoaded', initVisualization);