function renderInline(text: string) {
  const parts = text.split(/(\[[^\]]+]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)]\(([^)]+)\)$/);
    if (link) {
      return (
        <a
          key={i}
          href={link[2]}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline-offset-2 hover:underline"
        >
          {link[1]}
        </a>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded-sm bg-surface-2 px-1 font-mono text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function MarkdownExcerpt({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return (
    <div className="space-y-3 text-sm leading-relaxed text-muted">
      {blocks.map((block, i) => {
        const line = block.trim();
        if (!line) return null;
        if (line.startsWith("# ")) {
          return (
            <h3 key={i} className="font-display text-lg text-fg">
              {line.replace(/^#\s+/, "")}
            </h3>
          );
        }
        if (line.startsWith("## ") || line.startsWith("### ")) {
          return (
            <h4 key={i} className="font-medium text-fg">
              {line.replace(/^#+\s+/, "")}
            </h4>
          );
        }
        if (line.startsWith(">")) {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-accent/40 pl-3 text-fg/80"
            >
              {renderInline(line.replace(/^>\s?/gm, ""))}
            </blockquote>
          );
        }
        if (/^[-*]\s/.test(line) || /^\d+\.\s/.test(line)) {
          const items = line.split("\n").filter(Boolean);
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {items.map((item, j) => (
                <li key={j}>{renderInline(item.replace(/^([-*]|\d+\.)\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{renderInline(line.replace(/\n/g, " "))}</p>;
      })}
    </div>
  );
}
