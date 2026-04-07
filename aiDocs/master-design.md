# Master Design System: High-End Editorial Habit Diagnostics

## Purpose

This file is the single source of truth for the site-wide visual system, UI behavior, and implementation standards.

Apply these rules across the entire product, not just isolated screens. Every page, component, state, and interaction should feel like part of one coherent editorial system.

## Creative North Star

The core design direction is **The Intellectual Sanctuary**.

The product should feel like a premium digital journal, a quiet executive workspace, and a thoughtful diagnostic tool. It should not feel like a gamified productivity app, a startup dashboard template, or a streak-based self-judgment machine.

The target emotional response is:

- calm
- reflective
- credible
- premium
- intelligent
- low-friction

The user should feel guided, not managed.

## Brand Positioning in UI Form

This design system exists for a frustrated high-achiever who does not want:

- loud colors
- cluttered cards
- nagging notifications
- cheap borders
- achievement gimmicks
- shame-based failure states

This system should communicate:

- composure over urgency
- depth over noise
- resilience over streaks
- intelligence over hype
- editorial polish over app-store gamification

## Core Design Principles

### 1. Intentional Asymmetry

Avoid rigid, center-weighted SaaS layouts when not necessary.

Use:

- strong left alignment for hero copy and large text
- generous whitespace
- uneven but balanced composition
- layouts that feel editorial, not templated

Favor visual tension and breathing room over perfect symmetry.

### 2. Tonal Layering Over Borders

Do not structure the interface with visible outlines.

Never use:

- 1px section dividers
- boxed-in grids
- harsh card borders
- Bootstrap-style containment

Instead use:

- background tone shifts
- spacing
- radius
- nested surfaces
- subtle opacity changes

Boundaries should be felt, not drawn.

### 3. Quiet Depth

Depth should come from tonal hierarchy, blur, and surface contrast, not heavy drop shadows.

UI should feel like stacked sheets of fine paper, not floating plastic cards.

### 4. Diagnostic Calm

All feedback, metrics, and states should feel observational rather than judgmental.

Avoid visual language that implies punishment.
Missed habits are data, not failure.

### 5. Resilience Over Streak Logic

Never center the product around streaks.

Replace fragile all-or-nothing framing with:

- resilience
- recovery
- consistency bands
- pattern recognition
- “don’t miss twice” reinforcement

## Global Visual Language

### Overall Aesthetic

The interface should look like:

- a premium editorial publication
- an executive notebook
- a thoughtful behavioral diagnostic
- a modern, high-end research brief

It should not look like:

- a neon self-improvement app
- a generic Tailwind dashboard
- a template marketplace landing page
- a “hustle harder” productivity tool

### Density

Default to lower density.
Use spacious padding, wider margins, and deliberate rhythm.

If a screen feels busy:

1. remove nonessential UI
2. increase spacing
3. reduce competing emphasis
4. simplify copy
5. only then consider resizing elements

Do not solve clutter by shrinking everything.

## Color System

### Palette Intent

The palette should replace gamification energy with executive sophistication.

Core emotional roles:

- Deep navy and slate for authority and calm
- Off-whites and paper tones for softness and clarity
- Soft emerald for healthy progress and organic growth
- Muted error tones for gentle correction, never alarm

### Core Surface Tokens

Use these as the base layering system:

- `surface`: `#f7f9fb`
- `surface_container_lowest`: `#ffffff`
- `surface_container_low`: `#f2f4f6`
- `surface_container_highest`: `#e0e3e5`

These values should drive most page composition.

### Suggested Semantic Tokens

Use or map these consistently in the app theme:

- `primary`: `#000000`
- `primary_container`: `#131b2e`
- `on_surface`: `#191c1e`
- `outline_variant`: use at low opacity only
- `tertiary_fixed_dim`: soft emerald for positive charting and growth
- `on_primary_container`: muted slate-blue for neutral misses
- `error_container`: muted soft red or dusty rose
- `on_error_container`: deeper restrained error text tone

### The No-Line Rule

Never use solid visible borders as a default sectioning system.

Rules:

- no 1px gray dividers between cards or list rows
- no outlined dashboard boxes unless accessibility requires it
- no visual dependency on border grids

Preferred alternatives:

- background color shifts
- whitespace
- padding rhythm
- tonal layering
- shadow only when truly floating

### Ghost Border Rule

If a border is necessary for focus, accessibility, or state clarity:

- use `outline_variant`
- keep it at around 15% opacity by default
- increase only modestly on focus
- never use a fully opaque border unless absolutely required

## Surface Hierarchy

Treat the interface like nested paper layers.

### Layering Model

- **Page background:** `surface`
- **Primary cards and content blocks:** `surface_container_lowest`
- **Section wells and supporting zones:** `surface_container_low`
- **Tertiary nested modules:** `surface_container_highest`

### Usage Guidance

- A white card on a slightly darker paper background creates enough structure.
- A section should feel separated because of tone and spacing, not because of an outline.
- Repeated nesting deeper than three levels should be avoided unless absolutely necessary.

