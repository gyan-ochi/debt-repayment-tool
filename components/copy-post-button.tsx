"use client";

import { useState } from "react";

export function CopyPostButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button className="button" type="button" onClick={handleClick}>
      {copied ? "コピーしました" : "定型文をコピー"}
    </button>
  );
}
