import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/data/defaults";
import { usePlanStore } from "@/store/usePlanStore";
import { formatCurrency } from "@/utils/formatters";
import { validateWizardStep1 } from "@/utils/validationEngine";
import { ValidationIssues } from "./ValidationIssues";
import type { Currency } from "@mpa/shared";

export function WizardStep1Setup() {
  const wizard = usePlanStore((s) => s.wizard);
  const setField = usePlanStore((s) => s.setWizardField);

  const netBudget = useMemo(
    () => wizard.totalBudget * (1 - wizard.agencyFeePct / 100),
    [wizard.totalBudget, wizard.agencyFeePct]
  );
  const issues = validateWizardStep1(wizard);

  return (
    <Card accent="cyan">
      <CardHeader>
        <CardTitle>Plan setup</CardTitle>
        <CardDescription>
          Set up the basics — name, timing, budget. You can refine assumptions and platform splits
          in later steps.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Plan name *</Label>
          <Input
            id="name"
            value={wizard.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="e.g. Q3 lead-gen monthly plan"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start">Start date *</Label>
            <Input
              id="start"
              type="date"
              value={wizard.planningStart}
              onChange={(e) => setField("planningStart", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">End date *</Label>
            <Input
              id="end"
              type="date"
              value={wizard.planningEnd}
              onChange={(e) => setField("planningEnd", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select
              value={wizard.currency}
              onValueChange={(v) => setField("currency", v as Currency)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Total budget *</Label>
            <Input
              id="budget"
              type="number"
              min={0}
              value={wizard.totalBudget || ""}
              onChange={(e) => setField("totalBudget", Number(e.target.value))}
              placeholder="e.g. 50000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee">Agency fee %</Label>
            <Input
              id="fee"
              type="number"
              min={0}
              max={25}
              step={0.5}
              value={wizard.agencyFeePct || 0}
              onChange={(e) => setField("agencyFeePct", Number(e.target.value))}
            />
          </div>
        </div>
        <div className="bg-background rounded-[12px] p-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-muted-foreground">Net media budget</span>
          <span className="text-xl font-bold">{formatCurrency(netBudget, wizard.currency)}</span>
        </div>
        <ValidationIssues issues={issues} />
      </CardContent>
    </Card>
  );
}
