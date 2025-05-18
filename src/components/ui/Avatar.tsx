import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { SportType } from "@/lib/types/models";

// Define avatar variants using class-variance-authority
const avatarVariants = cva(
  // Base styles applied to all avatars
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      // Avatar sizes
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-sm",
        md: "h-10 w-10 text-base",
        lg: "h-12 w-12 text-lg",
        xl: "h-16 w-16 text-xl",
        "2xl": "h-20 w-20 text-2xl",
      },
      // Avatar status (online, offline, etc.)
      status: {
        online:
          "after:absolute after:bottom-0 after:right-0 after:h-2 after:w-2 after:rounded-full after:bg-success after:ring-1 after:ring-white",
        offline:
          "after:absolute after:bottom-0 after:right-0 after:h-2 after:w-2 after:rounded-full after:bg-neutral-400 after:ring-1 after:ring-white",
        busy: "after:absolute after:bottom-0 after:right-0 after:h-2 after:w-2 after:rounded-full after:bg-error after:ring-1 after:ring-white",
        away: "after:absolute after:bottom-0 after:right-0 after:h-2 after:w-2 after:rounded-full after:bg-warning after:ring-1 after:ring-white",
      },
      // Whether the avatar has a border
      withBorder: {
        true: "ring-2 ring-white",
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
      size: "md",
    },
    // Compound variants for more complex combinations
    compoundVariants: [
      // Sport-specific avatar styles
      {
        sportType: "tennis",
        withBorder: true,
        className: "ring-sport-tennis-primary/20",
      },
      {
        sportType: "basketball",
        withBorder: true,
        className: "ring-sport-basketball-primary/20",
      },
      {
        sportType: "soccer",
        withBorder: true,
        className: "ring-sport-soccer-primary/20",
      },
      {
        sportType: "volleyball",
        withBorder: true,
        className: "ring-sport-volleyball-primary/20",
      },
      {
        sportType: "baseball",
        withBorder: true,
        className: "ring-sport-baseball-primary/20",
      },
    ],
  },
);

// Define avatar image variants
const avatarImageVariants = cva(
  // Base styles applied to all avatar images
  "aspect-square h-full w-full",
  {
    variants: {
      // Avatar image fit
      fit: {
        cover: "object-cover",
        contain: "object-contain",
        fill: "object-fill",
      },
    },
    // Default variants
    defaultVariants: {
      fit: "cover",
    },
  },
);

// Define avatar fallback variants
const avatarFallbackVariants = cva(
  // Base styles applied to all avatar fallbacks
  "flex h-full w-full items-center justify-center rounded-full bg-muted",
  {
    variants: {
      // Sport-specific theming
      sportType: {
        tennis: "bg-sport-tennis-primary/10 text-sport-tennis-primary",
        basketball:
          "bg-sport-basketball-primary/10 text-sport-basketball-primary",
        soccer: "bg-sport-soccer-primary/10 text-sport-soccer-primary",
        volleyball:
          "bg-sport-volleyball-primary/10 text-sport-volleyball-primary",
        baseball: "bg-sport-baseball-primary/10 text-sport-baseball-primary",
      },
    },
  },
);

// Define avatar group variants
const avatarGroupVariants = cva(
  // Base styles applied to all avatar groups
  "flex",
  {
    variants: {
      // Avatar group spacing
      spacing: {
        tight: "-space-x-2",
        normal: "-space-x-1",
        loose: "space-x-1",
      },
      // Avatar group direction
      direction: {
        row: "flex-row",
        column: "flex-col",
      },
    },
    // Default variants
    defaultVariants: {
      spacing: "normal",
      direction: "row",
    },
  },
);

// Define the Avatar component props
export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof avatarVariants>, "sportType"> {
  sportType?:
    | SportType
    | "tennis"
    | "basketball"
    | "soccer"
    | "volleyball"
    | "baseball";
}

// Define the AvatarImage component props
export interface AvatarImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement>,
    VariantProps<typeof avatarImageVariants> {}

// Define the AvatarFallback component props
export interface AvatarFallbackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof avatarFallbackVariants>, "sportType"> {
  sportType?:
    | SportType
    | "tennis"
    | "basketball"
    | "soccer"
    | "volleyball"
    | "baseball";
}

// Define the AvatarGroup component props
export interface AvatarGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarGroupVariants> {
  limit?: number;
  size?: VariantProps<typeof avatarVariants>["size"];
}

/**
 * Avatar component with variants and sport-specific theming
 */
const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, status, withBorder, sportType, ...props }, ref) => {
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
          avatarVariants({
            size,
            status,
            withBorder,
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

Avatar.displayName = "Avatar";

/**
 * AvatarImage component for displaying an image in an avatar
 */
const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, fit, alt, ...props }, ref) => {
    return (
      <img
        className={cn(avatarImageVariants({ fit, className }))}
        ref={ref}
        alt={alt}
        {...props}
      />
    );
  },
);

AvatarImage.displayName = "AvatarImage";

/**
 * AvatarFallback component for displaying a fallback when an image is not available
 */
const AvatarFallback = forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, sportType, ...props }, ref) => {
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
          avatarFallbackVariants({ sportType: mappedSportType, className }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

AvatarFallback.displayName = "AvatarFallback";

/**
 * AvatarGroup component for displaying a group of avatars
 */
const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, spacing, direction, limit, size, children, ...props }, ref) => {
    // Clone children to add size prop
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = limit
      ? childrenArray.slice(0, limit)
      : childrenArray;
    const remainingCount = limit ? childrenArray.length - limit : 0;

    const sizedChildren = visibleChildren.map((child) => {
      if (React.isValidElement(child) && size) {
        return React.cloneElement(child, { size } as any);
      }
      return child;
    });

    return (
      <div
        className={cn(avatarGroupVariants({ spacing, direction, className }))}
        ref={ref}
        {...props}
      >
        {sizedChildren}

        {/* Show count of remaining avatars if limit is set */}
        {remainingCount > 0 && (
          <Avatar size={size}>
            <AvatarFallback>+{remainingCount}</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  },
);

AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup };
