# Baseline audit

This document captures the original widget state before the Aiba redesign.

## Original stack

- Electron 35 with a single main process (`main.js`)
- Vanilla HTML/CSS/JS in one 1,190-line `index.html`
- Secondary windows for notes and help
- JSON persistence at `%APPDATA%/<app>/data.json`

## Features kept in spirit

- Always-on-top frameless desktop companion
- Automatic morning / afternoon / night rhythm
- Live clock and date
- Focus timer with break guidance
- Quick notes
- System tray
- Subtle sound feedback
- Companion personality

## Features removed

- Twitch shortcut
- YouTube / creator promo card
- Spotify / PowerShell integration
- Game IP pixel-art character assets
- Singing Easter egg audio loop
- Dead task and notification IPC channels

## Technical debt addressed

- Monolithic renderer split into ES modules
- Versioned local data schema with migration
- Debounced persistence
- Accessibility baseline (labels, focus, reduced motion)
- Vite build pipeline
- Unit tests for core logic
- English naming and copy throughout
