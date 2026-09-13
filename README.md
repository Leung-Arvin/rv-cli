# rv-cli
Welcome! This is rv-CLI, my personal browser-based terminal portfolio. The motivation behind this project is the desire to stretch my fingers on some code and just make something fun and memorable. I also want to see what's the fuss about ai agents since I never dabbled in using them too much incorporating into a web app. This is not my announcement that I'm becoming an AI engineer! 

# Software Design Documentation

## Requirements
There are two distinct actors/users that the app will be build around: Guest and Admin (me)

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
4. The user shall be able to copy text from the terminal output to their clipboard using standard mouse highlighting and `Ctrl+C`/`Cmd+C`
5. The user on a mobile device shall be presented with a readable, touch-friendly fallback UI as standard UIs are not natively mobile-friendly

### The AI Agent 
1. The user shall be able to ask the AI agent questions about me by typing `ama <question>` or `ask <question`
2. The user shall see the AI's response stream into the terminal in real-time rather than waiting for the whole response to generate
3. The user shall be clearly notified via a terminal error message if they exceed the rate limit for AI queries
4. The user shall be able to stop a streaming AI response midway by pressing `Ctrl+C` or `Esc`
5. The user shall be able to submit feedback if the AI provides incorrect information by typing `feedback <correction>`

### Content Consumption
1. The user shall be able to view my resume, skills, and career history by navigating to the respective directories
2. The user shall be able to read blog posts, ideas, and hobbies stored in the `/blog` directory
3. The user shall be able to find and click external links to my GitHub, LinkedIn, Twitter, etc., via a `socials` command

## Admin Requirements
### Content Management
1. The admin shall be able to add, edit, or delete blog posts and portfolio content by simply pushing Markdown files to the Git repository, without modifying any frontend code
2. The admin shall be able to add new directories and files to the virtual file system by updating a centralized configuration file `content.config.ts`

### Ai Agent Management
1. The admin shall be able update the AI agent's personality, knowledge base, and guardrails by editing a centralized system prompt file, without redeploying the core application logic
2. The admin shall be able to view a log of use feedback commands to identify and correct AI hallucinations
3. The admin shall be able to adjust the rate-limiting thresholds via environment variables

### Theming & Customization
1. The admin shall be able to add new color themes by adding a new JSON object to a themes configuration file, mapping ANSI color codes to hex values

## General Non-Functional Requirements
1. The terminal interface shall achieve a Time to Interactive of under 1.5 seconds
2. The AI agent integration shall utilize edge caching or prompt caching to keep API costs low for moderate traffic
3. The AI agent shall be protected against prompt injection attacks that attempt to make the AI reveal hidden system prompts or generate malicious code
4. If the AI API goes down or times out, the terminal shall gracefully degrade, displaying a friendly CLI error message rather than crashing or hanging indefinitely

## Tech Stack
<img width="300" height="600" alt="image" src="https://github.com/user-attachments/assets/e884ea80-ece4-4016-8773-cbe5ff4b0800" />

### Frontend
**Svelte**: 
  At it's core, this isn't a generic content site or dashbord, its a terminal. The screen will update constantly like the cursor will be blink 60 times a second or characters have to stream in from the AI one-by-one. 
  Svelte's reactivity model is ideal for this situation. 
  1. There's no virtual DOM overhead where React re-renders component tress when state changes, svelte compiles code down to precise DOM updates.
  2. Svelte has built in stores with `writable` and `derived` stores for state management
  3. There's also smaller bundle size since Svelte ships virtually no runtime code to the browser

  Tradeoff: Svelte has a smaller ecosystem than React but this project doesn't need a massive one.

**Terminal Emulator**:
  I could spend days trying to perfectly recreate a terminal using divs and CSS but there's a lot that goes into it that would have to be tested and debugged
  - Cursor positioning and blinking
  - Text selection and copying
  - ANSI escape code parsing for colors
  - Scrollback buffer managemenet
  - Canvas-based rendering

  Xterm.js solves all of this in house. It powers VS Code's terminal, GitHub Codespaces, and Google Cloud Shell. It renders to a <canvas> element so it can handle massive scrollback buffers without lowering performance

  Tradeoff: Xterm.js is ~200KB so its a going to not necessarily lightweight. To workaround, we can imply lazy-loading only after initial banner renders so the user sees content instantly while the terminal engine loads in the background.

  **Vite**:
  Kind of a no brainer. Vite has become a essential part of all my web projects since its so simple to use. It uses native ES modules during development for instant hot reload and Rollup for production builds. 
  Tradeoff: There's Turbopack or esbuild but ones mostly tied to Next.js and the other lacks plugin ecosystem/same dev server features as vite
  
