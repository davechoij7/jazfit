# JazFit Visual Style Guide

Extracted from three visual references: Jazmin's iPhone home screen, a floral/botanical mood board, and a four-panel pink aesthetic layout.

---

## Visual Mood

**Soft romantic warmth.** The aesthetic across all three references is muted dusty rose — never neon, never cold. It reads like golden-hour light filtering through pink curtains: warm, feminine, slightly vintage but not retro. The mood is aspirational without being unattainable. Flowers appear in every reference (tulips, stargazer lilies, roses) reinforcing an organic, living quality rather than a sterile tech feel. There's a strong preference for layered depth — frosted glass effects, blurred backgrounds, overlapping surfaces — that creates visual softness without flatness.

**Emotional register:** Gentle confidence. The Spanish affirmation on Jazmin's phone — "Eres suficiente, aquí, ahora y siempre" (You are enough, here, now, and always) — is the emotional north star. This app should feel encouraging, personal, and warm. Not drill-sergeant fitness energy. Not clinical tracking. A soft space that still gets the work done.

---

## Color Palette

### Primary — Dusty Rose
`#C4808E`
The dominant tone across all three references. Muted pink with a warm brown undertone. Use for: primary brand identity, header accents, active states, progress indicators, filled buttons.

### Secondary — Deep Burgundy Wine
`#7A3347`
Pulled from the deep tones in Image 1's icon tinting and Image 2's dark floral shadows. Rich and grounding. Use for: text on light backgrounds, secondary buttons, navigation active state, section headers.

### Accent — Soft Blush
`#F0C4CE`
The lighter pink that appears in card backgrounds, widgets, and UI surfaces across all references. Use for: card backgrounds, input field fills, tag/badge backgrounds, hover states, soft highlights.

### Accent Warm — Petal Pink
`#E8A0AD`
Midpoint between primary and blush. Visible in the gradient transitions across Image 3's panels. Use for: gradient endpoints, progress bar fills, selected states, subtle borders.

### Background — Cream Blush
`#FBF0F0`
A barely-pink off-white. The lightest tone that still reads warm. Use for: page background, modal overlays, negative space.

### Background — Rose Cloud
`#F3DDE0`
A step darker than cream blush. Visible as the surface color for stacked cards and content areas in Image 3. Use for: card backgrounds on cream, section dividers, alternate row color.

### Background — Deep Rose (Dark Mode Option)
`#1F1418`
If a dark mode is needed, this is the darkest tone that stays in the rose family rather than going neutral black. Extracted from Image 2's left-panel background. Use for: dark mode page background.

### Background — Dark Rose Card
`#2D1E24`
Dark mode card surface. Warmer than pure dark gray. Use for: dark mode cards, elevated surfaces.

### Neutral — Text Dark
`#2D1A20`
Near-black with a warm rose undertone. Use for: primary body text, headings on light backgrounds.

### Neutral — Text Medium
`#7A6068`
Warm mid-gray. Use for: secondary text, labels, placeholders, captions.

### Neutral — Text Light
`#B8A0A6`
Soft muted tone. Use for: disabled text, tertiary labels, timestamps.

### Neutral — Border/Divider
`#E5CBCF`
Subtle warm border. Use for: card borders, input outlines, dividers.

### Neutral — Olive Sage (Complementary)
`#A09878`
Present in Image 2's icon tinting. An unexpected earthy green-gold that pairs beautifully with the pink system. Use sparingly for: secondary badges, completed-state indicators, tags, data visualization contrast.

### State — Success
`#7EBF8E`
Muted sage green — warmer and softer than a standard green. Fits the palette without clashing. Use for: completed workouts, success toasts, positive metrics.

### State — Warning
`#D4A960`
Warm amber-gold. Use for: rest timer alerts, incomplete states, attention-needed indicators.

### State — Error
`#C75B5B`
A deeper rose-red that stays in the color family. Not a harsh pure red. Use for: validation errors, destructive actions, failed states.

---

## Typography

### Heading Font
**DM Serif Display** (Google Fonts) — or fallback **Playfair Display**
The references lean into elegant, slightly editorial serif energy. DM Serif Display is warm and readable at large sizes without feeling overly formal. It pairs well with the romantic floral mood.

Use for: page titles, section headers, the app name, motivational/display text.

### Body Font
**DM Sans** (Google Fonts) — or fallback system `-apple-system, BlinkMacSystemFont, sans-serif`
Clean geometric sans-serif that shares the DM family with the heading font for natural pairing. Highly legible on mobile, available in a full weight range.

Use for: body text, labels, buttons, inputs, navigation, all functional UI text.

### Type Scale

