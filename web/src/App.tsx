import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ClientHub } from "@/pages/ClientHub";
import { ClientWorkspace } from "@/pages/ClientWorkspace";
import { ClientProfileForm } from "@/components/client/ClientProfileForm";
import { PlanTypeSelector } from "@/pages/PlanTypeSelector";
import { PlanningWizard } from "@/components/plan/PlanningWizard";
import { PlanWorkspace } from "@/pages/PlanWorkspace";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<ClientHub />} />
        <Route path="/clients/new" element={<ClientProfileForm />} />
        <Route path="/clients/:clientId" element={<ClientWorkspace />} />
        <Route path="/clients/:clientId/plans/new" element={<PlanTypeSelector />} />
        <Route path="/clients/:clientId/plans/new/wizard" element={<PlanningWizard />} />
        <Route path="/clients/:clientId/plans/:planId" element={<PlanWorkspace />} />
      </Route>
    </Routes>
  );
}
