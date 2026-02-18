from pathlib import Path

import geopandas as gpd
import matplotlib.colors as mcolors
import matplotlib.patheffects as pe
import matplotlib.pyplot as plt
from matplotlib.colorbar import ColorbarBase
from matplotlib.colors import Normalize

gdf = gpd.read_file("toronto_heat_canopy_final.geojson")
gdf = gdf.to_crs(epsg=4326)

HEAT_COLORS = [
    "#ebdccb",   
    "#e0a080",   
    "#d67c5e",   
    "#c95d60",  
    "#a83236",   
    "#5e1013",  
]
cmap = mcolors.LinearSegmentedColormap.from_list("heat", HEAT_COLORS, N=256)

vmin = gdf["lst_mean"].quantile(0.02)
vmax = gdf["lst_mean"].quantile(0.98)
norm = Normalize(vmin=vmin, vmax=vmax)

fig, ax = plt.subplots(1, 1, figsize=(8, 8), facecolor="white")
ax.set_facecolor("white")
ax.set_aspect("equal")

gdf.plot(
    ax=ax,
    column="lst_mean",
    cmap=cmap,
    norm=norm,
    linewidth=0.25,
    edgecolor="#555555", 
    missing_kwds={"color": "#eeeeee"},
)

top_hot = gdf.nlargest(8, "lst_mean")
top_hot.plot(
    ax=ax,
    facecolor="none",
    edgecolor="#a83236", 
    linewidth=1.1,
    alpha=0.75,
)

hottest = gdf.loc[gdf["lst_mean"].idxmax()]
cx = hottest.geometry.centroid.x
cy = hottest.geometry.centroid.y
ax.annotate(
    hottest["HOOD"],
    xy=(cx, cy),
    fontsize=5.5,
    color="#a83236",
    ha="center",
    va="center",
    fontfamily="serif",
    path_effects=[pe.withStroke(linewidth=2, foreground="white")], 
)

fig.text(
    0.5, 0.195,
    "TORONTO",
    fontsize=23, fontweight="bold", color="#333333",
    fontfamily="serif", ha="center"
)
fig.text(
    0.5, 0.155,
    "Urban Heat Islands",
    fontsize=16, color="#a83236",
    fontfamily="serif", ha="center"
)
fig.text(
    0.5, 0.130,
    "Land Surface Temperature · Summer",
    fontsize=9, color="#666666",
    fontfamily="serif", ha="center"
)

cbar_ax = fig.add_axes([0.20, 0.05, 0.60, 0.022]) 
cb = ColorbarBase(cbar_ax, cmap=cmap, norm=norm, orientation="horizontal")
cb.outline.set_visible(False)

cbar_ax.tick_params(
    axis="x", labelsize=7, colors="#555555", length=3, pad=3
)
cbar_ax.set_xlabel(
    "Avg Summer LST (°C)",
    color="#555555",
    fontsize=7,
    labelpad=4,
    fontfamily="serif",
)
for spine in cbar_ax.spines.values():
    spine.set_visible(False)

ax.set_xticks([])
ax.set_yticks([])
for spine in ax.spines.values():
    spine.set_visible(False)

bounds = gdf.total_bounds
pad_x = (bounds[2] - bounds[0]) * 0.03
pad_y = (bounds[3] - bounds[1]) * 0.03
ax.set_xlim(bounds[0] - pad_x, bounds[2] + pad_x)
ax.set_ylim(bounds[1] - pad_y, bounds[3] + pad_y)

plt.subplots_adjust(left=0.01, right=0.99, top=0.99, bottom=0.16)

out = Path("UH_thumbnail.png")
fig.savefig(out, dpi=120, bbox_inches="tight", facecolor=fig.get_facecolor())
print(f"Saved → {out.resolve()}")
plt.close()