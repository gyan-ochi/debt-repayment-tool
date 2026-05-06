import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const size = {
  width: 512,
  height: 512
};

export default function Icon() {
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
            width: 392,
            height: 392,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 96,
            background: "#ffffff",
            color: "#111111",
            border: "16px solid #e7e7e2",
            fontWeight: 700
          }}
        >
          <div style={{ fontSize: 72, lineHeight: 1 }}>¥</div>
          <div style={{ fontSize: 46, lineHeight: 1.2 }}>借金返済</div>
        </div>
      </div>
    ),
    size
  );
}
