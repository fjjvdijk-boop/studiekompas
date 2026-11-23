import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kamer vinden",
  description:
    "Zo kom je aan een studentenkamer: stappenplan, huisvesters, wachttijden en huurprijzen per universiteitsstad.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
