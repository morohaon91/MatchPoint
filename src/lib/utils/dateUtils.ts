/**
 * Format a date to a human-readable format
 *
 * @param dateInput - The date to format (can be string, Date, or Firestore Timestamp)
 * @returns A formatted date string (e.g., "Monday, January 1, 2023")
 */
export function formatDate(dateInput: any): string {
  if (!dateInput) return "";

  let date: Date;

  // Handle different date input types
  if (typeof dateInput === "string") {
    date = new Date(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else if (dateInput && typeof dateInput.toDate === "function") {
    // Handle Firestore Timestamp
    date = dateInput.toDate();
  } else {
    return "";
  }

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
 * Check if a date is in the past
 *
 * @param dateInput - The date to check (can be string, Date, or Firestore Timestamp)
 * @returns True if the date is in the past, false otherwise
 */
export function isDateInPast(dateInput: string | Date): boolean {
  if (!dateInput) return false;

  let date: Date;

  // Handle different date input types
  if (typeof dateInput === "string") {
    date = new Date(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return false;
  }

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  return date < now;
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
