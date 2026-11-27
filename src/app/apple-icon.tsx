import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Icoon voor "Zet op beginscherm" op iPhone en iPad */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      <svg width="140" height="140" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="22" fill="none" stroke="#0b0d12" strokeWidth="2.5" />
        <path d="M32 12 L38.5 32 L32 52 L25.5 32 Z" fill="#0b0d12" />
        <path d="M32 12 L38.5 32 L25.5 32 Z" fill="#ff4d2e" />
        <circle cx="32" cy="32" r="2.6" fill="#ffffff" />
      </svg>
    </div>,
    size,
  );
}
