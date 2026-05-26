import { Link } from "react-router-dom";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClientCard } from "@/components/client/ClientCard";
import { usePlanStore } from "@/store/usePlanStore";

export function ClientHub() {
  const clients = usePlanStore((s) => s.clients.filter((c) => !c.archived));

  if (clients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card accent="cyan" className="max-w-xl p-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">ARM Media Planning OS</h2>
          <p className="text-muted-foreground mb-6">
            Create, forecast, analyze, and export client-ready media plans with structured
            planning intelligence.
          </p>
          <Button asChild size="lg">
            <Link to="/clients/new">Start Planning</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Start building your first ARM media plan, or open an existing client workspace.
          </p>
        </div>
        <Button asChild>
          <Link to="/clients/new">
            <Plus className="h-4 w-4" />
            New client
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  );
}
