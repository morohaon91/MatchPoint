'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { SportType, TimeSlot, DayOfWeek } from '@/lib/types/userProfile';
import { createUserProfile } from '@/lib/firebase/userProfile';
import { User, Calendar, Users, MapPin, Clock, Check, ChevronRight, Trophy } from 'lucide-react';
import React from 'react';

interface StepContentProps {
  currentStep: number;
  displayName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  primarySport: SportType;
  secondarySports: SportType[];
  preferredDays: DayOfWeek[];
  preferredTimeSlots: TimeSlot[];
  onDisplayNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onDateOfBirthChange: (value: string) => void;
  onPrimarySportChange: (sport: SportType) => void;
  onSportToggle: (sport: SportType) => void;
  onDayToggle: (day: DayOfWeek) => void;
  onTimeSlotToggle: (slot: TimeSlot) => void;
}

const SportIcons: Record<SportType, { icon: string, label: string }> = {
  [SportType.TENNIS]: { icon: '🎾', label: 'Tennis' },
  [SportType.BASKETBALL]: { icon: '🏀', label: 'Basketball' },
  [SportType.FOOTBALL]: { icon: '⚽', label: 'Football' },
  [SportType.VOLLEYBALL]: { icon: '🏐', label: 'Volleyball' },
  [SportType.BADMINTON]: { icon: '🏸', label: 'Badminton' },
};

const TimeSlotDetails: Record<TimeSlot, { icon: string, label: string, hours: string }> = {
  [TimeSlot.MORNING]: { icon: '🌅', label: 'Morning', hours: '6AM - 12PM' },
  [TimeSlot.AFTERNOON]: { icon: '☀️', label: 'Afternoon', hours: '12PM - 6PM' },
  [TimeSlot.EVENING]: { icon: '🌆', label: 'Evening', hours: '6PM - 10PM' },
};

