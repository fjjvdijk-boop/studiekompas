import type { Opleiding } from "./types";

const twee = (n: number) => String(n).padStart(2, "0");

/** Maakt een .ics-bestand (agenda-afspraak, hele dag) voor een of meer open dagen. */
export function maakIcs(items: { datum: string; opleiding: Opleiding }[]): string {
  const nu = new Date();
  const stempel = `${nu.getUTCFullYear()}${twee(nu.getUTCMonth() + 1)}${twee(nu.getUTCDate())}T${twee(nu.getUTCHours())}${twee(nu.getUTCMinutes())}00Z`;
  const dag = (d: string) => d.replaceAll("-", "");
  const volgende = (d: string) => new Date(Date.parse(d) + 86_400_000).toISOString().slice(0, 10).replaceAll("-", "");
  const tekst = (s: string) => s.replace(/([,;\\])/g, "\\$1");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StudieKompas//NL",
    "CALSCALE:GREGORIAN",
    ...items.flatMap(({ datum, opleiding: o }) => [
      "BEGIN:VEVENT",
      `UID:${o.id}-${dag(datum)}@studiekompas`,
      `DTSTAMP:${stempel}`,
      `DTSTART;VALUE=DATE:${dag(datum)}`,
      `DTEND;VALUE=DATE:${volgende(datum)}`,
      `SUMMARY:${tekst(`Open dag ${o.naam} (${o.instelling.naam})`)}`,
      `LOCATION:${tekst(o.plaats.naam)}`,
      ...((o.url ?? o.instelling.url) ? [`URL:${o.url ?? o.instelling.url}`] : []),
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${tekst(`Morgen: open dag ${o.naam}`)}`,
      "END:VALARM",
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(bestandsnaam: string, inhoud: string) {
  const url = URL.createObjectURL(new Blob([inhoud], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = bestandsnaam.replace(/[^\w.-]+/g, "-");
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
