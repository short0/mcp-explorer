import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FolderTree, BookOpen, Headphones, Code2, ArrowRight, Wrench, Database, MessageSquareQuote, Plug, Search, PlayCircle, Reply } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRESETS } from "@/lib/mcp/presets";
import { loadState, saveState } from "@/lib/mcp/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MCP Playground — Learn the Model Context Protocol interactively" },
      { name: "description", content: "An interactive sandbox for the Model Context Protocol. Explore tools, resources, and prompts with mocked MCP servers — no setup required." },
      { property: "og:title", content: "MCP Playground" },
      { property: "og:description", content: "Learn how MCP clients discover tools, resources, and prompts — fully interactive, no setup." },
    ],
  }),
  component: Home,
});

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FolderTree,
  BookOpen,
  Headphones,
  Code2,
};

function Home() {
  const navigate = useNavigate();

  const launchPreset = (id: string) => {
    const s = loadState();
    saveState({ ...s, selectedPresetId: id, currentRequest: "" });
    navigate({ to: "/playground" });
  };

  const launchBlank = () => {
    const s = loadState();
    saveState({ ...s, selectedPresetId: "blank", currentRequest: "" });
    navigate({ to: "/playground" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                A calm, hands-on sandbox
              </span>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Learn the Model Context Protocol by playing with it.
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                MCP is a standard way for AI apps to discover and call <span className="font-medium text-foreground">tools</span>, read{" "}
                <span className="font-medium text-foreground">resources</span>, and reuse <span className="font-medium text-foreground">prompts</span> from external servers. This playground shows the whole flow, end to end — no install, no API key.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => launchPreset("filesystem")}>
                  Try a preset <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={launchBlank}>
                  Open blank playground
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Presets */}
        <section className="border-b">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Start with a preset</h2>
                <p className="mt-1 text-sm text-muted-foreground">Each preset bundles a mock MCP server with realistic capabilities and a scripted run.</p>
              </div>
              <Link to="/playground" className="hidden text-sm text-primary hover:underline sm:block">
                Or open a blank playground →
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PRESETS.map((p) => {
                const Icon = ICONS[p.icon] ?? Wrench;
                return (
                  <button
                    key={p.id}
                    onClick={() => launchPreset(p.id)}
                    className="group flex flex-col rounded-xl border bg-card p-5 text-left transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground/80">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-foreground">{p.name}</h3>
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{p.short}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.capabilityChips.map((c) => (
                        <span key={c} className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {c}
                        </span>
                      ))}
                    </div>
                    <span className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Launch <ArrowRight className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
            <p className="mt-1 text-sm text-muted-foreground">An MCP run, in four steps.</p>
            <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { n: 1, title: "Connect", desc: "The client opens a session with one or more MCP servers.", Icon: Plug },
                { n: 2, title: "Discover", desc: "The server advertises its tools, resources, and prompts.", Icon: Search },
                { n: 3, title: "Call tools", desc: "The model picks capabilities and invokes them with arguments.", Icon: PlayCircle },
                { n: 4, title: "Return results", desc: "Results flow back; the model composes a final answer.", Icon: Reply },
              ].map((s) => (
                <li key={s.n} className="rounded-xl border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border bg-background text-xs font-semibold text-foreground">
                      {s.n}
                    </span>
                    <s.Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="mt-4 font-medium text-foreground">{s.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Concept primer */}
        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">Tools, Resources, Prompts</h2>
            <p className="mt-1 text-sm text-muted-foreground">Three primitives. Each plays a different role.</p>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-tool text-tool-foreground">
                      <Wrench className="h-4 w-4" />
                    </span>
                    <CardTitle className="text-base">Tools</CardTitle>
                  </div>
                  <CardDescription>Actions with side effects.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Functions the model can call with arguments — like <code className="rounded bg-muted px-1 font-mono text-xs">search_tickets</code>.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-resource text-resource-foreground">
                      <Database className="h-4 w-4" />
                    </span>
                    <CardTitle className="text-base">Resources</CardTitle>
                  </div>
                  <CardDescription>Read-only context, addressed by URI.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Documents, notes, configs the model can read — like <code className="rounded bg-muted px-1 font-mono text-xs">docs://billing/refunds</code>.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-prompt text-prompt-foreground">
                      <MessageSquareQuote className="h-4 w-4" />
                    </span>
                    <CardTitle className="text-base">Prompts</CardTitle>
                  </div>
                  <CardDescription>Reusable instruction templates.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Server-provided templates with arguments — like <code className="rounded bg-muted px-1 font-mono text-xs">draft_reply(tone)</code>.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
