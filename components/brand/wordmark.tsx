"use client";

import Link from "next/link";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

function Glyph({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid h-6 w-6 shrink-0 grid-cols-2 gap-[3px] p-[3px]",
        className,
      )}
    >
      <span className="rounded-[1px] bg-brand" />
      <span className="rounded-[1px] bg-brand/45" />
      <span className="rounded-[1px] bg-brand/45" />
      <span className="rounded-[1px] bg-brand" />
    </span>
  );
}

export function Wordmark({
  className,
  href = "/",
  size = "md",
}: {
  className?: string;
  href?: string;
  size?: "md" | "lg";
}) {
  const name = (
    <span className="flex items-baseline gap-[7px]">
      <span
        className={cn(
          "font-medium tracking-[-0.02em] text-foreground",
          size === "lg" ? "text-[22px] leading-none" : "text-[17px] leading-none",
        )}
      >
        Meridian
      </span>
      <span className="hidden h-[1.5px] w-[18px] rounded-full bg-foreground/25 sm:block" />
    </span>
  );

  if (!href) {
    return (
      <span className={cn("inline-flex items-center gap-2.5", className)}>
        <Glyph />
        {name}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={`${brand.name} — ${brand.tagline}`}
      className={cn(
        "group inline-flex items-center gap-2.5 outline-none",
        className,
      )}
    >
      <Glyph className="transition-transform duration-300 group-hover:rotate-90 motion-reduce:transition-none" />
      {name}
    </Link>
  );
}