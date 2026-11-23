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
        background: "linear-gradient(135deg, #7c6cff, #4f39f6)",
      }}
    >
      <svg width="140" height="140" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="20" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="2.5" />
        <path d="M32 12 L38.5 32 L32 52 L25.5 32 Z" fill="#fff" />
        <path d="M32 12 L38.5 32 L25.5 32 Z" fill="#ff9f1c" />
        <circle cx="32" cy="32" r="3.2" fill="#4f39f6" stroke="#fff" strokeWidth="1.5" />
      </svg>
    </div>,
    size,
  );
}
