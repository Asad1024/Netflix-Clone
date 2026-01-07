'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search } from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string) => void;
  onBrowse?: () => void;
  onMyList?: () => void;
  selectedProfile?: { name: string; avatar: string; isKid: boolean; id: string } | null;
  allProfiles?: { name: string; avatar: string; isKid: boolean; id: string }[];
  onSwitchProfile?: () => void;
  onSelectProfile?: (profileId: string) => void;
  onManageProfiles?: () => void;
  onSignOut?: () => void;
}

export default function Header({ onSearch, onBrowse, onMyList, selectedProfile, allProfiles = [], onSwitchProfile, onSelectProfile, onManageProfiles, onSignOut }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [pendingProfileId, setPendingProfileId] = useState<string | null>(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear pending selection when the actual selectedProfile prop updates
  useEffect(() => {
    if (pendingProfileId && selectedProfile && pendingProfileId === selectedProfile.id) {
      setPendingProfileId(null);
    }
  }, [selectedProfile, pendingProfileId]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchBar(false);
      setSearchQuery('');
    }
  };

  return (
    <header className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
      isScrolled ? 'bg-black' : 'bg-gradient-to-b from-black/60 to-transparent'
    }`}>
      <div className="flex items-center justify-between px-4 py-3 md:px-8 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-8">
          <a href="/">
            <Image src="/logo.svg" alt="Netflix" width={100} height={27} priority className="cursor-pointer" />
          </a>
          <nav className="hidden md:flex items-center gap-6 text-white/90">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <button onClick={onBrowse} className="hover:text-white transition-colors bg-transparent border-none cursor-pointer">Browse</button>
            <button onClick={onMyList} className="hover:text-white transition-colors bg-transparent border-none cursor-pointer">My List</button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {showSearchBar ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Titles, people, genres"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    setTimeout(() => {
                      if (!searchQuery.trim()) {
                        setShowSearchBar(false);
                      }
                    }, 200);
                  }}
                  className="bg-black border border-white text-white pl-10 pr-4 py-2 w-64 md:w-80 focus:outline-none focus:border-white"
                  autoFocus
                />
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowSearchBar(true)}
              className="p-2 hover:bg-gray-800 rounded-md transition-colors"
            >
              <Search className="h-5 w-5 text-white" />
            </button>
          )}

          {selectedProfile && (
            <div 
              className="relative" 
              ref={dropdownRef}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
              >
                {/* Show optimistic selection if user clicked another profile */}
                <img
                  src={(pendingProfileId ? allProfiles.find(p => p.id === pendingProfileId) : selectedProfile)?.avatar}
                  alt={(pendingProfileId ? allProfiles.find(p => p.id === pendingProfileId) : selectedProfile)?.name}
                  className="w-8 h-8 rounded-md object-cover"
                />
                <svg
                  className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full w-64 bg-black/95 border border-gray-700 py-2 z-50">
                  {/* All Profiles */}
                  {allProfiles && allProfiles.length > 0 ? (
                    allProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => {
                          setShowDropdown(false);
                          // Optimistically show the clicked profile in the header
                          setPendingProfileId(profile.id);
                          if (profile.id !== selectedProfile?.id) {
                            onSelectProfile?.(profile.id);
                          }
                        }}
                        className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
                      >
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <span className="text-sm">{profile.name}</span>
                        <div className="ml-auto flex items-center gap-2">
                          {profile.isKid && (
                            <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded">Kids</span>
                          )}
                          {(profile as any).password && (
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7z"/>
                            </svg>
                          )}
                          {/* Active / pending indicator */}
                          {(profile.id === selectedProfile?.id || profile.id === pendingProfileId) && (
                            <span className="text-xs text-green-400">●</span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : null}
                  
                  {allProfiles && allProfiles.length > 0 && <div className="border-t border-gray-700 my-2"></div>}
                  
                  {/* Edit current profile (singular) */}
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      const targetProfile = pendingProfileId ? allProfiles.find(p => p.id === pendingProfileId) : selectedProfile;
                      if (targetProfile) {
                        // Navigate to edit page for the active profile using Next router
                        router.push(`/edit-profile/${targetProfile.id}`);
                      } else {
                        onManageProfiles?.();
                      }
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 transition-colors flex items-center gap-3 text-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit profile
                  </button>
                  
                  {/* Exit Profile */}
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onSwitchProfile?.();
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 transition-colors flex items-center gap-3 text-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Exit Profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}