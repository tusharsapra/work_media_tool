import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormattedNumberInput } from "@/components/ui/FormattedNumberInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/data/defaults";
import { usePlanStore } from "@/store/usePlanStore";
import { formatCurrency, monthsBetween } from "@/utils/formatters";
import { validateWizardStep1 } from "@/utils/validationEngine";
import { ValidationIssues } from "./ValidationIssues";
import type { Currency } from "@mpa/shared";

export function WizardStep1Setup() {
  const wizard = usePlanStore((s) => s.wizard);
  const setField = usePlanStore((s) => s.setWizardField);

  const issues = validateWizardStep1(wizard);
  const months =
    wizard.planningStart && wizard.planningEnd
      ? monthsBetween(wizard.planningStart, wizard.planningEnd).length
      : 0;

  return (
    <Card accent="cyan">
      <CardHeader>
        <CardTitle>Plan setup</CardTitle>
        <CardDescription>
          Set up the basics — name, timing, and media budget. You can refine assumptions and
          platform splits in later steps.
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Currency *</Label>
            <Select
              value={wizard.currency}
              onValueChange={(v) => setField("currency", v as Currency)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
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
            <Label htmlFor="budget">Media budget *</Label>
            <FormattedNumberInput
              id="budget"
              value={wizard.totalBudget}
              currency={wizard.currency}
              onValueChange={(v) => setField("totalBudget", v)}
              placeholder="e.g. 10,00,000"
            />
          </div>
        </div>
        <div className="bg-background rounded-[12px] p-4 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-muted-foreground">Media budget</span>
            {months > 0 && (
              <span className="text-xs text-muted-foreground ml-2">
                · {months} {months === 1 ? "month" : "months"}
              </span>
            )}
          </div>
          <span className="text-xl font-bold">
            {formatCurrency(wizard.totalBudget, wizard.currency)}
          </span>
        </div>
        <ValidationIssues issues={issues} />
      </CardContent>
    </Card>
  );
}
