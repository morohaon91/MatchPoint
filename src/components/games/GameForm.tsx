"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { Game, GameStatus, RecurringSeries } from "@/lib/types/models"; // Assuming RecurringSeries is here or import separately

// Extended interface for form data, including recurring details
interface GameFormData
  extends Partial<
    Omit<
      Game,
      | "date"
      | "createdAt"
      | "groupId"
      | "currentParticipants"
      | "status"
      | "createdBy"
    >
  > {
  date?: string; // Keep date as string for input
  startTime?: string;
  endTime?: string;
  // Fields for recurring series, if applicable
  recurringFrequency?: RecurringSeries["frequency"];
  recurringDayOfWeek?: RecurringSeries["dayOfWeek"]; // 0-6 for Sunday-Saturday
  recurringEndDate?: string; // Date string
  recurringOccurrences?: number;
  recurringEndType?: "date" | "occurrences";
}

interface GameFormProps {
  groupId: string; // groupId is now a required prop
  initialData?: Partial<GameFormData>;
  onSubmit: (
    data: GameFormData,
    isRecurring: boolean,
    recurringDetails?: Partial<RecurringSeries>,
  ) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const weekDays = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

// Initializer function for useState - defined outside the component
const getInitialFormData = (initData: Partial<GameFormData>): GameFormData => {
  const defaultDate = initData.date || new Date().toISOString().split("T")[0];
  const defaultDayOfWeek =
    initData.recurringDayOfWeek !== undefined
      ? initData.recurringDayOfWeek
      : new Date(defaultDate).getDay();

  return {
    title: "",
    description: "",
    location: "",
    maxParticipants: 0,
    isRecurring: false,
    recurringFrequency: "weekly",
    recurringEndType: "date",
    recurringOccurrences: 10,
    ...initData, // Spread initialData to override defaults
    date: defaultDate,
    startTime: initData.startTime || "",
    endTime: initData.endTime || "",
    recurringDayOfWeek: defaultDayOfWeek,
    recurringEndDate: initData.recurringEndDate || "",
  };
};

export default function GameForm({
  groupId,
  initialData = {}, // Default to empty object
  onSubmit,
  onCancel,
  isSubmitting = false,
}: GameFormProps) {
  const [formData, setFormData] = useState<GameFormData>(() =>
    getInitialFormData(initialData),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // This useEffect is to reset the form if initialData prop *itself* changes
  // (e.g. navigating between editing different games, if the form isn't unmounted).
  // It depends on initialData.id to avoid re-running for new game creation where initialData is {}.
  useEffect(() => {
    // Only re-initialize if initialData changes, indicating a different record is being edited.
    // For new games, initialData.id is undefined, so this effect won't run after the initial mount's useState initializer.
    setFormData(getInitialFormData(initialData));
  }, [initialData]); // Include initialData to satisfy the exhaustive-deps rule

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title?.trim()) newErrors.title = "Game title is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (
      formData.endTime &&
      formData.startTime &&
      formData.endTime <= formData.startTime
    ) {
      newErrors.endTime = "End time must be after start time";
    }
    if (!formData.location?.trim()) newErrors.location = "Location is required";
    if (
      formData.maxParticipants !== undefined &&
      formData.maxParticipants < 0
    ) {
      newErrors.maxParticipants = "Max participants cannot be negative";
    }

