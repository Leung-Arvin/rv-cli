# rv-cli
Welcome! This is rv-CLI, my personal browser-based terminal portfolio. The motivation behind this project is the desire to stretch my fingers on some code and just make something fun and memorable. I also want to see what's the fuss about AI agents since I never dabbled in incorporating them into a web app. This is not my announcement that I'm becoming an AI engineer!

# Software Design Documentation

## Requirements
There are two distinct actors/users that the app will be built around: Guest and Admin (me)

## Guest Requirements
### Navigation & File System
1. The user shall be able to navigate the virtual file system using standard UNIX commands (`ls`, `cd`, `pwd`)
2. The user shall be able to read the contents of text files and markdown documents using the `cat` command
3. The user shall be able to view a list of available commands and their descriptions by typing `help`
4. The user shall be able to clear the terminal screen using the `clear` command
5. The user shall be able to use `Up` and `Down` arrow keys to cycle through their previously entered command history.

### UI/UX Accessibility
1. The user shall be able to click on highlighted text using their mouse to execute commands or open external URLs
2. The user shall see a visual hover effect when their mouse cursor is over clickable text
3. The user shall be able to change the visual color scheme of the terminal by typing `theme <name>`
4. The user shall be able to copy selected terminal output to their clipboard using `Ctrl+C`/`Cmd+C`. If no text is selected, `Ctrl+C` acts as an interrupt instead (see AI Agent requirement 4), matching how most terminal apps behave
5. The user on a mobile device shall be presented with a readable, touch-friendly fallback UI, since terminal UIs are not natively mobile-friendly
6. The user relying on a screen reader shall be able to read terminal output, using xterm.js's `screenReaderMode`

### The AI Agent
1. The user shall be able to ask the AI agent questions about me by typing `ama <question>` or `ask <question>`
2. The user shall see the AI's response stream into the terminal in real-time rather than waiting for the whole response to generate
3. The user shall be clearly notified via a terminal error message if they exceed the rate limit for AI queries
4. The user shall be able to stop a streaming AI response midway by pressing `Esc`, or `Ctrl+C` when no text is selected
5. The user shall be able to submit feedback if the AI provides incorrect information by typing `feedback <correction>`

### Content Consumption
1. The user shall be able to view my resume, skills, and career history by navigating to the respective directories
2. The user shall be able to read blog posts, ideas, and hobbies stored in the `/blog` directory
3. The user shall be able to find and click external links to my GitHub, LinkedIn, Twitter, etc., via a `socials` command

## Admin Requirements
### Content Management
1. The admin shall be able to add, edit, or delete blog posts and portfolio content by pushing Markdown files to the Git repository, without modifying any frontend code. The push triggers an automatic rebuild and deploy through CI
2. The virtual file system shall be generated at build time from the content folder structure, so new directories and files appear automatically. A centralized configuration file `content.config.ts` is only needed for overrides (ordering, hidden files, display names)

### AI Agent Management
1. The admin shall be able to update the AI agent's personality, knowledge base, and guardrails by editing the system prompt stored in Cloudflare KV, without redeploying the application
2. The admin shall be able to view a log of user feedback commands to identify and correct AI hallucinations
3. The admin shall be able to adjust the rate-limiting thresholds in the Worker configuration (`wrangler.toml`)

### Theming & Customization
1. The admin shall be able to add new color themes by adding a new JSON object to a themes configuration file, mapping ANSI color codes to hex values

## General Non-Functional Requirements
1. The terminal interface shall achieve a Time to Interactive of under 1.5 seconds
2. AI requests shall be routed through Cloudflare AI Gateway so repeated questions can be served from cache, keeping API costs low for moderate traffic
3. The AI agent shall be designed so that a successful prompt injection causes no real harm:
   - The system prompt shall contain no secrets, only public information about me
   - The model shall have no tools or actions it can trigger
   - All AI output shall be sanitized before rendering (see requirements 4 and 5)
4. AI output shall have ANSI escape sequences and other control characters stripped before being written to the terminal
5. Links in AI output shall only be made clickable if their domain is on an allowlist (e.g. my own site, GitHub, LinkedIn)
6. The `ama` and `feedback` endpoints shall both be rate-limited per IP
7. If the AI API goes down or times out, the terminal shall gracefully degrade, displaying a friendly CLI error message rather than crashing or hanging indefinitely

