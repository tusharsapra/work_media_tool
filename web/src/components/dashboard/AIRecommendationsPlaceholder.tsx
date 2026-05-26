import { Sparkles, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AIRecommendationsPlaceholder() {
  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
        AI Recommendations
      </div>
      <Card accent="purple">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-ai/10 text-ai h-10 w-10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold tracking-tight">Strategic recommendations</h3>
                <Badge variant="ai">
                  <Sparkles className="h-3 w-3" />
                  AI
                </Badge>
                <Badge variant="muted">
                  <Lock className="h-3 w-3" />
                  Phase 3
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Claude-generated platform, budget, geography, funnel, and audience recommendations
                will appear here once the LLM layer lands in Phase 3. The app is currently in Mock
                AI mode — rule-based budget warnings already inform the planning surface.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
