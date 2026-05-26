import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ClientWorkspace,
  Currency,
  ForecastAssumption,
  GeographyGroup,
  MediaPlan,
  PlanType,
  PlatformPlan,
  WizardState,
} from "@mpa/shared";
import { MOCK_CLIENTS } from "@/data/mockClients";
import { DEFAULT_FUNNEL_SPLIT } from "@/data/defaults";
import { uid } from "@/lib/utils";
import { updateAssumptionInPlan } from "@/utils/recalculationEngine";

interface PlanStoreState {
  clients: ClientWorkspace[];
  currentClientId: string | null;
  currentPlanId: string | null;
  ui: { sidebarCollapsed: boolean };
  wizard: WizardState;

  // Client actions
  addClient: (input: {
    name: string;
    website?: string;
    industry?: string;
    currency: Currency;
  }) => string;
  updateClient: (id: string, patch: Partial<ClientWorkspace>) => void;
  archiveClient: (id: string) => void;
  setCurrentClient: (id: string | null) => void;

  // Plan actions
  addPlan: (clientId: string, plan: MediaPlan) => void;
  updatePlan: (clientId: string, planId: string, patch: Partial<MediaPlan>) => void;
  deletePlan: (clientId: string, planId: string) => void;
  setCurrentPlan: (id: string | null) => void;

  // Assumption recalculation
  recalcAssumption: (
    clientId: string,
    planId: string,
    assumptionId: string,
    patch: Partial<ForecastAssumption>
  ) => void;

  // Wizard actions
  initWizardForPlanType: (planType: PlanType, clientId: string, currency: Currency) => void;
  setWizardStep: (step: number) => void;
  setWizardField: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  resetWizard: () => void;

  // UI
  toggleSidebar: () => void;
}

const emptyWizard = (): WizardState => ({
  step: 0,
  planType: "monthly",
  clientId: "",
  name: "",
  currency: "USD",
  planningStart: "",
  planningEnd: "",
  totalBudget: 0,
  agencyFeePct: 0,
  geographyType: "region",
  geographies: [],
  objective: "lead_gen",
  primaryKPI: "CPL",
  primaryKPITarget: undefined,
  secondaryKPIs: [],
  funnelSplit: DEFAULT_FUNNEL_SPLIT.lead_gen,
  platforms: [],
  assumptions: [],
});

export const usePlanStore = create<PlanStoreState>()(
  persist(
    (set) => ({
      clients: MOCK_CLIENTS,
      currentClientId: null,
      currentPlanId: null,
      ui: { sidebarCollapsed: false },
      wizard: emptyWizard(),

      addClient: (input) => {
        const id = uid("client");
        const newClient: ClientWorkspace = {
          id,
          name: input.name,
          website: input.website,
          industry: input.industry,
          currency: input.currency,
          createdAt: new Date().toISOString(),
          archived: false,
          plans: [],
          defaults: {
            preferredPlatforms: [],
            preferredGeographies: [],
            benchmarkOverrides: [],
          },
        };
        set((state) => ({
          clients: [...state.clients, newClient],
          currentClientId: id,
        }));
        return id;
      },

      updateClient: (id, patch) =>
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      archiveClient: (id) =>
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, archived: true } : c)),
        })),

      setCurrentClient: (id) => set({ currentClientId: id }),

      addPlan: (clientId, plan) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === clientId ? { ...c, plans: [...c.plans, plan] } : c
          ),
          currentClientId: clientId,
          currentPlanId: plan.id,
        })),

      updatePlan: (clientId, planId, patch) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  plans: c.plans.map((p) =>
                    p.id === planId ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
                  ),
                }
              : c
          ),
        })),

      deletePlan: (clientId, planId) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === clientId ? { ...c, plans: c.plans.filter((p) => p.id !== planId) } : c
          ),
          currentPlanId: state.currentPlanId === planId ? null : state.currentPlanId,
        })),

      setCurrentPlan: (id) => set({ currentPlanId: id }),

      recalcAssumption: (clientId, planId, assumptionId, patch) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  plans: c.plans.map((p) =>
                    p.id === planId ? updateAssumptionInPlan(p, assumptionId, patch) : p
                  ),
                }
              : c
          ),
        })),

      initWizardForPlanType: (planType, clientId, currency) => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        const fmt = (d: Date) => d.toISOString().slice(0, 10);
        set({
          wizard: {
            ...emptyWizard(),
            planType,
            clientId,
            currency,
            planningStart: fmt(start),
            planningEnd: fmt(end),
          },
        });
      },

      setWizardStep: (step) => set((state) => ({ wizard: { ...state.wizard, step } })),

      setWizardField: (key, value) =>
        set((state) => ({ wizard: { ...state.wizard, [key]: value } })),

      resetWizard: () => set({ wizard: emptyWizard() }),

      toggleSidebar: () =>
        set((state) => ({ ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed } })),
    }),
    {
      name: "mpa-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        clients: state.clients,
        currentClientId: state.currentClientId,
        currentPlanId: state.currentPlanId,
        ui: state.ui,
      }),
    }
  )
);

// Convenience hooks for derived state
export const useCurrentClient = () =>
  usePlanStore((s) => s.clients.find((c) => c.id === s.currentClientId) ?? null);

export const useCurrentPlan = () =>
  usePlanStore((s) => {
    const client = s.clients.find((c) => c.id === s.currentClientId);
    return client?.plans.find((p) => p.id === s.currentPlanId) ?? null;
  });

// Helper: useful Wizard helper hooks (constructors)
export function makeGeographyGroup(
  partial: Partial<GeographyGroup> & { name: string }
): GeographyGroup {
  return {
    id: uid("geo"),
    name: partial.name,
    type: partial.type ?? "region",
    budgetShare: partial.budgetShare ?? 0,
    priority: partial.priority,
    competition: partial.competition,
    notes: partial.notes,
  };
}

export function makePlatformPlan(partial: Partial<PlatformPlan> & { platform: PlatformPlan["platform"] }): PlatformPlan {
  return {
    id: uid("plat"),
    platform: partial.platform,
    funnelStage: partial.funnelStage ?? "consideration",
    dealType: partial.dealType ?? "CPM",
    primaryKPI: partial.primaryKPI ?? "",
    budgetShare: partial.budgetShare ?? 0,
    budget: partial.budget ?? 0,
    enabled: partial.enabled ?? true,
    notes: partial.notes,
  };
}