## Tech Stack
<img width="300" height="600" alt="image" src="https://github.com/user-attachments/assets/e884ea80-ece4-4016-8773-cbe5ff4b0800" />

### Frontend
**Svelte (SvelteKit)**:
  At its core, this isn't a generic content site or dashboard, it's a terminal. xterm.js (below) owns the terminal surface itself: input, cursor, output, ANSI colors, and links. Svelte owns everything around it: the loading shell and banner, the status bar, theme switching, and the mobile fallback UI.
  Svelte is a good fit for that role:
  1. There's no virtual DOM overhead where React re-renders component trees when state changes; Svelte compiles code down to precise DOM updates.
  2. Svelte has built-in `writable` and `derived` stores for state management, which is handy for sharing state like the current directory, theme, and AI status between the terminal and the surrounding UI
  3. There's also a smaller bundle size since Svelte ships very little runtime code to the browser, which helps offset the weight of xterm.js

  I'm using SvelteKit for routing and builds, deployed with `@sveltejs/adapter-cloudflare`.

  Tradeoff: Svelte has a smaller ecosystem than React but this project doesn't need a massive one.

**Terminal Emulator**:
  I could spend days trying to perfectly recreate a terminal using divs and CSS but there's a lot that goes into it that would have to be tested and debugged
  - Cursor positioning and blinking
  - Text selection and copying
  - ANSI escape code parsing for colors
  - Scrollback buffer management
  - Performant rendering

  xterm.js solves all of this in house. It powers VS Code's terminal, GitHub Codespaces, and Google Cloud Shell. With its WebGL renderer addon it can handle massive scrollback buffers without lowering performance. It also has a link provider API for clickable, hoverable text and a built-in `screenReaderMode`.

  Tradeoff: xterm.js is ~200KB so it's not exactly lightweight. To work around this, I'll lazy-load it after an HTML banner renders, so the user sees content instantly while the terminal engine loads in the background. The banner container will be sized to match the terminal so there's no visible layout jump when xterm takes over.

**Vite**:
  Kind of a no brainer. Vite has become an essential part of all my web projects since it's so simple to use. It uses native ES modules during development for instant hot reload and Rollup for production builds.
  Tradeoff: There's Turbopack or esbuild, but one is mostly tied to Next.js and the other lacks the plugin ecosystem/dev server features of Vite

### "Backend"
**Cloudflare Workers**: Since I'm already using Workers AI, sticking to the Cloudflare ecosystem will be nice. Although Cloudflare does have dodgy availability, it cannot undermine how much of today's software architecture is built on them.

The backend needs to do three key things:
1. Route API requests
2. Enforce rate limits
3. Call the AI API and stream the response back

Cloudflare Workers run on the edge which means lower latency since requests are processed closer to the user, and cold starts are near zero.

Tradeoff: The free tier limits Workers to 10ms of CPU time per request and a 3MB bundle (the paid plan raises these to 30 seconds and 10MB). 10ms sounds tiny, but time spent waiting on the AI to respond is I/O rather than CPU, so streaming a response still fits. My own computations (routing, rate-limit checks, sanitizing output) are very light.

### AI Provider

**Cloudflare Workers AI**: Sticking to the Cloudflare ecosystem, their AI models are nicely packaged with Workers so that's a nice bonus. For a portfolio AMA, a small, fast model is more than enough to answer most questions about my career, skills, and blog posts. I'll start with Llama 3.1 8B and compare it against newer models in the Workers AI catalog before settling.

**Cloudflare AI Gateway**: Sits in front of Workers AI to cache responses to repeated questions, log requests, and give me analytics on usage and cost, without extra code.

Tradeoff: Workers AI models are open-weight so they aren't as smart as the frontier models, but for this tiny project, they should suffice.

### Storage & State

**Rate Limiting binding + KV + D1**: These tools cover the app's three storage needs:
1. Rate Limiting: Cloudflare's native Rate Limiting binding tracks requests per IP. I originally planned to use KV for this, but KV is eventually consistent (writes can take up to ~60 seconds to propagate) and limits writes to about one per second per key, so a counter built on it would undercount during bursts. The binding's counts are per Cloudflare location rather than globally exact, which is fine for abuse prevention; if I ever need exact global counts, a Durable Object is the upgrade path.
2. System prompt: stored in KV, which is read-heavy and rarely written, exactly what KV is good at. This lets me update the AI's personality and knowledge without a redeploy.
3. Feedback logs: store user corrections in D1 so I can review them

