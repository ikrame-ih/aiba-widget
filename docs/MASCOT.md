npm# Aiba Mascot

Aiba is a minimalist geisha figure: circular face, horizontal hair cap, round bun, long side hair, closed eyes, white kimono, and phase-colored identity details.

## Visual rules (dark default)

- 2D segmented SVG only
- Closed eyes by default; evening uses scaled eyelids without merging the beauty mark
- **Ceremonial Gold** (`#D69E59`) — kanzashi, cheek, accent details in afternoon
- **Verbena** / **Keystone** — morning/evening face tints (ambient, not loud UI colors)
- Kimono stays cool ivory `#FBFAF7`; hair ink `#171719`

## Behavior machine

Event-driven states: `idle`, `blink`, `glance`, `greet`, `focus`, `celebrate`, `sleep`, `static`.

- **Morning** — `bright`, gentle alert float
- **Afternoon** — `focused`, minimal motion (body doubling anchor)
- **Evening** — `drowsy` / `sleep`, fixed low anchor, no vertical roam

## Ensō progress

Focus sessions show an imperfect gold ring (Ensō) instead of a mechanical bar — time as gradual ink, not a slot machine.

## Ask Aiba

Offline contextual help beside Aiba. No history, no cloud.
