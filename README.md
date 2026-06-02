# Kortex — Landing Page

The AI growth command center for e-commerce and app marketers.

Rebuilt as a Vite + React + TypeScript + Tailwind + shadcn/ui stack, with
distinctive components ported and rethemed from a React reference repo
(VexosWebsite) — recolored from a generic dark-AI-purple palette to Kortex's
own **acid-lime-on-ink** signature.

## Stack

- **Vite 5** + **React 18** + **TypeScript**
- **Tailwind CSS** with custom Kortex tokens (ink / acid / cream / ash)
- **shadcn/ui** primitives (button, card, badge, carousel)
- **framer-motion** for headline rotation, nav cursor and beam gradients
- **three.js** for the hero shader aurora (lime-tinted)
- **embla-carousel-react** for the agents carousel
- **lucide-react** icons (no emoji)

## Design direction

- **Aesthetic**: operator's terminal × editorial spread
- **Type**: Instrument Serif (italic display) · Satoshi (UI sans) · JetBrains Mono (data, eyebrows)
- **Palette**: ink `hsl(0 0% 3.5%)`, acid `hsl(75 100% 60%)`, cream `hsl(44 33% 92%)`
- **Motion**: scroll-revealed sections, animated beam, looping shader, all honoring `prefers-reduced-motion`

## Sections

1. **Hero** — rotating headline, shader background, 3-step Connect/Ask/Approve strip
2. **Connections** — sources list + Kortex Cortex SVG hub
3. **Agents** — auto-cycling carousel of 8 specialist agents
4. **Live Example** — terminal-style chat + 4-card approval queue
5. **System Bento** — 6 differentiators in an asymmetric grid
6. **Operator Metrics** — 4 animated counters
7. **Logo Marquee** — connected systems
8. **Pull Quote** — large editorial testimonial
9. **CTA** — animated beam converging on the K cortex + request access

## Scripts

```bash
npm install      # install deps
npm run dev      # vite dev server (http://localhost:3010)
npm run build    # production build → dist/
npm run preview  # preview the prod build
```

## Deployment

`vercel.json` ships with the Vite framework preset and a SPA rewrite, so the
default Vercel detection works out of the box.