| Role | Size | Weight | Line Height | Font |
|---|---|---|---|---|
| Display / Hero | 32px | 400 | 1.2 | DM Serif Display |
| Page Title | 24px | 400 | 1.3 | DM Serif Display |
| Section Header | 18px | 600 | 1.4 | DM Sans |
| Body | 16px | 400 | 1.5 | DM Sans |
| Body Small | 14px | 400 | 1.5 | DM Sans |
| Caption / Label | 12px | 500 | 1.4 | DM Sans |
| Button | 16px | 600 | 1.0 | DM Sans |
| Input | 16px | 400 | 1.5 | DM Sans |

### Text Treatments
- Headings: normal case (not uppercase). Sentence case for section headers.
- Buttons: sentence case, never all-caps.
- Letter spacing: `0` for body, `0.01em` for captions, `-0.02em` for display headings.
- No underlines for links — use color change + subtle weight shift.

---

## UI Surfaces & Components

### Cards
- **Background:** `#F3DDE0` (Rose Cloud) on `#FBF0F0` (Cream Blush) page bg — or `#F0C4CE` (Soft Blush) for emphasis cards
- **Border radius:** `16px` — consistently rounded, matching the soft aesthetic in all three references
- **Border:** `1px solid #E5CBCF` or no border with subtle shadow
- **Shadow:** `0 2px 12px rgba(122, 51, 71, 0.06)` — barely visible, warm-tinted
- **No hard drop shadows.** Everything should feel like it floats gently, not like it's punched out.

### Glassmorphism (Feature Surfaces)
All three references use frosted-glass effects on widgets. Apply this to elevated or overlapping surfaces:
- `background: rgba(240, 196, 206, 0.55)`
- `backdrop-filter: blur(20px)`
- `border: 1px solid rgba(255, 255, 255, 0.25)`
- `border-radius: 20px`
Use for: active workout overlay, modal sheets, floating rest timer, bottom navigation.

### Buttons

**Primary CTA:**
- Fill: `#C4808E` (Dusty Rose)
- Text: `#FFFFFF`
- Border radius: `12px`
- Min height: `48px`
- Hover/press: `#B06E7C` (10% darker)
- No border, no shadow

**Secondary:**
- Fill: `#F0C4CE` (Soft Blush)
- Text: `#7A3347` (Deep Burgundy)
- Border radius: `12px`
- Min height: `48px`

**Ghost / Tertiary:**
- Fill: transparent
- Text: `#C4808E`
- Border: `1px solid #E5CBCF`
- Border radius: `12px`

**Destructive:**
- Fill: `#C75B5B`
- Text: `#FFFFFF`

### Input Fields
- Background: `#FBF0F0` or `#FFFFFF`
- Border: `1px solid #E5CBCF`
- Border radius: `12px`
- Focus border: `#C4808E`
- Focus ring: `0 0 0 3px rgba(196, 128, 142, 0.2)`
- Placeholder color: `#B8A0A6`
- Min height: `48px`
- Font size: `16px` (prevents iOS zoom on focus)

### Icons
- Style: **Line icons**, 1.5px stroke weight
- Source: Lucide or Phosphor (both available in this weight)
- Color follows text hierarchy: `#2D1A20` for primary, `#7A6068` for secondary
- Active/accent state: `#C4808E`
- Size: 24px default, 20px in dense contexts

