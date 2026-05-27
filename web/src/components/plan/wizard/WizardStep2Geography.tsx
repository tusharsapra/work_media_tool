import { Plus, X, Copy, Lock, Unlock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ACCOUNT_BASED_TEMPLATES,
  GEOGRAPHY_PLAN_TYPES,
  GLOBAL_REGIONS,
  INDIA_CITIES,
  INDIA_REGIONS,
  INDIA_STATES,
  INDIA_STRUCTURES,
  INDIA_TIERS,
} from "@/data/defaults";
import { usePlanStore, makeGeographyGroup } from "@/store/usePlanStore";
import { validateWizardStep2 } from "@/utils/validationEngine";
import { normalizeShares, equalShares, setShareAndRedistribute, sharesTotal } from "@/utils/shareUtils";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { ValidationIssues } from "./ValidationIssues";
import type {
  CompetitionLevel,
  GeographyGroup,
  GeographyPlanType,
  GeographyType,
  IndiaStructure,
  Priority,
} from "@mpa/shared";

export function WizardStep2Geography() {
  const wizard = usePlanStore((s) => s.wizard);
  const setField = usePlanStore((s) => s.setWizardField);
  const groups = wizard.geographies;

  const setGroups = (next: GeographyGroup[]) => setField("geographies", next);

  const updateGroup = (id: string, patch: Partial<GeographyGroup>) =>
    setGroups(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const planType = wizard.geographyPlanType;
  const setPlanType = (t: GeographyPlanType) => {
    setField("geographyPlanType", t);
    if (t !== "india") setField("indiaStructure", undefined);
  };

  const geoTypeForPlan = (): GeographyType => {
    if (planType === "india") {
      switch (wizard.indiaStructure) {
        case "city":
          return "city";
        case "state":
          return "state";
        case "region":
          return "region";
        default:
          return "custom";
      }
    }
    if (planType === "global") return "country";
    return "custom";
  };

  const addNamedGroup = (name: string, locations?: string[], notes?: string) => {
    if (!name.trim()) return;
    if (groups.some((g) => g.name.toLowerCase() === name.toLowerCase())) return;
    setGroups([
      ...groups,
      makeGeographyGroup({
        name,
        type: geoTypeForPlan(),
        budgetShare: 0,
        locations: locations ?? [name],
        notes,
      }),
    ]);
  };

  const addCustomGroup = () =>
    setGroups([
      ...groups,
      makeGeographyGroup({ name: "New group", type: geoTypeForPlan(), budgetShare: 0 }),
    ]);

  const removeGroup = (id: string) => setGroups(groups.filter((g) => g.id !== id));

  const duplicateGroup = (id: string) => {
    const g = groups.find((x) => x.id === id);
    if (!g) return;
    setGroups([
      ...groups,
      makeGeographyGroup({
        name: `${g.name} (copy)`,
        type: g.type,
        budgetShare: 0,
        locations: g.locations,
        priority: g.priority,
        competition: g.competition,
        notes: g.notes,
      }),
    ]);
  };

  const normalize = () => {
    const shares = normalizeShares(groups.map((g) => ({ share: g.budgetShare, locked: g.budgetLocked })));
    setGroups(groups.map((g, i) => ({ ...g, budgetShare: shares[i] })));
  };
  const equalSplit = () => {
    const shares = equalShares(groups.length);
    setGroups(groups.map((g, i) => ({ ...g, budgetShare: shares[i] })));
  };
  const changeShare = (index: number, value: number) => {
    const shares = setShareAndRedistribute(
      groups.map((g) => ({ share: g.budgetShare, locked: g.budgetLocked })),
      index,
      value
    );
    setGroups(groups.map((g, i) => ({ ...g, budgetShare: shares[i] })));
  };
  const toggleLock = (id: string) =>
    updateGroup(id, { budgetLocked: !groups.find((g) => g.id === id)?.budgetLocked });

  const total = sharesTotal(groups.map((g) => ({ share: g.budgetShare })));
  const issues = validateWizardStep2(wizard);

  // Picker options for the current India structure / global plan.
  const pickerOptions = (): string[] => {
    if (planType === "india") {
      switch (wizard.indiaStructure) {
        case "city":
          return INDIA_CITIES;
        case "state":
          return INDIA_STATES;
        case "region":
          return INDIA_REGIONS;
        case "tier":
          return INDIA_TIERS;
        default:
          return [];
      }
    }
    if (planType === "global") return GLOBAL_REGIONS;
    return [];
  };

  return (
    <Card accent="cyan">
      <CardHeader>
        <CardTitle>Geography</CardTitle>
        <CardDescription>
          Choose how you want to plan geography, then add groups and split the budget across them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Plan type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {GEOGRAPHY_PLAN_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setPlanType(t.id)}
              className={cn(
                "text-left rounded-[12px] border p-4 transition-colors",
                planType === t.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:bg-background"
              )}
            >
              <div className="font-bold text-sm mb-1">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.description}</div>
            </button>
          ))}
        </div>

        {/* India sub-structure */}
        {planType === "india" && (
          <div className="space-y-2">
            <Label>India targeting structure</Label>
            <Select
              value={wizard.indiaStructure ?? ""}
              onValueChange={(v) => setField("indiaStructure", v as IndiaStructure)}
            >
              <SelectTrigger>
                <SelectValue placeholder="How do you want to structure India targeting?" />
              </SelectTrigger>
              <SelectContent>
                {INDIA_STRUCTURES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Quick-add picker */}
        {pickerOptions().length > 0 && (
          <div className="space-y-2">
            <Label>Add {planType === "global" ? "region" : wizard.indiaStructure ?? "location"}</Label>
            <Select value="" onValueChange={(v) => addNamedGroup(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Pick from examples…" />
              </SelectTrigger>
              <SelectContent>
                {pickerOptions().map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Account-based templates */}
        {planType === "india" && wizard.indiaStructure === "account_based" && (
          <div className="space-y-2">
            <Label>Account-based grouping templates</Label>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_BASED_TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => addNamedGroup(t.name, t.suggestedLocations, t.note)}
                  className="px-3 py-1.5 rounded-full border border-border bg-card hover:bg-background text-sm font-medium"
                >
                  <Plus className="h-3 w-3 inline mr-1" />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={addCustomGroup}>
            <Plus className="h-3.5 w-3.5" />
            Add custom group
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={equalSplit} disabled={groups.length === 0}>
              Equal split
            </Button>
            <Button variant="ghost" size="sm" onClick={normalize} disabled={groups.length === 0}>
              Normalize to 100%
            </Button>
          </div>
        </div>

        {/* Group list */}
        <div className="space-y-3">
          {groups.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center bg-background rounded-[12px]">
              No geography groups yet. Use the picker above or add a custom group.
            </div>
          ) : (
            groups.map((g, index) => {
              const value = (wizard.totalBudget * g.budgetShare) / 100;
              return (
                <div key={g.id} className="rounded-[12px] border border-border p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                      value={g.name}
                      onChange={(e) => updateGroup(g.id, { name: e.target.value })}
                      className="font-semibold"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={g.budgetLocked ? "Unlock share" : "Lock share"}
                      onClick={() => toggleLock(g.id)}
                    >
                      {g.budgetLocked ? (
                        <Lock className="h-4 w-4 text-primary" />
                      ) : (
                        <Unlock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Duplicate" onClick={() => duplicateGroup(g.id)}>
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => removeGroup(g.id)}>
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-[120px_1fr_140px_140px] gap-3 items-center">
                    <div>
                      <Label className="text-xs">Share %</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={g.budgetShare || 0}
                        onChange={(e) => changeShare(index, Number(e.target.value))}
                      />
                    </div>
                    <div className="pt-5 text-sm font-semibold text-muted-foreground">
                      {g.budgetShare.toFixed(1)}% · {formatCurrency(value, wizard.currency)}
                    </div>
                    <div>
                      <Label className="text-xs">Priority</Label>
                      <Select
                        value={g.priority ?? "medium"}
                        onValueChange={(v) => updateGroup(g.id, { priority: v as Priority })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Competition</Label>
                      <Select
                        value={g.competition ?? "medium"}
                        onValueChange={(v) => updateGroup(g.id, { competition: v as CompetitionLevel })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {g.locations && g.locations.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Locations: {g.locations.join(", ")}
                    </div>
                  )}

                  <Textarea
                    value={g.notes ?? ""}
                    onChange={(e) => updateGroup(g.id, { notes: e.target.value })}
                    placeholder="Notes (e.g. strongest sales coverage, test market)…"
                    className="min-h-[44px] text-sm"
                  />
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between bg-background rounded-[12px] p-3">
          <span className="text-sm font-semibold text-muted-foreground">Total share</span>
          <Badge variant={Math.abs(total - 100) < 0.5 ? "success" : total === 0 ? "muted" : "warning"}>
            {total.toFixed(1)}% / 100%
          </Badge>
        </div>
        <ValidationIssues issues={issues} />
      </CardContent>
    </Card>
  );
}
