"use client";

import React, { useState, useMemo } from "react";
import { Game, SportType, GameStatus, Group } from "@/lib/types/models";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { doc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseClient";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { firestoreConverter } from "@/lib/firebase/converters";

interface GameFormProps {
  initialData?: Partial<Game>;
  onSubmit: (data: Partial<Game>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * GameForm component for creating and editing games
 * Features:
 * - Sport-specific styling and validation
 * - Firestore integration with converters
 * - Rich form controls and error handling
 * - Supports both creation and editing modes
 */
export default function GameForm({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  className = "",
}: GameFormProps) {
  // Memoize group reference to prevent unnecessary re-renders
  const groupId = initialData?.groupId;
  const groupRef = useMemo(() => {
    return groupId
      ? doc(db, "groups", groupId).withConverter(firestoreConverter<Group>())
      : null;
  }, [groupId]);

  const [group, groupLoading] = useDocumentData<Group>(groupRef);

  // Initial sport type calculation
  const initialSport = useMemo(() => {
    return initialData?.sport || group?.sport || SportType.TENNIS;
  }, [initialData?.sport, group?.sport]);

  // Form state
  const [formData, setFormData] = useState<Partial<Game>>({
    title: "",
    description: "",
    sport: initialSport,
    location: "",
    scheduledTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 86400000 + 7200000)
      .toISOString()
      .slice(0, 16),
    status: GameStatus.UPCOMING,
    maxParticipants: 10,
    minParticipants: 2,
    isRecurring: false,
    isPrivate: false,
    isOpenToGuests: false,
    photoURL: "",
    ...initialData,
  });

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);

    if (!isNaN(numValue)) {
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle sport selection
  const handleSportChange = (sport: SportType) => {
    setFormData((prev) => ({ ...prev, sport }));

    // Clear error when field is edited
    if (errors.sport) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.sport;
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Game title is required";
    }

    if (!formData.sport) {
      newErrors.sport = "Sport is required";
    }

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = "Start time is required";
    }

    if (!formData.location?.trim()) {
      newErrors.location = "Location is required";
    }

    if (
      formData.maxParticipants !== undefined &&
      formData.minParticipants !== undefined
    ) {
      if (formData.maxParticipants < formData.minParticipants) {
        newErrors.maxParticipants =
          "Maximum participants cannot be less than minimum participants";
      }
    }

    if (formData.scheduledTime && formData.endTime) {
      const startTime = new Date(formData.scheduledTime).getTime();
      const endTime = new Date(formData.endTime).getTime();

      if (endTime <= startTime) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Sport selection button
  const SportButton = ({
    sport,
    selected,
  }: {
    sport: SportType;
    selected: boolean;
  }) => (
    <button
      type="button"
      onClick={() => handleSportChange(sport)}
      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
        selected
          ? `bg-sport-${sport.toLowerCase()}-primary/10 border-2 border-sport-${sport.toLowerCase()}-primary text-sport-${sport.toLowerCase()}-primary`
          : "bg-neutral-100 border-2 border-transparent hover:bg-neutral-200"
      }`}
    >
      {/* Sport icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
          selected
            ? `bg-sport-${sport.toLowerCase()}-primary text-white`
            : "bg-neutral-200"
        }`}
      >
        {getSportIcon(sport)}
      </div>
      <span className="text-sm font-medium">{sport}</span>
    </button>
  );

  // Get sport icon based on sport type
  const getSportIcon = (sport: SportType) => {
    switch (sport) {
      case SportType.TENNIS:
        return "🎾";
      case SportType.BASKETBALL:
        return "🏀";
      case SportType.SOCCER:
        return "⚽";
      case SportType.VOLLEYBALL:
        return "🏐";
      case SportType.BASEBALL:
        return "⚾";
      default:
        return "🏆";
    }
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-2xl">
            {initialData.id ? "Edit Game" : "Create New Game"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Game photo URL */}
          <div className="space-y-2">
            <label
              htmlFor="photoURL"
              className="block text-sm font-medium text-neutral-700"
            >
              Game Photo URL
            </label>
            <input
              type="text"
              id="photoURL"
              name="photoURL"
              value={formData.photoURL || ""}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {formData.photoURL && (
              <div className="mt-2 relative w-full h-40 rounded-lg overflow-hidden">
                <img
                  src={formData.photoURL}
                  alt="Game preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/400x200?text=Invalid+Image+URL";
                  }}
                />
              </div>
            )}
          </div>

          {/* Game title */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-neutral-700"
            >
              Game Title <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              required
              placeholder="Enter game title"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.title ? "border-error-500" : "border-neutral-300"
              }`}
            />
            {errors.title && (
              <p className="text-error-500 text-sm">{errors.title}</p>
            )}
          </div>

          {/* Game description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-neutral-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your game"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Sport selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">
              Sport <span className="text-error-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.values(SportType).map((sport) => (
                <SportButton
                  key={sport}
                  sport={sport}
                  selected={formData.sport === sport}
                />
              ))}
            </div>
            {errors.sport && (
              <p className="text-error-500 text-sm">{errors.sport}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-neutral-700"
            >
              Location <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location || ""}
              onChange={handleChange}
              required
              placeholder="Enter location"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.location ? "border-error-500" : "border-neutral-300"
              }`}
            />
            {errors.location && (
              <p className="text-error-500 text-sm">{errors.location}</p>
            )}
          </div>

          {/* Date and time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start time */}
            <div className="space-y-2">
              <label
                htmlFor="scheduledTime"
                className="block text-sm font-medium text-neutral-700"
              >
                Start Time <span className="text-error-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="scheduledTime"
                name="scheduledTime"
                value={formData.scheduledTime?.toString().slice(0, 16) || ""}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                  errors.scheduledTime
                    ? "border-error-500"
                    : "border-neutral-300"
                }`}
              />
              {errors.scheduledTime && (
                <p className="text-error-500 text-sm">{errors.scheduledTime}</p>
              )}
            </div>

            {/* End time */}
            <div className="space-y-2">
              <label
                htmlFor="endTime"
                className="block text-sm font-medium text-neutral-700"
              >
                End Time
              </label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime?.toString().slice(0, 16) || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                  errors.endTime ? "border-error-500" : "border-neutral-300"
                }`}
              />
              {errors.endTime && (
                <p className="text-error-500 text-sm">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Min participants */}
            <div className="space-y-2">
              <label
                htmlFor="minParticipants"
                className="block text-sm font-medium text-neutral-700"
              >
                Minimum Participants
              </label>
              <input
                type="number"
                id="minParticipants"
                name="minParticipants"
                value={formData.minParticipants || ""}
                onChange={handleNumberChange}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Max participants */}
            <div className="space-y-2">
              <label
                htmlFor="maxParticipants"
                className="block text-sm font-medium text-neutral-700"
              >
                Maximum Participants
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants || ""}
                onChange={handleNumberChange}
                min="1"
                max="100"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                  errors.maxParticipants
                    ? "border-error-500"
                    : "border-neutral-300"
                }`}
              />
              {errors.maxParticipants && (
                <p className="text-error-500 text-sm">
                  {errors.maxParticipants}
                </p>
              )}
            </div>
          </div>

          {/* Game options */}
          <div className="space-y-4">
            {/* Recurring game */}
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-neutral-700">
                  Recurring game
                </span>
              </label>
              {formData.isRecurring && (
                <Badge variant="primary" size="sm">
                  Recurring
                </Badge>
              )}
            </div>

            {/* Private game */}
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-neutral-700">
                  Private game
                </span>
              </label>
              {formData.isPrivate && (
                <Badge variant="secondary" size="sm">
                  Private
                </Badge>
              )}
            </div>

            {/* Open to Guests option */}
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isOpenToGuests"
                  checked={formData.isOpenToGuests}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-neutral-700">
                  Open to Guests
                </span>
              </label>
              {formData.isOpenToGuests && (
                <Badge variant="outline" size="sm">
                  Open to Guests
                </Badge>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between" withBorder>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            sportType={formData.sport?.toLowerCase() as any}
            isLoading={isLoading}
            fullWidth={!onCancel}
          >
            {initialData.id ? "Update Game" : "Create Game"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
