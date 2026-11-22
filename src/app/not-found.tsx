import Link from "next/link";
import { Compass } from "lucide-react";

export default function NietGevonden() {
  return (
    <div className="kaart mx-auto mt-10 flex max-w-md flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Compass className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-semibold">Deze pagina bestaat niet</h1>
      <p className="mt-1 text-muted">Je kompas wijst de verkeerde kant op.</p>
      <Link href="/" className="focus-ring mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-brand-ink">
        Terug naar home
      </Link>
    </div>
  );
}
