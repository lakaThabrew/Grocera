import { Fragment, type ReactNode } from "react";

function renderInlineMarkdown(value: string): ReactNode[] {
  // Support **bold** and *italic*
  const parts = value.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function MarkdownMessage({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\s*\n/);

  return (
    <div className="space-y-3">
      {blocks.map((block, blockIndex) => {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.length === 1 && /^---+$/.test(lines[0])) {
          return <hr key={blockIndex} className="border-border/60 my-3" />;
        }

        const isBulletList = lines.every((line) => /^[-*]\s+/.test(line));
        const isNumberedList = lines.every((line) => /^\d+\.\s+/.test(line));

        if (isBulletList) {
          return (
            <ul key={blockIndex} className="list-disc space-y-1 pl-5 marker:text-primary">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        if (isNumberedList) {
          return (
            <ol key={blockIndex} className="list-decimal space-y-1 pl-5 marker:text-primary">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{renderInlineMarkdown(line.replace(/^\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          );
        }

        return (
          <div key={blockIndex} className="space-y-1">
            {lines.map((line, lineIndex) => {
              const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
              if (headingMatch) {
                const level = headingMatch[1].length;
                const text = headingMatch[2];
                if (level === 1) return <h1 key={lineIndex} className="text-xl font-bold mt-2">{renderInlineMarkdown(text)}</h1>;
                if (level === 2) return <h2 key={lineIndex} className="text-lg font-bold mt-2">{renderInlineMarkdown(text)}</h2>;
                if (level >= 3) return <h3 key={lineIndex} className="text-base font-bold mt-1 text-primary">{renderInlineMarkdown(text)}</h3>;
              }

              return (
                <p key={lineIndex} className={lineIndex > 0 ? "mt-1" : ""}>
                  {renderInlineMarkdown(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
