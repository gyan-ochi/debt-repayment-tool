import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const size = {
  width: 180,
  height: 180
};

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6f6f3"
        }}
      >
        <div
          style={{
            width: 144,
            height: 144,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 36,
            background: "#ffffff",
            color: "#111111",
            border: "6px solid #e7e7e2",
            fontWeight: 700
          }}
        >
          <div style={{ fontSize: 34, lineHeight: 1 }}>¥</div>
          <div style={{ fontSize: 18, lineHeight: 1.2 }}>借金返済</div>
        </div>
      </div>
    ),
    size
  );
}
