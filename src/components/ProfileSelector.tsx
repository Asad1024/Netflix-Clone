'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Profile {
  id: string;
  name: string;
  avatar: string;
  isKid: boolean;
  password?: string;
}

interface ProfileSelectorProps {
  onProfileSelect: (profile: Profile) => void;
  onEditProfiles: () => void;
  isManaging?: boolean;
}

export default function ProfileSelector({ onProfileSelect, onEditProfiles, isManaging = false }: ProfileSelectorProps) {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  useEffect(() => {
    const savedProfiles = localStorage.getItem('netflixProfiles');
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    } else {
      // First time visit - only show kid profile
      const initialProfiles: Profile[] = [
        {
          id: 'kid',
          name: 'Kids',
          avatar: '/kid-avatar.png',
          isKid: true
        }
      ];
      setProfiles(initialProfiles);
      localStorage.setItem('netflixProfiles', JSON.stringify(initialProfiles));
    }
  }, []);

  const handleRemoveProfile = (profileId: string) => {
    if (profiles.length <= 1) return; // Keep at least 1 profile

    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    setProfiles(updatedProfiles);
    localStorage.setItem('netflixProfiles', JSON.stringify(updatedProfiles));
  };

  const handleAddProfile = () => {
    if (profiles.length >= 3) return; // Max 3 profiles
    setShowAddModal(true);
  };

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) return;

    // For the first added profile, use adult-avatar 1.png, for the second use adult-avatar 2.png
    const avatarIndex = profiles.filter(p => !p.isKid).length + 1;
    const avatarPath = `/adult-avatar ${avatarIndex}.png`;

    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      name: newProfileName.trim(),
      avatar: avatarPath,
      isKid: false
    };
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    localStorage.setItem('netflixProfiles', JSON.stringify(updatedProfiles));
    setShowAddModal(false);
    setNewProfileName('');
    router.push(`/edit-profile/${newProfile.id}`);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-white text-4xl font-bold mb-4">
          {isManaging ? 'Manage Profiles' : "Who's watching?"}
        </h1>
        <p className="text-gray-400">
          {isManaging ? 'Edit or remove profiles' : 'Select a profile to continue'}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 mb-8">
        {profiles
          .sort((a, b) => {
            // Sort so that non-kid profiles come first, kid profiles last
            if (a.isKid && !b.isKid) return 1;
            if (!a.isKid && b.isKid) return -1;
            return 0;
          })
          .map((profile) => (
          <div
            key={profile.id}
            className={`flex flex-col items-center cursor-pointer group relative ${
              isManaging ? '' : 'hover:scale-105 transition-transform'
            }`}
            onClick={() => {
              if (!isManaging) {
                onProfileSelect(profile);
              }
            }}
          >
            <div className={`relative w-32 h-32 mb-3 rounded-md overflow-hidden ${
              profile.isKid
                ? 'bg-gradient-to-br from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 to-pink-500 p-1'
                : 'bg-gray-600'
            }`}>
              <div className={`w-full h-full rounded-md flex items-center justify-center ${
                profile.isKid ? 'bg-black' : ''
              }`}>
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-28 h-28 object-cover rounded-md"
                  onError={(e) => {
                    // Fallback to emoji if image fails
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className={`text-3xl hidden`}>
                  👤
                </div>
              </div>

              {isManaging && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/edit-profile/${profile.id}`);
                    }}
                    className="bg-white hover:bg-gray-200 text-black rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <span className="text-white text-sm font-medium">{profile.name}</span>
            {profile.password && (
              <svg className="w-4 h-4 text-gray-400 mt-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7z"/>
              </svg>
            )}
          </div>
        ))}

        {!isManaging && profiles.length < 3 && (
          <div
            className="flex flex-col items-center cursor-pointer group"
            onClick={handleAddProfile}
          >
            <div className="w-24 h-24 mb-3 bg-gray-800 rounded-md flex items-center justify-center group-hover:bg-gray-700 transition-colors">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-gray-400 text-sm">Add Profile</span>
          </div>
        )}
      </div>

      {!isManaging && (
        <button
          onClick={onEditProfiles}
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors"
        >
          Manage Profiles
        </button>
      )}

      {isManaging && (
        <button
          onClick={onEditProfiles}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors"
        >
          Done
        </button>
      )}

      {/* Add Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-white text-2xl font-bold mb-6 text-center">
              Add Profile
            </h2>

            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-2">Profile Name</label>
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateProfile()}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Enter profile name"
                maxLength={20}
                autoFocus
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewProfileName('');
                }}
                className="flex-1 bg-gray-600 text-white py-3 rounded-md hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProfile}
                className="flex-1 bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition"
                disabled={!newProfileName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}