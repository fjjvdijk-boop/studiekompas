import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kaart",
  description: "Alle studieplaatsen van Nederland op de kaart, met reistijd, maandlasten en studentenleven.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