### Images & Photos
- Border radius: `16px` — matching card radius
- Photos may use a subtle warm overlay: `linear-gradient(to bottom, rgba(196, 128, 142, 0.05), rgba(196, 128, 142, 0.15))`
- No hard rectangular images. Everything should feel softened.
- Hero/feature images can go full-bleed behind frosted-glass content overlays (as seen in Image 2 and Image 3's lock screens)

### Bottom Navigation
- Background: frosted glass (see glassmorphism spec above)
- Active icon: `#C4808E` with subtle filled variant
- Inactive icon: `#B8A0A6`
- Active indicator: small pill shape below icon, `#C4808E`, `border-radius: 100px`

---

## Gradients

Two gradients appear consistently across the references:

**Rose Gradient (backgrounds, section fills):**
`linear-gradient(180deg, #FBF0F0 0%, #F0C4CE 100%)`

**Warm Glass (overlay surfaces):**
`linear-gradient(135deg, rgba(240, 196, 206, 0.4) 0%, rgba(196, 128, 142, 0.2) 100%)`

---

## Do / Don't

**Do** use soft pink-to-cream gradients for background depth — the references consistently layer warm tones rather than using flat single-color backgrounds.

**Don't** use saturated or neon pinks. The palette is always muted, dusty, and warm. If a pink looks like it belongs on a highlighter, it's wrong.

**Do** use frosted-glass effects on overlapping surfaces — every reference uses translucent layering as a primary visual technique.

**Don't** use hard black shadows or sharp geometric elements. No sharp 90-degree corners, no heavy box-shadows, no pure black (`#000000`) anywhere in the UI.

**Do** incorporate organic/floral imagery when appropriate (onboarding, empty states, backgrounds). The references are full of flowers — this aesthetic embraces nature.

**Don't** use cold grays or blue-tinted neutrals. Every neutral in this system has a warm rose undertone. Even the darkest text color `#2D1A20` leans warm.

**Do** keep typography elegant — serif headings paired with clean sans-serif body text. The references favor editorial warmth, not tech minimalism.

**Don't** use uppercase text, aggressive font weights (800+), or clinical sans-serif-only typography. This isn't a CrossFit app.

---

## Recurring Motifs

- **Flowers:** Tulips, lilies, roses — used as wallpapers, widget imagery, and decorative elements. Consider subtle floral patterns for empty states or onboarding screens.
- **Affirmations:** Jazmin's phone includes positive affirmation text ("Eres suficiente"). Motivational/encouraging micro-copy should feel warm and personal, not generic or preachy.
- **Layered depth:** Surfaces stacked at varying opacity levels. Nothing sits flat — there's always a sense of gentle layering.
- **Rounded everything:** `16px` base radius on cards and images, `12px` on buttons and inputs, `20px` on full-width sheets and modals. No sharp corners anywhere.
- **Warm metallic hints:** Image 2 shows olive/gold tones — consider using `#A09878` sparingly for completed states or achievement badges (like a soft gold medal).

---

## Dark Mode Guidance

The current JazFit implementation uses `#111111` backgrounds with `#FF6B6B` coral accents. This is a **full aesthetic departure** from the reference direction. If dark mode is desired:

- Replace `#111111` with `#1F1418` (Deep Rose) — retains warmth
- Replace `#1e1e1e` cards with `#2D1E24` (Dark Rose Card)
- Replace `#FF6B6B` accent with `#C4808E` (Dusty Rose) — the coral is too saturated and too orange for this palette
- Replace `#f5f5f5` text with `#F3DDE0` (Rose Cloud) — softer than pure white
- Replace `#333333` borders with `#3D2A30` — warm dark border

However, the overwhelming direction from these references is **light mode**. All three references feature light/blush backgrounds. Recommend making light mode the default, with dark mode as an option that uses the rose-tinted dark values above.

---

## Migration Notes (Current → New)

| Current Token | Current Value | New Value | New Name |
|---|---|---|---|
| `--color-bg-primary` | `#111111` | `#FBF0F0` | Cream Blush |
| `--color-bg-card` | `#1e1e1e` | `#F3DDE0` | Rose Cloud |
| `--color-bg-elevated` | `#2a2a2a` | `#FFFFFF` | White |
| `--color-accent` | `#FF6B6B` | `#C4808E` | Dusty Rose |
| `--color-accent-bright` | `#FF8585` | `#E8A0AD` | Petal Pink |
| `--color-accent-muted` | `#CC5555` | `#7A3347` | Deep Burgundy |
| `--color-text-primary` | `#f5f5f5` | `#2D1A20` | Text Dark |
| `--color-text-muted` | `#a3a3a3` | `#7A6068` | Text Medium |
| `--color-text-dim` | `#666666` | `#B8A0A6` | Text Light |
| `--color-border` | `#333333` | `#E5CBCF` | Border Rose |
| `--color-success` | `#4ADE80` | `#7EBF8E` | Success Sage |
| `--color-warning` | `#FBBF24` | `#D4A960` | Warning Amber |

---

## Quick Reference — Copy-Paste Tokens

```css
--color-primary: #C4808E;
--color-secondary: #7A3347;
--color-accent: #F0C4CE;
--color-accent-warm: #E8A0AD;
--color-bg-page: #FBF0F0;
--color-bg-card: #F3DDE0;
--color-bg-elevated: #FFFFFF;
--color-text-primary: #2D1A20;
--color-text-secondary: #7A6068;
--color-text-tertiary: #B8A0A6;
--color-border: #E5CBCF;
--color-sage: #A09878;
--color-success: #7EBF8E;
--color-warning: #D4A960;
--color-error: #C75B5B;
--color-glass-bg: rgba(240, 196, 206, 0.55);
--color-glass-border: rgba(255, 255, 255, 0.25);
--radius-card: 16px;
--radius-button: 12px;
--radius-sheet: 20px;
--radius-pill: 100px;
--shadow-card: 0 2px 12px rgba(122, 51, 71, 0.06);
--font-display: 'DM Serif Display', Georgia, serif;
--font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
```
