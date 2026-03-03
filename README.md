# Discord Bot + Web Dashboard

A Discord bot built with **discord.js v14** plus a **Next.js web dashboard** for managing settings via Discord OAuth.

## What’s included

- **Bot (discord.js)**
  - Slash command system (auto-loads commands from `/commands`)
  - Economy commands (balance, daily, shop, work, etc.)
  - Moderation commands (ban/kick/timeout/warn, purge, modlog channel)
  - Ticket system (setup, panel, add/remove, close)
  - Leveling commands (rank, leaderboard, set level channel)
  - Per-guild JSON data stored in `/data`

- **Web dashboard (Next.js)**
  - Discord OAuth login
  - Reads your guild list & links to invite flow

## Requirements

- **Node.js 18+** (discord.js v14 needs Node 18 or newer)
- A Discord Application (Bot + OAuth2)

## Project structure

- `index.js` — bot entry
- `commands/` — slash commands (grouped by category folders)
- `handlers/` — command loader + registration helpers
- `tickets/` — ticket components & logic
- `lib/` — config helpers
- `data/` — JSON storage (economy/levels/tickets/settings per guild)
- `web/` — Next.js dashboard

## Setup

### 1) Install dependencies

```bash
npm install