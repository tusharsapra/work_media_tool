import { Link } from "react-router-dom";
import { Building2, Globe, FileText } from "lucide-react";
import type { ClientWorkspace } from "@mpa/shared";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ClientCard({ client }: { client: ClientWorkspace }) {
  const planCount = client.plans.length;
  return (
    <Link to={`/clients/${client.id}`} className="block group">
      <Card
        accent="cyan"
        className="p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(17,17,17,0.08)] cursor-pointer h-full"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
              {client.name}
            </h3>
            {client.industry && (
              <Badge variant="muted" className="mt-2">
                <Building2 className="h-3 w-3" />
                {client.industry}
              </Badge>
            )}
          </div>
          <Badge variant="default">{client.currency}</Badge>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          {client.website && (
            <div className="flex items-center gap-2 truncate">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{client.website.replace(/^https?:\/\//, "")}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span>
              {planCount} {planCount === 1 ? "plan" : "plans"}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
