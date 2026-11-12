---
name: Institutional Trust
colors:
  surface: '#e5fff7'
  surface-dim: '#c5e0d8'
  surface-bright: '#e5fff7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#dff9f1'
  surface-container: '#d9f4ec'
  surface-container-high: '#d3eee6'
  surface-container-highest: '#cee8e0'
  on-surface: '#071f1b'
  on-surface-variant: '#3e4947'
  inverse-surface: '#1d3530'
  inverse-on-surface: '#dcf7ef'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#1a6962'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#29746d'
  on-primary-container: '#aff8ee'
  inverse-primary: '#8cd4ca'
  secondary: '#216963'
  on-secondary: '#ffffff'
  secondary-container: '#a8ece4'
  on-secondary-container: '#266d67'
  tertiary: '#025e39'
  on-tertiary: '#ffffff'
  tertiary-container: '#29774f'
  on-tertiary-container: '#adfcca'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a7f0e6'
  primary-fixed-dim: '#8cd4ca'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#abefe7'
  secondary-fixed-dim: '#8fd3cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504b'
  tertiary-fixed: '#a5f4c3'
  tertiary-fixed-dim: '#89d7a8'
  on-tertiary-fixed: '#002111'
  on-tertiary-fixed-variant: '#005231'
  background: '#e5fff7'
  on-background: '#071f1b'
  surface-variant: '#cee8e0'
typography:
  display-page-title:
    fontFamily: IBM Plex Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-section:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-default:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-medium:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  body-semibold:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  caption-meta:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  caption-meta-medium:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-micro:
    fontFamily: IBM Plex Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
---

## Brand & Style

This design system establishes an institutional, calm, and highly structured environment engineered for multi-party recruitment marketplaces and enterprise HR operations. Balancing enterprise data governance, financial escrow, and sensitive candidate personal information requires a design language of absolute clarity, deliberate rhythm, and unshakeable stability.

The aesthetic follows an understated Modern Corporate direction:
- **Tone:** Authoritative, discreet, objective, and meticulously organized.
- **Atmosphere:** Distraction-free workspaces utilizing cool-tinted neutrals, deep spruce accents, and crisp structural delineations rather than decorative embellishments.
- **Principles:** High information density without visual crowding, tabular precision for numeric and contractual values, and immediate state recognition across complex transactional workflows.

## Colors

The color palette centers on disciplined spruce teals paired with cool, slate-tinted neutrals. Backgrounds avoid stark pure whites in favor of balanced pale tones that alleviate eye strain during intensive operational shifts.

### Canvas & Surface Hierarchy
- **Canvas Background (`#F4F7F6`):** The grounding shade for shell scaffolding, content wells, and outer layout containers.
- **Surface (`#FFFFFF`):** High-priority operational work areas, active forms, data tables, and cards.
- **Subsurface / Secondary Fill (`#F7FAF9`):** Inset table headers, filter drawers, muted sidebars, and grouped panel sections.
- **Border / Structural Dividers (`#DDE7E3`):** 1px structural lines for row separation, container containment, and table headers.

### Primary Accents
- **Primary Base (`#0F766E`):** Core action buttons, selected navigation items, interactive links, and focus rings.
- **Primary Strong / Hover (`#115E59`):** Interaction state for buttons, active state indicators, and deep emphasized elements.
- **Primary Soft (`#E6F2EF`):** Tonal badge fills, active row highlights, and multi-select pill backgrounds.

### Typography & Content Color
- **Text Primary (`#12201C`):** High-contrast, deeply saturated near-black with teal undertones for titles, primary data fields, and critical metrics.
- **Text Secondary (`#4E6660`):** Balanced mid-tone for descriptive labels, secondary table columns, and form placeholders.
- **Text Tertiary (`#809691`):** Subdued tone for timestamps, disabled states, unselected icons, and metadata captions.

### System Top Bar
- **Top Bar Canvas (`#12201C`):** High-density visual anchor spanning the global header.
- **Top Bar Border (`#2E443E`):** Subtle separation hairline dividing global controls.
- **Top Bar Muted (`#9DB3AC`):** Secondary controls, icons, and contextual breadcrumbs within the global header.
- **Top Bar Text (`#E4EEEA`):** High-legibility light text for workspace and profile labels.

### Status & Verification States
- **Success (`#1E6E47`, Background `#E5F3EB`):** Completed payouts, cleared background checks, verified placements.
- **Warning / Escrow Attention (`#9A5B08`, Background `#FCF1DC`):** Money reservation pending, expiring offers, missing compliance paperwork.
- **Info (`#0F766E`, Background `#E6F2EF`):** General system notifications, candidate stage changes, neutral updates.
- **Neutral (`#4E6660`, Background `#EDF4F1`):** Archived candidates, draft contracts, closed vacancies.

