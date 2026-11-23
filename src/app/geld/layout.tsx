import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Geld & DUO",
  description:
    "Reken uit wat studeren aan de universiteit kost, hoeveel studiefinanciering je krijgt en wat je moet lenen.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
