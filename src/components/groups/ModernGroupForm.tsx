import React, { useState } from "react";
import { Group, SportType } from "@/lib/types/models";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ModernGroupFormProps {
  initialData?: Partial<Group>;
  onSubmit: (data: Partial<Group>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * ModernGroupForm component for creating and editing groups
 */
export default function ModernGroupForm({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  className = "",
}: ModernGroupFormProps) {
  // Form state
  const [formData, setFormData] = useState<Partial<Group>>({
    name: "",
    description: "",
    sport: SportType.TENNIS,
    location: "",
    isPublic: true,
    photoURL: "",
    invitationCode: "", // Add invitationCode to state
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

    if (!formData.name?.trim()) {
      newErrors.name = "Group name is required";
    }

    if (!formData.sport) {
      newErrors.sport = "Sport is required";
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
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        );
      case SportType.BASKETBALL:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2 12h20"
            />
          </svg>
        );
      case SportType.SOCCER:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 2v4m0 16v-4m-10-8h4m16 0h-4m-8 0l-4-4m8 0l4-4m-8 16l-4 4m8 0l4 4"
            />
          </svg>
        );
      case SportType.VOLLEYBALL:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 15l5-5 5 5"
            />
          </svg>
        );
      case SportType.BASEBALL:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.5 9.5c1.5-1.5 3.5-1.5 5 0m-5 5c1.5 1.5 3.5 1.5 5 0"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
    }
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-2xl">
            {initialData.id ? "Edit Group" : "Create New Group"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Group photo URL */}
          <div className="space-y-2">
            <label
              htmlFor="photoURL"
              className="block text-sm font-medium text-neutral-700"
            >
              Group Photo URL
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
                  alt="Group preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/400x200?text=Invalid+Image+URL";
                  }}
                />
              </div>
            )}
          </div>

          {/* Group name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-neutral-700"
            >
              Group Name <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
              placeholder="Enter group name"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.name ? "border-error-500" : "border-neutral-300"
              }`}
            />
            {errors.name && (
              <p className="text-error-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Group description */}
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
              placeholder="Describe your group"
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
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location || ""}
              onChange={handleChange}
              placeholder="Enter location"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Privacy setting */}
          <div className="space-y-2">
            <span className="block text-sm font-medium text-neutral-700">
              Privacy
            </span>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-neutral-700">
                  Public group
                </span>
              </label>
              <Badge
                variant={formData.isPublic ? "outline" : "secondary"}
                size="sm"
              >
                {formData.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            <p className="text-sm text-neutral-500">
              {formData.isPublic
                ? "Anyone can find and join this group"
                : "Only people with an invite link can join this group"}
            </p>
          </div>

          {/* Invitation Code */}
          <div className="space-y-2">
            <label
              htmlFor="invitationCode"
              className="block text-sm font-medium text-neutral-700"
            >
              Invite Code (Optional)
            </label>
            <input
              type="text"
              id="invitationCode"
              name="invitationCode"
              value={formData.invitationCode || ""}
              onChange={handleChange}
              placeholder="Leave blank to auto-generate"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <p className="text-sm text-neutral-500">
              Create a custom code or leave blank for an auto-generated one.
            </p>
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
            {initialData.id ? "Update Group" : "Create Group"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
