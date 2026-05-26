import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
}

export function WizardStepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, i) => {
        const completed = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                  completed && "bg-success text-white",
                  active && "bg-primary text-white ring-4 ring-primary/20",
                  !completed && !active && "bg-border text-muted-foreground"
                )}
              >
                {completed ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-sm font-semibold truncate",
                  active && "text-foreground",
                  !active && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-px flex-1 mx-1", completed ? "bg-success" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
