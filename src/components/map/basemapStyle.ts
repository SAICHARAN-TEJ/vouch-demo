import type { StyleSpecification } from "maplibre-gl";

/**
 * Vouch basemap — a hand-built style over OpenFreeMap's free OpenMapTiles
 * vector tiles (no API key, no style.json network fetch).
 *
 * The palette mirrors the app's paper + teal system: a calm paper field,
 * soft teal water, white carriageways on gray casings, and quiet gray
 * labels — so the teal route corridor and hazard markers carry the color.
 *
 * Roughly 18 layers versus ~80 in a stock basemap: fewer vector layers to
 * decode and draw, which shows up as a faster first paint on mobile GPUs.
 */
export function basemapStyle(): StyleSpecification {
  return {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: {
      openmaptiles: {
        type: "vector",
        url: "https://tiles.openfreemap.org/planet",
      },
    },
    layers: [
      {
        id: "bg",
        type: "background",
        paint: { "background-color": "#f3f6f5" },
      },
      {
        id: "park",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "park",
        paint: { "fill-color": "#e6efe6" },
      },
      {
        id: "landuse",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landuse",
        filter: ["==", ["get", "class"], "residential"],
        paint: {
          "fill-color": "#ebf0f0",
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0.6, 12, 0.45],
        },
      },
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        filter: ["!=", ["get", "brunnel"], "tunnel"],
        paint: { "fill-color": "#d8e7e9" },
      },
      {
        id: "waterway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "waterway",
        paint: {
          "line-color": "#cfe1e3",
          "line-width": ["interpolate", ["linear"], ["zoom"], 12, 0.8, 16, 3],
        },
      },
      {
        id: "building",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 13,
        paint: { "fill-color": "#e9eeef" },
      },
      {
        id: "boundary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        minzoom: 8,
        filter: [
          "all",
          [">=", ["get", "admin_level"], 2],
          ["<=", ["get", "admin_level"], 6],
          ["!=", ["get", "maritime"], 1],
        ],
        paint: {
          "line-color": "#d4dcdd",
          "line-dasharray": [2, 3],
          "line-width": 1,
        },
      },
      {
        id: "rail",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 13,
        filter: ["all", ["==", ["get", "class"], "rail"], ["!", ["has", "service"]]],
        paint: {
          "line-color": "#d9e0e2",
          "line-width": ["interpolate", ["linear"], ["zoom"], 13, 1, 17, 4],
        },
      },
      {
        id: "tunnel-casing",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: [
          "all",
          ["==", ["get", "brunnel"], "tunnel"],
          [
            "match",
            ["get", "class"],
            ["motorway", "trunk", "primary", "secondary", "tertiary"],
            true,
            false,
          ],
        ],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ccd6d9",
          "line-opacity": 0.55,
          "line-width": ["interpolate", ["linear"], ["zoom"], 12, 3, 16, 9],
        },
      },
      {
        id: "motorway-casing",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: [
          "all",
          ["!=", ["get", "brunnel"], "tunnel"],
          ["==", ["get", "class"], "motorway"],
        ],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#c7d3d6",
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 3, 17, 18],
        },
      },
      {
        id: "major-casing",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 11,
        filter: [
          "all",
          ["!=", ["get", "brunnel"], "tunnel"],
          [
            "match",
            ["get", "class"],
            ["trunk", "primary", "secondary", "tertiary"],
            true,
            false,
          ],
        ],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ccd6d9",
          "line-width": ["interpolate", ["linear"], ["zoom"], 11, 2.6, 17, 14],
        },
      },
      {
        id: "minor",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 13,
        filter: [
          "all",
          ["!=", ["get", "brunnel"], "tunnel"],
          ["match", ["get", "class"], ["minor", "service", "track"], true, false],
        ],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-opacity": 0.95,
          "line-width": ["interpolate", ["linear"], ["zoom"], 13, 1.4, 17, 12],
        },
      },
      {
        id: "motorway-inner",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: [
          "all",
          ["!=", ["get", "brunnel"], "tunnel"],
          ["==", ["get", "class"], "motorway"],
        ],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 17, 15],
        },
      },
      {
        id: "major-inner",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 11,
        filter: [
          "all",
          ["!=", ["get", "brunnel"], "tunnel"],
          [
            "match",
            ["get", "class"],
            ["trunk", "primary", "secondary", "tertiary"],
            true,
            false,
          ],
        ],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": ["interpolate", ["linear"], ["zoom"], 11, 1.8, 17, 12],
        },
      },
      {
        id: "water-name",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "water_name",
        minzoom: 12,
        layout: {
          "symbol-placement": "line",
          "text-field": ["coalesce", ["get", "name:latin"], ["get", "name_en"], ["get", "name"]],
          "text-font": ["Noto Sans Italic"],
          "text-size": 11,
        },
        paint: {
          "text-color": "#9db4b6",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1,
        },
      },
      {
        id: "place-city",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        minzoom: 8,
        filter: ["==", ["get", "class"], "city"],
        layout: {
          "text-field": ["coalesce", ["get", "name:latin"], ["get", "name_en"], ["get", "name"]],
          "text-font": ["Noto Sans Bold"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 8, 11, 14, 15],
        },
        paint: {
          "text-color": "#4f5f6a",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.2,
        },
      },
      {
        id: "place-town",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        minzoom: 11,
        filter: ["match", ["get", "class"], ["town", "suburb", "village"], true, false],
        layout: {
          "text-field": ["coalesce", ["get", "name:latin"], ["get", "name_en"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 11, 10, 14, 12],
        },
        paint: {
          "text-color": "#6c7a7d",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1,
        },
      },
      {
        id: "highway-name",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "transportation_name",
        minzoom: 13,
        filter: [
          "match",
          ["get", "class"],
          ["motorway", "trunk", "primary", "secondary", "tertiary", "minor"],
          true,
          false,
        ],
        layout: {
          "symbol-placement": "line",
          "text-field": ["coalesce", ["get", "name:latin"], ["get", "name_en"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 13, 10, 16, 12],
        },
        paint: {
          "text-color": "#69787b",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1,
        },
      },
    ],
  };
}
