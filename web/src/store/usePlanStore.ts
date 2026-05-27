import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ClientWorkspace,
  Currency,
  ForecastAssumption,
  GeographyGroup,
  MediaPlan,
  Objective,
  PlanningNotes,
  PlanType,
  PlatformPlan,
  ProjectGroup,
  GeographyPlanType,
  WizardState,
} from "@mpa/shared";
import { SEED_PROJECTS, V1_MOCK_IDS } from "@/data/seedProjects";
import { DEFAULT_FUNNEL_SPLIT } from "@/data/defaults";
import { uid } from "@/lib/utils";
import { updateAssumptionInPlan } from "@/utils/recalculationEngine";

export interface AddProjectInput {
  name: string;
  projectGroup: ProjectGroup;
  industry?: string;
  website?: string;
  currency?: Currency;
  defaultGeographyType?: GeographyPlanType;
  projectContext?: string;
  defaultObjective?: Objective;
}

interface PlanStoreState {
  clients: ClientWorkspace[];
  currentClientId: string | null;
  currentPlanId: string | null;
  ui: { sidebarCollapsed: boolean };
  wizard: WizardState;

  // Project actions (UI calls these "projects"; the object is ClientWorkspace internally)
  addProject: (input: AddProjectInput) => string;
  updateProjectSettings: (id: string, patch: Partial<ClientWorkspace>) => void;
  archiveProject: (id: string) => void;
  unarchiveProject: (id: string) => void;
  setCurrentClient: (id: string | null) => void;

  // Plan actions
  addPlan: (clientId: string, plan: MediaPlan) => void;
  updatePlan: (clientId: string, planId: string, patch: Partial<MediaPlan>) => void;
  deletePlan: (clientId: string, planId: string) => void;
  setCurrentPlan: (id: string | null) => void;
  setPlanNotes: (clientId: string, planId: string, notes: PlanningNotes) => void;

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

const emptyNotes = (): PlanningNotes => ({});

const emptyWizard = (): WizardState => ({
  step: 0,
  planType: "monthly",
  clientId: "",
  name: "",
  currency: "INR",
  planningStart: "",
  planningEnd: "",
  totalBudget: 0,
  agencyFeePct: 0,
  geographyType: "region",
  geographyPlanType: "india",
  indiaStructure: undefined,
  geographies: [],
  objective: "lead_gen",
  primaryKPI: "CPL",
  primaryKPITarget: undefined,
  secondaryKPIs: [],
  funnelSplit: DEFAULT_FUNNEL_SPLIT.lead_gen,
  platforms: [],
  assumptions: [],
  notes: emptyNotes(),
});

/** Migrate a persisted v1 store to v2: drop V1 fake clients, group user-created
 * clients as non_bajaj, and merge in the 21 ARM seed projects. */
function migrateToV2(persisted: unknown): { clients: ClientWorkspace[] } {
  const state = (persisted ?? {}) as { clients?: ClientWorkspace[] };
  const prior = Array.isArray(state.clients) ? state.clients : [];
  const kept = prior
    .filter((c) => !V1_MOCK_IDS.includes(c.id))
    .map((c) => ({
      ...c,
      projectGroup: c.projectGroup ?? ("non_bajaj" as ProjectGroup),
    }));
  const keptIds = new Set(kept.map((c) => c.id));
  const seedsToAdd = SEED_PROJECTS.filter((p) => !keptIds.has(p.id));
  return { clients: [...kept, ...seedsToAdd] };
}

export const usePlanStore = create<PlanStoreState>()(
  persist(
    (set) => ({
      clients: SEED_PROJECTS,
      currentClientId: null,
      currentPlanId: null,
      ui: { sidebarCollapsed: false },
      wizard: emptyWizard(),

      addProject: (input) => {
        const id = uid("project");
        const now = new Date().toISOString();
        const newProject: ClientWorkspace = {
          id,
          name: input.name,
          website: input.website,
          industry: input.industry,
          currency: input.currency,
          projectGroup: input.projectGroup,
          projectContext: input.projectContext,
          defaultObjective: input.defaultObjective,
          defaultGeographyType: input.defaultGeographyType,
          createdAt: now,
          updatedAt: now,
          archived: false,
          plans: [],
          defaults: {
            preferredPlatforms: [],
            preferredGeographies: [],
            benchmarkOverrides: [],
          },
        };
        set((state) => ({
          clients: [...state.clients, newProject],
          currentClientId: id,
        }));
        return id;
      },

      updateProjectSettings: (id, patch) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
          ),
        })),

      archiveProject: (id) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, archived: true, updatedAt: new Date().toISOString() } : c
          ),
        })),

      unarchiveProject: (id) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, archived: false, updatedAt: new Date().toISOString() } : c
          ),
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

      setPlanNotes: (clientId, planId, notes) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  plans: c.plans.map((p) =>
                    p.id === planId ? { ...p, notes, updatedAt: new Date().toISOString() } : p
                  ),
                }
              : c
          ),
        })),

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
        set((state) => {
          const project = state.clients.find((c) => c.id === clientId);
          return {
            wizard: {
              ...emptyWizard(),
              planType,
              clientId,
              currency: currency || project?.currency || "INR",
              objective: project?.defaultObjective ?? "lead_gen",
              geographyPlanType: project?.defaultGeographyType ?? "india",
              funnelSplit:
                DEFAULT_FUNNEL_SPLIT[project?.defaultObjective ?? "lead_gen"],
              planningStart: fmt(start),
              planningEnd: fmt(end),
            },
          };
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
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        clients: state.clients,
        currentClientId: state.currentClientId,
        currentPlanId: state.currentPlanId,
        ui: state.ui,
      }),
      migrate: (persisted, fromVersion) => {
        if (fromVersion < 2) {
          const { clients } = migrateToV2(persisted);
          return {
            ...(persisted as object),
            clients,
            currentClientId: null,
            currentPlanId: null,
          };
        }
        return persisted as PlanStoreState;
      },
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
    budgetLocked: partial.budgetLocked ?? false,
    locations: partial.locations ?? [],
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
