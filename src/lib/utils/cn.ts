import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 *
 * This function combines clsx and tailwind-merge to provide a convenient way
 * to conditionally apply Tailwind CSS classes and resolve conflicts.
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 *
 * @example
 * // Basic usage
 * cn('px-4 py-2', 'bg-blue-500');
 * // => 'px-4 py-2 bg-blue-500'
 *
 * @example
 * // With conditional classes
 * cn('px-4 py-2', isActive && 'bg-blue-500', !isActive && 'bg-gray-500');
 * // => 'px-4 py-2 bg-blue-500' or 'px-4 py-2 bg-gray-500'
 *
 * @example
 * // Resolving conflicts
 * cn('px-4 py-2', 'px-8');
 * // => 'py-2 px-8'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
