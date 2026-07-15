import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

/** Home-screen icon matching the FamilyCrest circle-M mark. */
export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFFCF6",
      }}
    >
      <div
        style={{
          width: 148,
          height: 148,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "rgba(20, 107, 58, 0.12)",
          border: "6px solid #C96A1B",
          boxShadow: "inset 0 0 0 10px rgba(255, 252, 246, 0.85)",
          color: "#0B4F2D",
          fontSize: 84,
          fontWeight: 700,
          fontFamily: "Georgia, 'Times New Roman', serif",
          lineHeight: 1,
        }}
      >
        M
      </div>
    </div>,
    { ...size },
  );
}
