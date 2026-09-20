"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="group/code my-4 overflow-hidden rounded-lg border border-border bg-black text-left">
      <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex h-6 items-center gap-1.5 rounded px-1.5 text-[11px] font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand motion-reduce:transition-none"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-brand" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 text-[13px] leading-relaxed text-white/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}