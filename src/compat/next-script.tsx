import React from "react";

// Minimal shim for next/script in Vite environment.
// Prefer adding scripts in index.html. This component renders nothing.
export interface ScriptProps extends React.ScriptHTMLAttributes<HTMLScriptElement> {
  strategy?: "afterInteractive" | "beforeInteractive" | "lazyOnload";
}

export default function Script(_props: ScriptProps) {
  return null;
}
