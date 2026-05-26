import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { GEO_PRESETS } from "@/data/defaults";
import { usePlanStore, makeGeographyGroup } from "@/store/usePlanStore";
import { validateWizardStep2 } from "@/utils/validationEngine";
import { ValidationIssues } from "./ValidationIssues";
import type { GeographyGroup, GeographyType, Priority } from "@mpa/shared";

export function WizardStep2Geography() {
  const wizard = usePlanStore((s) => s.wizard);
  const setField = usePlanStore((s) => s.setWizardField);

  const updateGroup = (id: string, patch: Partial<GeographyGroup>) => {
    setField(
      "geographies",
      wizard.geographies.map((g) => (g.id === id ? { ...g, ...patch } : g))
    );
  };

  const addCustomGroup = () => {
    setField("geographies", [
      ...wizard.geographies,
      makeGeographyGroup({ name: "New group", type: wizard.geographyType, budgetShare: 0 }),
    ]);
  };

  const addPreset = (presetId: string) => {
    const preset = GEO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    if (wizard.geographies.some((g) => g.name === preset.label)) return;
    setField("geographies", [
      ...wizard.geographies,
      makeGeographyGroup({ name: preset.label, type: preset.type, budgetShare: 0 }),
    ]);
  };

  const removeGroup = (id: string) => {
    setField("geographies", wizard.geographies.filter((g) => g.id !== id));
  };

  const distributeEvenly = () => {
    if (wizard.geographies.length === 0) return;
    const share = 100 / wizard.geographies.length;
    setField(
      "geographies",
      wizard.geographies.map((g) => ({ ...g, budgetShare: Number(share.toFixed(2)) }))
    );
  };

  const totalShare = wizard.geographies.reduce((s, g) => s + (g.budgetShare || 0), 0);
  const issues = validateWizardStep2(wizard);

  return (
    <Card accent="cyan">
      <CardHeader>
        <CardTitle>Geography</CardTitle>
        <CardDescription>
          How do you want to structure geography? Pick a level, then add presets or custom groups.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Structure</Label>
            <Select
              value={wizard.geographyType}
              onValueChange={(v) => setField("geographyType", v as GeographyType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="country">Country-level</SelectItem>
                <SelectItem value="region">Region-level</SelectItem>
                <SelectItem value="state">State-level</SelectItem>
                <SelectItem value="city">City-level</SelectItem>
                <SelectItem value="custom">Custom geo groups</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Add preset</Label>
            <Select value="" onValueChange={addPreset}>
              <SelectTrigger>
                <SelectValue placeholder="Select a preset…" />
              </SelectTrigger>
              <SelectContent>
                {GEO_PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="secondary" size="sm" onClick={addCustomGroup}>
            <Plus className="h-3.5 w-3.5" />
            Add custom group
          </Button>
          <Button variant="ghost" size="sm" onClick={distributeEvenly}>
            Distribute evenly
          </Button>
        </div>

        <div className="space-y-2">
          {wizard.geographies.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center bg-background rounded-[12px]">
              No geographies yet. Pick a preset above or add a custom group to start.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_140px_120px_40px] gap-2 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Group</span>
                <span>Budget share %</span>
                <span>Priority</span>
                <span />
              </div>
              {wizard.geographies.map((g) => (
                <div
                  key={g.id}
                  className="grid grid-cols-[1fr_140px_120px_40px] gap-2 items-center"
                >
                  <Input
                    value={g.name}
                    onChange={(e) => updateGroup(g.id, { name: e.target.value })}
                  />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={g.budgetShare || 0}
                    onChange={(e) =>
                      updateGroup(g.id, { budgetShare: Number(e.target.value) })
                    }
                  />
                  <Select
                    value={g.priority ?? "medium"}
                    onValueChange={(v) => updateGroup(g.id, { priority: v as Priority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove"
                    onClick={() => removeGroup(g.id)}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center justify-between bg-background rounded-[12px] p-3">
          <span className="text-sm font-semibold text-muted-foreground">Total share</span>
          <Badge
            variant={
              Math.abs(totalShare - 100) < 0.5 ? "success" : totalShare === 0 ? "muted" : "warning"
            }
          >
            {totalShare.toFixed(1)}% / 100%
          </Badge>
        </div>
        <ValidationIssues issues={issues} />
      </CardContent>
    </Card>
  );
}
