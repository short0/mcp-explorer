import { Link, useRouter } from "@tanstack/react-router";
import { Moon, Sun, RefreshCw, Sparkles } from "lucide-react";
import { useTheme } from "@/hooks/use-playground-state";
import { Button } from "@/components/ui/button";
import { STORAGE_KEY, DEFAULT_STATE, loadState, saveState } from "@/lib/mcp/storage";

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const router = useRouter();

  const handleReset = () => {
    const current = loadState();
    saveState({ ...DEFAULT_STATE, theme: current.theme, savedRuns: current.savedRuns, recentRequests: current.recentRequests });
    router.navigate({ to: "/" });
    // Force a soft refresh of the state on the playground page if open
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span>MCP Playground</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            activeOptions={{ exact: true }}
            activeProps={{ className: "rounded-md px-3 py-1.5 text-sm font-medium text-foreground bg-accent" }}
          >
            Home
          </Link>
          <Link
            to="/playground"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            activeProps={{ className: "rounded-md px-3 py-1.5 text-sm font-medium text-foreground bg-accent" }}
          >
            Playground
          </Link>
          <Button variant="ghost" size="icon" onClick={handleReset} aria-label="Reset to home">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
        <div>
          <span className="font-medium text-foreground">MCP glossary:</span>{" "}
          <span>
            <span className="font-medium">Server</span> exposes capabilities. <span className="font-medium">Client</span> discovers them.
            <span className="font-medium"> Tool</span> = action. <span className="font-medium">Resource</span> = data. <span className="font-medium">Prompt</span> = template.
          </span>
        </div>
        <div>An educational sandbox. Mocked by default.</div>
      </div>
    </footer>
  );
}