## Typography

Typography is governed exclusively by **IBM Plex Sans** to convey technical discipline, neutral legibility, and architectural structure.

### Numerical & Tabular Data
All numeric fields—including currency values, salary bands, transaction hashes, timestamps, and stage counts—must be rendered with tabular numerals enabled (`font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1`). This ensures clean vertical alignment across high-density recruitment rosters and financial ledgers.

### Hierarchy Guidelines
- **Page Title (`22px / 600`):** Reserved for primary workspace views (e.g., "Active Requisitions", "Candidate Pipeline", "Billing Ledger").
- **Section Title (`16px / 600`):** Used on drawer headers, panel section blocks, card headers, and table segment separators.
- **Body (`14px / 400 & 500`):** The primary reading weight across lists, chat transcripts, form field inputs, and contract terms.
- **Caption / Meta (`12px / 400 & 500`):** Used for auxiliary candidate metadata (e.g., location, experience length, timestamp of last touchpoint).
- **Micro Label (`11px / 600 / uppercase / 0.08em tracking`):** Strictly used for field category labels, table column headers, verification status tags, and contract stage chips.

## Layout & Spacing

The layout is built for complex, multi-pane workflows requiring simultaneous candidate evaluation, resume viewing, and contract verification without frequent context switching.

### Desktop Three-Pane Architecture
- **Global Header Bar:** Fixed `56px` height spanning 100% viewport width in deep slate-green (`#12201C`).
- **Primary Navigation Pane:** Fixed `232px` width; houses workspace switching, search entry, and core operational directories.
- **List / Queue Column:** Fixed `380px` width; scrollable feed of incoming candidates, job requisitions, or billing records.
- **Detail Workspace:** Flexible `1fr` width; contextual detail card, resume inspector, contract negotiation split-pane, or audit log.

### Responsive Breakpoints & Reflow
- **Desktop (>= 1280px):** Full 3-pane layout visible simultaneously.
- **Tablet / Small Desktop (768px - 1279px):** Primary navigation collapses to an icon rail (`56px`) or slide-over drawer; list column (`320px`) and detail pane occupy the remaining viewport.
- **Mobile (< 768px):** Single-column stacked mode. List view transitions to detail view via full-screen view transitions, with back navigation anchored in the header.

## Elevation & Depth

Visual hierarchy is primarily communicated through structural 1px borders (`#DDE7E3`) and tinted tonal layers (`#F7FAF9` against `#FFFFFF`), rather than heavy drop shadows. This preserves a flat, institutional feel and prevents visual fatigue in data-dense matrices.

### Elevation Levels
- **Level 0 (Flat Ground):** Canvas background (`#F4F7F6`). Borders mark divisions without shadow.
- **Level 1 (Card & Panel Surface):** Surface white (`#FFFFFF`) with 1px border in `#DDE7E3`. Zero box-shadow under normal state.
- **Level 2 (Dropdown & Context Menus):** Surface white (`#FFFFFF`) bound by `#DDE7E3` with an ultra-subtle ambient shadow: `0 4px 12px rgba(18, 32, 28, 0.05)`.
- **Level 3 (Modal Dialogs & Overlays):** Used for money reservation confirmations, offer approvals, and candidate rejection dialogues: `0 4px 16px rgba(18, 32, 28, 0.08)`. Backdrops feature a solid 40% opacity dim (`rgba(18, 32, 28, 0.40)`) with zero backdrop-filter blur to preserve crisp rendering.

## Shapes

The design uses a controlled, disciplined geometry with a baseline soft radius (`roundedness: 1`), balancing human approachability with enterprise restraint.

### Radius Scale
- **Interactive Controls (Inputs, Buttons, Dropdowns):** `6px` radius (`0.375rem`).
- **Cards, Modals & Structural Panels:** `8px` radius (`0.5rem`).
- **Status Badges, Chips & Meta Tags:** `4px` radius (`0.25rem`).
- **Avatars, Circular Action Badges & Metric Pills:** `9999px` full pill radius.

## Components

