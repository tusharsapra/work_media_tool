import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import type { ClientWorkspace, MediaPlan } from "@mpa/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { exportPlanToExcel, triggerDownload } from "@/exports/excelExport";

const SHEETS = [
  { name: "Planning Inputs", description: "Client, plan, budget, objective, KPIs, geographies, platforms" },
  { name: "Monthly Media Plan", description: "Forecast rows by month / geography / platform with totals" },
  { name: "Assumptions", description: "Per-platform CPM, CTR, LPV%, CVR, VTR, Reg. rate, QL rate" },
  { name: "Summary & Warnings", description: "Forecast totals, budget warnings, AI Recommendations placeholder" },
];

export function ExportPanel({ plan, client }: { plan: MediaPlan; client: ClientWorkspace }) {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const blob = await exportPlanToExcel(plan, client);
      const slug = (s: string) => s.replace(/[^a-z0-9]+/gi, "_").replace(/_+/g, "_");
      const today = new Date().toISOString().slice(0, 10);
      triggerDownload(
        blob,
        `${slug(client.name)}_${slug(plan.name)}_v${plan.version}_${today}.xlsx`
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card accent="cyan">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Export client-ready Excel</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Generate a 4-sheet ARM-branded workbook. PPT and PDF exports will land in a later
              phase.
            </p>
          </div>
          <Button size="lg" onClick={handleExport} disabled={busy}>
            <Download className="h-4 w-4" />
            {busy ? "Generating…" : "Download Excel"}
          </Button>
        </div>

        <div className="space-y-2">
          {SHEETS.map((s, i) => (
            <div
              key={s.name}
              className="flex items-start gap-3 px-4 py-3 rounded-[12px] bg-background"
            >
              <div className="rounded-full bg-primary/10 text-primary h-8 w-8 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{s.name}</span>
                  <Badge variant="muted">Sheet {i + 1}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
