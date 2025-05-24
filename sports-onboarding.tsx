import React, { useState } from 'react';
import { User, Calendar, Users, MapPin, Clock, Check, ChevronRight, Trophy } from 'lucide-react';

const SportsOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: '',
    email: 'orange.mountain.273@example.com',
    phone: '',
    dateOfBirth: '',
    primarySport: '',
    secondarySports: [],
    location: '',
    skillLevel: '',
    preferredDays: [],
    preferredTimes: [],
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });

  const totalSteps = 4;

  const sports = [
    { id: 'tennis', name: 'Tennis', icon: '🎾' },
    { id: 'basketball', name: 'Basketball', icon: '🏀' },
    { id: 'soccer', name: 'Soccer', icon: '⚽' },
    { id: 'volleyball', name: 'Volleyball', icon: '🏐' },
    { id: 'baseball', name: 'Baseball', icon: '⚾' },
    { id: 'badminton', name: 'Badminton', icon: '🏸' }
  ];

  const days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const timeSlots = [
    { id: 'morning', label: 'Morning', subtitle: '6AM - 12PM', icon: '🌅' },
    { id: 'afternoon', label: 'Afternoon', subtitle: '12PM - 6PM', icon: '☀️' },
    { id: 'evening', label: 'Evening', subtitle: '6PM - 10PM', icon: '🌆' }
  ];

  const skillLevels = [
    { id: 'beginner', label: 'Beginner', subtitle: 'Just starting out' },
    { id: 'intermediate', label: 'Intermediate', subtitle: 'Some experience' },
    { id: 'advanced', label: 'Advanced', subtitle: 'Very experienced' },
    { id: 'competitive', label: 'Competitive', subtitle: 'Tournament level' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
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

  const handleComplete = () => {
    console.log('Profile completed:', formData);
    // Here you would save the data and redirect to the dashboard
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

  const StepContent = () => {
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How should we call you?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, State"
                  />
                </div>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What sports do you play?</h2>
              <p className="text-gray-600">Help us match you with the right groups and games</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Primary Sport *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sports.map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => handleInputChange('primarySport', sport.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.primarySport === sport.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{sport.icon}</div>
                    <div className="font-medium">{sport.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Skill Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skillLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleInputChange('skillLevel', level.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.skillLevel === level.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{level.label}</div>
                    <div className="text-sm text-gray-500">{level.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Other Sports You Play
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sports.filter(sport => sport.id !== formData.primarySport).map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => handleArrayToggle('secondarySports', sport.id)}
                    className={`p-3 rounded-lg border-2 transition-all relative ${
                      formData.secondarySports.includes(sport.id)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{sport.icon}</div>
                    <div className="text-sm font-medium">{sport.name}</div>
                    {formData.secondarySports.includes(sport.id) && (
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
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">When do you like to play?</h2>
              <p className="text-gray-600">We'll use this to suggest games that fit your schedule</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Preferred Days
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => handleArrayToggle('preferredDays', day)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.preferredDays.includes(day)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{day}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Preferred Time Slots
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleArrayToggle('preferredTimes', slot.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.preferredTimes.includes(slot.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">{slot.icon}</span>
                      <span className="font-medium text-gray-900">{slot.label}</span>
                    </div>
                    <div className="text-sm text-gray-500">{slot.subtitle}</div>
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
              <p className="text-gray-600">Review your preferences and start connecting with players</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Profile</h3>
                  <p className="text-sm text-gray-600">
                    {formData.displayName || 'Orange Mountain'} • {formData.location || 'Location not set'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Primary Sport</h3>
                  <p className="text-sm text-gray-600">
                    {sports.find(s => s.id === formData.primarySport)?.name || 'Not selected'} 
                    {formData.skillLevel && ` • ${skillLevels.find(l => l.id === formData.skillLevel)?.label}`}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Availability</h3>
                  <p className="text-sm text-gray-600">
                    {formData.preferredDays.length} days • {formData.preferredTimes.length} time slots
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Other Sports</h3>
                  <p className="text-sm text-gray-600">
                    {formData.secondarySports.length} sports selected
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
                      <li>Browse local sports groups</li>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to SportConnect
            </h1>
            <p className="text-gray-600">
              Let's get you set up to find and join amazing sports communities
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <ProgressBar />
            <StepContent />

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
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
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
                >
                  Complete Profile
                  <Check className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-6">
            <button className="text-gray-500 hover:text-gray-700 text-sm">
              Skip for now - I'll complete this later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsOnboarding;