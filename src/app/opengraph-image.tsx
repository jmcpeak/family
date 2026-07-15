import { ImageResponse } from "next/og";

export const alt = "McPeak Family";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

/** Social share card with the FamilyCrest circle-M mark. */
export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#F6F1E7",
        backgroundImage:
          "radial-gradient(circle at 14% 4%, rgba(20, 107, 58, 0.12), transparent 34%), radial-gradient(circle at 90% 92%, rgba(201, 106, 27, 0.10), transparent 30%)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 10,
          background:
            "linear-gradient(90deg, #146B3A 0 33%, #F8F5ED 33% 66%, #C96A1B 66%)",
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 56,
          padding: "0 72px",
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "rgba(20, 107, 58, 0.10)",
            border: "8px solid #C96A1B",
            boxShadow: "inset 0 0 0 14px rgba(255, 252, 246, 0.85)",
            color: "#0B4F2D",
            fontSize: 128,
            fontWeight: 700,
            fontFamily: "Georgia, 'Times New Roman', serif",
            lineHeight: 1,
          }}
        >
          M
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#0B4F2D",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            McPeak Family
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#146B3A",
            }}
          >
            Roots · Stories · Family
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 28,
              color: "rgba(11, 79, 45, 0.72)",
              maxWidth: 620,
              lineHeight: 1.35,
            }}
          >
            Family member directory
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