## Gradients, Blur, and Material Effects

### Signature CTA Gradient

Primary actions should feel weighted and deliberate.

Use a subtle linear gradient:

- from `primary`
- to `primary_container`

This is preferred over flat black because it creates a richer premium feel.

### Glassmorphism Rule

Use glass only on floating or transient UI:

- modal overlays
- floating action buttons
- elevated menus
- command surfaces

Implementation guidance:

- semi-transparent surface-based background
- backdrop blur around 20px
- restrained contrast
- never use glass everywhere

Glass is an accent, not the base system.

### Surface Tinting

In selected premium areas such as insight modules or charts, allow color to softly bleed into the background using 3% to 5% opacity.

This should feel atmospheric, not decorative.

## Typography System

## Font Roles

Use a two-font system:

### 1. Voice Font: Manrope

Use for:

- display
- headline
- high-emphasis metrics
- key emotional words
- hero statements
- diagnostic takeaways

Why:

- geometric
- modern
- confident
- wide stance
- strong editorial authority

### 2. Intellect Font: Public Sans

Use for:

- titles
- body copy
- labels
- dense summaries
- supporting UI text
- tables and structured informational content

Why:

- neutral
- highly legible
- low cognitive load
- clean and operational

## Typography Behavior

### Display Use

Use large display sizes sparingly and strategically.
Best for:

- single-word states
- key insights
- emotionally resonant headings
- hero framing

Examples:

- Resilient
- Rebuilding
- Stable
- In Motion

### Hierarchy Guidance

Prefer strong contrast in scale rather than many medium-weight headings.

A good pattern:

- `display-lg` or `headline-lg` for the main insight
- `body-md` or `title-sm` for the supporting explanation

This creates editorial contrast and avoids dashboard sameness.

### Headline Case

Use **Title Case** for headlines and major module titles unless a specific page pattern calls for sentence case.

### Readability Rules

- avoid dense walls of small text
- prefer shorter paragraphs
- maintain generous line-height
- avoid overly light weights for body text
- maintain strong contrast without pure harshness

## Spacing and Layout Rhythm

### Spacing Philosophy

Spacing is one of the main structural tools in the system.

Use spacing to:

- create containment
- create transitions
- separate thought groups
- lower cognitive pressure

### Rhythm Rules

- prefer larger outer margins
- keep consistent vertical rhythm
- use generous space between major sections
- avoid cramped clusters of controls

### List and Stack Rhythm

For habit rows and stacked content:

- default to wide vertical padding
- target around 24px vertical rhythm between important items

Each row should feel significant, not disposable.

## Radius and Shape

### Softness Standard

Use rounded corners to reduce sharpness and stress.

Default radius:

- `lg` = 1rem
- `xl` = 1.5rem

Use pill/full rounding for:

- primary buttons
- segmented actions when appropriate
- chips only if restrained and premium

Do not use sharp-cornered cards unless there is a very explicit editorial reason.

## Elevation and Shadows

### Tonal Layering First

Always try to create depth through surface contrast before adding shadow.

### Shadow Usage

Avoid traditional card shadows as a default.

Only use shadows for truly floating elements:

- menus
- popovers
- sticky floating controls
- dialog surfaces

Recommended shadow behavior:

- large blur, around 40px
- very low opacity, around 5%
- shadow color tinted from `on_surface`

The effect should feel like ambient light, not a sticker underneath the component.

## Component Standards

## Buttons

### Primary Button

Use for highest-priority actions only.

Style:

- gradient from `primary` to `primary_container`
- white text
- full rounded corners
- comfortable horizontal padding
- substantial height

Behavior:

- should feel calm, premium, decisive
- not glossy, loud, or aggressively saturated

### Secondary Button

Style:

- `surface_container_high` or equivalent soft raised surface
- text in a darker muted tone
- no border
- rounded corners consistent with system

Use for supportive actions.

### Tertiary Button

Style:

- text only
- no filled background unless hover/focus state requires it
- understated emphasis

Use for low-priority actions and inline control.

## Input Fields

### Resting State

- `surface_container_lowest` background
- no obvious border
- optional ghost border at low opacity
- generous padding
- rounded corners

### Focus State

- maintain calm appearance
- increase ghost border to around 40% opacity in `primary`
- no glowing blue browser-style ring unless adapted into the system language

### Error State

Do not use aggressive red fields.

Use:

- soft error-container background shift
- restrained error text
- clear but calm guidance

The goal is correction without emotional punishment.

## Cards

### Card Rule

Cards should feel like quiet editorial containers, not widgets.

Use:

- tonal separation
- generous internal padding
- soft radius
- minimal chrome

Avoid:

- visible dividers
- stacked border boxes
- overuse of badges
- overly dense card headers

### Nested Cards

If a card sits inside another tonal area, the contrast should be subtle and architectural.

## Lists

### Anti-Grid Rule

Do not use divider lines between list items.

Use:

- spacing
- tonal grouping
- rhythm
- micro-indent or content organization

List items should breathe.

## Charts and Data Visualization

### Chart Philosophy

Charts are diagnostic, not performative.

They should feel:

- calm
- premium
- explanatory
- emotionally safe

### Failure Profile Chart

For success:

- use `tertiary_fixed_dim` or equivalent soft emerald

For missed days:

- use `on_primary_container` or a muted slate-blue

Never use bright red for missed habits.

A miss is a neutral observation.

### Chart Background Treatment

Allow chart colors to lightly tint surrounding surfaces with around 5% opacity where appropriate.

This creates cohesion and a softer reading experience.

### Data Ink Guidance

- reduce unnecessary gridlines
- minimize chart chrome
- avoid bright legends and defaults
- keep labels readable and restrained
- prefer subtle contrast over high-saturation visuals

## Iconography

Use thin or light-weight icons only.

Guidance:

- around 1.5px stroke weight
- clean, minimal, understated
- avoid chunky, playful, cartoonish icon sets
- icons should support content, not dominate it

## Motion and Interaction

### Motion Principle

Motion should feel quiet, smooth, and inevitable.

Avoid:

- bounce
- flashy springiness
- gamified celebration effects
- over-animated counters
- excessive parallax

Prefer:

- soft fades
- short ease transitions
- subtle elevation changes
- calm hover states
- deliberate drawer and modal motion

### Feedback Tone

Success states should feel affirming, not euphoric.
Error states should feel informative, not punitive.

## Content Framing in UI

### Language Rules

The interface should speak like an intelligent coach or analyst, not a cheerleader.

Favor:

- calm observation
- reflective prompts
- measured encouragement
- diagnostic clarity

Avoid:

- hype
- exclamation-heavy praise
- guilt-based nudges
- streak obsession
- “you failed” framing

### Replace Gamified Language

Do not use:

- streak
- failure alert
- crushed it
- missed your goal again
- level up

Prefer:

- Weekly Resilience Score
- Pattern Shift
- Recovery Window
- Missed Day
- Re-entry
- Consistency Trend

## Page-Level Implementation Guidance

### Landing and Hero Sections

- use editorial asymmetry
- keep hero copy left-weighted
- allow meaningful whitespace
- avoid crowded hero UI
- one primary action, one optional secondary action

### Dashboard and Diagnostic Views

- avoid rigid tile grids where possible
- group related insights into calm tonal zones
- create hierarchy with spacing and typography first
- emphasize the main narrative, not every metric equally

### Forms

- simplify visible fields
- keep sections soft and open
- do not box every field group
- use progression and spacing to reduce friction

### Empty States

Empty states should feel thoughtful, not barren.

Use:

- calm prompt
- soft guidance
- minimal illustration if any
- no cartoon emptiness graphics

### Modals and Overlays

- use blur and surface transparency carefully
- maintain premium restraint
- avoid sharp frames or harsh shadows

## Accessibility Within This Style

Accessibility matters, but it should be solved in-system.

Rules:

- preserve sufficient text contrast
- never rely only on low-contrast subtlety for critical information
- use ghost borders or stronger focus states where needed
- ensure touch targets remain large
- keep typography readable at all sizes
- do not sacrifice usability for aesthetic purity

If accessibility and style conflict, solve it with tasteful reinforcement, not a collapse into generic defaults.

## Non-Negotiables

### Always Do

- use tonal layering instead of visible section lines
- prioritize whitespace
- use Manrope for high-emphasis editorial voice
- use Public Sans for operational clarity
- keep interaction feedback emotionally neutral and calm
- frame habit data as resilience and pattern recognition
- keep surfaces soft, rounded, and layered
- use premium restraint across all states

### Never Do

- no hard 1px borders as default structure
- no bright red missed-habit states
- no streak-centric product framing
- no loud gradients outside intentional CTA use
- no heavy drop shadows on standard cards
- no dense dashboard clutter
- no generic template UI patterns without adaptation
- no thick icons
- no shame-based copy

## Cursor Agent Implementation Instructions

Use this file as the governing design standard for the entire site.

When making any UI decision:

1. prefer calm over flashy
2. prefer editorial over app-template
3. prefer tonal separation over borders
4. prefer whitespace over density
5. prefer resilience framing over streak framing
6. prefer premium restraint over feature noise

When uncertain, ask:

- Does this feel like an intellectual sanctuary?
- Does this feel premium and editorial?
- Does this reduce pressure rather than increase it?
- Does this look custom, not generic?
- Does this communicate insight rather than gamification?

If the answer is no, revise the implementation.

## Build Checklist for Any New Screen

Before finalizing any screen, verify:

- no hard borders are doing the structural work
- spacing is generous enough
- typography hierarchy is clear and editorial
- surface nesting is intentional
- the screen does not feel like a generic SaaS dashboard
- any chart uses muted, emotionally safe colors
- any success or failure state is calm and diagnostic
- buttons and inputs match the premium system
- the page supports the brand thesis of reflective, resilient self-understanding
