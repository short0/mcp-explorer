import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_STATE, loadState, saveState, type PersistedState } from "@/lib/mcp/storage";

const HISTORY_LIMIT = 40;
const TRACKED: (keyof PersistedState)[] = [
  "selectedPresetId",
  "mode",
  "settings",
  "currentRequest",
  "liveModel",
];

function trackedSnapshot(s: PersistedState) {
  return JSON.stringify({
    selectedPresetId: s.selectedPresetId,
    mode: s.mode,
    settings: s.settings,
    currentRequest: s.currentRequest,
    liveModel: s.liveModel,
  });
}

export function usePlaygroundState() {
  const [state, setState] = useState<PersistedState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const past = useRef<PersistedState[]>([]);
  const future = useRef<PersistedState[]>([]);
  const lastTrackedRef = useRef<string>("");

  // Hydrate on mount
  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    lastTrackedRef.current = trackedSnapshot(loaded);
    // Apply theme class
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", loaded.theme === "dark");
    }
    setHydrated(true);
  }, []);

  // Persist + push to history when tracked fields change
  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", state.theme === "dark");
    }
    const snap = trackedSnapshot(state);
    if (snap !== lastTrackedRef.current) {
      // user-driven change → push previous tracked snapshot to past
      past.current.push(JSON.parse(lastTrackedRef.current ? lastTrackedRef.current : trackedSnapshot(DEFAULT_STATE)));
      if (past.current.length > HISTORY_LIMIT) past.current.shift();
      future.current = [];
      lastTrackedRef.current = snap;
    }
  }, [state, hydrated]);

  const update = useCallback((patch: Partial<PersistedState> | ((s: PersistedState) => Partial<PersistedState>)) => {
    setState((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));
  }, []);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    setState((s) => {
      future.current.push(JSON.parse(trackedSnapshot(s)));
      const next = { ...s, ...prev };
      lastTrackedRef.current = trackedSnapshot(next);
      return next;
    });
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    setState((s) => {
      past.current.push(JSON.parse(trackedSnapshot(s)));
      const merged = { ...s, ...next };
      lastTrackedRef.current = trackedSnapshot(merged);
      return merged;
    });
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({
      ...DEFAULT_STATE,
      theme: s.theme,
      savedRuns: s.savedRuns,
      recentRequests: s.recentRequests,
    }));
    past.current = [];
    future.current = [];
    lastTrackedRef.current = "";
  }, []);

  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  return useMemo(
    () => ({ state, update, undo, redo, reset, canUndo, canRedo, hydrated }),
    [state, update, undo, redo, reset, canUndo, canRedo, hydrated],
  );
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const s = loadState();
    setTheme(s.theme);
    document.documentElement.classList.toggle("dark", s.theme === "dark");
  }, []);
  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === "light" ? "dark" : "light";
      const s = loadState();
      saveState({ ...s, theme: next });
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);
  return { theme, toggle };
}

// keep TRACKED referenced to avoid unused warnings
void TRACKED;