### Buttons
- **Primary:** Solid `#0F766E` background with `#FFFFFF` text. Hover: `#115E59`. Active: `#0D4F4A`. Height: `36px` (compact), `40px` (default). Padding: `0 14px`. Radius: `6px`. Font: `14px / 500`.
- **Secondary:** Surface `#FFFFFF` with 1px border `#DDE7E3`, text `#12201C`. Hover: `#F7FAF9` with border `#C3D4CF`.
- **Tertiary / Ghost:** Transparent background, text `#4E6660`. Hover: `#E6F2EF` with text `#0F766E`.
- **Destructive:** Background `#FFFFFF` with 1px border `#FCA5A5`, text `#DC2626`. Hover: `#FEF2F2`.

### Input Fields & Selects
- Height: `38px`. Radius: `6px`. Border: 1px `#DDE7E3`. Background: `#FFFFFF`. Typography: `14px / 400` with `#12201C`.
- **Placeholder:** `#809691`.
- **Focus State:** 1px border `#0F766E` with a 2px outer ring in `rgba(15, 118, 110, 0.15)`.
- **Error State:** 1px border `#DC2626` with red assist text below (`12px / 400`).

### Checkboxes & Radio Buttons
- Box size: `16px × 16px`. Radius: `3px` (checkbox) or `9999px` (radio).
- **Default:** Border 1px `#DDE7E3`, background `#FFFFFF`.
- **Checked:** Background `#0F766E`, border `#0F766E`, with white glyph.

### Status Chips & Badges
- Height: `22px`. Padding: `0 8px`. Radius: `4px`. Font: `11px / 600` uppercase with `0.08em` tracking.
- **Success:** Text `#1E6E47`, Background `#E5F3EB`.
- **Attention / Pending:** Text `#9A5B08`, Background `#FCF1DC`.
- **Information / Active:** Text `#0F766E`, Background `#E6F2EF`.
- **Neutral:** Text `#4E6660`, Background `#EDF4F1`.

### Data Cards & Split Workspace Panels
- Background: `#FFFFFF`. Border: 1px `#DDE7E3`. Radius: `8px`. Padding: `16px` or `20px`.
- Card headers utilize `#F7FAF9` subsurface styling when housing batch tools or secondary filter actions.
- Selected list card state: `#F7FAF9` fill with a `3px` solid `#0F766E` left-edge indicator bar.

### Escrow & Money Reservation Banners
- Encapsulated alert box with `6px` radius, 1px border `#F59E0B`, and tinted background `#FCF1DC`.
- Includes a lock icon, clear currency values in tabular font (`14px / 600`), and a direct link to the escrow verification ledger.

## 6. Layout Shell (Global Application Skeleton)

To ensure absolute pixel-perfect consistency across all generated screens, EVERY page MUST be wrapped in this Layout Shell. Do NOT alter the dimensions, colors, or structure of these global elements.

### 6.1. Top Bar (Global Header)
- **Height:** Strictly `56px`. Fixed to top.
- **Background:** `#12201C`.
- **Structure (Left to Right):**
  1. **Logo Area:** `32x32px` square with white "КТ" text + "КадрыТут" (`16px / 600`, color `#E4EEEA`) + a gray badge "PLATFORM" (`11px / 600`, uppercase).
  2. **Global Search:** Max-width `520px`, background `#1D302B`, border `#2E443E`, search icon, placeholder text.
  3. **Right Area:** Bell icon with a yellow badge (e.g., "3"). User Profile block: Name (`14px / 500`), Role (`12px / 400`, color `#9DB3AC`), and a circular `34x34px` Avatar (bg `#0F766E`) with initials.

### 6.2. Sidebar (Primary Navigation)
- **Width:** Strictly `232px`. Background `#FFFFFF`, border-right `1px solid #DDE7E3`.
- **Structure:**
  1. Top: Role micro-label (e.g., "CUSTOMER") color `#809691`.
  2. Primary Action Button: Full width (e.g., "+ Create Order").
  3. Nav Links: Icon (18px) + Label + Count badge (if applicable). 
     - Active State: Background `#E6F2EF`, text `#0F766E`, font-weight 600.
     - Default State: Text `#4E6660`, hover background `#F7FAF9`.
  4. Bottom (Pinned): "Wallet" block. Background `#F7FAF9`, border `#DDE7E3`. Contains rows like "Reserved: 360 000 ₽" and "Available: 140 000 ₽".

### 6.3. Desktop Grid Architecture
- Use CSS Grid: `grid-template-columns: 232px 380px minmax(0, 1fr);`
- The middle column (`380px`) is the List/Queue (orders, candidates, chats).
- The right column (`1fr`) is the Detail Workspace (forms, detail views, tables).

---

