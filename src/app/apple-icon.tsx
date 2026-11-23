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
        background: "#f6f3ec",
      }}
    >
      <svg width="140" height="140" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="22" fill="none" stroke="#17160f" strokeWidth="2.5" />
        <path d="M32 12 L38.5 32 L32 52 L25.5 32 Z" fill="#17160f" />
        <path d="M32 12 L38.5 32 L25.5 32 Z" fill="#b9472f" />
        <circle cx="32" cy="32" r="2.6" fill="#f6f3ec" />
      </svg>
    </div>,
    size,
  );
}
