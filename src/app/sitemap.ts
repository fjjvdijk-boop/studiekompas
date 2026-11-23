import type { MetadataRoute } from "next";
import { plaatsSlug } from "@/lib/bereken";
import { dataOpServer } from "@/lib/data-server";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const data = dataOpServer();
  const vast = ["", "/vragenlijst", "/zoeken", "/kaart"].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly" as const,
    priority: 1,
  }));
  return [
    ...vast,
    ...data.plaatsen.map((p) => ({
      url: `${SITE_URL}/plaats/${plaatsSlug(p.naam)}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...data.opleidingen.map((o) => ({
      url: `${SITE_URL}/opleiding/${o.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
