import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectGroupLanding } from "@/pages/ProjectGroupLanding";
import { ProjectList } from "@/pages/ProjectList";
import { ProjectWorkspace } from "@/pages/ProjectWorkspace";
import { PlanTypeSelector } from "@/pages/PlanTypeSelector";
import { PlanningWizard } from "@/components/plan/PlanningWizard";
import { PlanWorkspace } from "@/pages/PlanWorkspace";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<ProjectGroupLanding />} />
        <Route path="/projects/:group" element={<ProjectList />} />
        {/* Path kept as /clients/* for back-compat; UI calls these "projects". */}
        <Route path="/clients/:clientId" element={<ProjectWorkspace />} />
        <Route path="/clients/:clientId/plans/new" element={<PlanTypeSelector />} />
        <Route path="/clients/:clientId/plans/new/wizard" element={<PlanningWizard />} />
        <Route path="/clients/:clientId/plans/:planId" element={<PlanWorkspace />} />
      </Route>
    </Routes>
  );
}
