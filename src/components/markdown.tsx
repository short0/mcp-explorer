/**
 * Minimal markdown renderer — no external deps. Supports headings, bold, italic, inline code,
 * fenced code blocks, unordered lists, and paragraph breaks. Good enough for mocked answers.
 */
import { useMemo } from "react";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(s: string) {
  let out = escapeHtml(s);
  out = out.replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/\[(\d+)\]/g, '<sup class="text-primary">[$1]</sup>');
  return out;
}

function render(md: string): string {
  const lines = md.split("\n");
  let html = "";
  let inCode = false;
  let codeBuf: string[] = [];
  let listOpen = false;

  const closeList = () => {
    if (listOpen) {
      html += "</ul>";
      listOpen = false;
    }
  };

  for (const raw of lines) {
    const line = raw.replace(/\r$/, "");
    if (line.startsWith("```")) {
      if (inCode) {
        html += `<pre class="overflow-x-auto rounded-md bg-muted p-3 font-mono text-[12px] leading-relaxed"><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`;
        codeBuf = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }
    if (/^### /.test(line)) {
      closeList();
      html += `<h3 class="mt-4 mb-1 text-base font-semibold">${inline(line.slice(4))}</h3>`;
    } else if (/^## /.test(line)) {
      closeList();
      html += `<h2 class="mt-4 mb-2 text-lg font-semibold">${inline(line.slice(3))}</h2>`;
    } else if (/^# /.test(line)) {
      closeList();
      html += `<h1 class="mt-2 mb-2 text-xl font-semibold">${inline(line.slice(2))}</h1>`;
    } else if (/^[-*] /.test(line)) {
      if (!listOpen) {
        html += '<ul class="my-2 ml-5 list-disc space-y-1">';
        listOpen = true;
      }
      html += `<li>${inline(line.slice(2))}</li>`;
    } else if (line.trim() === "") {
      closeList();
      html += "";
    } else {
      closeList();
      html += `<p class="my-2 leading-relaxed">${inline(line)}</p>`;
    }
  }
  closeList();
  if (inCode) {
    html += `<pre class="overflow-x-auto rounded-md bg-muted p-3 font-mono text-[12px]"><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`;
  }
  return html;
}

export function Markdown({ children }: { children: string }) {
  const html = useMemo(() => render(children), [children]);
  return <div className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: html }} />;
}
