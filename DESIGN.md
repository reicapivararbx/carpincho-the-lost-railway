# CARPINCHO: The Lost Railway Design System

## 1. Atmosphere & Identity

CARPINCHO uses a field-ready railway HUD: a moss-dark canvas frame, parchment-like text, and worn brass interaction accents. Its signature is operational warmth rather than a generic mobile game overlay: controls should feel like compact brass fittings over the world, with a visible pressed state that confirms touch without obscuring gameplay.

## 2. Color

### Palette

| Role | Token | Value | Usage |
|---|---|---:|---|
| Surface / world | `--bg` | `#0f1f0a` | App and game backdrop |
| Surface / panel | `--panel` | `#1a2e12` | Panels and overlays |
| Text / primary | `--text` | `#fdf6e3` | HUD labels and controls |
| Accent / brass | `--gold` | `#d4a843` | Primary interaction, selection, focus |
| Surface / touch control | `--touch-surface` | `rgba(8, 18, 8, 0.82)` | Mobile control body |
| Surface / touch control active | `--touch-surface-active` | `rgba(39, 66, 23, 0.94)` | Pressed mobile control body |
| Border / touch control | `--touch-border` | `rgba(212, 168, 67, 0.62)` | Mobile control outline |
| Shadow / touch control | `--touch-shadow` | `rgba(0, 0, 0, 0.38)` | Control elevation over the canvas |

### Rules

- Brass is reserved for actionable, selected, or keyboard-focused UI.
- Touch controls use the same dark-green and brass palette as the HUD; they introduce no new brand color.
- Controls remain translucent enough to preserve world awareness while retaining legible contrast.

## 3. Typography

### Scale

| Level | Size | Weight | Line height | Usage |
|---|---:|---:|---:|---|
| HUD label | 0.75rem | 700 | 1.2 | Touch-control label and compact HUD text |
| HUD icon | 1.5rem | 700 | 1 | Directional glyphs |
| Body | 1rem | 400 | 1.5 | Standard app text |
| Caption | 0.625rem | 500 | 1.4 | Existing controls hint and metadata |

### Font Stack

- Primary: `'Segoe UI', system-ui, sans-serif`
- Mono: `monospace` for train instrumentation

### Rules

- Mobile control labels use `HUD label` with modest letter spacing for fast scanning.
- Directional glyphs are symbols rather than emoji; the interaction affordance uses the raised-index hand symbol (`☝️`).

## 4. Spacing & Layout

### Base Unit

All new touch-control spacing is based on 4px.

| Token | Value | Usage |
|---|---:|---|
| `--space-1` | 4px | Inner icon adjustment |
| `--space-2` | 8px | Direction-pad separation |
| `--space-3` | 12px | Small touch-control padding |
| `--space-4` | 16px | Outer control inset |
| `--space-5` | 20px | Touch-control cluster inset |
| `--space-14` | 56px | Minimum direction-button target |
| `--space-18` | 72px | Interaction-button target |

### Responsive Placement

- Desktop and hybrid fine-pointer devices hide the touch-control root and preserve keyboard prompts and controls.
- Touch-first devices place the directional pad in the lower-left safe area and the Interagir control in the lower-right safe area.
- The bottom inset reserves enough clearance for the existing hotbar and uses `env(safe-area-inset-*)` so iOS browser chrome and device cut-outs do not cover controls.
- The overlay does not receive events outside its buttons and never blocks the HUD, canvas, or hotbar.

## 5. Components

### Touch Direction Button

- **Structure**: semantic `button[data-touch-action]` with a directional text glyph.
- **Variants**: forward, back, left, right.
- **Spacing**: `--space-14` square target, `--space-2` pad spacing.
- **States**: default, active/pressed, keyboard focus-visible, disabled by hidden root on non-touch devices.
- **Accessibility**: Portuguese `aria-label`, native button semantics, minimum 56px target, visible focus ring.
- **Motion**: a 120ms transform/color transition confirms a press; reduced motion removes the scale transform.
- **Layout**: a fixed non-blocking HUD overlay; only buttons accept pointer events.

### Touch Interaction Button

- **Structure**: semantic `button[data-touch-interaction]` with a raised-index hand icon and `Interagir` label.
- **Variants**: default and active/pressed.
- **Spacing**: `--space-18` minimum target and `--space-2` icon-label separation.
- **States**: default, active/pressed, keyboard focus-visible, hidden on non-touch devices.
- **Accessibility**: Portuguese `aria-label`, decorative icon marked `aria-hidden`, native button semantics, minimum 72px target.
- **Motion**: a 120ms press scale and brass glow; reduced motion preserves color-state feedback without scaling.
- **Layout**: fixed lower-right safe area, above but clear of the hotbar.

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
|---|---:|---|---|
| Micro press | 120ms | `ease-out` | Direction and interaction button press/release |
| Focus state | 120ms | `ease-out` | Brass focus ring and glow |

- Pointer events drive direct game actions; controls never synthesize keyboard events.
- Press feedback uses only `transform`, color, opacity, and box shadow.
- Controls release held movement on pointer cancellation, lost capture, or game teardown.
- `prefers-reduced-motion: reduce` removes the press transform while keeping state feedback.

## 7. Depth & Surface

### Strategy

Mixed: translucent tonal shift, brass outlines, and one soft canvas-tinted shadow.

| Level | Value | Usage |
|---|---|---|
| Touch control | `0 8px 20px var(--touch-shadow)` | Lifted controls over the game canvas |
| Pressed control | `0 4px 10px var(--touch-shadow)` | Compressed tactile state |

The controls pair a dark translucent surface with a restrained brass outline so they read as part of the railway HUD rather than as generic floating UI.

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- Target WCAG 2.2 AA contrast where the canvas background allows; active and focus states add a brass outline and shadow for redundancy.
- Every touch action has a Portuguese accessible name, a native button role, and a target of at least 56px; Interagir is at least 72px.
- Keyboard controls and their configurable bindings remain intact on desktop.
- Touch prompts use plain language (`Toque em Interagir para …`) instead of mentioning unavailable keyboard keys.
- Reduced-motion users retain visible pressed and focus states without scale animation.
- Touch controls must be tested at 375px, 768px, and 1280px, including active, focus, cancellation, and safe-area placement.

### Accepted Debt

| Item | Location | Why accepted | Owner / Exit |
|---|---|---|---|
| Legacy HUD colors and spacing outside this feature are not yet tokenized | Existing CSS files | This change preserves the established presentation rather than expanding scope into a HUD redesign | Future HUD-system consolidation |
