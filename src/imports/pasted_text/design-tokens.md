### Typography (apply globally via CSS variables or Tailwind config)
- Display / headings: `'Playfair Display', Georgia, serif` — weight 400 (not bold), tight letter-spacing (-0.02em)
- Body: `'Inter', system-ui, sans-serif` — weight 400, 15px, line-height 1.7
- Labels / eyebrows: Inter, 11px, uppercase, letter-spacing 0.1em, weight 500, color var(--color-text-secondary)
- Monospace (IDs, codes): `'JetBrains Mono', monospace`, 13px

Load from Google Fonts: `Playfair Display:ital,wght@0,400;0,500;1,400` and `Inter:wght@400;500`

### Spacing and Layout Rules
- Section vertical padding: 96px desktop / 64px mobile
- Max content width: 1200px, centered
- Horizontal page padding: 48px desktop / 20px mobile
- Grid gap: 32px standard, 48px between major sections
- No drop shadows anywhere. Use border and space as separators.
- Border-radius: 4px inputs and buttons, 8px cards, 0px for section dividers and table rows
- No background gradients. No glassmorphism. No blur effects.

### Button System
Primary: bg var(--color-accent-green), text white, 4px radius, 14px Inter 500, 44px height, 24px horizontal padding, no shadow
Ghost: transparent bg, 1px solid var(--color-accent-green), text var(--color-accent-green), same sizing
Danger: transparent bg, 1px solid var(--color-status-rejected), text var(--color-status-rejected)
Disabled: opacity 0.4, cursor not-allowed
No icon-only buttons without accessible labels.

### Input System
Height: 44px
Border: 1px solid var(--color-border)
Border-radius: 4px
Background: white
Label: always above the input, 12px Inter 500 uppercase tracking, color var(--color-text-secondary)
Focus: border-color var(--color-accent-green), outline none, box-shadow: 0 0 0 3px rgba(45,80,22,0.12)
Error state: border-color var(--color-status-rejected), error message in 12px red below field
No floating/placeholder-as-label pattern.

---

## GLOBAL LAYOUT CHANGE — Auth Redirect Logic

After Clerk authentication resolves:
- If user.role === "admin" → redirect to /admin (not to / or /dashboard)
- If user.role === "golfer" → redirect to /dashboard (golfer home, not the landing page /)
- The landing page (/) is public and does not redirect authenticated users — but the navbar should reflect auth state

Create /dashboard as the authenticated golfer home:
- Greeting: "Good morning, [name]." in serif 28px
- Three panels in a row (not cards — just bordered sections):
  1. Upcoming reservations (next 2, with date, time, status badge, "View →" link)
  2. Quick action: "Book a tee time →" button + "View all reservations →" text link
  3. Recent notification (last status change, if any, as a single line with timestamp)
- If no reservations: "You have no upcoming reservations. Ready to play?" with CTA

---

## LANDING PAGE (/) — Redesign to Match Reference Image

