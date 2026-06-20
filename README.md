# SocoX Website Builder

A professional, browser-based drag-and-drop website builder. Build complete, responsive, multi-page websites visually — no coding required. Export production-ready HTML/CSS/JS as a ZIP and deploy anywhere.

**Zero dependencies. No backend. No build tools. Pure vanilla JavaScript.**

---

## What Is This?

SocoX Builder is a visual website editor that runs entirely in your browser. You drag components onto a canvas, customize them with a properties panel, preview your site in real-time, and export a fully functional website as a downloadable ZIP file.

It's designed for:
- Freelancers building client sites fast
- Small businesses creating their own web presence
- Developers prototyping layouts visually
- Educators teaching web design concepts
- Anyone who wants a website without writing code

---

## Features

### Visual Editor
- **Drag-and-drop canvas** — drag components from the left palette onto the canvas
- **Real-time preview** — see exactly what your site looks like as you build
- **Responsive device modes** — switch between Desktop, Tablet, and Mobile views
- **Structure view** — toggle visual outlines to see element boundaries
- **Right-click context menu** — move, duplicate, or delete blocks quickly
- **Keyboard shortcuts** — Ctrl+Z undo, Ctrl+Y redo, Delete to remove, Ctrl+D to duplicate, Arrow keys to reorder

### Components (Block Types)
- **Navbar** — responsive navigation with hamburger menu, multiple styles (Classic, Editorial, App), sticky/fixed positioning, cart icon, APK install button
- **Hero / Header** — full-screen hero sections with CTAs, background images, customizable typography
- **About Section** — split layout with image, feature checklist, badge
- **Services** — grid cards with icons, configurable columns
- **Contact** — contact forms and info sections
- **Testimonials** — customer review cards
- **Pricing** — pricing table with plan comparison
- **Stats** — animated counter sections
- **CTA (Call to Action)** — conversion-focused sections (centered, split, card layouts)
- **Footer** — multi-column footers with social links
- **Image** — single or multi-image galleries with captions, ratings, lightbox
- **Video** — YouTube, Vimeo, Dailymotion, TikTok, Facebook, Google Drive, direct MP4 embeds
- **Video Carousel** — scrollable video galleries
- **Promo Carousel** — image/content sliders
- **Text** — rich text blocks with multi-column grid support
- **Container** — flexbox layout wrapper for nesting blocks
- **Box** — inner content card for grid/flex compositions
- **Divider** — horizontal rule with customizable style
- **Button** — standalone CTA buttons with link or cart actions
- **Accordion** — collapsible FAQ/content sections
- **Products** — e-commerce product grids
- **Roadmap** — timeline/milestone displays

### Multi-Page Support
- Create unlimited pages
- Switch between pages with the bottom tab bar
- Rename and delete pages
- Clone existing pages (duplicate all content)
- Internal page navigation works in preview
- Each page exports as a separate HTML file

### Theme System
- **24 built-in themes** across 3 categories:
  - Solid (8 themes) — clean single-color palettes
  - Gradient (8 themes) — modern gradient backgrounds
  - Blob (8 themes) — organic radial gradient effects
- One-click theme application to entire project
- Themes update all blocks: backgrounds, text colors, accents, cards, borders
- Clear theme to revert to manual colors

### E-Commerce (Cart System)
- Add-to-cart buttons on any block
- Slide-out cart drawer with quantity controls
- Promo code input field
- WhatsApp checkout — sends order summary to your WhatsApp number
- Telegram checkout — sends order summary to your Telegram
- Cart persists across page refreshes
- Cart badge on navbar

### Import / Export
- **Export as ZIP** — complete website with:
  - HTML files (one per page)
  - CSS (responsive, production-ready)
  - JavaScript (animations, cart, media controls)
  - PWA manifest + service worker + icons
  - Sitemap.xml
  - Robots.txt
  - project.json (for re-importing later)
- **Import from ZIP** — restore a previously exported project
- **Import from folder** — upload a website folder
- **Import raw HTML** — paste or upload HTML files
- **Import JSON** — paste project.json data directly

