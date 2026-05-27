import { useEffect, useState } from "react";
import type { MediaPlan, PlanningNotes as PlanningNotesType } from "@mpa/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { usePlanStore } from "@/store/usePlanStore";

const FIELDS: { key: keyof PlanningNotesType; label: string }[] = [
  { key: "budgetRationale", label: "Budget rationale" },
  { key: "geographyRationale", label: "Geography rationale" },
  { key: "platformRationale", label: "Platform rationale" },
  { key: "assumptions", label: "Assumption notes" },
  { key: "internal", label: "Internal notes" },
  { key: "client", label: "Client notes" },
];

export function PlanningNotes({ plan, clientId }: { plan: MediaPlan; clientId: string }) {
  const setPlanNotes = usePlanStore((s) => s.setPlanNotes);
  const [draft, setDraft] = useState<PlanningNotesType>(plan.notes ?? {});
  const [saved, setSaved] = useState(false);

  // Sync if the plan changes underneath (e.g. navigating between plans).
  useEffect(() => {
    setDraft(plan.notes ?? {});
  }, [plan.id, plan.notes]);

  const dirty = FIELDS.some((f) => (draft[f.key] ?? "") !== (plan.notes?.[f.key] ?? ""));

  const save = () => {
    const cleaned: PlanningNotesType = {};
    FIELDS.forEach((f) => {
      const v = (draft[f.key] ?? "").trim();
      if (v) cleaned[f.key] = v;
    });
    setPlanNotes(clientId, plan.id, cleaned);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
        Planning Notes
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-xs">{f.label}</Label>
                <Textarea
                  value={draft[f.key] ?? ""}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  className="min-h-[60px] text-sm"
                  placeholder="Optional — appears in the Excel export summary."
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={save} disabled={!dirty}>
              Save notes
            </Button>
            {saved && <span className="text-sm text-success font-semibold">Saved</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