### "Backend"
**Cloudflare Workers**: Since I'm already thinking of using Cloudflare agents, sticking to the cloudflare ecosystem will be nice. Although Cloudflare does have dodgy availability, it cannot undermine how much of todays software architecture is built on them.

The backend needs to do three key things:
1. Route API requests
2. Enforce rate limits
3. Call thje AI API and stream response back

Cloudflare workers run on the edge which means lower latency since it processed closer to the user and there's no cold starts

Tradeoff: Workers have 10MB bundle size limit and a 30-second CPU time limit per request at least on the free tier. My computations arent going to be super heavy so this should be fine.

### AI Provider

**Cloudflare Workers AI**: Sticking to the Cloudflare ecosystem, there AI agents are nicely packaged with their workers so thats a nice bonus. For a portfolio AMA, Llama 3.1 8B is more than enough where its fast, cheap and good enough to answer most questions about my career, skills, and blog spots.

Tradeoff: Workers AI models are open-source so they arent as smart as Claude or GPT-4 but for a this tiny project, it should suffice. 

### Storage & State

**Cloudflare KV + Vectorize + D1**: These tools will provide the app three types of storage:
1. Rate Limiting: Track how many requests each IP has made. KV is perfect.
2. RAG: If blog becomes larger, embed it into vectorize so the AI can search it for context
3. Feedback labs: store user corrections in D1 so I can review them

Tradeoff: D1 is relatively knew launching in 2024 and so it has fewer features than Postgres. But for logging feedback, it should be enough. Redis would also be a good choice to switch to later down the line for rate limiting but KV is already apart of cloudflare's ecosystem so I dont have to manage as many services.

### Deployment

**Cloudflare Pages + Cloudflare Workers**: Pages provides a 500 builds/month and unlimited bandwidth. Workers can be easily integrated via wrangler.toml, where one deployment command can push both. Both are served from Cloudflare's edge, so the site is super duper fast. 

Tradeoff: CF pages doesnt have the same preview deployment UX as Vercel which is a bit of a pain but for a solo portfolio seems chill.

## App Scaffolding

### Frontend App Scaffolding

```
  src/
      lib/
          terminal/
              Terminal.svelte # Big wrapper, initalizes xterm.js 
              Prompt.svelte # Handles cursor, prompt text, input capture
              OutputLine.svelte # Renders a single line with ANSI parsing
              StatusBar.svelte # Bottom var for current dir, theme, and AI status
          state/
              stores.ts # Svelte state stores
              actions.ts # Functions to safely update state
          commands/
              router.ts # parses input, routes to correct handler
              handlers/
                  ls.ts # Handles ls command
                  cd.ts # handles cd command
                  cat.ts # handles cat command
                  theme.ts # handles theme command
                  ama.ts # calls /api/ama, handles streaming
              types.ts # Typescript interfaces for commands
          vfs/
              parser.ts # Converts JSON VFS to navigable trees
              navigator.ts # Handles cd, ls logic against VFS
              types.ts # FileNode, DirectoryNode interfaces
          themes/
              themes.json # Color definition for each theme
              applyTheme.ts # Updates CSS variables based on theme
    routes/
          +page.svelte # Main page, renders Terminal component
    app.css # Global styles
```
### Backend Worker Scaffolding
```
  worker/
      src/
          index.ts # Main entry point, routes requests
          routes/
              ama.ts # POST /api/ama - AI agent endpoint
              feedback.ts # POST /api/feedback - Log user corrections
          middleware/
              rateLimiter.ts # Checks KV for IP limits
              cors.ts # Handles CORs headers
          ai/
              agent.ts # Formats system prompt and calls workers AI
              prompts.ts # System prompt templates
              stream.ts # Handles streaming response back to client
          utils/
              env.ts # Typescript types for environment variables
      wrangler.toml # Cloudflare Worker config file
```

### Interface Contracts
To prevent spaghetti code and keep maintenance easier, each module will define its public API.

**Example: Command Handler Interface**
```
export interface CommandText {
  currentDirectory: string;
  vfs: VirtualFileSystem;
  args: string[];
}

export interface CommandResult {
  output: string;
  newDirectory?: string;
  isError?: boolean;

export interface CommandHandler {
  execute(ctx: CommandContext): CommandResult;
}
```

Every command handler like `ls.ts` must implement this interface. This makes it simpler to add new commands later

