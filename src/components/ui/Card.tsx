import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { SportType } from "@/lib/types/models";

// Define card variants using class-variance-authority
const cardVariants = cva(
  // Base styles applied to all cards
  "rounded-lg overflow-hidden transition-all duration-300",
  {
    variants: {
      // Card variants (default, elevated, outline, etc.)
      variant: {
        default: "bg-card text-card-foreground",
        elevated: "bg-card text-card-foreground shadow-md",
        outline: "bg-card text-card-foreground border border-border",
        ghost: "hover:bg-muted/50",
      },
      // Whether the card is hoverable
      isHoverable: {
        true: "hover:shadow-card-hover hover:-translate-y-1",
      },
      // Whether the card is interactive
      isInteractive: {
        true: "cursor-pointer active:scale-[0.98] active:shadow-sm",
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
    },
    // Compound variants for more complex combinations
    compoundVariants: [
      // Sport-specific card styles
      {
        sportType: "tennis",
        variant: "elevated",
        className: "border-t-4 border-t-sport-tennis-primary",
      },
      {
        sportType: "basketball",
        variant: "elevated",
        className: "border-t-4 border-t-sport-basketball-primary",
      },
      {
        sportType: "soccer",
        variant: "elevated",
        className: "border-t-4 border-t-sport-soccer-primary",
      },
      {
        sportType: "volleyball",
        variant: "elevated",
        className: "border-t-4 border-t-sport-volleyball-primary",
      },
      {
        sportType: "baseball",
        variant: "elevated",
        className: "border-t-4 border-t-sport-baseball-primary",
      },
    ],
  },
);

// Define the Card component props
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof cardVariants>, "sportType"> {
  sportType?:
    | SportType
    | "tennis"
    | "basketball"
    | "soccer"
    | "volleyball"
    | "baseball";
}

/**
 * Card component with variants and sport-specific theming
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant, isHoverable, isInteractive, sportType, ...props },
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
          cardVariants({
            variant,
            isHoverable,
            isInteractive,
            sportType: mappedSportType,
            className,
          }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";

/**
 * CardHeader component for the top section of a card
 */
const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

/**
 * CardTitle component for the card title
 */
const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

/**
 * CardDescription component for the card description
 */
const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

CardDescription.displayName = "CardDescription";

/**
 * CardContent component for the main content of a card
 */
const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));

CardContent.displayName = "CardContent";

/**
 * CardFooter component for the bottom section of a card
 */
const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { withBorder?: boolean }
>(({ className, withBorder = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      withBorder && "border-t border-border pt-4 mt-4",
      className,
    )}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};
