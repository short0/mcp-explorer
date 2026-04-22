import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Undo2, Redo2, RotateCcw, Play, Save, Repeat, GitCompare, Wrench, Database, MessageSquareQuote,
  Info, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Sparkles,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CapabilityBadge } from "@/components/capability-badge";
import { JsonView } from "@/components/json-view";
import { Markdown } from "@/components/markdown";
import { usePlaygroundState } from "@/hooks/use-playground-state";
import { PRESETS, PRESETS_BY_ID } from "@/lib/mcp/presets";
import { runMocked } from "@/lib/mcp/engine";
import type { CapabilityKind, ScriptedRun } from "@/lib/mcp/types";

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: "Playground — MCP Playground" },
      { name: "description", content: "Run an MCP-style session: pick a server, browse capabilities, send a request, and inspect the tool-call timeline." },
      { property: "og:title", content: "MCP Playground — Sandbox" },
      { property: "og:description", content: "Pick a server, browse capabilities, and inspect the tool-call timeline." },
    ],
  }),
  component: Playground,
});

function Playground() {
  const { state, update, undo, redo, reset, canUndo, canRedo, hydrated } = usePlaygroundState();
  const [currentRun, setCurrentRun] = useState<ScriptedRun | null>(null);
  const [previousRun, setPreviousRun] = useState<ScriptedRun | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tools" | "resources" | "prompts">("tools");

  const preset = state.selectedPresetId !== "blank" ? PRESETS_BY_ID[state.selectedPresetId] : undefined;

  // Preload sample request when preset changes and field is empty
  useEffect(() => {
    if (!hydrated) return;
    if (preset && !state.currentRequest) {
      update({ currentRequest: preset.examplePrompts[0] });
    }
  }, [preset?.id, hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRun = () => {
    if (!preset || !state.currentRequest.trim()) return;
    const run = runMocked(preset, state.currentRequest.trim());
    setPreviousRun(currentRun);
    setCurrentRun(run);
    update((s) => ({
      recentRequests: [state.currentRequest, ...s.recentRequests.filter((r) => r !== state.currentRequest)].slice(0, 10),
    }));
  };

  const handleSave = () => {
    if (!currentRun || !preset) return;
    update((s) => ({
      savedRuns: [
        { id: `r-${Date.now()}`, presetId: preset.id, request: currentRun.request, finalAnswer: currentRun.finalAnswer, stepCount: currentRun.steps.length, at: Date.now() },
        ...s.savedRuns,
      ].slice(0, 5),
    }));
  };

  const handleReplay = () => {
    if (!currentRun) return;
    const replayed = { ...currentRun };
    setPreviousRun(currentRun);
    setCurrentRun(replayed);
  };

  const modeBadge = state.mode === "live" ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-warn px-2 py-0.5 text-[11px] font-medium text-warn-foreground">
      <AlertTriangle className="h-3 w-3" /> Live
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <Sparkles className="h-3 w-3" /> Simulated
    </span>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* Sticky mobile actions */}
      <div className="sticky top-14 z-20 border-b bg-background/95 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2 px-4 py-2">
          <Select value={state.selectedPresetId} onValueChange={(v) => update({ selectedPresetId: v, currentRequest: "" })}>
            <SelectTrigger className="h-9 flex-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRESETS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              <SelectItem value="blank">Blank</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleRun} disabled={!preset || !state.currentRequest.trim()}>
            <Play className="h-4 w-4" /> Run
          </Button>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 py-4 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)_380px]">
          {/* LEFT */}
          <aside className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Server</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="hidden lg:block">
                  <Label className="mb-1.5 block text-xs">Preset</Label>
                  <Select value={state.selectedPresetId} onValueChange={(v) => update({ selectedPresetId: v, currentRequest: "" })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRESETS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      <SelectItem value="blank">Blank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {preset ? (
                  <div className="rounded-md border bg-muted/30 p-3 text-xs">
                    <div className="font-mono text-[12px] font-medium text-foreground">{preset.server.name}</div>
                    <div className="mt-1 text-muted-foreground">v{preset.server.version} · {preset.server.transport}</div>
                    <div className="mt-2 text-muted-foreground">{preset.server.description}</div>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">No server selected. Pick a preset to get started.</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Mode</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{state.mode === "live" ? "Live (advanced)" : "Mocked"}</div>
                    <div className="text-xs text-muted-foreground">{state.mode === "live" ? "Calls a real LLM." : "Deterministic, offline."}</div>
                  </div>
                  <Switch
                    checked={state.mode === "live"}
                    onCheckedChange={(v) => update({ mode: v ? "live" : "mocked" })}
                    aria-label="Toggle live mode"
                  />
                </div>
                {state.mode === "live" && (
                  <div className="space-y-2 rounded-md border bg-warn/40 p-3 text-xs text-warn-foreground">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <div>Live mode is experimental. The current build still produces mocked output — wire up an edge function to enable real LLM calls.</div>
                    </div>
                    <Input
                      type="password"
                      placeholder="API key (stored in localStorage)"
                      value={state.liveApiKey}
                      onChange={(e) => update({ liveApiKey: e.target.value })}
                      className="h-8 text-xs"
                    />
                    <Select value={state.liveModel} onValueChange={(v) => update({ liveModel: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google/gemini-3-flash-preview">gemini-3-flash-preview</SelectItem>
                        <SelectItem value="google/gemini-2.5-flash">gemini-2.5-flash</SelectItem>
                        <SelectItem value="openai/gpt-5-mini">gpt-5-mini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label className="text-xs">Temperature</Label>
                    <span className="font-mono text-xs text-muted-foreground">{state.settings.temperature.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[state.settings.temperature]}
                    min={0} max={1} step={0.05}
                    onValueChange={([v]) => update((s) => ({ settings: { ...s.settings, temperature: v } }))}
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label className="text-xs">Max steps</Label>
                    <span className="font-mono text-xs text-muted-foreground">{state.settings.maxSteps}</span>
                  </div>
                  <Slider
                    value={[state.settings.maxSteps]}
                    min={1} max={12} step={1}
                    onValueChange={([v]) => update((s) => ({ settings: { ...s.settings, maxSteps: v } }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-explain" className="text-xs">Auto-explain steps</Label>
                  <Switch
                    id="auto-explain"
                    checked={state.settings.autoExplain}
                    onCheckedChange={(v) => update((s) => ({ settings: { ...s.settings, autoExplain: v } }))}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between gap-2 rounded-md border bg-card p-2">
              <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo} aria-label="Undo" className="flex-1">
                <Undo2 className="h-4 w-4" /> Undo
              </Button>
              <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo} aria-label="Redo" className="flex-1">
                <Redo2 className="h-4 w-4" /> Redo
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { reset(); setCurrentRun(null); setPreviousRun(null); }} aria-label="Reset" className="flex-1">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
          </aside>

          {/* CENTER */}
          <section className="flex flex-col gap-4 min-w-0">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-sm">Capabilities</CardTitle>
                  <CardDescription className="text-xs">Discovered from the active server.</CardDescription>
                </div>
                {modeBadge}
              </CardHeader>
              <CardContent>
                <Collapsible>
                  <CollapsibleTrigger className="mb-3 flex w-full items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted/60">
                    <span className="flex items-center gap-2"><Info className="h-3.5 w-3.5" /> What's the difference between tools, resources, and prompts?</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mb-3 space-y-1.5 rounded-md border bg-background p-3 text-xs text-muted-foreground">
                    <div><CapabilityBadge kind="tool" /> <span className="ml-1"><b className="text-foreground">Actions</b> the model invokes with arguments. May have side effects.</span></div>
                    <div><CapabilityBadge kind="resource" /> <span className="ml-1"><b className="text-foreground">Read-only context</b> addressed by URI. The model just reads.</span></div>
                    <div><CapabilityBadge kind="prompt" /> <span className="ml-1"><b className="text-foreground">Reusable templates</b> the server provides for consistent instructions.</span></div>
                  </CollapsibleContent>
                </Collapsible>

                {preset ? (
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="tools"><Wrench className="mr-1.5 h-3.5 w-3.5" /> Tools <span className="ml-1.5 text-muted-foreground">{preset.server.tools.length}</span></TabsTrigger>
                      <TabsTrigger value="resources"><Database className="mr-1.5 h-3.5 w-3.5" /> Resources <span className="ml-1.5 text-muted-foreground">{preset.server.resources.length}</span></TabsTrigger>
                      <TabsTrigger value="prompts"><MessageSquareQuote className="mr-1.5 h-3.5 w-3.5" /> Prompts <span className="ml-1.5 text-muted-foreground">{preset.server.prompts.length}</span></TabsTrigger>
                    </TabsList>
                    <TabsContent value="tools" className="mt-3 space-y-2">
                      {preset.server.tools.map((t) => (
                        <div key={t.name} className="rounded-md border p-3">
                          <div className="flex items-center gap-2">
                            <CapabilityBadge kind="tool" />
                            <span className="font-mono text-sm font-medium">{t.name}</span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Object.entries(t.inputSchema.properties).map(([k, v]) => (
                              <span key={k} className="rounded border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px]">
                                {k}: <span className="text-muted-foreground">{v.type}</span>
                                {t.inputSchema.required?.includes(k) && <span className="text-destructive">*</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="resources" className="mt-3 space-y-2">
                      {preset.server.resources.map((r) => (
                        <div key={r.uri} className="rounded-md border p-3">
                          <div className="flex items-center gap-2">
                            <CapabilityBadge kind="resource" />
                            <span className="text-sm font-medium">{r.name}</span>
                          </div>
                          <div className="mt-1 break-all font-mono text-[11px] text-muted-foreground">{r.uri}</div>
                          <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="prompts" className="mt-3 space-y-2">
                      {preset.server.prompts.map((pr) => (
                        <div key={pr.name} className="rounded-md border p-3">
                          <div className="flex items-center gap-2">
                            <CapabilityBadge kind="prompt" />
                            <span className="font-mono text-sm font-medium">{pr.name}</span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{pr.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {pr.arguments.map((a) => (
                              <span key={a.name} className="rounded border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px]">
                                {a.name}{a.required && <span className="text-destructive">*</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Pick a preset to see its capabilities.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Your request</CardTitle>
                <CardDescription className="text-xs">Ask the assistant anything. The model will pick capabilities to fulfill it.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {preset && (
                  <div className="flex flex-wrap gap-1.5">
                    {preset.examplePrompts.map((q) => (
                      <button
                        key={q}
                        onClick={() => update({ currentRequest: q })}
                        className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:bg-accent hover:text-foreground"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
                <Textarea
                  value={state.currentRequest}
                  onChange={(e) => update({ currentRequest: e.target.value })}
                  placeholder="Type your request…"
                  className="min-h-[110px] resize-y"
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">{state.currentRequest.length} chars</div>
                  <Button onClick={handleRun} disabled={!preset || !state.currentRequest.trim()}>
                    <Play className="h-4 w-4" /> Run
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* RIGHT */}
          <aside className="flex flex-col gap-4 min-w-0">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-sm">Run output</CardTitle>
                  <CardDescription className="text-xs">{currentRun ? `${currentRun.steps.length} step(s)` : "Run a request to see results."}</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={handleReplay} disabled={!currentRun} aria-label="Replay"><Repeat className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setCompareOpen((v) => !v)} disabled={!previousRun} aria-label="Compare runs"><GitCompare className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={handleSave} disabled={!currentRun} aria-label="Save run"><Save className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                {currentRun ? (
                  <Timeline run={currentRun} autoExplain={state.settings.autoExplain} />
                ) : (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Hit <span className="font-medium text-foreground">Run</span> to see the tool-call timeline, raw results, and final answer.
                  </div>
                )}
              </CardContent>
            </Card>

            {currentRun && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Final answer</CardTitle>
                  <CardDescription className="text-xs">Composed by the model from the steps above.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Markdown>{currentRun.finalAnswer}</Markdown>
                </CardContent>
              </Card>
            )}

            {compareOpen && previousRun && currentRun && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Compare</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Previous</div>
                    <div className="rounded-md border p-2 text-xs"><Markdown>{previousRun.finalAnswer}</Markdown></div>
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Current</div>
                    <div className="rounded-md border p-2 text-xs"><Markdown>{currentRun.finalAnswer}</Markdown></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {state.savedRuns.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Saved runs</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {state.savedRuns.map((r) => (
                    <div key={r.id} className="rounded-md border p-2 text-xs">
                      <div className="font-medium text-foreground">{r.request}</div>
                      <div className="mt-0.5 text-muted-foreground">{r.stepCount} steps · {new Date(r.at).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Timeline({ run, autoExplain }: { run: ScriptedRun; autoExplain: boolean }) {
  const totalMs = useMemo(() => run.steps.reduce((a, s) => a + s.durationMs, 0), [run]);
  return (
    <div className="space-y-2">
      <div className="text-[11px] text-muted-foreground">Total: {totalMs} ms</div>
      <ol className="space-y-2">
        {run.steps.map((s, i) => (
          <Step key={s.id} index={i + 1} kind={s.kind} name={s.name} durationMs={s.durationMs}
                input={s.input} output={s.output} explanation={s.explanation} status={s.status}
                defaultExplain={autoExplain} />
        ))}
      </ol>
    </div>
  );
}

function Step({ index, kind, name, durationMs, input, output, explanation, status, defaultExplain }: {
  index: number; kind: CapabilityKind; name: string; durationMs: number;
  input: unknown; output: unknown; explanation: string; status: "ok" | "error"; defaultExplain: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [explainOpen, setExplainOpen] = useState(defaultExplain);
  return (
    <li className="rounded-md border bg-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 p-2.5 text-left"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-background text-[10px] font-semibold">{index}</span>
        <CapabilityBadge kind={kind} />
        <span className="truncate font-mono text-xs font-medium">{name}</span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {status === "ok"
            ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            : <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
          {durationMs}ms
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </span>
      </button>
      {open && (
        <div className="space-y-2 border-t p-2.5">
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Input</div>
            <JsonView value={input} />
          </div>
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Output</div>
            <JsonView value={output} />
          </div>
        </div>
      )}
      <div className="border-t px-2.5 py-1.5">
        <button
          onClick={() => setExplainOpen((v) => !v)}
          className="text-[11px] text-primary hover:underline"
        >
          {explainOpen ? "Hide explanation" : "Explain this step"}
        </button>
        {explainOpen && <p className="mt-1 text-xs text-muted-foreground">{explanation}</p>}
      </div>
    </li>
  );
}
