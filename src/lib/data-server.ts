import "server-only";
import { readFileSync } from "fs";
import path from "path";
import { decodeer, type Data, type RuweData } from "./data";

let cache: Data | null = null;

/** Leest de opleidingen op de server (voor de detailpagina's en zoekmachines). */
export function dataOpServer(): Data {
  cache ??= decodeer(
    JSON.parse(readFileSync(path.join(process.cwd(), "public", "data", "opleidingen.json"), "utf8")) as RuweData,
  );
  return cache;
}