const StepContent = ({
  currentStep,
  displayName,
  email,
  phoneNumber,
  dateOfBirth,
  primarySport,
  secondarySports,
  preferredDays,
  preferredTimeSlots,
  onDisplayNameChange,
  onPhoneNumberChange,
  onDateOfBirthChange,
  onPrimarySportChange,
  onSportToggle,
  onDayToggle,
  onTimeSlotToggle,
}: StepContentProps) => {
  switch (currentStep) {
    case 1:
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
            <p className="text-gray-600">Let's start with the basics to personalize your experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="displayName">
                Display Name *
              </label>
              <input
                id="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => onDisplayNameChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="How should we call you?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phoneNumber">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => onPhoneNumberChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="dateOfBirth">
                Date of Birth *
              </label>
              <input
                id="dateOfBirth"
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => onDateOfBirthChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your sports</h2>
            <p className="text-gray-600">Select your primary sport and any others you're interested in</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Primary Sport *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.values(SportType).map((sport) => (
                <button
                  key={sport}
                  onClick={() => onPrimarySportChange(sport)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    primarySport === sport
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{SportIcons[sport].icon}</div>
                  <div className="font-medium">{SportIcons[sport].label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Other Sports You're Interested In
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.values(SportType)
                .filter(sport => sport !== primarySport)
                .map((sport) => (
                  <button
                    key={sport}
                    onClick={() => onSportToggle(sport)}
                    className={`p-3 rounded-lg border-2 transition-all relative ${
                      secondarySports.includes(sport)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{SportIcons[sport].icon}</div>
                    <div className="font-medium">{SportIcons[sport].label}</div>
                    {secondarySports.includes(sport) && (
                      <Check className="absolute top-2 right-2 w-4 h-4" />
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">When do you like to play?</h2>
            <p className="text-gray-600">We'll use this to suggest games that fit your schedule</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Days
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(DayOfWeek).map((day) => (
                <button
                  key={day}
                  onClick={() => onDayToggle(day)}
                  className={`px-4 py-3 rounded-lg border transition-all text-center ${
                    preferredDays.includes(day)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Time Slots
            </label>
            <div className="space-y-3">
              {Object.values(TimeSlot).map((slot) => (
                <button
                  key={slot}
                  onClick={() => onTimeSlotToggle(slot)}
                  className={`w-full px-4 py-3 rounded-lg border transition-all ${
                    preferredTimeSlots.includes(slot)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{TimeSlotDetails[slot].icon}</span>
                    <div className="text-left">
                      <div className="font-medium">
                        {TimeSlotDetails[slot].label}
                      </div>
                      <div className="text-sm text-gray-500">
                        {TimeSlotDetails[slot].hours}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
            <p className="text-gray-600">Review your profile and start connecting with players</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Profile</h3>
                <p className="text-sm text-gray-600">
                  {displayName} • {phoneNumber || 'No phone number'}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Primary Sport</h3>
                <p className="text-sm text-gray-600">
                  {primarySport}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Availability</h3>
                <p className="text-sm text-gray-600">
                  {preferredDays.length} days • {preferredTimeSlots.length} time slots
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Other Sports</h3>
                <p className="text-sm text-gray-600">
                  {secondarySports.length} sports selected
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Check className="w-5 h-5 text-blue-600 mt-0.5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Next Steps</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Browse available matches</li>
                    <li>Join your first game</li>
                    <li>Connect with other players</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default function OnboardingPage() {
  const { currentUser, isLoadingAuth } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Individual state variables for form fields
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [email] = useState(currentUser?.email || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [primarySport, setPrimarySport] = useState(SportType.TENNIS);
  const [secondarySports, setSecondarySports] = useState<SportType[]>([]);
  const [preferredDays, setPreferredDays] = useState<DayOfWeek[]>([]);
  const [preferredTimeSlots, setPreferredTimeSlots] = useState<TimeSlot[]>([]);

  const totalSteps = 4;

  const handleSubmit = async () => {
    if (!currentUser) return;

    // Validate required fields
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }
    if (!dateOfBirth) {
      setError('Date of birth is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const formData = {
        displayName,
        email,
        phoneNumber,
        dateOfBirth: new Date(dateOfBirth),
        primarySport,
        secondarySports,
        availabilityPreferences: {
          preferredDays,
          preferredTimeSlots,
        },
      };

      await createUserProfile(currentUser, formData);

      // Wait a moment for Firestore to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Force a hard reload to ensure all auth states are updated
      window.location.href = '/app/dashboard';
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSportToggle = (sport: SportType) => {
    setSecondarySports(prev =>
      prev.includes(sport)
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  };

  const handleDayToggle = (day: DayOfWeek) => {
    setPreferredDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleTimeSlotToggle = (slot: TimeSlot) => {
    setPreferredTimeSlots(prev =>
      prev.includes(slot)
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}% complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  if (isLoadingAuth || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to MatchPoint
            </h1>
            <p className="text-gray-600">
              Let's get you set up to find and join amazing sports matches
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <ProgressBar />
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={e => e.preventDefault()}>
              <StepContent
                currentStep={currentStep}
                displayName={displayName}
                email={email}
                phoneNumber={phoneNumber}
                dateOfBirth={dateOfBirth}
                primarySport={primarySport}
                secondarySports={secondarySports}
                preferredDays={preferredDays}
                preferredTimeSlots={preferredTimeSlots}
                onDisplayNameChange={setDisplayName}
                onPhoneNumberChange={setPhoneNumber}
                onDateOfBirthChange={setDateOfBirth}
                onPrimarySportChange={setPrimarySport}
                onSportToggle={handleSportToggle}
                onDayToggle={handleDayToggle}
                onTimeSlotToggle={handleTimeSlotToggle}
              />

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    currentStep === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Complete Profile'}
                    <Check className="w-4 h-4 ml-2" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-6">
            <button 
              onClick={() => router.push('/app/dashboard')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Skip for now - I'll complete this later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 