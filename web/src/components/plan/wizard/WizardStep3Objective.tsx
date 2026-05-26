import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_FUNNEL_SPLIT, KPI_BY_OBJECTIVE, OBJECTIVES } from "@/data/defaults";
import { usePlanStore } from "@/store/usePlanStore";
import { validateWizardStep3 } from "@/utils/validationEngine";
import { ValidationIssues } from "./ValidationIssues";
import type { FunnelSplit, Objective } from "@mpa/shared";

export function WizardStep3Objective() {
  const wizard = usePlanStore((s) => s.wizard);
  const setField = usePlanStore((s) => s.setWizardField);

  const kpiOptions = KPI_BY_OBJECTIVE[wizard.objective] ?? { primary: [], secondary: [] };
  const issues = validateWizardStep3(wizard);

  // When objective changes, reset primary KPI to the first option and load default funnel split.
  useEffect(() => {
    if (!kpiOptions.primary.includes(wizard.primaryKPI)) {
      setField("primaryKPI", kpiOptions.primary[0] ?? "");
      setField("secondaryKPIs", []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizard.objective]);

  const updateFunnel = (key: keyof FunnelSplit, value: number) => {
    setField("funnelSplit", { ...wizard.funnelSplit, [key]: value });
  };

  const useDefaultFunnel = () => {
    setField("funnelSplit", DEFAULT_FUNNEL_SPLIT[wizard.objective]);
  };

  const funnelSum =
    wizard.funnelSplit.awareness +
    wizard.funnelSplit.consideration +
    wizard.funnelSplit.decision +
    wizard.funnelSplit.lead_gen;

  const toggleSecondary = (kpi: string, checked: boolean) => {
    const next = checked
      ? [...wizard.secondaryKPIs, kpi]
      : wizard.secondaryKPIs.filter((k) => k !== kpi);
    setField("secondaryKPIs", next);
  };

  return (
    <Card accent="cyan">
      <CardHeader>
        <CardTitle>Objective & KPIs</CardTitle>
        <CardDescription>
          Pick the main business objective, choose how success is measured, and optionally set a
          target value for your primary KPI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Primary objective</Label>
          <Select
            value={wizard.objective}
            onValueChange={(v) => setField("objective", v as Objective)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OBJECTIVES.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {OBJECTIVES.find((o) => o.id === wizard.objective)?.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Primary KPI</Label>
            <Select
              value={wizard.primaryKPI}
              onValueChange={(v) => setField("primaryKPI", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select primary KPI" />
              </SelectTrigger>
              <SelectContent>
                {kpiOptions.primary.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="target">Target value (optional)</Label>
            <Input
              id="target"
              type="number"
              min={0}
              step={0.01}
              value={wizard.primaryKPITarget ?? ""}
              onChange={(e) =>
                setField(
                  "primaryKPITarget",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
              placeholder="e.g. 800"
            />
            <p className="text-xs text-muted-foreground">
              Used by the Excel export for KPI cell color-coding. Leave blank to skip.
            </p>
          </div>
        </div>

        {kpiOptions.secondary.length > 0 && (
          <div className="space-y-2">
            <Label>Secondary KPIs (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {kpiOptions.secondary.map((kpi) => {
                const checked = wizard.secondaryKPIs.includes(kpi);
                return (
                  <label
                    key={kpi}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card cursor-pointer hover:bg-background text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => toggleSecondary(kpi, c === true)}
                    />
                    {kpi}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Funnel split</Label>
            <button
              type="button"
              onClick={useDefaultFunnel}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Use objective default
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(["awareness", "consideration", "decision", "lead_gen"] as const).map((key) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs capitalize">{key.replace("_", " ")}</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  value={wizard.funnelSplit[key]}
                  onChange={(e) => updateFunnel(key, Number(e.target.value))}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between bg-background rounded-[12px] p-3">
            <span className="text-sm font-semibold text-muted-foreground">Funnel sum</span>
            <Badge variant={Math.abs(funnelSum - 100) < 0.5 ? "success" : "warning"}>
              {funnelSum.toFixed(1)}% / 100%
            </Badge>
          </div>
        </div>
        <ValidationIssues issues={issues} />
      </CardContent>
    </Card>
  );
}
