import type { ReactNode } from "react";

/** Simple inline markdown: **bold** only */
export function formatSimpleMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-kapruka-purple">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
