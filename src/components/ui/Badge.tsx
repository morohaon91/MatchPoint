import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { SportType } from "@/lib/types/models";

// Define badge variants using class-variance-authority
const badgeVariants = cva(
  // Base styles applied to all badges
  "inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      // Badge variants (primary, secondary, outline, etc.)
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        primary: "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        success: "bg-success text-success-foreground hover:bg-success/80",
        error: "bg-error text-error-foreground hover:bg-error/80",
        warning: "bg-warning text-warning-foreground hover:bg-warning/80",
        info: "bg-info text-info-foreground hover:bg-info/80",
        outline:
          "text-foreground border border-border bg-transparent hover:bg-muted",
        ghost: "hover:bg-muted",
      },
      // Badge sizes
      size: {
        xs: "text-xs px-1.5 py-0.5",
        sm: "text-xs px-2.5 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-sm px-4 py-1.5",
      },
      // Whether the badge has a dot indicator
      withDot: {
        true: "pl-2",
      },
      // Sport-specific theming
      sportType: {
        tennis: "data-sport-tennis",
        basketball: "data-sport-basketball",
        soccer: "data-sport-soccer",
        volleyball: "data-sport-volleyball",
        baseball: "data-sport-baseball",
      },
    },
    // Default variants
    defaultVariants: {
      variant: "default",
      size: "md",
    },
    // Compound variants for more complex combinations
    compoundVariants: [
      // Sport-specific badge styles
      {
        sportType: "tennis",
        variant: "primary",
        className:
          "bg-sport-tennis-primary text-white hover:bg-sport-tennis-primary/80",
      },
      {
        sportType: "basketball",
        variant: "primary",
        className:
          "bg-sport-basketball-primary text-white hover:bg-sport-basketball-primary/80",
      },
      {
        sportType: "soccer",
        variant: "primary",
        className:
          "bg-sport-soccer-primary text-white hover:bg-sport-soccer-primary/80",
      },
      {
        sportType: "volleyball",
        variant: "primary",
        className:
          "bg-sport-volleyball-primary text-white hover:bg-sport-volleyball-primary/80",
      },
      {
        sportType: "baseball",
        variant: "primary",
        className:
          "bg-sport-baseball-primary text-white hover:bg-sport-baseball-primary/80",
      },
    ],
  },
);

// Define the Badge component props
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof badgeVariants>, "sportType"> {
  sportType?:
    | SportType
    | "tennis"
    | "basketball"
    | "soccer"
    | "volleyball"
    | "baseball";
}

/**
 * Badge component with variants and sport-specific theming
 */
const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    { className, variant, size, withDot, sportType, children, ...props },
    ref,
  ) => {
    // Map SportType enum to the sportType variant if needed
    let mappedSportType:
      | "tennis"
      | "basketball"
      | "soccer"
      | "volleyball"
      | "baseball"
      | undefined;

    if (sportType) {
      const sportTypeLower = sportType.toString().toLowerCase();
      if (
        ["tennis", "basketball", "soccer", "volleyball", "baseball"].includes(
          sportTypeLower,
        )
      ) {
        mappedSportType = sportTypeLower as
          | "tennis"
          | "basketball"
          | "soccer"
          | "volleyball"
          | "baseball";
      }
    }

    return (
      <div
        className={cn(
          badgeVariants({
            variant,
            size,
            withDot,
            sportType: mappedSportType,
            className,
          }),
        )}
        ref={ref}
        {...props}
      >
        {withDot && (
          <span
            className={cn(
              "mr-1 h-2 w-2 rounded-full",
              variant === "outline" ? "bg-current" : "bg-current opacity-80",
            )}
          />
        )}
        {children}
      </div>
    );
  },
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
