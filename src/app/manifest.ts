import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StudieKompas",
    short_name: "StudieKompas",
    description: "Zoek, vergelijk en bewaar opleidingen.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f6fa",
    theme_color: "#4338ca",
    lang: "nl",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
