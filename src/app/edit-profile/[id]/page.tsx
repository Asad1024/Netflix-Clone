'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  avatar: string;
  isKid: boolean;
  password?: string;
}

export default function EditProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    const savedProfiles = localStorage.getItem('netflixProfiles');
    if (savedProfiles) {
      const profiles: Profile[] = JSON.parse(savedProfiles);
      const foundProfile = profiles.find(p => p.id === params.id);
      if (foundProfile) {
        setProfile(foundProfile);
        setName(foundProfile.name);
        setPassword(foundProfile.password || '');
      }
    }
    setLoading(false);
  }, [params.id]);

  const handleSave = () => {
    if (!profile || !name.trim()) return;

    const savedProfiles = localStorage.getItem('netflixProfiles');
    if (savedProfiles) {
      const profiles: Profile[] = JSON.parse(savedProfiles);
      const updatedProfiles = profiles.map(p =>
        p.id === profile.id ? {
          ...p,
          name: name.trim(),
          password: password.trim() || undefined
        } : p
      );
      localStorage.setItem('netflixProfiles', JSON.stringify(updatedProfiles));
    }

    router.push('/');
  };

  const handleRemoveProfile = () => {
    if (!profile) return;

    const savedProfiles = localStorage.getItem('netflixProfiles');
    if (savedProfiles) {
      const profiles: Profile[] = JSON.parse(savedProfiles);
      const updatedProfiles = profiles.filter(p => p.id !== profile.id);

      // If this was the selected profile, clear it
      const selectedProfile = localStorage.getItem('selectedProfile');
      if (selectedProfile) {
        const selected = JSON.parse(selectedProfile);
        if (selected.id === profile.id) {
          localStorage.removeItem('selectedProfile');
        }
      }

      localStorage.setItem('netflixProfiles', JSON.stringify(updatedProfiles));
    }

    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-red-600 border-r-red-600 border-b-red-600 border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl mb-4">Profile Not Found</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-200 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-4 md:px-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
            <span className="text-lg font-semibold">Back</span>
          </button>
          <div className="text-white">
            <h1 className="text-lg font-semibold">Edit Profile</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 px-4 md:px-8 max-w-md mx-auto">
        <div className="bg-zinc-900 p-8 rounded-lg">
          {/* Profile Avatar */}
          <div className="flex justify-center mb-6">
            <div className={`relative w-32 h-32 rounded-md overflow-hidden ${
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
                />
              </div>
            </div>
          </div>

          {/* Profile Name */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm mb-2">Profile Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Enter profile name"
              maxLength={20}
            />
          </div>

          {/* Password */}
          <div className="mb-8">
            <label className="block text-gray-300 text-sm mb-2">
              Password (Optional)
              <span className="text-gray-500 text-xs ml-2">Protect this profile</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 pr-12"
                placeholder="Enter password (optional)"
                maxLength={20}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {password && (
              <button
                type="button"
                onClick={() => setPassword('')}
                className="text-red-400 text-xs mt-1 hover:text-red-300"
              >
                Remove password
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleSave}
              className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition disabled:opacity-50"
              disabled={!name.trim()}
            >
              Save Changes
            </button>

            <button
              onClick={handleRemoveProfile}
              className="w-full bg-red-800 text-white py-3 rounded-md hover:bg-red-900 transition"
            >
              Remove Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}