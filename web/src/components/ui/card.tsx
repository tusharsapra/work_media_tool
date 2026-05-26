import * as React from "react";
import { cn } from "@/lib/utils";

type AccentColor = "cyan" | "purple" | "magenta" | "yellow" | "lime" | "none";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: AccentColor;
}

const accentClass: Record<AccentColor, string> = {
  cyan: "border-t-[3px] border-t-arm-cyan",
  purple: "border-t-[3px] border-t-arm-purple",
  magenta: "border-t-[3px] border-t-arm-magenta",
  yellow: "border-t-[3px] border-t-arm-yellow",
  lime: "border-t-[3px] border-t-arm-lime",
  none: "",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, accent = "none", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[16px] bg-card text-card-foreground border border-border shadow-card",
        accentClass[accent],
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-bold tracking-tight", className)} {...props} />
);

export const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 pb-6", className)} {...props} />
);

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center px-6 pb-6 pt-2 gap-3", className)} {...props} />
);
