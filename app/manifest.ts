import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "借金返済×家計管理ツール",
    short_name: "借金返済ツール",
    description: "借金残高、収支、借金内訳をこの端末のブラウザだけで管理できるシンプルなツールです。",
    start_url: "/?tab=dashboard",
    display: "standalone",
    background_color: "#f6f6f3",
    theme_color: "#ffffff",
    lang: "ja",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  };
}
