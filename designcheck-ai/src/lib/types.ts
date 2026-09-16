export type Severity = "critical" | "warning" | "pass";

export interface Finding {
  id: string;
  category: "brand" | "accessibility";
  severity: Severity;
  title: string;
  detail: string;
  wcag?: string;
  fix: string;
}

export interface Audit {
  id: string;
  source: string; // URL or screenshot file name
  sourceType: "url" | "screenshot";
  createdAt: string; // ISO
  overallScore: number;
  brandScore: number;
  accessibilityScore: number;
  palette: string[];
  fonts: string[];
  findings: Finding[];
  screenshotDataUrl?: string;
}
