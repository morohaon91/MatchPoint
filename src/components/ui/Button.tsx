import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { SportType } from "@/lib/types/models";

// Define button variants using class-variance-authority
const buttonVariants = cva(
  // Base styles applied to all buttons
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      // Button variants (primary, secondary, outline, etc.)
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        success: "bg-success text-success-foreground hover:bg-success/90",
        error: "bg-error text-error-foreground hover:bg-error/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        info: "bg-info text-info-foreground hover:bg-info/90",
        outline:
          "border border-input bg-background hover:bg-muted hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      // Button sizes
      size: {
        xs: "h-8 px-2.5 text-xs",
        sm: "h-9 px-3",
        md: "h-10 px-4 py-2",
        lg: "h-11 px-5 py-2",
        xl: "h-12 px-6 py-2.5",
        icon: "h-10 w-10",
      },
      // Whether the button is full width
      fullWidth: {
        true: "w-full",
      },
      // Whether the button is rounded
      rounded: {
        true: "rounded-full",
      },
      // Whether the button is loading
      isLoading: {
        true: "relative text-transparent transition-none hover:text-transparent",
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
      // Sport-specific button styles
      {
        sportType: "tennis",
        variant: "primary",
        className:
          "bg-sport-tennis-primary text-white hover:bg-sport-tennis-primary/90",
      },
      {
        sportType: "basketball",
        variant: "primary",
        className:
          "bg-sport-basketball-primary text-white hover:bg-sport-basketball-primary/90",
      },
      {
        sportType: "soccer",
        variant: "primary",
        className:
          "bg-sport-soccer-primary text-white hover:bg-sport-soccer-primary/90",
      },
      {
        sportType: "volleyball",
        variant: "primary",
        className:
          "bg-sport-volleyball-primary text-white hover:bg-sport-volleyball-primary/90",
      },
      {
        sportType: "baseball",
        variant: "primary",
        className:
          "bg-sport-baseball-primary text-white hover:bg-sport-baseball-primary/90",
      },
      // Sport-specific outline button styles
      {
        sportType: "tennis",
        variant: "outline",
        className:
          "border-sport-tennis-primary text-sport-tennis-primary hover:bg-sport-tennis-primary/10 hover:text-sport-tennis-primary",
      },
      {
        sportType: "basketball",
        variant: "outline",
        className:
          "border-sport-basketball-primary text-sport-basketball-primary hover:bg-sport-basketball-primary/10 hover:text-sport-basketball-primary",
      },
      {
        sportType: "soccer",
        variant: "outline",
        className:
          "border-sport-soccer-primary text-sport-soccer-primary hover:bg-sport-soccer-primary/10 hover:text-sport-soccer-primary",
      },
      {
        sportType: "volleyball",
        variant: "outline",
        className:
          "border-sport-volleyball-primary text-sport-volleyball-primary hover:bg-sport-volleyball-primary/10 hover:text-sport-volleyball-primary",
      },
      {
        sportType: "baseball",
        variant: "outline",
        className:
          "border-sport-baseball-primary text-sport-baseball-primary hover:bg-sport-baseball-primary/10 hover:text-sport-baseball-primary",
      },
    ],
  },
);

// Define the Button component props
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonVariants>, "sportType" | "isLoading"> {
  sportType?:
    | SportType
    | "tennis"
    | "basketball"
    | "soccer"
    | "volleyball"
    | "baseball";
  isLoading?: boolean;
  loadingText?: string;
}

/**
 * Button component with variants and sport-specific theming
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      rounded,
      sportType,
      isLoading = false,
      loadingText,
      children,
      ...props
    },
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
      <button
        className={cn(
          buttonVariants({
            variant,
            size,
            fullWidth,
            rounded,
            isLoading,
            sportType: mappedSportType,
            className,
          }),
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {children}

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText && <span className="ml-2">{loadingText}</span>}
          </div>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
