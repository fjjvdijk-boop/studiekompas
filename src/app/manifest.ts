import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StudieKompas",
    short_name: "StudieKompas",
    description: "Kies je universitaire studie: test, DUO en kamer vinden.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2541ff",
    lang: "nl",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
