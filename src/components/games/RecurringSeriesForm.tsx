"use client";

import React, { useState, useEffect } from "react";
import { RecurringSeries } from "@/lib/types/models";

interface RecurringSeriesFormProps {
  initialData?: Partial<RecurringSeries>;
  onSubmit: (data: Partial<RecurringSeries>) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  groupId: string;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const FREQUENCY_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];
const REQUIRED_FIELDS = [
  { key: "frequency", message: "Frequency is required" },
  { key: "startDate", message: "Start date is required" },
  { key: "dayOfWeek", message: "Day of week is required" },
];

const getDefaultFormData = (
  initialData: Partial<RecurringSeries>,
  groupId: string
): Partial<RecurringSeries> => ({
  groupId,
  frequency: "weekly",
  dayOfWeek: new Date().getDay(),
  startDate: new Date().toISOString().split("T")[0],
  ...initialData,
});

const inputClassName = (hasError: boolean) =>
  `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
    hasError ? "border-red-500" : ""
  }`;

export default function RecurringSeriesForm({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  groupId,
}: RecurringSeriesFormProps) {
  const [formData, setFormData] = useState<Partial<RecurringSeries>>(
    getDefaultFormData(initialData, groupId)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(getDefaultFormData(initialData, groupId));
  }, [initialData, groupId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const processedValue =
      type === "number" ? (value === "" ? undefined : Number(value)) : value;

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors = REQUIRED_FIELDS.reduce((acc, { key, message }) => {
      if (!formData[key as keyof typeof formData]) acc[key] = message;
      return acc;
    }, {} as Record<string, string>);

    setErrors(newErrors);
    return !Object.keys(newErrors).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) onSubmit(formData);
  };

  const formatTimeValue = (dateString?: string) =>
    dateString
      ? new Date(dateString).toISOString().split("T")[1].substring(0, 5)
      : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Frequency Field */}
      <div>
        <label
          htmlFor="frequency"
          className="block text-sm font-medium text-gray-700"
        >
          Frequency *
        </label>
        <select
          id="frequency"
          name="frequency"
          value={formData.frequency || "weekly"}
          onChange={handleChange}
          className={inputClassName(!!errors.frequency)}
        >
          {FREQUENCY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.frequency && <FormError message={errors.frequency} />}
      </div>

      {/* Day of Week Field */}
      <div>
        <label
          htmlFor="dayOfWeek"
          className="block text-sm font-medium text-gray-700"
        >
          Day of Week *
        </label>
        <select
          id="dayOfWeek"
          name="dayOfWeek"
          value={formData.dayOfWeek}
          onChange={handleChange}
          className={inputClassName(!!errors.dayOfWeek)}
        >
          {DAYS.map((day, index) => (
            <option key={index} value={index}>
              {day}
            </option>
          ))}
        </select>
        {errors.dayOfWeek && <FormError message={errors.dayOfWeek} />}
      </div>

      {/* Date Fields */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <DateInput
          label="Start Date *"
          id="startDate"
          value={formData.startDate}
          error={errors.startDate}
          onChange={handleChange}
        />
        <DateInput
          label="End Date (Optional)"
          id="endDate"
          value={formData.endDate}
          onChange={handleChange}
        />
      </div>

      {/* Time of Day Field */}
      <div>
        <label
          htmlFor="timeOfDay"
          className="block text-sm font-medium text-gray-700"
        >
          Time of Day *
        </label>
        <input
          type="time"
          id="timeOfDay"
          name="timeOfDay"
          value={formatTimeValue(formData.timeOfDay)}
          onChange={handleChange}
          className={inputClassName(!!errors.timeOfDay)}
        />
        {errors.timeOfDay && <FormError message={errors.timeOfDay} />}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-cancel"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : initialData.id
            ? "Update Series"
            : "Create Series"}
        </button>
      </div>
    </form>
  );
}

// Helper components for repeated UI patterns
const FormError = ({ message }: { message: string }) => (
  <p className="mt-1 text-sm text-red-600">{message}</p>
);

const DateInput = ({
  label,
  id,
  value,
  error,
  onChange,
}: {
  label: string;
  id: string;
  value?: string;
  error?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type="date"
      id={id}
      name={id}
      value={value ? new Date(value).toISOString().split("T")[0] : ""}
      onChange={onChange}
      className={inputClassName(!!error)}
    />
    {error && <FormError message={error} />}
  </div>
);

// Style constants for buttons
const buttonBase =
  "rounded-md py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
const btnCancel = `${buttonBase} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`;
const btnSubmit = `${buttonBase} border-transparent bg-blue-600 text-white hover:bg-blue-700`;
