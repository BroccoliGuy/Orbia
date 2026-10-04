"use client";

import dynamic from "next/dynamic";

const Explorer = dynamic(() => import("@/components/Explorer"), {
  ssr: false,
  loading: () => <main className="fixed inset-0 bg-background" />,
});

export default function ExplorePage() {
  return <Explorer />;
}
