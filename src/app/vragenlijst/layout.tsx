import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studietest",
  description:
    "Ontdek in 5 minuten welke richting bij je past: 14 interessegebieden, 42 stellingen, direct je matches.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
