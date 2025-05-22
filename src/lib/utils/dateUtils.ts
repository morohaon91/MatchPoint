import { Timestamp } from "firebase/firestore";

/**
 * Converts various date formats to a JavaScript Date object
 * @param value - The value to convert (Timestamp, string, Date, or undefined)
 * @returns A JavaScript Date object, or undefined if the input is invalid/undefined
 */
export function convertToDate(value: Timestamp | Date | string | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  return undefined;
}

/**
 * Formats a date for display using the specified options
 * @param value - The date value to format
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns A formatted date string, or undefined if the input is invalid
 */
export function formatDate(
  value: Timestamp | Date | string | undefined,
  options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }
): string | undefined {
  const date = convertToDate(value);
  if (!date) return undefined;
  return date.toLocaleString(undefined, options);
}

/**
 * Checks if a date is in the past
 * @param value - The date value to check
 * @returns true if the date is in the past, false otherwise
 */
export function isDateInPast(value: Timestamp | Date | string | undefined): boolean {
  const date = convertToDate(value);
  if (!date) return false;
  return date < new Date();
}

/**
 * Checks if a date is in the future
 * @param value - The date value to check
 * @returns true if the date is in the future, false otherwise
 */
export function isDateInFuture(value: Timestamp | Date | string | undefined): boolean {
  const date = convertToDate(value);
  if (!date) return false;
  return date > new Date();
}

/**
 * Format a time string to a human-readable format
 *
 * @param timeString - The time string to format (e.g., "14:30" or "14:30:00")
 * @returns A formatted time string (e.g., "2:30 PM")
 */
export function formatTime(timeString: any): string {
  if (!timeString) return "";

  // Handle different time formats
  let hours: number;
  let minutes: number;

  // Check if the time is in HH:MM:SS format
  if (typeof timeString === "string" && timeString.includes(":")) {
    const [hoursStr, minutesStr] = timeString.split(":");
    hours = parseInt(hoursStr, 10);
    minutes = parseInt(minutesStr, 10);
  } else {
    // Assume it's a timestamp or other format
    const date = new Date(timeString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    hours = date.getHours();
    minutes = date.getMinutes();
  }

  // Format to 12-hour time with AM/PM
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes} ${period}`;
}

/**
 * Format a date and time together
 *
 * @param dateString - The date string to format
 * @param timeString - The time string to format
 * @returns A formatted date and time string (e.g., "Monday, January 1, 2023 at 2:30 PM")
 */
export function formatDateTime(dateString: string, timeString: string): string {
  const formattedDate = formatDate(dateString);
  const formattedTime = formatTime(timeString);

  if (!formattedDate || !formattedTime) {
    return formattedDate || formattedTime;
  }

  return `${formattedDate} at ${formattedTime}`;
}

/**
 * Get the day of the week from a date string
 *
 * @param dateString - The date string to get the day from
 * @returns The day of the week (e.g., "Monday")
 */
export function getDayOfWeek(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", { weekday: "long" });
}
