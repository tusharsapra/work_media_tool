import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { ValidationIssue } from "@mpa/shared";
import { cn } from "@/lib/utils";

export function ValidationIssues({ issues }: { issues: ValidationIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <div className="space-y-2 mt-4">
      {issues.map((issue, i) => (
        <div
          key={i}
          className={cn(
            "flex items-start gap-2 px-3 py-2 rounded-[8px] text-sm",
            issue.severity === "error" && "bg-danger/10 text-danger",
            issue.severity === "warning" && "bg-warning/10 text-warning",
            issue.severity === "info" && "bg-primary/10 text-primary"
          )}
        >
          {issue.severity === "error" && <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
          {issue.severity === "warning" && <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />}
          {issue.severity === "info" && <Info className="h-4 w-4 mt-0.5 shrink-0" />}
          <span>{issue.message}</span>
        </div>
      ))}
    </div>
  );
}
