import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Currency, GeographyPlanType, Objective, ProjectGroup } from "@mpa/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { CURRENCIES, INDUSTRIES, OBJECTIVES } from "@/data/defaults";
import { usePlanStore } from "@/store/usePlanStore";

const NONE = "__none__";

export function AddProjectModal({
  open,
  onOpenChange,
  defaultGroup,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultGroup?: ProjectGroup;
}) {
  const navigate = useNavigate();
  const addProject = usePlanStore((s) => s.addProject);

  const [name, setName] = useState("");
  const [group, setGroup] = useState<ProjectGroup>(defaultGroup ?? "non_bajaj");
  const [industry, setIndustry] = useState<string>(INDUSTRIES[0]);
  const [website, setWebsite] = useState("");
  const [currency, setCurrency] = useState<string>(NONE);
  const [geoType, setGeoType] = useState<GeographyPlanType>("india");
  const [context, setContext] = useState("");
  const [objective, setObjective] = useState<string>(NONE);

  const reset = () => {
    setName("");
    setGroup(defaultGroup ?? "non_bajaj");
    setIndustry(INDUSTRIES[0]);
    setWebsite("");
    setCurrency(NONE);
    setGeoType("india");
    setContext("");
    setObjective(NONE);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const id = addProject({
      name: name.trim(),
      projectGroup: group,
      industry,
      website: website.trim() || undefined,
      currency: currency === NONE ? undefined : (currency as Currency),
      defaultGeographyType: geoType,
      projectContext: context.trim() || undefined,
      defaultObjective: objective === NONE ? undefined : (objective as Objective),
    });
    onOpenChange(false);
    reset();
    navigate(`/clients/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add project</DialogTitle>
          <DialogDescription>
            Create a new project workspace under Bajaj or Non-Bajaj. You can edit everything later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Project name *</Label>
            <Input
              id="p-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Niva Bupa"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Group</Label>
              <Select value={group} onValueChange={(v) => setGroup(v as ProjectGroup)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bajaj">Bajaj</SelectItem>
                  <SelectItem value="non_bajaj">Non-Bajaj</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Industry / category</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-web">Website (optional)</Label>
            <Input
              id="p-web"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default currency (optional)</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Set later" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Set later</SelectItem>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default geography</Label>
              <Select value={geoType} onValueChange={(v) => setGeoType(v as GeographyPlanType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Default objective (optional)</Label>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger>
                <SelectValue placeholder="Set later" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Set later</SelectItem>
                {OBJECTIVES.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-context">Project context / notes</Label>
            <Textarea
              id="p-context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Short description of the project, category focus, or planning context."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
