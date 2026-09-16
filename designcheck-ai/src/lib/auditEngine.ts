import { Audit, Finding } from "./types";

// Deterministic pseudo-random generator seeded from the audit source,
// so the same URL always produces the same simulated audit.
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTES: string[][] = [
  ["#4F46E5", "#22D3EE", "#0F172A", "#F8FAFC", "#F59E0B"],
  ["#DC2626", "#FCA5A5", "#1F2937", "#FFFFFF", "#FBBF24"],
  ["#059669", "#A7F3D0", "#064E3B", "#F9FAFB", "#3B82F6"],
  ["#7C3AED", "#C4B5FD", "#111827", "#FAF5FF", "#EC4899"],
  ["#0284C7", "#BAE6FD", "#0C4A6E", "#F0F9FF", "#F97316"],
];

const FONT_SETS: string[][] = [
  ["Inter", "Georgia"],
  ["Poppins", "Roboto", "Arial"],
  ["SF Pro Display", "SF Pro Text"],
  ["Montserrat", "Open Sans", "Lato", "Times New Roman"],
  ["DM Sans", "IBM Plex Mono"],
];

interface FindingTemplate {
  category: "brand" | "accessibility";
  severity: "critical" | "warning";
  title: string;
  detail: string;
  wcag?: string;
  fix: string;
}

const ISSUE_POOL: FindingTemplate[] = [
  {
    category: "accessibility",
    severity: "critical",
    title: "Low contrast body text",
    detail:
      "Primary body copy renders at a contrast ratio of ~3.2:1 against the background, below the 4.5:1 minimum for normal text.",
    wcag: "WCAG 2.2 — 1.4.3 Contrast (Minimum)",
    fix: "Darken body text to at least #475569 on white, or lighten the background. Aim for 4.5:1 or higher.",
  },
  {
    category: "accessibility",
    severity: "critical",
    title: "Missing alt text on hero imagery",
    detail:
      "The hero image and 3 feature illustrations appear to be informative but carry no visible caption or discernible text alternative.",
    wcag: "WCAG 2.2 — 1.1.1 Non-text Content",
    fix: "Add descriptive alt attributes to informative images; use empty alt (alt=\"\") for purely decorative ones.",
  },
  {
    category: "accessibility",
    severity: "warning",
    title: "Touch targets below 44px",
    detail:
      "Several nav links and footer icons measure roughly 28–36px, making them hard to tap on mobile devices.",
    wcag: "WCAG 2.2 — 2.5.8 Target Size (Minimum)",
    fix: "Increase padding so interactive targets are at least 44×44px, or add spacing between adjacent targets.",
  },
  {
    category: "accessibility",
    severity: "warning",
    title: "Color used as the only signal",
    detail:
      "Form validation states and pricing-tier highlights rely on color alone, which fails for color-blind users.",
    wcag: "WCAG 2.2 — 1.4.1 Use of Color",
    fix: "Pair color cues with icons, text labels, or patterns (e.g., an error icon plus a message next to invalid fields).",
  },
  {
    category: "accessibility",
    severity: "warning",
    title: "Focus states not visible",
    detail:
      "Buttons and links show no visible focus indicator, leaving keyboard users without orientation.",
    wcag: "WCAG 2.2 — 2.4.7 Focus Visible",
    fix: "Add a 2px high-contrast focus ring (e.g., outline: 2px solid #4F46E5; outline-offset: 2px) to all interactive elements.",
  },
  {
    category: "accessibility",
    severity: "critical",
    title: "Text embedded in images",
    detail:
      "Key value propositions are rendered inside raster images, so they cannot scale, reflow, or be read by screen readers.",
    wcag: "WCAG 2.2 — 1.4.5 Images of Text",
    fix: "Rebuild these sections with real HTML text styled via CSS instead of baked-in image text.",
  },
  {
    category: "brand",
    severity: "critical",
    title: "Too many primary colors competing",
    detail:
      "We detected 5+ saturated hues used at similar visual weight, diluting brand recognition and CTA hierarchy.",
    fix: "Pick one primary brand color, one accent, and demote the rest to neutrals. CTAs should own the primary hue.",
  },
  {
    category: "brand",
    severity: "warning",
    title: "Inconsistent button styles",
    detail:
      "Three different corner radii (4px, 8px, 999px) and two different button heights appear across the page.",
    fix: "Define a single button component spec — one radius, one height scale — and apply it everywhere.",
  },
  {
    category: "brand",
    severity: "warning",
    title: "Typography scale drifts",
    detail:
      "Headings jump between 22px, 27px, and 34px with no consistent ratio, and two competing font families appear in body copy.",
    fix: "Adopt a modular type scale (e.g., 1.25 ratio) and limit the page to one display and one body typeface.",
  },
  {
    category: "brand",
    severity: "warning",
    title: "Logo clear-space violations",
    detail:
      "The logo sits within 4px of adjacent nav items, tighter than the recommended clear space of the logo's x-height.",
    fix: "Reserve padding equal to at least the height of the logomark on all sides of the logo.",
  },
  {
    category: "brand",
    severity: "critical",
    title: "Inconsistent voice on CTAs",
    detail:
      "CTA copy mixes 'Get started', 'Try now', 'Sign up free', and 'Learn more' for the same action, splitting conversions.",
    fix: "Standardize the primary CTA label across the page and reserve secondary labels for genuinely different actions.",
  },
  {
    category: "brand",
    severity: "warning",
    title: "Spacing rhythm is irregular",
    detail:
      "Section padding varies between 40px, 56px, 64px, and 90px without a discernible system, making the page feel unpolished.",
    fix: "Use a 8px spacing grid and standardize vertical section rhythm (e.g., 64px between major sections).",
  },
];