    if (formData.isRecurring) {
      if (!formData.recurringFrequency)
        newErrors.recurringFrequency = "Frequency is required";
      if (
        formData.recurringFrequency === "weekly" ||
        formData.recurringFrequency === "biweekly"
      ) {
        if (formData.recurringDayOfWeek === undefined)
          newErrors.recurringDayOfWeek = "Day of week is required";
      }
      if (formData.recurringEndType === "date" && !formData.recurringEndDate) {
        newErrors.recurringEndDate =
          "End date is required for recurring series ending on a specific date.";
      } else if (
        formData.recurringEndType === "date" &&
        formData.recurringEndDate &&
        formData.date &&
        formData.recurringEndDate < formData.date
      ) {
        newErrors.recurringEndDate =
          "Recurring end date cannot be before the first game date.";
      }
      if (
        formData.recurringEndType === "occurrences" &&
        (!formData.recurringOccurrences || formData.recurringOccurrences <= 0)
      ) {
        newErrors.recurringOccurrences =
          "Number of occurrences must be greater than 0.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      let recurringDetails: Partial<RecurringSeries> | undefined = undefined;
      if (formData.isRecurring) {
        recurringDetails = {
          groupId,
          frequency: formData.recurringFrequency!,
          // timeOfDay will be derived from startTime in the API
          startDate: formData.date, // Will be converted to Timestamp in API
          dayOfWeek:
            formData.recurringFrequency === "weekly" ||
            formData.recurringFrequency === "biweekly"
              ? formData.recurringDayOfWeek
              : undefined,
          endDate:
            formData.recurringEndType === "date"
              ? formData.recurringEndDate
              : undefined, // Will be converted to Timestamp
          // occurrences are handled by creating games, not stored directly in RecurringSeries model as per current model
        };
      }
      // Remove recurring-specific fields not part of the Game model from the main formData payload
      const {
        recurringFrequency,
        recurringDayOfWeek,
        recurringEndDate,
        recurringOccurrences,
        recurringEndType,
        ...gameData
      } = formData;

      onSubmit(gameData, !!formData.isRecurring, recurringDetails);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 p-4 sm:p-6 bg-white shadow-lg rounded-xl"
    >
      {/* Section 1: Basic Info */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Game Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Game Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.title ? "border-red-500" : ""}`}
              placeholder="e.g., Weekly Kickabout, Tennis Tuesday"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Optional: Add any details like skill level, what to bring, etc."
          />
        </div>
      </section>

      {/* Section 2: Time & Location */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Time & Location
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date || ""}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.date ? "border-red-500" : ""}`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime || ""}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.startTime ? "border-red-500" : ""}`}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime || ""}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.endTime ? "border-red-500" : ""}`}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location || ""}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.location ? "border-red-500" : ""}`}
              placeholder="e.g., Central Park Pitch 5"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Game Settings */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Settings
        </h2>
        <div>
          <label
            htmlFor="maxParticipants"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Maximum Participants
          </label>
          <input
            type="number"
            id="maxParticipants"
            name="maxParticipants"
            value={
              formData.maxParticipants === undefined
                ? ""
                : formData.maxParticipants
            }
            onChange={handleChange}
            min="0"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.maxParticipants ? "border-red-500" : ""}`}
            placeholder="0 for unlimited"
          />
          {errors.maxParticipants && (
            <p className="mt-1 text-sm text-red-600">
              {errors.maxParticipants}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Set to 0 or leave empty for unlimited participants.
          </p>
        </div>
      </section>

      {/* Section 4: Recurring Options */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Recurring Game
        </h2>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isRecurring"
            name="isRecurring"
            checked={!!formData.isRecurring}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="isRecurring"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            This is a recurring game
          </label>
        </div>

        {formData.isRecurring && (
          <div className="mt-4 pl-4 sm:pl-6 border-l-2 border-blue-500 space-y-4 py-4">
            <div>
              <label
                htmlFor="recurringFrequency"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Frequency <span className="text-red-500">*</span>
              </label>
              <select
                id="recurringFrequency"
                name="recurringFrequency"
                value={formData.recurringFrequency || "weekly"}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.recurringFrequency ? "border-red-500" : ""}`}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly (Every 2 Weeks)</option>
                <option value="monthly">Monthly</option>
              </select>
              {errors.recurringFrequency && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.recurringFrequency}
                </p>
              )}
            </div>

            {(formData.recurringFrequency === "weekly" ||
              formData.recurringFrequency === "biweekly") && (
              <div>
                <label
                  htmlFor="recurringDayOfWeek"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Day of the Week <span className="text-red-500">*</span>
                </label>
                <select
                  id="recurringDayOfWeek"
                  name="recurringDayOfWeek"
                  value={
                    formData.recurringDayOfWeek === undefined
                      ? ""
                      : formData.recurringDayOfWeek
                  }
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.recurringDayOfWeek ? "border-red-500" : ""}`}
                >
                  {weekDays.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                {errors.recurringDayOfWeek && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.recurringDayOfWeek}
                  </p>
                )}
              </div>
            )}

            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">
                Ends
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="recurringEndTypeDate"
                    name="recurringEndType"
                    value="date"
                    checked={formData.recurringEndType === "date"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="recurringEndTypeDate"
                    className="ml-2 text-sm text-gray-700"
                  >
                    On date
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="recurringEndTypeOccurrences"
                    name="recurringEndType"
                    value="occurrences"
                    checked={formData.recurringEndType === "occurrences"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="recurringEndTypeOccurrences"
                    className="ml-2 text-sm text-gray-700"
                  >
                    After occurrences
                  </label>
                </div>
              </div>
            </div>

            {formData.recurringEndType === "date" && (
              <div>
                <label
                  htmlFor="recurringEndDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="recurringEndDate"
                  name="recurringEndDate"
                  value={formData.recurringEndDate || ""}
                  onChange={handleChange}
                  min={formData.date} // Recurring end date cannot be before the first game date
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.recurringEndDate ? "border-red-500" : ""}`}
                />
                {errors.recurringEndDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.recurringEndDate}
                  </p>
                )}
              </div>
            )}

            {formData.recurringEndType === "occurrences" && (
              <div>
                <label
                  htmlFor="recurringOccurrences"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Number of Occurrences <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="recurringOccurrences"
                  name="recurringOccurrences"
                  value={
                    formData.recurringOccurrences === undefined
                      ? ""
                      : formData.recurringOccurrences
                  }
                  onChange={handleChange}
                  min="1"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.recurringOccurrences ? "border-red-500" : ""}`}
                  placeholder="e.g., 10"
                />
                {errors.recurringOccurrences && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.recurringOccurrences}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Submit/Cancel Buttons */}
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t mt-8">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : initialData?.id
              ? "Update Game"
              : "Create Game"}
        </button>
      </div>
    </form>
  );
}
