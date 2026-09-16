export type PaidPlan = "pro" | "agency";
export type Billing = "monthly" | "yearly";

export const PAID_PLANS: Record<
  PaidPlan,
  { name: string; monthly: number; yearly: number }
> = {
  pro: { name: "Pro", monthly: 19, yearly: 15 },
  agency: { name: "Agency", monthly: 49, yearly: 39 },
};

/** USD → PHP conversion used for GCash charges. */
export const PHP_RATE = 58;

/** Total due today in USD (yearly plans are billed for 12 months upfront). */
export function totalDue(plan: PaidPlan, billing: Billing): number {
  const p = PAID_PLANS[plan];
  return billing === "yearly" ? p.yearly * 12 : p.monthly;
}
