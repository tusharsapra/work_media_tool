export type Currency = "USD" | "INR" | "EUR" | "GBP" | "AED" | "SGD" | "AUD";

export type FunnelStage =
  | "awareness"
  | "consideration"
  | "decision"
  | "lead_gen"
  | "retention";

export type DealType = "CPM" | "CPC" | "CPV" | "CPL" | "CPR" | "CPLPV" | "Fixed";

export type Priority = "high" | "medium" | "low";

export type Severity = "info" | "warning" | "error";

export interface BudgetWarning {
  code: string;
  severity: Severity;
  message: string;
}

export interface ValidationIssue {
  code: string;
  severity: Severity;
  field?: string;
  message: string;
}
