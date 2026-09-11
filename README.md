# rv-cli
Welcome! This is rv-CLI, my personal browser-based terminal portfolio. The motivation behind this project is the desire to stretch my fingers on some code and just make something fun and memorable. I also want to see what's the fuss about ai agents since I never dabbled in using them too much incorporating into a web app. This is not my announcement that I'm becoming an AI engineer! 

# Software Design Documentation

## Requirements
There are two distinct actors/users that the app will be build around: Guest and Admin (me)

## User  Requirements 
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
1. The user shall be able to ask the AI agent questions about the developer by typing `ama <question>` or `ask <question`
2. The user shall see the AI's response stream into the terminal in real-time rather than waiting for the whole response to generate
3. The user shall be clearly notified via a terminal errorm essage if they exceed the rate limit for AI queries
4. The user shall be able to stop a streaming AI response midway by pressing `Ctrl+C` or `Esc`
5. The user shall be able to submit feedback if the AI provides incorrect information by typing `feedback <correction>`

## Tech Stack

### Frontend
**Svelte** - I may be a tried and true React developer but that cannot outweigh the fact that Svelte seems like a good fit for a terminal app thats highly interactive and state-heavy. the big tradeoff is a smaller developer ecosystem and the ability to leverage Vercel to its fullest.

### "Backend"
**Cloudflare Workers** - Since I'm already thinking of using Cloudflare agents, sticking to the cloudflare ecosystem will be nice. Although Cloudflare does have dodgy availability, it cannot undermine how much of todays software architecture is built on them.


