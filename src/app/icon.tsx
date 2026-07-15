import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

/** Tab favicon matching the FamilyCrest circle-M mark. */
export default function Icon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "#146B3A",
          border: "2px solid #C96A1B",
          boxShadow: "inset 0 0 0 2px rgba(7, 58, 33, 0.35)",
          color: "#FFF9EE",
          fontSize: 16,
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
