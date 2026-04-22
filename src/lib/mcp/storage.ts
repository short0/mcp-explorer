export const STORAGE_KEY = "mcp-playground:v1";

export interface Settings {
  temperature: number;
  maxSteps: number;
  autoExplain: boolean;
}

export interface SavedRun {
  id: string;
  presetId: string;
  request: string;
  finalAnswer: string;
  stepCount: number;
  at: number;
}

export interface PersistedState {
  theme: "light" | "dark";
  selectedPresetId: string | "blank";
  mode: "mocked" | "live";
  settings: Settings;
  currentRequest: string;
  notes: string;
  recentRequests: string[];
  savedRuns: SavedRun[];
  liveApiKey: string;
  liveModel: string;
}

export const DEFAULT_STATE: PersistedState = {
  theme: "light",
  selectedPresetId: "filesystem",
  mode: "mocked",
  settings: { temperature: 0.2, maxSteps: 6, autoExplain: true },
  currentRequest: "",
  notes: "",
  recentRequests: [],
  savedRuns: [],
  liveApiKey: "",
  liveModel: "google/gemini-3-flash-preview",
};

export function loadState(): PersistedState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed, settings: { ...DEFAULT_STATE.settings, ...(parsed.settings ?? {}) } };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}
