"use client";

import { usePlatforms } from "@/hooks/usePlatforms";
import Link from "next/link";

export function Platforms() {
  const platforms = usePlatforms()?.platforms;

  return (
    <div className="flex flex-wrap gap-2">
      {platforms?.map((platform) => (
        <Link key={platform.id} href={`/platform/${platform.id}`}>
          <div className="px-4 py-2 border-2">{platform.name}</div>
        </Link>
      ))}
    </div>
  );
}
