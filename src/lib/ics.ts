import type { OpenDag, Opleiding } from "./types";

const twee = (n: number) => String(n).padStart(2, "0");

/** Maakt een .ics-bestand (agenda-afspraak) voor een of meer open dagen. Tijden in Nederlandse tijd. */
export function maakIcs(items: { dag: OpenDag; opleiding: Opleiding }[]): string {
  const nu = new Date();
  const stempel = `${nu.getUTCFullYear()}${twee(nu.getUTCMonth() + 1)}${twee(nu.getUTCDate())}T${twee(nu.getUTCHours())}${twee(nu.getUTCMinutes())}00Z`;
  const tijd = (datum: string, t: string) => `${datum.replaceAll("-", "")}T${t.replace(":", "")}00`;
  const tekst = (s: string) => s.replace(/([,;\\])/g, "\\$1");
  const regels = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StudieKompas//NL",
    "CALSCALE:GREGORIAN",
    ...items.flatMap(({ dag, opleiding }) => [
      "BEGIN:VEVENT",
      `UID:${dag.id}@studiekompas`,
      `DTSTAMP:${stempel}`,
      `DTSTART;TZID=Europe/Amsterdam:${tijd(dag.datum, dag.start)}`,
      `DTEND;TZID=Europe/Amsterdam:${tijd(dag.datum, dag.eind)}`,
      `SUMMARY:${tekst(`${dag.soort}: ${opleiding.naam} (${opleiding.instelling})`)}`,
      `URL:${dag.link}`,
      `DESCRIPTION:${tekst(`Bekijk ${dag.link} voor het programma en aanmelden.`)}`,
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${tekst(`Morgen: ${dag.soort} ${opleiding.naam}`)}`,
      "END:VALARM",
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return regels.join("\r\n");
}

export function downloadIcs(bestandsnaam: string, inhoud: string) {
  const url = URL.createObjectURL(new Blob([inhoud], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = bestandsnaam;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
