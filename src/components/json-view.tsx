import { useMemo } from "react";

function Pretty({ value }: { value: unknown }) {
  const text = useMemo(() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }, [value]);
  return (
    <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-[11px] leading-relaxed text-foreground/90">
      {text}
    </pre>
  );
}

export function JsonView({ value }: { value: unknown }) {
  return <Pretty value={value} />;
}
