import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Currency } from "@mpa/shared";
import { CURRENCIES, INDUSTRIES } from "@/data/defaults";
import { usePlanStore } from "@/store/usePlanStore";
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

export function ClientProfileForm() {
  const navigate = useNavigate();
  const addClient = usePlanStore((s) => s.addClient);

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState<string>(INDUSTRIES[0]);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const id = addClient({
      name: name.trim(),
      website: website.trim() || undefined,
      industry,
      currency,
    });
    navigate(`/clients/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">New client</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new client workspace. You can add plans and assumptions next.
        </p>
      </div>
      <Card accent="cyan">
        <CardHeader>
          <CardTitle>Client profile</CardTitle>
          <CardDescription>Basic information that will appear across plans and exports.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Client name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Northshore Credit Co."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website (optional)</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry</Label>
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
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting || !name.trim()}>
                Create client
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