const PASS_POOL: Omit<FindingTemplate, "severity">[] = [
  {
    category: "accessibility",
    title: "Headings follow a logical order",
    detail: "The page structure steps down heading levels without skipping, aiding screen-reader navigation.",
    fix: "",
  },
  {
    category: "accessibility",
    title: "Language and layout are readable",
    detail: "Line lengths stay under ~80 characters and text blocks are left-aligned for comfortable reading.",
    fix: "",
  },
  {
    category: "brand",
    title: "Strong hero hierarchy",
    detail: "The hero headline, subcopy, and primary CTA follow a clear visual hierarchy that guides the eye.",
    fix: "",
  },
  {
    category: "brand",
    title: "Consistent iconography style",
    detail: "Icons share a single stroke weight and corner style, reinforcing a cohesive visual language.",
    fix: "",
  },
  {
    category: "accessibility",
    title: "Buttons have descriptive labels",
    detail: "Primary actions use clear verbs rather than ambiguous labels like 'Click here'.",
    fix: "",
  },
];

function pickUnique<T>(pool: T[], count: number, rand: () => number): T[] {
  const copy = [...pool];
  const out: T[] = [];
  while (out.length < count && copy.length > 0) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

export function runAudit(
  source: string,
  sourceType: "url" | "screenshot",
  screenshotDataUrl?: string
): Audit {
  const seed = hashString(source.toLowerCase().trim() + sourceType);
  const rand = mulberry32(seed);

  const issueCount = 3 + Math.floor(rand() * 4); // 3–6 issues
  const passCount = 2 + Math.floor(rand() * 3); // 2–4 passes

  const issues: Finding[] = pickUnique(ISSUE_POOL, issueCount, rand).map(
    (t, i) => ({ ...t, id: `f-${i}` })
  );
  const passes: Finding[] = pickUnique(PASS_POOL, passCount, rand).map(
    (t, i) => ({ ...t, severity: "pass" as const, id: `p-${i}` })
  );

  const findings = [...issues, ...passes];

  const score = (category: "brand" | "accessibility") => {
    const crit = issues.filter(
      (f) => f.category === category && f.severity === "critical"
    ).length;
    const warn = issues.filter(
      (f) => f.category === category && f.severity === "warning"
    ).length;
    return Math.max(28, Math.min(98, Math.round(96 - crit * 17 - warn * 8 - rand() * 5)));
  };

  const brandScore = score("brand");
  const accessibilityScore = score("accessibility");

  return {
    id: `audit-${Date.now().toString(36)}-${Math.floor(rand() * 1e6).toString(36)}`,
    source,
    sourceType,
    createdAt: new Date().toISOString(),
    overallScore: Math.round((brandScore + accessibilityScore) / 2),
    brandScore,
    accessibilityScore,
    palette: PALETTES[seed % PALETTES.length],
    fonts: FONT_SETS[seed % FONT_SETS.length],
    findings,
    screenshotDataUrl,
  };
}
