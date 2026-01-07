'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import MovieCard from '@/components/MovieCard';
import MovieDetailsModal from '@/components/MovieDetailsModal';
import TrailerModal from '@/components/TrailerModal';
import ProfileSelector from '@/components/ProfileSelector';
import { Movie } from '@/types/movie';
import { getMovieTrailers } from '@/utils/api';

interface Profile {
  id: string;
  name: string;
  avatar: string;
  isKid: boolean;
  password?: string;
}

export default function MyList() {
  const router = useRouter();
  const [isManagingProfiles, setIsManagingProfiles] = useState(false);
  const [passwordPrompt, setPasswordPrompt] = useState<{ profile: Profile; onSuccess: () => void } | null>(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const pinInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [myListMovies, setMyListMovies] = useState<Movie[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; movie: Movie | null }>({ isOpen: false, movie: null });
  const [trailerModal, setTrailerModal] = useState<{ isOpen: boolean; trailerKey: string; movieTitle: string }>({
    isOpen: false,
    trailerKey: '',
    movieTitle: '',
  });
  const [removeConfirm, setRemoveConfirm] = useState<{ movieId: number; movieTitle: string } | null>(null);

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newPinDigits = [...pinDigits];
    newPinDigits[index] = value;
    setPinDigits(newPinDigits);

    // Auto-focus next input
    if (value && index < 3) {
      pinInputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 4 digits are entered
    const pinComplete = newPinDigits.every(digit => digit !== '');
    if (pinComplete) {
      const pin = newPinDigits.join('');
      setTimeout(() => {
        if (passwordPrompt && pin === passwordPrompt.profile.password) {
          passwordPrompt.onSuccess();
          setPinDigits(['', '', '', '']);
        } else {
          alert('Incorrect PIN');
          setPinDigits(['', '', '', '']);
          pinInputRefs[0].current?.focus();
        }
      }, 100);
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs[index - 1].current?.focus();
    }
  };
  const filterKidContent = (movies: Movie[]) => {
    return movies.filter(movie => {
      // Strictly exclude adult content
      if (movie.adult) return false;

      // Only allow very kid-friendly genres (suitable for under 12)
      const kidFriendlyGenres = [16, 10751, 14, 12]; // Animation, Family, Fantasy, Adventure
      const inappropriateGenres = [27, 53, 80, 99, 10402, 9648, 18, 10749, 37]; // Horror, Thriller, Crime, Documentary, Music, Mystery, Drama, Romance, Western

      // Check if movie has any inappropriate genres
      const hasInappropriateGenre = movie.genre_ids.some(genreId => inappropriateGenres.includes(genreId));

      // If it has inappropriate genres, exclude it
      if (hasInappropriateGenre) return false;

      // Only include if it has kid-friendly genres - more restrictive for under 12
      const hasKidGenre = movie.genre_ids.some(genreId => kidFriendlyGenres.includes(genreId));
      
      // Also check vote average - exclude mature or intense content
      const isSuitableRating = movie.vote_average <= 7.5; // More family-oriented content
      
      return hasKidGenre && isSuitableRating;
    });
  };

  useEffect(() => {
    // Check if profile is selected
    const savedProfile = localStorage.getItem('selectedProfile');
    if (savedProfile) {
      setSelectedProfile(JSON.parse(savedProfile));
    }
  }, []);

  useEffect(() => {
    if (!selectedProfile) return;

    // Load saved movies from localStorage for this specific profile
    const savedMovies = localStorage.getItem(`myList_${selectedProfile.id}`);
    if (savedMovies) {
      try {
        let movies = JSON.parse(savedMovies);
        // Filter content for kids
        if (selectedProfile.isKid) {
          movies = filterKidContent(movies);
        }
        setMyListMovies(movies);
      } catch (error) {
        console.error('Error loading saved movies:', error);
      }
    }
  }, [selectedProfile]);

  const handleSearch = async (query: string) => {
    // Redirect to home page for search
    router.push(`/?search=${encodeURIComponent(query)}`);
  };

  const handleBrowse = () => {
    // Redirect to home page and scroll to movies
    router.push('/');
    setTimeout(() => {
      document.getElementById('movie-sections')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleProfileSelect = (profile: Profile) => {
    if (profile.password) {
      setPasswordPrompt({
        profile,
        onSuccess: () => {
          setSelectedProfile(profile);
          localStorage.setItem('selectedProfile', JSON.stringify(profile));
          setPasswordPrompt(null);
          setEnteredPassword('');
        }
      });
    } else {
      setSelectedProfile(profile);
      localStorage.setItem('selectedProfile', JSON.stringify(profile));
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordPrompt && enteredPassword === passwordPrompt.profile.password) {
      passwordPrompt.onSuccess();
    } else {
      alert('Incorrect password');
    }
  };

  const handleManageProfiles = () => {
    setIsManagingProfiles(!isManagingProfiles);
  };

  const handleSwitchProfile = () => {
    setSelectedProfile(null);
    localStorage.removeItem('selectedProfile');
  };

  const handleMyList = () => {
    // Already on My List page, do nothing
  };

  const removeFromList = (movieId: number) => {
    const movie = myListMovies.find(m => m.id === movieId);
    if (movie) {
      setRemoveConfirm({ movieId, movieTitle: movie.title });
    }
  };

  const confirmRemove = () => {
    if (removeConfirm && selectedProfile) {
      const updatedList = myListMovies.filter(movie => movie.id !== removeConfirm.movieId);
      setMyListMovies(updatedList);
      localStorage.setItem(`myList_${selectedProfile.id}`, JSON.stringify(updatedList));
      setRemoveConfirm(null);
    }
  };

  const handlePlayTrailer = async (movie: Movie) => {
    try {
      const trailers = await getMovieTrailers(movie.id);
      if (trailers.length > 0) {
        setTrailerModal({
          isOpen: true,
          trailerKey: trailers[0].key,
          movieTitle: movie.title,
        });
      } else {
        alert('No trailer available for this movie');
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
      alert('Failed to load trailer');
    }
  };

  const openDetails = (movie: Movie) => {
    setDetailsModal({ isOpen: true, movie });
  };

  const closeDetails = () => {
    setDetailsModal({ isOpen: false, movie: null });
  };

  const closeTrailerModal = () => {
    setTrailerModal({ isOpen: false, trailerKey: '', movieTitle: '' });
  };

  if (!selectedProfile) {
    return (
      <>
        <ProfileSelector
          onProfileSelect={handleProfileSelect}
          onEditProfiles={handleManageProfiles}
          isManaging={isManagingProfiles}
        />

        {/* Password Prompt Modal */}
        {passwordPrompt && (
          <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
            <button
              onClick={() => {
                setPasswordPrompt(null);
                setPinDigits(['', '', '', '']);
              }}
              className="absolute top-8 right-8 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Profile Lock is currently on.</p>
              <h2 className="text-white text-3xl font-bold mb-8">
                Enter your PIN to access this profile.
              </h2>

              <div className="flex gap-4 justify-center mb-8">
                {pinDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={pinInputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    className="w-20 h-20 bg-transparent border-2 border-gray-500 text-white text-center text-2xl rounded-md focus:outline-none focus:border-white transition-colors"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header 
        onSearch={handleSearch} 
        onBrowse={handleBrowse} 
        onMyList={handleMyList}
        selectedProfile={selectedProfile}
        onSwitchProfile={handleSwitchProfile}
      />

      <div className="pt-20 px-4 md:px-8">
        <h1 className="text-white text-3xl font-bold mb-6">My List</h1>

        {myListMovies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {myListMovies.map((movie) => (
              <div key={movie.id} className="relative">
                <MovieCard
                  movie={movie}
                  onPlayTrailer={() => handlePlayTrailer(movie)}
                  onClick={() => openDetails(movie)}
                  isKidProfile={selectedProfile?.isKid}
                  isMyListPage={true}
                />
                <button
                  onClick={() => removeFromList(movie.id)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-75 hover:opacity-100 transition-opacity shadow-lg"
                  title="Remove from My List"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">Your list is empty</div>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Browse Movies
            </button>
          </div>
        )}
      </div>

      <MovieDetailsModal
        movie={detailsModal.movie}
        isOpen={detailsModal.isOpen}
        onClose={closeDetails}
        onPlay={() => {
          if (detailsModal.movie) {
            closeDetails();
            router.push(`/watch/${detailsModal.movie.id}`);
          }
        }}
        onWatchTrailer={() => {
          if (detailsModal.movie) {
            closeDetails();
            handlePlayTrailer(detailsModal.movie);
          }
        }}
      />

      <TrailerModal
        isOpen={trailerModal.isOpen}
        onClose={closeTrailerModal}
        trailerKey={trailerModal.trailerKey}
        movieTitle={trailerModal.movieTitle}
      />

      {/* Remove Confirmation Modal */}
      {removeConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-white text-xl font-bold mb-4 text-center">
              Remove from My List?
            </h2>
            <p className="text-gray-300 text-center mb-6">
              Are you sure you want to remove "{removeConfirm.movieTitle}" from your list?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setRemoveConfirm(null)}
                className="flex-1 bg-gray-600 text-white py-3 rounded-md hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}