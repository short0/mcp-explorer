export type CapabilityKind = "tool" | "resource" | "prompt";

export interface MockTool {
  name: string;
  description: string;
  inputSchema: { type: "object"; properties: Record<string, { type: string; description?: string }>; required?: string[] };
}

export interface MockResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

export interface MockPrompt {
  name: string;
  description: string;
  arguments: { name: string; description?: string; required?: boolean }[];
}

export interface MockServer {
  id: string;
  name: string;
  version: string;
  transport: "stdio" | "http+sse" | "ws";
  description: string;
  tools: MockTool[];
  resources: MockResource[];
  prompts: MockPrompt[];
}

export interface RunStep {
  id: string;
  kind: CapabilityKind;
  name: string;
  durationMs: number;
  status: "ok" | "error";
  input: unknown;
  output: unknown;
  explanation: string;
}

export interface ScriptedRun {
  request: string;
  steps: RunStep[];
  finalAnswer: string;
}

export interface Preset {
  id: string;
  name: string;
  icon: string;
  short: string;
  capabilityChips: string[];
  server: MockServer;
  examplePrompts: string[];
  runs: Record<string, ScriptedRun>;
}
