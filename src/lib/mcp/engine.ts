import type { Preset, RunStep, ScriptedRun } from "./types";

/**
 * Deterministic mocked engine. Given a preset and a user request, produce a run.
 * If the request matches a scripted prompt exactly, replay it. Otherwise,
 * synthesize a plausible 1–2 step run from the preset's available capabilities.
 */
export function runMocked(preset: Preset, request: string): ScriptedRun {
  const direct = preset.runs[request];
  if (direct) return direct;

  // Heuristic synthesis
  const lower = request.toLowerCase();
  const steps: RunStep[] = [];
  const tool = preset.server.tools[0];
  const resource = preset.server.resources[0];

  if (resource && (lower.includes("read") || lower.includes("show") || lower.includes("doc") || lower.includes("note"))) {
    steps.push({
      id: "s1",
      kind: "resource",
      name: resource.uri,
      durationMs: 14,
      status: "ok",
      input: { uri: resource.uri },
      output: { contents: `(mocked contents of ${resource.name})` },
      explanation: "Resources are passive context — fetched by URI without invoking server logic.",
    });
  }
  if (tool) {
    steps.push({
      id: `s${steps.length + 1}`,
      kind: "tool",
      name: tool.name,
      durationMs: 60 + Math.floor(request.length % 50),
      status: "ok",
      input: { hint: request.slice(0, 60) },
      output: { ok: true, note: `Synthesized result from ${tool.name}.` },
      explanation: `Tool call to '${tool.name}' to gather data needed to answer the request.`,
    });
  }

  return {
    request,
    steps,
    finalAnswer: `Here's a synthesized answer for: _"${request}"_.\n\nIn a real run, the model would compose this from the ${steps.length} step(s) above. Try one of the example prompts for a fully scripted scenario.`,
  };
}
