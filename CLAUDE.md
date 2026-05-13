# NestProtect

A free disaster preparedness web app from Blue Sky Disaster Relief, a 501(c)(3).
Helps families prepare for, survive, and recover from 17 types of severe weather,
personalized by ZIP code.

## Founder context (use sparingly, only when relevant to copy or UX decisions)

Built by Leo, a teen who lost his family home in the 2019 Dallas tornado. The
app exists to spare other families the chaos his family went through.

## Tone of voice

- Plain-spoken. Short sentences. No marketing fluff.
- Calm, never alarmist. Users may open this app under real stress.
- Speak to the user as "you." Refer to the org as "Blue Sky Disaster Relief"
  on first mention, "Blue Sky" after.
- "Disaster" is fine to use as a noun. Prefer "risk" when referring to
  FEMA-sourced hazard data (e.g., "risk types," "risk rating").

## Brand — strict rules

Full brand spec: see `/mnt/skills/user/npbrand/SKILL.md` if available, or the
locally-checked-in copy at `design/npbrand.md`. Hard rules, do not break:

- **Royal blue `#0162e8`** is the only color for titles, subheads, and links.
- **Cool gradient** (royal `#0162e8` → teal `#00d2bc`, top-to-bottom 180°) is
  the primary CTA treatment.
- **Special gradient** (royal → purple `#770bda`) appears EXACTLY ONCE per
  page, on the most important "moment of magic" CTA. Purple appears nowhere
  else as a solid color.
- **Sunset gradient** (yellow → pink/red) is reserved for emergency CTAs
  only. Do not use on marketing/auth pages.
- **No icons on page-level content.** Icons appear only in footer navigation.
  Use small colored dots or text labels instead.
- **Cards** are white, 1px `#E5E7EB` border, `0.75rem` radius, soft shadow:
  `0 1px 3px rgba(160,168,176,.18), 0 4px 16px rgba(160,168,176,.18)`.
- **Typography:** Open Sans everywhere, Arial fallback.

Color tokens live in `src/index.css` as HSL CSS variables. Always use the
semantic Tailwind classes (`bg-primary`, `text-title`, `bg-gradient-primary`)
over raw hex codes.

## Auth page redesign (active work)

The current auth page is being replaced. Target design:
`design/NestProtect_Auth_Page_Redesign_Mockup.html`. Read this file before
making any changes to auth-related components — it is the source of truth
for layout, copy, and visual hierarchy.

Notes:
- The hero photo (`public/images/Leos_House_After_Tornado_2019-10_600x250.jpg`)
  is served via a raw `<img>` tag (Vite project, no next/image). Already sized at 600×250.
- The ZIP code "What's my risk?" CTA hits the existing risk-lookup endpoint.
  Do not create a new one.
- Reuse existing email/password and Google OAuth handlers from the previous
  auth page. Only the visual layer is changing.
- The number "17" is hard-coded in the trust pills. Update it manually if
  the count of risk types ever changes.

## Privacy — non-negotiable

NestProtect collects the minimum data needed to function: auth info, ZIP
code, task status. No analytics SDKs that share data with third parties.
No PII in logs, ever. If a feature requires collecting new data, flag it
explicitly before implementing.

## Conventions

- Always plan before coding. List the files you'll create or modify, wait
  for confirmation, then implement.
- Match the existing codebase's styling approach (Tailwind / CSS modules
  / etc.) — do not introduce a new one.
- Keep components small. If a file passes ~200 lines, propose a split.
- Tests live next to the component: `Foo.tsx` + `Foo.test.tsx`.

## What NOT to do

- Do not auto-commit. I'll commit manually after review.
- Do not run `npm install` for new packages without asking first.
- Do not add tracking, analytics, or third-party SDKs without asking.
- Do not invent copy. Pull from `design/` mockups or the one-pager at
  `design/NestProtect_One_Pager.md`. If copy is missing, ask.