## 7. Auth Providers (Russian Market Specifics)
- On all Login and Registration screens, you MUST use these OAuth providers: **VK ID, Yandex ID, Telegram, Sber ID**.
- **Styling:** Buttons must be neutral (background `#FFFFFF`, border `#DDE7E3`, height `36px`) with brand icons on the left. Arrange them in a row (or 2x2 grid) below the main password field or form. Do NOT use Google or Apple sign-in.

---

## 8. Stepper Component (Registration Flow)
Used for onboarding (Steps 1-4). Strictly enforce these dimensions:
- **Container:** Row of `28x28px` circles connected by `2px` lines.
- **Completed Step:** Circle bg `#0F766E`, white checkmark icon. Connector line `#0F766E`.
- **Current Step:** Circle bg `#0F766E`, white step number. `ring-2 ring-[#0F766E]/30`. Connector line to the right is gray.
- **Future Step:** Circle bg `#E5E7EB`, text color `#6B7280`.
- **Labels:** `12px / 500` below circles. Do NOT change circle sizes, fonts, or gap spacing between different screens.

---

## 9. Data Tables
- **Header:** Background `#F7FAF9`, text `12px / 500`, color `#4E6660`. Border-bottom `1px solid #DDE7E3`.
- **Rows:** Height `44px`. Border-bottom `1px solid #DDE7E3`. Hover state: background `#F7FAF9`.
- **Numbers:** Always use tabular numerals (`font-variant-numeric: tabular-nums`).
- **Actions:** Use text ghost buttons or `16px` icons (e.g., "Open", "Reject").

---

## 10. Modals, Drawers & Overlays
- **Modals (Confirmation Dialogs):** Width strictly `480px`. Use ONLY for destructive actions or confirmations. Backdrop MUST be `rgba(18, 32, 28, 0.40)` with **NO backdrop-filter blur**. Radius `8px`, shadow `0 4px 16px rgba(18, 32, 28, 0.08)`.
- **Drawers (Side Panels):** Used for viewing candidate cards or quick forms. Slides in from the right. Width strictly `540px`, height `100vh`. Same shadow as modals.

## 11. Role-Based Content Matrix (Strict Data Dictionary)
The LLM must strictly follow this data matrix. Never invent menu items, user names, or wallet balances. The UI content depends entirely on the active role.

### Role 1: Customer (Заказчик)
- **Header Profile:** "Ирина Котова" / "Руководитель отдела персонала"
- **Sidebar Menu:**
  - Primary Button: "+ Создать заказ"
  - Items: "Мои заказы (4)", "Кандидаты (2)", "Встречи (1)", "Сообщения (3)", "Документы", "Аналитика"
  - *Forbidden:* Do NOT show "My Resumes", "Job Board", or "Candidates Pool".
- **Sidebar Wallet Block:**
  - "Зарезервировано: 360 000 ₽"
  - "Свободный остаток: 140 000 ₽"
  - Subtext: "ООО «Альфа Логистик» • ИНН 7704123456"

### Role 2: Executor (Исполнитель)
- **Header Profile:** "Анна Ершова" / "Рекрутер · самозанятая"
- **Sidebar Menu:**
  - Primary Button: "+ Найти проект"
  - Items: "Мои проекты (3)", "Биржа заказов (2)", "Кандидаты (12)", "Встречи (2)", "Сообщения (1)", "Аналитика"
  - *Forbidden:* Do NOT show "My Orders" or "Post a Job".
- **Sidebar Wallet Block:**
  - "К получению: 255 000 ₽"
  - "Выплачено в ноябре: 85 000 ₽"
  - Subtext: "Рейтинг 4,8 · 23 закрытых заказа"

### Role 3: Applicant (Соискатель)
- **Header Profile:** "Дмитрий Орлов" / "Frontend-разработчик"
- **Sidebar Menu:**
  - Primary Button: "+ Найти вакансию"
  - Items: "Мои отклики (3)", "База вакансий (128)", "Мои резюме (1)", "Встречи (1)", "Сообщения (1)"
  - *Forbidden:* Do NOT show "Wallet", "My Projects", or "Create Order".
- **Sidebar Wallet Block (Replace with Metrics):**
  - "Просмотров резюме: 14"
  - "Ответов компаний: 2 из 5"
  - Subtext: "Резюме заполнено на 80%"

---

## 12. Layout Shell Consistency Rule
When generating a screen, you MUST explicitly state the Role in the prompt. Once the role is set, copy the EXACT Header and Sidebar contents defined in Section 11. Do NOT change active menu items. The active item is always the first one (e.g., "Мои заказы" for Customer, "Мои проекты" for Executor), unless the screen is specifically a sub-page of another section.