### Undo / Redo
- 50-step undo history
- Debounced history (typing doesn't flood the stack)
- Ctrl+Z / Ctrl+Y keyboard shortcuts
- History survives page refresh (localStorage)

### Responsive Design
- All exported sites are mobile-responsive
- Navbar collapses to hamburger menu on mobile
- Grid layouts adapt to screen size
- Preview modal with resizable viewport
- Device-specific visibility controls (APK button show/hide per device)

### Scroll Animations
- Built-in animation presets: fade-up, fade-in, zoom-in, slide-right
- Configurable duration and delay
- Trigger on scroll (IntersectionObserver) or on page load
- Animations work in both editor preview and exported sites

### Site Settings (SEO)
- Page title and meta description
- Keywords
- Favicon URL
- Custom head scripts (analytics, tracking)
- Google Fonts URL
- Website URL (for canonical links and Open Graph)
- Robots.txt content
- Open Graph / Twitter Card meta tags in export

### PWA Support (Exported Sites)
- Auto-generated manifest.json
- Service worker with offline caching
- App icons (192px and 512px, auto-generated from theme colors)
- "Install as App" prompt for mobile users
- Apple touch icon support

### Sub-Element Editing (Structure View)
- Click into any element within a block to style it individually
- Pen tool for fine-grained control over nested elements
- Add/remove/reorder dynamic child elements
- Move elements between blocks via drag-and-drop
- Per-element style overrides (color, font, spacing, visibility)

### Media Controls
- Only one video/audio plays at a time (auto-pause others)
- YouTube API integration for pause control
- Vimeo API integration
- Google Drive video embed support
- Direct video file playback (MP4, WebM, OGG)

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  UI Layer                     │
│  canvas.js │ palette.js │ properties.js      │
│  pages.js  │ app.js                          │
├─────────────────────────────────────────────┤
│              Command Layer                    │
│  commands.js (execute, validate, log)        │
├─────────────────────────────────────────────┤
│              State Store                      │
│  state.js (blocks, pages, meta, history)     │
├─────────────────────────────────────────────┤
│           Render Scheduler                    │
│  renderer.js (RAF batching, dirty tracking)  │
├─────────────────────────────────────────────┤
│         Block Definitions                     │
│  blocks.js │ registry.js                     │
├─────────────────────────────────────────────┤
│           Domain Modules                      │
│  themes.js │ cart.js │ export.js             │
└─────────────────────────────────────────────┘
```

### Module Responsibilities

| Module | Role |
|--------|------|
| `state.js` | Global state store, undo/redo history, localStorage persistence, schema versioning, data validation |
| `renderer.js` | requestAnimationFrame-based render scheduler, dirty block tracking, transaction batching, performance instrumentation |
| `commands.js` | Command pattern for state mutations, validation, execution logging, extensible command registry |
| `registry.js` | Block type registry, dev assertions, state integrity checks, render purity validation |
| `blocks.js` | Block type definitions (render functions, default props, categories) |
| `canvas.js` | Canvas rendering, drag-and-drop, resize handles, event delegation, incremental DOM reconciliation |
| `palette.js` | Left sidebar component list, search, variant previews |
| `properties.js` | Right sidebar property editor, tabs (Design/Content/Advanced) |
| `pages.js` | Multi-page tab bar UI |
| `themes.js` | Theme definitions and application logic |
| `cart.js` | Shopping cart drawer, WhatsApp/Telegram checkout |
| `export.js` | ZIP generation, HTML/CSS output, PWA assets, sitemap |
| `app.js` | Module initialization, global event wiring, keyboard shortcuts |

---

## Technical Highlights

- **No framework** — pure vanilla JavaScript, no React/Vue/Svelte
- **No build step** — open index.html in a browser and it works
- **No backend** — everything runs client-side
- **Static deployable** — host on GitHub Pages, Netlify, Vercel, any static host
- **Schema versioned** — project files include version for forward compatibility
- **Collision-resistant IDs** — timestamp + random + counter based generation
- **XSS protected** — all user input is HTML-escaped before rendering
- **Script sandboxed** — only known-safe builder scripts execute in the editor
- **Incremental rendering** — only dirty blocks re-render, not the entire canvas
- **Focus preservation** — typing in properties doesn't lose cursor position
- **Debounced history** — rapid edits coalesce into single undo steps
- **Deep clone safety** — block props are deep-cloned on creation to prevent shared references
- **Import validation** — imported projects are validated, deduplicated, and sanitized
- **Circular reference detection** — parent chains are checked for cycles
- **Orphan cleanup** — blocks with invalid parents are auto-repaired

---

## Getting Started

1. Open `index.html` in any modern browser
2. Drag components from the left panel onto the canvas
3. Click any block to edit its properties in the right panel
4. Use the top bar for undo/redo, preview, themes, and export
5. Click "Export ZIP" to download your complete website

No installation. No npm. No terminal. Just open and build.

---

## Deployment

The exported ZIP contains a complete static website. Deploy it to:

- **GitHub Pages** — push to a repo, enable Pages
- **Netlify** — drag the ZIP into the Netlify dashboard
- **Vercel** — import the folder
- **Any web host** — upload via FTP/SFTP
- **Firebase Hosting** — `firebase deploy`
- **Cloudflare Pages** — connect your repo

The exported site includes:
- Responsive CSS
- PWA manifest and service worker
- SEO meta tags
- Sitemap.xml
- All assets referenced by URL (images, fonts, icons via CDN)

---

## Developer Mode

Enable debug mode in the browser console:

```javascript
window.SOCOX_DEBUG = true;
```

This activates:
- Render performance logging (duration, frame drops)
- Command execution logging
- State integrity assertions
- DOM synchronization checks
- Render purity validation

Useful commands:
```javascript
RenderScheduler.getStats()          // Render performance metrics
Commands.getLog()                   // Command execution history
Commands.listCommands()             // All available commands
DevAssertions.checkStateIntegrity() // Full state validation
DevAssertions.checkDomSync()        // DOM vs state sync check
BlockRegistry.getAll()              // All registered block types
```

---

## What You Can Build

- Landing pages
- Portfolio websites
- Business websites
- Product launch pages
- Event pages
- Restaurant menus
- Personal blogs (static)
- E-commerce storefronts (with WhatsApp/Telegram checkout)
- Documentation sites
- Coming soon pages
- Link-in-bio pages
- Agency websites
- SaaS marketing pages
- App download pages
- Wedding/invitation sites

---

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

---

## License

See repository for license details.
