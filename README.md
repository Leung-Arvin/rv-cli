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
3. The user shall be clearly notified via a terminal errorm essage if they exceed the rate limit for AI queries
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
<img width="708" height="1418" alt="image" src="https://github.com/user-attachments/assets/e884ea80-ece4-4016-8773-cbe5ff4b0800" />

### Frontend
**Svelte** - I may be a tried and true React developer but that cannot outweigh the fact that Svelte seems like a good fit for a terminal app thats highly interactive and state-heavy. the big tradeoff is a smaller developer ecosystem and the ability to leverage Vercel to its fullest.

### "Backend"
**Cloudflare Workers** - Since I'm already thinking of using Cloudflare agents, sticking to the cloudflare ecosystem will be nice. Although Cloudflare does have dodgy availability, it cannot undermine how much of todays software architecture is built on them.