The portfolio and blog content is small enough to go directly into the model's context. If the blog grows large enough that answers start degrading, I'll add Vectorize for RAG then, but not before.

Tradeoff: D1 is relatively new, reaching general availability in 2024, so it has fewer features than Postgres. But for logging feedback, it should be enough. Keeping everything inside Cloudflare means I don't have to manage as many services.

### Deployment

**Cloudflare Workers (with static assets)**: A single Worker serves both the built SvelteKit frontend and the `/api` routes, configured in one `wrangler.toml`, so one deployment command really does push everything. Cloudflare now recommends Workers with static assets over Pages for new projects, and everything is served from Cloudflare's edge, so the site is super duper fast. Pushes to `main` deploy automatically through CI.

Tradeoff: Cloudflare's preview deployment UX isn't as polished as Vercel's, which is a bit of a pain, but for a solo portfolio it seems chill.

## App Scaffolding

### Frontend App Scaffolding

```
  src/
      lib/
          terminal/
              Terminal.svelte # Big wrapper, lazy-loads and initializes xterm.js
              Banner.svelte # Instant HTML banner shown while xterm loads
              TerminalWriter.ts # Wraps xterm writes; implements the TerminalWriter interface
              links.ts # Registers xterm link providers for clickable/hoverable text
              StatusBar.svelte # Bottom bar for current dir, theme, and AI status
              MobileFallback.svelte # Touch-friendly UI for mobile devices
          state/
              stores.ts # Svelte state stores
              actions.ts # Functions to safely update state
          commands/
              router.ts # Parses input, routes to correct handler
              history.ts # Up/Down arrow command history
              handlers/
                  ls.ts # Handles ls command
                  cd.ts # Handles cd command
                  cat.ts # Handles cat command
                  theme.ts # Handles theme command
                  clear.ts # Handles clear command
                  ama.ts # Calls /api/ama, handles streaming and cancellation
                  feedback.ts # Calls /api/feedback
              types.ts # TypeScript interfaces for commands
          vfs/
              build.ts # Generates the VFS at build time from content/ (import.meta.glob)
              navigator.ts # Handles cd, ls logic against the VFS
              types.ts # FileNode, DirectoryNode interfaces
          themes/
              themes.json # Color definition for each theme
              applyTheme.ts # Updates xterm theme and CSS variables
      routes/
          +page.svelte # Main page, renders Terminal component
      app.css # Global styles
  content/ # Markdown content; folder structure becomes the VFS
  content.config.ts # Optional overrides (ordering, hidden files, display names)
```
### Backend Worker Scaffolding
```
  worker/
      src/
          index.ts # Main entry point, routes /api requests, serves static assets otherwise
          routes/
              ama.ts # POST /api/ama - AI agent endpoint
              feedback.ts # POST /api/feedback - Log user corrections to D1
          middleware/
              rateLimiter.ts # Checks the Rate Limiting binding per IP
              cors.ts # Handles CORS headers
          ai/
              agent.ts # Loads system prompt from KV and calls Workers AI via AI Gateway
              stream.ts # Handles streaming response back to client
              sanitize.ts # Strips ANSI/control characters, filters links against allowlist
          utils/
              env.ts # TypeScript types for environment variables and bindings
  wrangler.toml # Worker config: static assets, KV, D1, rate limiting, AI bindings
```

### Interface Contracts
To prevent spaghetti code and keep maintenance easier, each module will define its public API.

**Example: Command Handler Interface**
```ts
export interface CommandContext {
  currentDirectory: string;
  vfs: VirtualFileSystem;
  args: string[];
}

// Handlers write output through this instead of returning one big string,
// so streaming commands like `ama` use the same interface as `ls`.
export interface TerminalWriter {
  write(text: string): void;
  writeLine(text: string): void;
  writeError(text: string): void;
  clear(): void;
}

export interface CommandResult {
  exitCode: number; // 0 = success
  newDirectory?: string;
  newTheme?: string;
}

export interface CommandHandler {
  name: string;
  description: string; // Used by `help`
  execute(
    ctx: CommandContext,
    term: TerminalWriter,
    signal: AbortSignal // Fired on Ctrl+C / Esc
  ): Promise<CommandResult>;
}
```

Every command handler like `ls.ts` must implement this interface. Simple commands just write and resolve immediately; `ama` streams chunks through `term.write()` and stops when `signal` is aborted. This makes it simpler to add new commands later.
