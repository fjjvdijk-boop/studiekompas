"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { STEDEN, THUISSTAD } from "@/data/steden";
import { euro, reistijdTekst, stoplicht } from "@/lib/bereken";

const KLEUR = { groen: "#16a34a", oranje: "#ea580c", rood: "#dc2626" } as const;

function useDonker() {
  const [donker, setDonker] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDonker(mq.matches);
    const f = (e: MediaQueryListEvent) => setDonker(e.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return donker;
}

function PasAan() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(
      L.latLngBounds([...STEDEN.map((s) => [s.lat, s.lng] as [number, number]), [THUISSTAD.lat, THUISSTAD.lng]]),
      { padding: [36, 36] },
    );
  }, [map]);
  return null;
}

function Vlieg({ id }: { id: string | null }) {
  const map = useMap();
  useEffect(() => {
    const s = STEDEN.find((x) => x.id === id);
    if (s) map.flyTo([s.lat, s.lng], 9, { duration: 0.6 });
  }, [id, map]);
  return null;
}

export default function StedenKaart({
  geselecteerd,
  kies,
  maandlasten,
}: {
  geselecteerd: string | null;
  kies: (id: string) => void;
  maandlasten: Record<string, number>;
}) {
  const donker = useDonker();
  const thuisIcoon = useMemo(
    () =>
      L.divIcon({
        className: "stad-pin",
        html: `<div style="background:#0e1630;padding:5px 7px" title="${THUISSTAD.naam}">🏠</div>`,
      }),
    [],
  );

  return (
    <MapContainer
      center={[52.15, 5.6]}
      zoom={7}
      zoomSnap={0.25}
      scrollWheelZoom={false}
      className="h-full w-full"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={`https://{s}.basemaps.cartocdn.com/${donker ? "dark_all" : "light_all"}/{z}/{x}/{y}{r}.png`}
      />
      <PasAan />
      <Vlieg id={geselecteerd} />
      {STEDEN.map((s) => (
        <Polyline
          key={`lijn-${s.id}`}
          positions={[
            [THUISSTAD.lat, THUISSTAD.lng],
            [s.lat, s.lng],
          ]}
          pathOptions={{
            color: KLEUR[stoplicht(s.reistijd)],
            weight: geselecteerd === s.id ? 3 : 1.5,
            opacity: geselecteerd === s.id ? 0.9 : 0.35,
            dashArray: "4 6",
          }}
        />
      ))}
      <Marker position={[THUISSTAD.lat, THUISSTAD.lng]} icon={thuisIcoon} />
      {STEDEN.map((s) => {
        const licht = stoplicht(s.reistijd);
        const icoon = L.divIcon({
          className: `stad-pin${geselecteerd === s.id ? " actief" : ""}`,
          html: `<div style="background:${KLEUR[licht]}">${geselecteerd === s.id ? `${s.naam} · ` : ""}${euro(maandlasten[s.id] ?? s.kamerhuur)}</div>`,
        });
        return (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={icoon}
            title={s.naam}
            eventHandlers={{ click: () => kies(s.id) }}
          >
            <Tooltip direction="top" offset={[0, -14]}>
              {s.naam}
            </Tooltip>
            <Popup>
              <strong>{s.naam}</strong>
              <br />
              Kamerhuur: {euro(s.kamerhuur)} per maand
              <br />
              Reistijd: {reistijdTekst(s.reistijd)}
              {s.overstappen ? ` (${s.overstappen}× overstappen)` : " (direct)"}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
