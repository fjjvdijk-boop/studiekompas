import { FOTOS, type FotoSleutel } from "@/data/fotos";

/**
 * Een foto uit /public/fotos, in twee formaten (800 en 1600 pixels breed).
 * Alle foto's komen van Wikimedia Commons met een vrije licentie; de bron staat in src/data/fotos.ts.
 */
export function Foto({
  sleutel,
  className = "",
  sizes = "100vw",
  prioriteit = false,
  alt,
}: {
  sleutel: FotoSleutel;
  className?: string;
  sizes?: string;
  prioriteit?: boolean;
  alt?: string;
}) {
  const f = FOTOS[sleutel];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/fotos/${sleutel}-1600.webp`}
      srcSet={`/fotos/${sleutel}-800.webp 800w, /fotos/${sleutel}-1600.webp 1600w`}
      sizes={sizes}
      alt={alt ?? f.alt}
      loading={prioriteit ? "eager" : "lazy"}
      fetchPriority={prioriteit ? "high" : undefined}
      decoding="async"
      className={className}
      style={{ objectPosition: f.positie ?? "50% 50%", backgroundColor: f.kleur }}
    />
  );
}

/** Kleine naamsvermelding, verplicht bij CC BY en CC BY-SA */
export function FotoBron({ sleutel, className = "" }: { sleutel: FotoSleutel; className?: string }) {
  const f = FOTOS[sleutel];
  return (
    <a href={f.bron} target="_blank" rel="noopener noreferrer" className={`hover:underline ${className}`}>
      Foto: {f.maker} · {f.licentie}
    </a>
  );
}
