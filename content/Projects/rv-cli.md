---
description: The Site You are standing in
date: 2026-09-20
---

# rv-cli

The Terminal You are reading this in.

**What It is.** A SvelteKit App wrapped around xterm.js, deployed as a single
Cloudflare Worker that serves both the Frontend and the `/api` Routes. The
Filesystem You are browsing is generated at Build time from a Folder of Markdown
Files, so adding a Blog Post means pushing a `.md` and nothing else.

**The Agent.** `ama <Question>` calls Workers AI and streams the Answer back
through the same Writer Interface that `ls` uses. It has no Tools, no Secrets in
its Prompt, and every Byte It returns gets stripped of Escape Codes before It
touches the Screen. If someone injects It, the worst They get is a rude Sentence.

**What I would change.** The Mobile Fallback drops the Terminal Metaphor
entirely, which I still feel slightly guilty about. Tab Completion is not wired
up. Both are on the List.

Source: [github.com/Leung-Arvin/rv-cli](https://github.com/Leung-Arvin/rv-cli)
