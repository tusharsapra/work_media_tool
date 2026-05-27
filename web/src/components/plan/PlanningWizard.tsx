import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WizardStepper } from "./wizard/WizardStepper";
import { WizardStep1Setup } from "./wizard/WizardStep1Setup";
import { WizardStep2Geography } from "./wizard/WizardStep2Geography";
import { WizardStep3Objective } from "./wizard/WizardStep3Objective";
import { WizardStep4Budget } from "./wizard/WizardStep4Budget";
import { WizardStep5Assumptions } from "./wizard/WizardStep5Assumptions";
import { WizardReviewConfirm } from "./wizard/WizardReviewConfirm";
import { usePlanStore } from "@/store/usePlanStore";
import {
  validateWizardStep1,
  validateWizardStep2,
  validateWizardStep3,
  validateWizardStep4,
  validateWizardStep5,
} from "@/utils/validationEngine";
import { uid } from "@/lib/utils";
import { buildMediaPlanRow } from "@/utils/forecastEngine";
import { monthsBetween } from "@/utils/formatters";
import type { MediaPlan, MediaPlanRow } from "@mpa/shared";

const STEPS = [
  { label: "Setup" },
  { label: "Geography" },
  { label: "Objective & KPI" },
  { label: "Budget & platforms" },
  { label: "Assumptions" },
  { label: "Review" },
];

export function PlanningWizard() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const wizard = usePlanStore((s) => s.wizard);
  const setStep = usePlanStore((s) => s.setWizardStep);
  const addPlan = usePlanStore((s) => s.addPlan);
  const resetWizard = usePlanStore((s) => s.resetWizard);
  const setCurrentPlan = usePlanStore((s) => s.setCurrentPlan);

  if (!clientId) return null;

  const step = wizard.step;

  const validateCurrent = () => {
    switch (step) {
      case 0:
        return validateWizardStep1(wizard);
      case 1:
        return validateWizardStep2(wizard);
      case 2:
        return validateWizardStep3(wizard);
      case 3:
        return validateWizardStep4(wizard);
      case 4:
        return validateWizardStep5(wizard);
      default:
        return [];
    }
  };
  const canGoNext = !validateCurrent().some((i) => i.severity === "error");

  const onBack = () => {
    if (step === 0) navigate(-1);
    else setStep(step - 1);
  };

  const onNext = () => {
    if (!canGoNext) return;
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const onGenerate = () => {
    // V2: no agency fee — net media budget equals the total media budget.
    const netBudget = wizard.totalBudget;
    const months = monthsBetween(wizard.planningStart, wizard.planningEnd);
    const enabledPlatforms = wizard.platforms.filter((p) => p.enabled);

    const rows: MediaPlanRow[] = [];
    months.forEach((m) => {
      const monthlyBudget = netBudget / months.length;
      wizard.geographies.forEach((g) => {
        const geoBudget = (monthlyBudget * g.budgetShare) / 100;
        enabledPlatforms.forEach((p) => {
          const platBudget = (geoBudget * p.budgetShare) / 100;
          const assumption = wizard.assumptions.find((a) => a.platform === p.platform);
          if (!assumption || platBudget <= 0) return;
          rows.push(
            buildMediaPlanRow(
              {
                id: uid("row"),
                month: m,
                geographyId: g.id,
                geographyName: g.name,
                platform: p.platform,
                funnelStage: p.funnelStage,
                dealType: p.dealType,
                budget: platBudget,
              },
              assumption
            )
          );
        });
      });
    });

    const now = new Date().toISOString();
    const plan: MediaPlan = {
      id: uid("plan"),
      clientId,
      name: wizard.name,
      type: wizard.planType,
      status: "draft",
      version: 1,
      currency: wizard.currency,
      planningStart: wizard.planningStart,
      planningEnd: wizard.planningEnd,
      totalBudget: wizard.totalBudget,
      agencyFeePct: 0,
      netMediaBudget: wizard.totalBudget,
      objective: wizard.objective,
      primaryKPI: wizard.primaryKPI,
      primaryKPITarget: wizard.primaryKPITarget,
      secondaryKPIs: wizard.secondaryKPIs,
      funnelSplit: wizard.funnelSplit,
      geographyPlanType: wizard.geographyPlanType,
      indiaStructure: wizard.indiaStructure,
      geographies: wizard.geographies,
      platforms: wizard.platforms,
      assumptions: wizard.assumptions,
      rows,
      notes: wizard.notes,
      createdAt: now,
      updatedAt: now,
    };

    addPlan(clientId, plan);
    setCurrentPlan(plan.id);
    resetWizard();
    navigate(`/clients/${clientId}/plans/${plan.id}`);
  };

  const onExit = () => {
    resetWizard();
    navigate(`/clients/${clientId}`);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plan generation</h1>
          <p className="text-muted-foreground mt-1">
            Step through the wizard to build your forecast. You can edit assumptions later from the
            plan workspace.
          </p>
        </div>
        <Button variant="ghost" onClick={onExit}>
          <X className="h-4 w-4" />
          Exit to project
        </Button>
      </div>

      <WizardStepper steps={STEPS} current={step} />

      <div className="mb-6">
        {step === 0 && <WizardStep1Setup />}
        {step === 1 && <WizardStep2Geography />}
        {step === 2 && <WizardStep3Objective />}
        {step === 3 && <WizardStep4Budget />}
        {step === 4 && <WizardStep5Assumptions />}
        {step === 5 && <WizardReviewConfirm />}
      </div>

      {/* Sticky wizard footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur z-40">
        <div className="max-w-4xl mx-auto px-8 py-3 flex items-center justify-between">
          <Button variant="secondary" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          <div className="text-xs text-muted-foreground font-medium">
            Step {step + 1} of {STEPS.length} · {STEPS[step].label}
          </div>
          {step < STEPS.length - 1 ? (
            <Button onClick={onNext} disabled={!canGoNext}>
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={onGenerate}>
              <Check className="h-4 w-4" />
              Generate plan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
