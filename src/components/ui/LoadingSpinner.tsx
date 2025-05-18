import React from "react";
import { cn } from "@/lib/utils/cn";

export interface SVGProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const LoadingSpinner = ({ size = 24, className, ...props }: SVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin text-primary", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

export { LoadingSpinner };
