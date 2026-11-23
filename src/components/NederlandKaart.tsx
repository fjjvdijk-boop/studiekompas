"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource, type Map as MLMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Stoplicht } from "@/lib/bereken";
import { useDonker } from "@/lib/thema";

export interface KaartPunt {
  naam: string;
  label: string;
  lat: number;
  lng: number;
  aantal: number;
  licht: Stoplicht;
  maandlasten: number;
}

const KLEUR: Record<Stoplicht, string> = { groen: "#12a660", oranje: "#f07c1b", rood: "#e0344a" };

function geojson(punten: KaartPunt[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: punten.map((p) => ({
      type: "Feature",
      id: p.naam,
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: {
        naam: p.naam,
        label: p.label,
        aantal: p.aantal,
        kleur: KLEUR[p.licht],
        prijs: `€ ${Math.round(p.maandlasten)}`,
      },
    })),
  };
}

export default function NederlandKaart({
  punten,
  thuis,
  gekozen,
  kies,
}: {
  punten: KaartPunt[];
  thuis: { naam: string; lat: number; lng: number };
  gekozen: string | null;
  kies: (naam: string | null) => void;
}) {
  const doos = useRef<HTMLDivElement>(null);
  const kaart = useRef<MLMap | null>(null);
  const thuisMarker = useRef<maplibregl.Marker | null>(null);
  const [klaar, setKlaar] = useState(false);
  const donker = useDonker();
  const kiesRef = useRef(kies);
  kiesRef.current = kies;
  const puntenRef = useRef(punten);
  puntenRef.current = punten;

  // Kaart maken (opnieuw als het thema wisselt)
  useEffect(() => {
    if (!doos.current) return;
    const map = new maplibregl.Map({
      container: doos.current,
      style: `https://tiles.openfreemap.org/styles/${donker ? "dark" : "positron"}`,
      bounds: [
        [3.3, 50.72],
        [7.25, 53.56],
      ],
      fitBoundsOptions: { padding: 24 },
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.touchZoomRotate.disableRotation();

    map.on("load", () => {
      // Plaatsnamen van de ondergrond verbergen: onze eigen labels laten de naam én de prijs zien
      for (const laag of map.getStyle().layers ?? []) {
        if (laag.type === "symbol" && /place|city|town|village|label_/i.test(laag.id))
          map.setLayoutProperty(laag.id, "visibility", "none");
      }
      map.addSource("plaatsen", { type: "geojson", data: geojson(puntenRef.current), promoteId: "naam" });
      map.addLayer({
        id: "plaatsen-gloed",
        type: "circle",
        source: "plaatsen",
        paint: {
          "circle-color": ["get", "kleur"],
          "circle-opacity": 0.18,
          "circle-blur": 0.6,
          "circle-radius": ["interpolate", ["linear"], ["sqrt", ["get", "aantal"]], 1, 10, 30, 46],
        },
      });
      map.addLayer({
        id: "plaatsen",
        type: "circle",
        source: "plaatsen",
        paint: {
          "circle-color": ["get", "kleur"],
          "circle-radius": ["interpolate", ["linear"], ["sqrt", ["get", "aantal"]], 1, 4, 30, 22],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": ["case", ["boolean", ["feature-state", "gekozen"], false], 4, 2],
          "circle-opacity": 0.92,
        },
      });
      map.addLayer({
        id: "plaatsen-label",
        type: "symbol",
        source: "plaatsen",
        minzoom: 0,
        layout: {
          "text-field": ["concat", ["get", "label"], "\n", ["get", "prijs"]],
          "text-font": ["Noto Sans Bold"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 6, 10, 10, 13],
          "text-offset": [0, 1.4],
          "text-anchor": "top",
          "text-allow-overlap": false,
          "text-optional": true,
          "symbol-sort-key": ["-", 0, ["get", "aantal"]],
        },
        paint: {
          "text-color": donker ? "#ecebfa" : "#120f2e",
          "text-halo-color": donker ? "#0b0a1a" : "#ffffff",
          "text-halo-width": 1.6,
        },
      });

      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 });
      map.on("mouseenter", "plaatsen", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const f = e.features?.[0];
        if (!f) return;
        const p = f.properties as { label: string; aantal: number; prijs: string };
        popup
          .setLngLat((f.geometry as GeoJSON.Point).coordinates as [number, number])
          .setHTML(
            `<strong>${p.label}</strong><br><span style="opacity:.7">${p.aantal} opleidingen · ${p.prijs}/mnd</span>`,
          )
          .addTo(map);
      });
      map.on("mouseleave", "plaatsen", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
      map.on("click", "plaatsen", (e) => {
        const naam = e.features?.[0]?.properties?.naam as string | undefined;
        if (naam) kiesRef.current(naam);
      });
      map.on("click", (e) => {
        const raak = map.queryRenderedFeatures(e.point, { layers: ["plaatsen"] });
        if (!raak.length) kiesRef.current(null);
      });
      setKlaar(true);
    });

    kaart.current = map;
    return () => {
      setKlaar(false);
      map.remove();
      kaart.current = null;
    };
  }, [donker]);

  // Nieuwe punten (bijv. ander filter)
  useEffect(() => {
    if (!klaar) return;
    (kaart.current?.getSource("plaatsen") as GeoJSONSource | undefined)?.setData(geojson(punten));
  }, [punten, klaar]);

  // Thuis-marker
  useEffect(() => {
    if (!klaar || !kaart.current) return;
    thuisMarker.current?.remove();
    const el = document.createElement("div");
    el.innerHTML = `<div style="display:flex;align-items:center;gap:6px;padding:5px 10px 5px 6px;border-radius:999px;background:#120f2e;color:#fff;font:600 12px var(--font-sans);box-shadow:0 8px 20px -6px rgba(0,0,0,.5);border:2px solid #fff"><span style="font-size:15px">🏠</span>${thuis.naam}</div>`;
    thuisMarker.current = new maplibregl.Marker({ element: el, anchor: "bottom" })
      .setLngLat([thuis.lng, thuis.lat])
      .addTo(kaart.current);
  }, [thuis.naam, thuis.lat, thuis.lng, klaar]);

  // Gekozen plaats markeren en ernaartoe vliegen
  const vorigeGekozen = useRef<string | null>(null);
  useEffect(() => {
    const map = kaart.current;
    if (!klaar || !map) return;
    if (vorigeGekozen.current)
      map.setFeatureState({ source: "plaatsen", id: vorigeGekozen.current }, { gekozen: false });
    if (gekozen) {
      map.setFeatureState({ source: "plaatsen", id: gekozen }, { gekozen: true });
      const p = puntenRef.current.find((x) => x.naam === gekozen);
      if (p) map.flyTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 9), duration: 900, essential: true });
    }
    vorigeGekozen.current = gekozen;
  }, [gekozen, klaar]);

  return <div ref={doos} className="h-full w-full overflow-hidden rounded-[1.25rem]" />;
}
