import type { Preset } from "./types";

export const PRESETS: Preset[] = [
  {
    id: "filesystem",
    name: "Filesystem Assistant",
    icon: "FolderTree",
    short: "Browse files and use safe utility tools to read and summarize project content.",
    capabilityChips: ["list_directory", "read_file", "search_files"],
    server: {
      id: "fs-server",
      name: "filesystem-mcp",
      version: "0.4.2",
      transport: "stdio",
      description: "Sandboxed filesystem access for a project workspace.",
      tools: [
        {
          name: "list_directory",
          description: "List entries in a directory.",
          inputSchema: {
            type: "object",
            properties: { path: { type: "string", description: "Absolute or workspace-relative path" } },
            required: ["path"],
          },
        },
        {
          name: "read_file",
          description: "Read a UTF-8 text file.",
          inputSchema: {
            type: "object",
            properties: { path: { type: "string" } },
            required: ["path"],
          },
        },
        {
          name: "search_files",
          description: "Find files matching a glob pattern.",
          inputSchema: {
            type: "object",
            properties: { pattern: { type: "string" }, path: { type: "string" } },
            required: ["pattern"],
          },
        },
      ],
      resources: [
        { uri: "file:///workspace/README.md", name: "README.md", description: "Project overview", mimeType: "text/markdown" },
        { uri: "file:///workspace/package.json", name: "package.json", description: "Manifest", mimeType: "application/json" },
      ],
      prompts: [
        { name: "summarize_repo", description: "Summarize the structure of a project.", arguments: [{ name: "root", required: true }] },
      ],
    },
    examplePrompts: [
      "Summarize what this project does",
      "List all TypeScript files in src/",
      "Show me the README",
      "Find files mentioning 'auth'",
    ],
    runs: {
      "Summarize what this project does": {
        request: "Summarize what this project does",
        steps: [
          {
            id: "s1",
            kind: "tool",
            name: "list_directory",
            durationMs: 42,
            status: "ok",
            input: { path: "/workspace" },
            output: { entries: ["README.md", "package.json", "src/", "public/"] },
            explanation:
              "The client called the list_directory tool to discover what's at the project root before deciding what to read.",
          },
          {
            id: "s2",
            kind: "resource",
            name: "file:///workspace/README.md",
            durationMs: 18,
            status: "ok",
            input: { uri: "file:///workspace/README.md" },
            output: { contents: "# Demo Project\n\nA small TanStack Start app showing MCP concepts." },
            explanation:
              "The model read the README resource directly. Resources are read-only context the server exposes by URI.",
          },
          {
            id: "s3",
            kind: "tool",
            name: "read_file",
            durationMs: 24,
            status: "ok",
            input: { path: "/workspace/package.json" },
            output: { name: "demo", scripts: { dev: "vite" } },
            explanation: "The model used a tool call to inspect dependencies and scripts for additional signal.",
          },
        ],
        finalAnswer:
          "**Demo Project** is a small TanStack Start app demonstrating MCP. It uses Vite for dev (`npm run dev`) and contains a typical `src/` + `public/` layout. The README frames it as an educational sample.",
      },
      "List all TypeScript files in src/": {
        request: "List all TypeScript files in src/",
        steps: [
          {
            id: "s1",
            kind: "tool",
            name: "search_files",
            durationMs: 36,
            status: "ok",
            input: { pattern: "**/*.ts", path: "/workspace/src" },
            output: { matches: ["src/main.ts", "src/router.ts", "src/lib/utils.ts"] },
            explanation: "A single tool call with a glob pattern is enough — no need to read file contents.",
          },
        ],
        finalAnswer: "Found **3 TypeScript files**:\n- `src/main.ts`\n- `src/router.ts`\n- `src/lib/utils.ts`",
      },
      "Show me the README": {
        request: "Show me the README",
        steps: [
          {
            id: "s1",
            kind: "resource",
            name: "file:///workspace/README.md",
            durationMs: 12,
            status: "ok",
            input: { uri: "file:///workspace/README.md" },
            output: { contents: "# Demo Project\n\nA small TanStack Start app showing MCP concepts." },
            explanation: "Resources are passive context — the client just fetches the URI without invoking logic.",
          },
        ],
        finalAnswer: "```md\n# Demo Project\n\nA small TanStack Start app showing MCP concepts.\n```",
      },
      "Find files mentioning 'auth'": {
        request: "Find files mentioning 'auth'",
        steps: [
          {
            id: "s1",
            kind: "tool",
            name: "search_files",
            durationMs: 51,
            status: "ok",
            input: { pattern: "**/*auth*" },
            output: { matches: ["src/lib/auth.ts", "src/routes/auth.tsx"] },
            explanation: "A glob search is the cheapest first pass before opening any files.",
          },
        ],
        finalAnswer: "Two files match `auth`:\n- `src/lib/auth.ts`\n- `src/routes/auth.tsx`",
      },
    },
  },
  {
    id: "research",
    name: "Research Assistant",
    icon: "BookOpen",
    short: "Combine personal notes, web search results, and reusable prompts for synthesis.",
    capabilityChips: ["web_search", "fetch_url", "notes://"],
    server: {
      id: "research-server",
      name: "research-mcp",
      version: "1.2.0",
      transport: "http+sse",
      description: "Aggregates a notes vault, search, and citation prompts.",
      tools: [
        {
          name: "web_search",
          description: "Search the web and return top results.",
          inputSchema: {
            type: "object",
            properties: { query: { type: "string" }, limit: { type: "number" } },
            required: ["query"],
          },
        },
        {
          name: "fetch_url",
          description: "Fetch and extract main content from a URL.",
          inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] },
        },
      ],
      resources: [
        { uri: "notes://daily/2024-09-12", name: "Daily note 2024-09-12", description: "Personal notes" },
        { uri: "notes://topics/mcp", name: "Topic: MCP", description: "Collected MCP notes" },
      ],
      prompts: [
        {
          name: "cite_sources",
          description: "Format a synthesis with inline citations.",
          arguments: [{ name: "topic", required: true }, { name: "style", required: false }],
        },
      ],
    },
    examplePrompts: [
      "What is MCP and why does it matter?",
      "Summarize my notes on MCP",
      "Find recent articles on agent protocols",
    ],
    runs: {
      "What is MCP and why does it matter?": {
        request: "What is MCP and why does it matter?",
        steps: [
          {
            id: "s1",
            kind: "resource",
            name: "notes://topics/mcp",
            durationMs: 9,
            status: "ok",
            input: { uri: "notes://topics/mcp" },
            output: { contents: "MCP = Model Context Protocol. Standard for tool/resource discovery." },
            explanation: "First, pull existing personal context so the answer reflects what the user already knows.",
          },
          {
            id: "s2",
            kind: "tool",
            name: "web_search",
            durationMs: 312,
            status: "ok",
            input: { query: "Model Context Protocol overview", limit: 3 },
            output: {
              results: [
                { title: "Introducing MCP", url: "https://example.com/a" },
                { title: "MCP spec v1", url: "https://example.com/b" },
              ],
            },
            explanation: "A tool call to fetch fresh public sources. Tools have side effects — here, an outbound network request.",
          },
          {
            id: "s3",
            kind: "prompt",
            name: "cite_sources",
            durationMs: 4,
            status: "ok",
            input: { topic: "MCP", style: "inline" },
            output: { template: "Use [n] inline citations and a Sources list." },
            explanation: "A prompt is a reusable instruction template — the server provides it so the format stays consistent.",
          },
        ],
        finalAnswer:
          "**MCP (Model Context Protocol)** is an open standard letting AI apps discover tools, read resources, and reuse prompts from external servers in a uniform way [1][2].\n\nIt matters because it replaces ad‑hoc plugin systems with one protocol that any client and any server can speak.\n\n**Sources**\n1. Introducing MCP\n2. MCP spec v1",
      },
      "Summarize my notes on MCP": {
        request: "Summarize my notes on MCP",
        steps: [
          {
            id: "s1",
            kind: "resource",
            name: "notes://topics/mcp",
            durationMs: 7,
            status: "ok",
            input: { uri: "notes://topics/mcp" },
            output: { contents: "MCP = Model Context Protocol. Standard for tool/resource discovery." },
            explanation: "Only personal context is needed — no external lookups.",
          },
        ],
        finalAnswer: "Your notes define MCP as the **Model Context Protocol**, a standard for tool and resource discovery between AI clients and servers.",
      },
      "Find recent articles on agent protocols": {
        request: "Find recent articles on agent protocols",
        steps: [
          {
            id: "s1",
            kind: "tool",
            name: "web_search",
            durationMs: 287,
            status: "ok",
            input: { query: "agent protocol 2024", limit: 5 },
            output: { results: [{ title: "Agent protocols compared", url: "https://example.com/agents" }] },
            explanation: "Web search is the right first step when the user asks for recent external content.",
          },
        ],
        finalAnswer: "Top result: **Agent protocols compared** — overview of MCP, A2A, and proprietary stacks.",
      },
    },
  },
  {
    id: "support",
    name: "Support Copilot",
    icon: "Headphones",
    short: "Look up customer profiles, related tickets, and product docs to draft a reply.",
    capabilityChips: ["get_customer", "search_tickets", "docs://"],
    server: {
      id: "support-server",
      name: "support-mcp",
      version: "0.9.1",
      transport: "http+sse",
      description: "Customer profile, ticket lookup, and documentation tools.",
      tools: [
        {
          name: "get_customer",
          description: "Fetch a customer profile by id.",
          inputSchema: {
            type: "object",
            properties: { id: { type: "string" } },
            required: ["id"],
          },
        },
        {
          name: "search_tickets",
          description: "Search support tickets by keyword and customer.",
          inputSchema: {
            type: "object",
            properties: { customerId: { type: "string" }, query: { type: "string" } },
            required: ["query"],
          },
        },
      ],
      resources: [
        { uri: "docs://billing/refunds", name: "Refund policy", description: "Internal billing doc" },
        { uri: "docs://product/limits", name: "Plan limits", description: "Plan and usage limits" },
      ],
      prompts: [
        {
          name: "draft_reply",
          description: "Polite, on-brand support reply template.",
          arguments: [{ name: "tone", required: false }],
        },
      ],
    },
    examplePrompts: [
      "Draft a refund reply for customer 4821",
      "Why is customer 4821 over their limit?",
      "Find recent tickets about billing",
    ],
    runs: {
      "Draft a refund reply for customer 4821": {
        request: "Draft a refund reply for customer 4821",
        steps: [
          {
            id: "s1",
            kind: "tool",
            name: "get_customer",
            durationMs: 64,
            status: "ok",
            input: { id: "4821" },
            output: { id: "4821", name: "Jamie Lee", plan: "Pro", since: "2023-04-11" },
            explanation: "We need the customer's name and plan to personalize the reply.",
          },
          {
            id: "s2",
            kind: "resource",
            name: "docs://billing/refunds",
            durationMs: 11,
            status: "ok",
            input: { uri: "docs://billing/refunds" },
            output: { contents: "Pro customers eligible for prorated refund within 14 days." },
            explanation: "Internal docs read as a resource — passive context, no logic on the server.",
          },
          {
            id: "s3",
            kind: "prompt",
            name: "draft_reply",
            durationMs: 3,
            status: "ok",
            input: { tone: "warm" },
            output: { template: "Warm greeting → acknowledge → action → sign-off." },
            explanation: "A reusable prompt template ensures consistent voice across agents.",
          },
        ],
        finalAnswer:
          "Hi Jamie,\n\nThanks for reaching out. Since you're on **Pro** and within our 14‑day window, I've gone ahead and issued a prorated refund — you should see it in 3–5 business days.\n\nLet me know if anything else comes up.\n\n— Support",
      },
      "Why is customer 4821 over their limit?": {
        request: "Why is customer 4821 over their limit?",
        steps: [
          {
            id: "s1",
            kind: "tool",
            name: "get_customer",
            durationMs: 58,
            status: "ok",
            input: { id: "4821" },
            output: { id: "4821", plan: "Pro", usage: { seats: 12, included: 10 } },
            explanation: "Compares actual usage to what's included in the plan.",
          },
          {
            id: "s2",
            kind: "resource",
            name: "docs://product/limits",
            durationMs: 9,
            status: "ok",
            input: { uri: "docs://product/limits" },
            output: { contents: "Pro plan includes 10 seats; overages billed at $8/seat." },
            explanation: "Pulls the policy needed to explain the overage.",
          },
        ],
        finalAnswer:
          "Customer 4821 is on **Pro** (10 seats included) but currently has **12 active seats**. Overages bill at $8/seat, so 2 extra seats are being charged.",
      },
      "Find recent tickets about billing": {
        request: "Find recent tickets about billing",
        steps: [
          {
            id: "s1",
            kind: "tool",
            name: "search_tickets",
            durationMs: 94,
            status: "ok",
            input: { query: "billing" },
            output: { tickets: [{ id: "T-1042", subject: "Refund question" }, { id: "T-1051", subject: "Invoice mismatch" }] },
            explanation: "One scoped tool call returns the relevant tickets.",
          },
        ],
        finalAnswer: "**2 recent billing tickets:**\n- T‑1042 — Refund question\n- T‑1051 — Invoice mismatch",
      },
    },
  },
  {
    id: "dev",
    name: "Dev Helper",
    icon: "Code2",
    short: "Inspect repository info, open issues, and library docs through MCP-style capabilities.",
    capabilityChips: ["list_issues", "get_repo", "docs://lib"],
    server: {
      id: "dev-server",
      name: "dev-mcp",
      version: "2.0.0",
      transport: "http+sse",
      description: "Repository, issues, and library docs.",
      tools: [
        {
          name: "get_repo",
          description: "Fetch repository metadata.",
          inputSchema: {
            type: "object",
            properties: { owner: { type: "string" }, repo: { type: "string" } },
            required: ["owner", "repo"],
          },
        },
        {
          name: "list_issues",
          description: "List issues for a repository.",
          inputSchema: {
            type: "object",
            properties: { owner: { type: "string" }, repo: { type: "string" }, state: { type: "string" } },
            required: ["owner", "repo"],
          },
        },
      ],
      resources: [
        { uri: "docs://lib/tanstack-router", name: "TanStack Router docs", description: "Router reference" },
      ],
      prompts: [
        { name: "triage_issue", description: "Categorize and prioritize an issue.", arguments: [{ name: "issueId", required: true }] },
      ],
    },
    examplePrompts: [
      "What's open on lovable/example?",
      "Triage issue 42",
      "How do I define a route in TanStack Router?",
    ],
    runs: {
      "What's open on lovable/example?": {
        request: "What's open on lovable/example?",
        steps: [
          {
            id: "s1",
            kind: "tool",
            name: "get_repo",
            durationMs: 71,
            status: "ok",
            input: { owner: "lovable", repo: "example" },
            output: { stars: 128, openIssues: 7, defaultBranch: "main" },
            explanation: "Quick metadata fetch tells us the repo exists and how many open issues to expect.",
          },
          {
            id: "s2",
            kind: "tool",
            name: "list_issues",
            durationMs: 138,
            status: "ok",
            input: { owner: "lovable", repo: "example", state: "open" },
            output: { issues: [{ id: 41, title: "404 on dynamic route" }, { id: 42, title: "SSR hydration warning" }] },
            explanation: "A second tool call gets the actual issue list now that we know it's safe.",
          },
        ],
        finalAnswer:
          "**lovable/example** has **7 open issues**. Top two:\n- #41 404 on dynamic route\n- #42 SSR hydration warning",
      },
      "Triage issue 42": {
        request: "Triage issue 42",
        steps: [
          {
            id: "s1",
            kind: "prompt",
            name: "triage_issue",
            durationMs: 4,
            status: "ok",
            input: { issueId: "42" },
            output: { template: "Classify: bug/feat/docs. Priority: P0–P3. Reason." },
            explanation: "A prompt ensures every triage uses the same structure.",
          },
          {
            id: "s2",
            kind: "tool",
            name: "list_issues",
            durationMs: 88,
            status: "ok",
            input: { owner: "lovable", repo: "example", state: "open" },
            output: { issues: [{ id: 42, title: "SSR hydration warning", body: "Mismatch on /products" }] },
            explanation: "Fetches the issue body so the model has enough to classify.",
          },
        ],
        finalAnswer:
          "**#42 — SSR hydration warning**\n- **Type:** bug\n- **Priority:** P1\n- **Reason:** Hydration mismatches cause visible flicker and break interactivity on a primary route.",
      },
      "How do I define a route in TanStack Router?": {
        request: "How do I define a route in TanStack Router?",
        steps: [
          {
            id: "s1",
            kind: "resource",
            name: "docs://lib/tanstack-router",
            durationMs: 10,
            status: "ok",
            input: { uri: "docs://lib/tanstack-router" },
            output: { contents: "Use createFileRoute('/path')({ component }) in src/routes." },
            explanation: "Docs are static reference material — exposed as a resource, not a tool.",
          },
        ],
        finalAnswer:
          "Create a file in `src/routes/` and export a route:\n\n```tsx\nimport { createFileRoute } from '@tanstack/react-router';\nexport const Route = createFileRoute('/about')({ component: AboutPage });\n```",
      },
    },
  },
];

export const PRESETS_BY_ID: Record<string, Preset> = Object.fromEntries(PRESETS.map((p) => [p.id, p]));
