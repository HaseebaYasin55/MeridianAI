import type { ReactNode } from "react";

import { CodeBlock } from "@/components/code-block";
import { cn } from "@/lib/utils";

type Token =
  | { type: "code"; language?: string; code: string }
  | { type: "text"; text: string };

function splitCodeFences(source: string): Token[] {
  const tokens: Token[] = [];
  const regex = /```([\w+-]*)[\s]*\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(source)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        text: source.slice(lastIndex, match.index),
      });
    }
    tokens.push({
      type: "code",
      language: match[1] || undefined,
      code: match[2],
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < source.length) {
    tokens.push({ type: "text", text: source.slice(lastIndex) });
  }

  return tokens;
}

type InlineNode = ReactNode;

function inline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  const regex =
    /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|~~([^~]+)~~|\*([^*]+)\*|_([^_]+)_|`([^`]+)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const push = (part: string) => {
    if (part) nodes.push(part);
  };

  while ((match = regex.exec(text)) !== null) {
    push(text.slice(lastIndex, match.index));
    const [full, linkText, linkUrl, b, u, s, e1, e2, code] = match;

    if (linkText && linkUrl) {
      nodes.push(
        <a
          key={`${lastIndex}-${full}`}
          href={linkUrl}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-brand underline decoration-brand/40 underline-offset-2"
        >
          {linkText}
        </a>,
      );
    } else if (b) {
      nodes.push(
        <strong key={`${lastIndex}-${full}`} className="font-semibold">
          {b}
        </strong>,
      );
    } else if (u) {
      nodes.push(
        <strong key={`${lastIndex}-${full}`} className="font-semibold">
          {u}
        </strong>,
      );
    } else if (s) {
      nodes.push(
        <s key={`${lastIndex}-${full}`} className="text-muted-foreground">
          {s}
        </s>,
      );
    } else if (e1) {
      nodes.push(
        <em key={`${lastIndex}-${full}`} className="font-display">
          {e1}
        </em>,
      );
    } else if (e2) {
      nodes.push(
        <em key={`${lastIndex}-${full}`} className="font-display">
          {e2}
        </em>,
      );
    } else if (code) {
      nodes.push(
        <code
          key={`${lastIndex}-${full}`}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-primary"
        >
          {code}
        </code>,
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    push(text.slice(lastIndex));
  }

  return nodes;
}

type Block =
  | { kind: "h"; level: 1 | 2 | 3; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "quote"; text: string };

function parseBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "p", text: paragraph.join(" ") });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push(list.ordered ? { kind: "ol", items: list.items } : { kind: "ul", items: list.items });
      list = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        kind: "h",
        level: heading[1].length as 1 | 2 | 3,
        text: heading[2],
      });
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "quote", text: quote[1] });
      continue;
    }

    const ul = /^[-*+]\s+(.+)$/.exec(line);
    if (ul) {
      flushParagraph();
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(ul[1]);
      continue;
    }

    const ol = /^\d+[.)]\s+(.+)$/.exec(line);
    if (ol) {
      flushParagraph();
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(ol[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function Heading({ level, children }: { level: 1 | 2 | 3; children: ReactNode }) {
  const base = "font-medium tracking-[-0.01em] text-foreground";
  if (level === 1) {
    return <h1 className={cn(base, "mb-3 mt-5 text-lg first:mt-0")}>{children}</h1>;
  }
  if (level === 2) {
    return <h2 className={cn(base, "mb-2 mt-5 text-[17px] first:mt-0")}>{children}</h2>;
  }
  return <h3 className={cn(base, "mb-2 mt-4 text-[15px] first:mt-0")}>{children}</h3>;
}

export function Markdown({ content }: { content: string }) {
  const tokens = splitCodeFences(content);
  const nodes = tokens.map((token, tokenIndex) => {
    if (token.type === "code") {
      return <CodeBlock key={tokenIndex} code={token.code} language={token.language} />;
    }

    const blocks = parseBlocks(token.text.split("\n"));

    const blockNodes = blocks.map((block, blockIndex) => {
      const key = `${tokenIndex}-${blockIndex}`;
      switch (block.kind) {
        case "h":
          return <Heading key={key} level={block.level}>{inline(block.text)}</Heading>;
        case "quote":
          return (
            <blockquote
              key={key}
              className="my-3 border-l-2 border-foreground/20 pl-4 text-muted-foreground"
            >
              {inline(block.text)}
            </blockquote>
          );
        case "ul":
          return (
            <ul key={key} className="my-3 space-y-1.5 pl-1">
              {block.items.map((item, i) => (
                <li key={i} className="flex gap-2.5 leading-relaxed">
                  <span className="mt-[0.55em] h-[5px] w-[5px] shrink-0 rounded-full bg-foreground/40" />
                  <span>{inline(item)}</span>
                </li>
              ))}
            </ul>
          );
        case "ol":
          return (
            <ol key={key} className="my-3 space-y-1.5 pl-1">
              {block.items.map((item, i) => (
                <li key={i} className="flex gap-3 leading-relaxed">
                  <span className="w-4 shrink-0 text-right font-mono text-[13px] text-muted-foreground">
                    {i + 1}.
                  </span>
                  <span>{inline(item)}</span>
                </li>
              ))}
            </ol>
          );
        case "p":
          return (
            <p key={key} className="my-3 leading-[1.75] first:mt-0 last:mb-0">
              {inline(block.text)}
            </p>
          );
      }
    });

    return <div key={tokenIndex}>{blockNodes}</div>;
  });

  return (
    <div className="break-words text-[15px] text-foreground/90">{nodes}</div>
  );
}