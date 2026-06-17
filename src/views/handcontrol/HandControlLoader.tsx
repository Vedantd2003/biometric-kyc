"use client";

import dynamic from "next/dynamic";

const HandControlView = dynamic(
  () => import("./HandControlView").then((m) => m.HandControlView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        Loading hand tracker…
      </div>
    ),
  }
);

export function HandControlLoader() {
  return <HandControlView />;
}
