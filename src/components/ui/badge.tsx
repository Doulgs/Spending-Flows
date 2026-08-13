import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border-primary-border bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:bg-surface-hover",
        destructive:
          "border-destructive-border bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive-hover",
        success: "border-success-border bg-success-subtle text-success",
        warning: "border-warning-border bg-warning-subtle text-warning",
        outline: "border-border-strong bg-surface text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
