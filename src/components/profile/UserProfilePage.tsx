import { useState } from 'react';
import { UserProfile, SportType, TimeSlot, DayOfWeek } from '@/lib/types/userProfile';
import ProfilePicture from './ProfilePicture';

interface UserProfilePageProps {
  profile: UserProfile;
  onUpdate: (updatedProfile: Partial<UserProfile>) => Promise<void>;
}

export default function UserProfilePage({ profile, onUpdate }: UserProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState<UserProfile>(profile);

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSave = async () => {
    await onUpdate(updatedProfile);
    setIsEditing(false);
  };

  const handlePhotoUpdate = async (photoURL: string) => {
    const updatedData = { ...updatedProfile, photoURL };
    setUpdatedProfile(updatedData);
    await onUpdate({ photoURL });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      {/* Basic Information Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <ProfilePicture
              photoURL={updatedProfile.photoURL}
              onPhotoUpdate={handlePhotoUpdate}
              size={150}
            />
          </div>
          
          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Display Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={updatedProfile.displayName}
                  onChange={(e) => setUpdatedProfile({...updatedProfile, displayName: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="text-gray-900">{profile.displayName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{profile.email}</p>
              {!profile.emailVerified && (
                <span className="text-sm text-yellow-600">Email not verified</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={updatedProfile.phoneNumber || ''}
                  onChange={(e) => setUpdatedProfile({...updatedProfile, phoneNumber: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="text-gray-900">{profile.phoneNumber || 'Not provided'}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <p className="text-gray-900">{calculateAge(profile.dateOfBirth)} years old</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sports & Preferences Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Sports & Preferences</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Primary Sport</label>
            {isEditing ? (
              <select
                value={updatedProfile.primarySport}
                onChange={(e) => setUpdatedProfile({...updatedProfile, primarySport: e.target.value as SportType})}
                className="w-full p-2 border rounded"
              >
                {Object.values(SportType).map((sport) => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900">{profile.primarySport}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Secondary Sports</label>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {Object.values(SportType).map((sport) => (
                  <label key={sport} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={updatedProfile.secondarySports.includes(sport)}
                      onChange={(e) => {
                        const newSports = e.target.checked
                          ? [...updatedProfile.secondarySports, sport]
                          : updatedProfile.secondarySports.filter(s => s !== sport);
                        setUpdatedProfile({...updatedProfile, secondarySports: newSports});
                      }}
                      className="mr-2"
                    />
                    {sport}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-900">{profile.secondarySports.join(', ') || 'None selected'}</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Availability Preferences</h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Preferred Days</label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {Object.values(DayOfWeek).map((day) => (
                    <label key={day} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={updatedProfile.availabilityPreferences.preferredDays.includes(day)}
                        onChange={(e) => {
                          const newDays = e.target.checked
                            ? [...updatedProfile.availabilityPreferences.preferredDays, day]
                            : updatedProfile.availabilityPreferences.preferredDays.filter(d => d !== day);
                          setUpdatedProfile({
                            ...updatedProfile,
                            availabilityPreferences: {
                              ...updatedProfile.availabilityPreferences,
                              preferredDays: newDays
                            }
                          });
                        }}
                        className="mr-2"
                      />
                      {day}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-900">
                  {profile.availabilityPreferences.preferredDays.join(', ') || 'None selected'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Preferred Time Slots</label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {Object.values(TimeSlot).map((slot) => (
                    <label key={slot} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={updatedProfile.availabilityPreferences.preferredTimeSlots.includes(slot)}
                        onChange={(e) => {
                          const newSlots = e.target.checked
                            ? [...updatedProfile.availabilityPreferences.preferredTimeSlots, slot]
                            : updatedProfile.availabilityPreferences.preferredTimeSlots.filter(s => s !== slot);
                          setUpdatedProfile({
                            ...updatedProfile,
                            availabilityPreferences: {
                              ...updatedProfile.availabilityPreferences,
                              preferredTimeSlots: newSlots
                            }
                          });
                        }}
                        className="mr-2"
                      />
                      {slot}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-900">
                  {profile.availabilityPreferences.preferredTimeSlots.join(', ') || 'None selected'}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Account Information Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Account Created</label>
            <p className="text-gray-900">{profile.createdAt.toLocaleDateString()}</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Last Active</label>
            <p className="text-gray-900">{profile.lastActiveAt.toLocaleDateString()}</p>
          </div>
        </div>
      </section>
    </div>
  );
} 