### Navbar
Match the GOLFX reference: dark background (#141410), centered nav links, right side has icon buttons
- Background: var(--color-bg-dark)
- Logo left: "PRADERA VERDE" in 13px uppercase Inter 500, white, letter-spacing 0.15em
- Center links (13px Inter 500, white, hover: color var(--color-accent-gold)):
  Book Now | Our Courses | Membership | About Us | Blog
- Right: user icon + cart-style icon (use for "My Reservations" link) — 20px icon, white
- No border below navbar — it bleeds into the hero
- Mobile: hamburger, slide-down menu on dark background

### Hero Section (match GOLFX layout exactly)
- Full-width, ~70vh height (not full 100vh)
- Background: full-bleed golf course image (keep existing Unsplash URL)
- NO dark overlay — let the image breathe like in the reference
- Bottom-left text overlay (not centered):
  - Headline (serif, 48px desktop / 32px mobile, white, weight 400): "Championship Golf\nAwaits You."
  - Below headline: inline search-style row (match GOLFX search bar position):
    - Date input (styled like a search bar, white bg, 4px radius)
    - "Check Availability" button (primary)
    - This row sits on the image, bottom-left, above a subtle dark-to-transparent gradient that only covers the bottom 30% of the image
- Top-left corner: small label "Pradera Verde · Cavite, Philippines" in 11px gold uppercase
- Top-right: "Book Now →" small ghost link in white

### About / Course Overview Section (match GOLFX "About Us" pill + text layout)
- Centered pill label: "About Us" — small rounded pill, border 1px solid var(--color-border-strong), 11px uppercase
- Large centered serif heading (32px): "Pradera Verde is dedicated to bringing championship golf to Cavite."
- Below heading: two side-by-side images (use existing course images or Unsplash golf course placeholders), offset slightly like the reference — one higher, one lower, slight overlap feel (use negative margin-top on the second one, ~24px)
- Right side of the two-image block: two text blocks positioned beside them (like the reference "Our Vision" / "Our Mission"):
  - "The Course" label + 2-sentence course description
  - "Our Promise" label + 1-sentence service promise
- Keep it sparse — 4 sentences total in this section

### Scorecard Section (two-column, dark background)
Background: var(--color-bg-dark)
Left: serif heading "18 Holes — Blue Tees" in white, stats row in gold
Right: compact hole scorecard table (Hole | Yards | HCP) — white text, alternating row opacity (100% / 70%)

### Walkthrough / Caddie Notes Section
Background: var(--color-bg-secondary)
Keep existing two-column per-hole layout but restyle:
- Each hole block: gold line-height rule above, 11px eyebrow "Hole X — XXX yds", 14px tip text below
- Column gap wider (48px)
- Section heading serif centered above

### Practical Info + Final CTA
Keep existing content. Restyle:
- Three-column info: plain text, no cards, 1px top border per column, 13px Inter
- CTA section: dark background, centered serif heading, primary button

---

## BOOKING FLOW — Multi-Step Wizard

Replace the current single-page horizontal form with a vertical multi-step wizard.

### Step Indicator (top of booking page)
Horizontal stepper with 4 steps, always visible:
Step 1: Select Date
Step 2: Select Time
Step 3: Your Details
Step 4: Review & Pay

Each step: number circle (24px) + label below. Active: filled var(--color-accent-green) circle, white number. Completed: checkmark. Upcoming: outlined circle, muted label. Connected by a thin 1px line between circles.

### Step 1 — Select Date
- Full-width date strip: scrollable row of the next 21 days
- Each day chip: day name (Mon) above, date number (16) below, month label small below that
- Selected: bg var(--color-accent-green), white text
- Blocked day (full schedule block): muted, strikethrough date, not selectable, small "Unavailable" label
- "Next →" button below becomes active once a date is selected

### Step 2 — Select Time
- Heading: "Available times on [selected date]"
- Time slot list (not a card grid):
  Each slot as a full-width row: time on left | spots remaining center | status right | "Select" on far right
  Available row: left border 2px var(--color-accent-green) on hover/selected
  Blocked row: bg slightly muted, "Blocked — [reason]" label, no select button
  Fully booked: "Full" badge, not selectable
- Selected slot gets a persistent selected state (filled left border, light green bg tint)
- "Next →" active once a slot is selected

### Step 3 — Your Details
Vertical stacked form, grouped:

Section: Contact Information
- Full name *
- Email address *
- Phone number *
- Visiting from (city) *

Section: Players
- Player 1 name * (required)
- Subtle "+ Add player" text link below (max 4 players total)
- Each additional player: name field + "Remove" text link right-aligned

Section: Preferences
- Transportation needed: two large radio tiles ("Yes — arrange transport" / "No — self-transport"), not small radio buttons
- Other notes: textarea, optional, placeholder: "Anything the course team should know?"

"Next →" button — validates all required fields before proceeding

### Step 4 — Review & Pay
Summary card:
- Course, date, time, player count, transport preference
- Section: Payment
  Two large option tiles (full width, bordered, radio-select behavior):

  Tile 1: "Pay Now (Mock)"
  Sub: "Complete a simulated payment today to secure your slot."
  On select: expand below the tile with payment method options:
    - Online Banking — mock bank details shown
    - GCash / Maya — mock QR placeholder shown
    - Credit Card (mock) — 3 disabled card-looking inputs clearly labeled "DEMO ONLY"

  Tile 2: "Pay at Venue"
  Sub: "Confirm your reservation now, pay at the pro shop on arrival."
  On select: no sub-form, just a note: "Your reservation will be marked as confirmed. Payment is due at the clubhouse."

- Below tiles: "Confirm Reservation" primary button
- On confirm: loading state → success panel (same as existing ConfirmationPanel) with:
  - Heading: "You're booked."
  - Reservation ID in monospace
  - Date, time, payment method used
  - Status badge
  - "View reservation →" and "Back to home" links

---

## ADMIN PANEL — Modern Professional Redesign

Preserve all existing functionality. Redesign the visual presentation only.

### Admin Sidebar
Width: 256px, fixed
Background: var(--color-bg-dark)
Top section:
- "PRADERA VERDE" in 11px uppercase Inter 500, gold (#B8962E), letter-spacing 0.15em
- "Admin Panel" in 12px Inter, white, opacity 0.5
- 1px gold border-bottom below branding block, margin-bottom 24px

Nav items (48px height, 14px Inter 400):
- Default: white text, opacity 0.65, no bg
- Hover: opacity 1, bg rgba(255,255,255,0.06)
- Active: opacity 1, bg rgba(255,255,255,0.08), left border 2px solid #B8962E
- Icon: 16px icon left, label right, 16px horizontal padding

Nav groups (add section labels in 10px uppercase gold, opacity 0.5, margin-top 24px):
"Overview"
  → Dashboard
"Reservations"
  → All Reservations
  → Pending Approval
"Schedule"
  → Calendar
  → Schedule Blocks
"Communications"
  → Notifications
[bottom, separated by spacer]
  → View Site →

### Admin Top Bar (right of sidebar)
Height: 56px, bg white, border-bottom 1px var(--color-border)
Left: Current page title in 16px Inter 500
Right: admin user name + avatar initials circle (32px, bg var(--color-accent-green), white initials)

### Admin Dashboard (/admin)
Replace metric blocks with a clean stat row:
- 4 stats side by side, each: large number in 32px Playfair Display, label below in 11px uppercase muted
- Separated by 1px vertical dividers — not cards
- Background: white, 1px bottom border, 20px vertical padding

Below stats: two columns
Left (60%): Pending Reservations table
- Columns: Golfer | Date | Time | Players | Actions
- Actions: "Approve" (green text link) | "Reject" (red text link) | "View" (muted link)
- No status column (these are all pending by definition)
- Header: "Awaiting Approval" serif 18px + count badge

Right (40%): Today at a glance
- List of today's confirmed tee times: time chip + golfer name + player count
- If empty: "No confirmed tee times today."
- Below: upcoming schedule blocks (next 3, each as a date + reason line)

### Admin Reservations (/admin/reservations)
Filter tabs: All | Pending | Approved | Rejected | Cancelled | Completed
- Tab style: borderless, active tab has a 2px gold underline, not a filled pill

Table:
- Row height: 52px
- Columns: ID | Golfer | Date | Time | Players | Status | Payment | Updated | →
- Status: small colored dot + text (no background pill)
- "→" column: right-aligned "View" link
- Alternating row bg: white / #FAFAF8
- Table header: 11px uppercase, var(--color-text-secondary), no background
- Hover: row bg #F3F1EC

### Admin Reservation Detail (/admin/reservations/[id])
Two column layout: 60% / 40%

Left column:
- Back link "← All reservations" in 13px muted
- Reservation heading: "[Golfer name] — [Date] at [Time]" in Playfair Display 24px
- Info blocks stacked vertically, each: 11px uppercase label + value below
- Players: numbered list 1. 2. 3. style
- Divider between each info group (1px border)

Right column (sticky on desktop):
- Card: white, 1px border, 8px radius, 24px padding
- "Status" label + current status badge
- Action buttons stacked, full-width, with 8px gap:
  Approve (primary, only if pending)
  Reject (danger outline, only if pending)
  Mark Complete (ghost, only if approved)
  Cancel (ghost gray, only if pending or approved)
- Each button: confirm inline before executing — replace button with "[Action]? Confirm | Cancel" row
- Notes section below buttons:
  "Internal note" textarea (admin only) + "Customer note" textarea (visible to golfer)
  Save button: ghost, 100% width
- Notification log at bottom: each as a single line — dot + event name + timestamp, no table needed

### Admin Calendar (/admin/calendar)
Month grid:
- Day cells: 48px min height on mobile, natural height desktop
- Slot chips: 20px height, 10px font, rounded-full, bg var(--color-accent-green) at 15% opacity, green text
- Blocked day: red tint bg on cell
- Click day: right-side drawer panel slides in (not a modal)
  - Drawer: fixed right, 320px wide, full height, white bg, 1px left border
  - Shows all slots for that day with edit/disable toggles
  - "+ Add slot" at bottom

### Admin Schedule Blocks (/admin/blocks)
Two-section layout:
Top: active blocks table (Date range | Time | Reason | Actions)
  - Reason styled as small pill: "Tournament" amber, "Maintenance" gray, "Private Event" blue, "Holiday" teal
Below: "Add schedule block" form in a clean bordered section (not a card, just a 1px border all around, 24px padding)

### Admin Notifications (/admin/notifications)
Table with filter row above.
- Status "Sent (mock)": green dot + text
- Status "Queued": amber dot + text
- Status "Failed": red dot + text
- No background pills — dot + colored text only
- Channel shown as plain text, not a badge

---

## GOLFER DASHBOARD (/dashboard)

This is the authenticated home for golfers (not the landing page).

Layout: centered, max-width 800px

Top: "Good [morning/afternoon], [First name]." — Playfair Display 28px, no bg
Sub: Today's date in 13px muted

Three sections stacked:

### Upcoming Reservations
Heading: "Upcoming" — 13px uppercase gold
If reservations exist: list of next 2–3 with:
  - Date large on left (Playfair Display 20px) + day name below
  - Middle: course name + time + player count
  - Right: status dot + "View →"
  - 1px bottom border between rows
If empty: "No upcoming tee times. [Book a round →]"

### Quick Actions
Two action blocks side by side (bordered sections, not cards):
Left: "Book a Tee Time" — serif 18px heading + short line + primary button
Right: "View All Reservations" — serif 18px heading + short line + ghost button

### Recent Activity
Heading: "Recent activity" — 13px uppercase gold
Last 3 notification events as a simple list:
  - Event label + reservation date + timestamp right-aligned
  - 1px border between rows
If none: "No recent activity."

---

## MOCK PAYMENT BANNER (applies everywhere payment simulation appears)

Replace any yellow banner with:
Background: var(--color-accent-gold-light) — #E8D5A0
Border: 1px solid var(--color-accent-gold)
Text: 13px Inter, color var(--color-bg-dark)
Content: "Simulation mode — no real payment will be processed."
No icon. Left-aligned text. Full width of its container.

---

## WHAT NOT TO CHANGE
- All Convex queries, mutations, and schema — do not touch
- Clerk auth configuration — do not touch
- All route paths — do not rename any routes
- Existing seed data logic
- Notification logging behavior
- All existing form validation logic (only restyle the visual presentation)