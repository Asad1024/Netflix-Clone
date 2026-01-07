'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MovieRow from '@/components/MovieRow';
import MovieCard from '@/components/MovieCard';
import TrailerModal from '@/components/TrailerModal';
import MovieDetailsModal from '@/components/MovieDetailsModal';
import ProfileSelector from '@/components/ProfileSelector';
import { Movie } from '@/types/movie';
import { getTrendingMovies, getTopRatedMovies, getPopularMovies, getMoviesByGenre, searchMovies, getMovieTrailers } from '@/utils/api';

interface Profile {
  id: string;
  name: string;
  avatar: string;
  isKid: boolean;
  password?: string;
}

export default function Home() {
  const router = useRouter();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [isManagingProfiles, setIsManagingProfiles] = useState(false);
  const [passwordPrompt, setPasswordPrompt] = useState<{ profile: Profile; onSuccess: () => void } | null>(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const pinInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([]);
  const [horrorMovies, setHorrorMovies] = useState<Movie[]>([]);
  const [romanceMovies, setRomanceMovies] = useState<Movie[]>([]);
  const [documentaryMovies, setDocumentaryMovies] = useState<Movie[]>([]);
  const [animationMovies, setAnimationMovies] = useState<Movie[]>([]);
  const [thrillerMovies, setThrillerMovies] = useState<Movie[]>([]);
  const [dramaMovies, setDramaMovies] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trailerModal, setTrailerModal] = useState<{ isOpen: boolean; trailerKey: string; movieTitle: string }>({
    isOpen: false,
    trailerKey: '',
    movieTitle: '',
  });
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; movie: Movie | null }>({ isOpen: false, movie: null });
  const [heroTrailerKey, setHeroTrailerKey] = useState<string>('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const filterKidContent = (movies: Movie[]) => {
    return movies.filter(movie => {
      // Exclude adult content
      if (movie.adult) return false;

      // Get genre IDs
      const genreIds = movie.genre_ids || [];
      if (genreIds.length === 0) return false;

      // Only allow kid-friendly genres (Family, Animation, Adventure, Fantasy, Comedy - under 12+)
      const kidFriendlyGenres = [16, 10751, 12, 14, 35]; // Animation, Family, Adventure, Fantasy, Comedy
      const inappropriateGenres = [27, 53, 80, 99, 10402, 9648, 28, 10749, 37, 10752, 18]; // Horror, Thriller, Crime, Documentary, Music, Mystery, Action, Romance, Western, War, Drama

      // Check if movie has any inappropriate genres - if yes, exclude
      const hasInappropriateGenre = genreIds.some(genreId => inappropriateGenres.includes(genreId));
      if (hasInappropriateGenre) return false;

      // Must have at least one kid-friendly genre
      const hasKidFriendlyGenre = genreIds.some(genreId => kidFriendlyGenres.includes(genreId));
      if (!hasKidFriendlyGenre) return false;
      
      // Additional safety: filter by vote average - must be family appropriate
      const hasSafeRating = movie.vote_average >= 5.0 && movie.vote_average <= 8.0;
      if (!hasSafeRating) return false;

      return true;
    });
  };

  useEffect(() => {
    // Check if profile is selected
    const savedProfile = localStorage.getItem('selectedProfile');
    if (savedProfile) {
      setSelectedProfile(JSON.parse(savedProfile));
    }
    
    // Load all profiles
    const savedProfiles = localStorage.getItem('netflixProfiles');
    if (savedProfiles) {
      const profiles = JSON.parse(savedProfiles);
      setAllProfiles(profiles);
      console.log('Loaded profiles:', profiles);
    }
  }, []);

  useEffect(() => {
    if (!selectedProfile) return;

    const fetchMovies = async () => {
      try {
        const [
          trending,
          topRated,
          popular,
          action,
          comedy,
          horror,
          romance,
          documentary,
          animation,
          thriller,
          drama,
        ] = await Promise.all([
          getTrendingMovies(),
          getTopRatedMovies(),
          getPopularMovies(),
          getMoviesByGenre(28), // Action
          getMoviesByGenre(35), // Comedy
          getMoviesByGenre(27), // Horror
          getMoviesByGenre(10749), // Romance
          getMoviesByGenre(99), // Documentary
          getMoviesByGenre(16), // Animation
          getMoviesByGenre(53), // Thriller
          getMoviesByGenre(18), // Drama
        ]);

  const filterContent = (movies: Movie[]) => {
    if (selectedProfile?.isKid) {
      return filterKidContent(movies);
    }
    return movies;
  };

        setTrendingMovies(filterContent(trending));
        setTopRatedMovies(filterContent(topRated));
        setPopularMovies(filterContent(popular));
        setActionMovies(filterContent(action));
        setComedyMovies(filterContent(comedy));
        setHorrorMovies(filterContent(horror));
        setRomanceMovies(filterContent(romance));
        setDocumentaryMovies(filterContent(documentary));
        setAnimationMovies(filterContent(animation));
        setThrillerMovies(filterContent(thriller));
        setDramaMovies(filterContent(drama));

        // Fetch trailer for hero movie (first trending movie)
        if (trending.length > 0) {
          try {
            const trailers = await getMovieTrailers(trending[0].id);
            if (trailers.length > 0) {
              setHeroTrailerKey(trailers[0].key);
            }
          } catch (error) {
            console.error('Error fetching hero trailer:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [selectedProfile]);

  const handleProfileSelect = (profile: Profile) => {
    if (profile.password) {
      setPasswordPrompt({
        profile,
        onSuccess: () => {
          setPasswordPrompt(null);
          setIsProfileLoading(true);
          setTimeout(() => {
            setSelectedProfile(profile);
            localStorage.setItem('selectedProfile', JSON.stringify(profile));
            setEnteredPassword('');
            setIsProfileLoading(false);
            router.push('/');
          }, 1000);
        }
      });
    } else {
      setIsProfileLoading(true);
      setTimeout(() => {
        setSelectedProfile(profile);
        localStorage.setItem('selectedProfile', JSON.stringify(profile));
        setIsProfileLoading(false);
        router.push('/');
      }, 1000);
    }
  };

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

  const handleManageProfiles = () => {
    if (isManagingProfiles) {
      // Exiting manage mode: just exit, don't auto-select
      setIsManagingProfiles(false);
    } else {
      // Enter manage mode
      setSelectedProfile(null);
      localStorage.removeItem('selectedProfile');
      setIsManagingProfiles(true);
    }
  };

  const handleSwitchProfile = () => {
    setSelectedProfile(null);
    localStorage.removeItem('selectedProfile');
  };

  const handleBrowse = () => {
    setIsSearching(false);
    setSearchResults([]);
    // Smooth scroll to movie sections
    setTimeout(() => {
      document.getElementById('movie-sections')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleMyList = () => {
    router.push('/my-list');
  };

  const handleSearch = async (query: string) => {
    if (query.trim() === '') {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchMovies(query);
      // Filter content for kids
      const filteredResults = selectedProfile?.isKid
        ? filterKidContent(results)
        : results;
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
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

  const closeTrailerModal = () => {
    setTrailerModal({ isOpen: false, trailerKey: '', movieTitle: '' });
  };

  const openDetails = (movie: Movie) => {
    setDetailsModal({ isOpen: true, movie });
  };

  const closeDetails = () => {
    setDetailsModal({ isOpen: false, movie: null });
  };

  if (!selectedProfile) {
    return (
      <>
        <ProfileSelector
          onProfileSelect={handleProfileSelect}
          onEditProfiles={handleManageProfiles}
          isManaging={isManagingProfiles}
        />

        {/* Loader overlay when switching profiles */}
        {isProfileLoading && !passwordPrompt && (
          <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-t-red-600 border-r-red-600 border-b-red-600 border-l-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Password Prompt Modal */}
        {passwordPrompt && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
            <div className="bg-zinc-900 p-8 rounded-lg max-w-md w-full mx-4">
              <button
                onClick={() => {
                  setPasswordPrompt(null);
                  setPinDigits(['', '', '', '']);
                  setIsProfileLoading(false);
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
          </div>
        )}
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-red-600 border-r-red-600 border-b-red-600 border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {isProfileLoading && !passwordPrompt && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-red-600 border-r-red-600 border-b-red-600 border-l-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Password Prompt Modal - works when switching between profiles */}
      {passwordPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
          <div className="bg-zinc-900 p-8 rounded-lg max-w-md w-full mx-4">
            <button
              onClick={() => {
                setPasswordPrompt(null);
                setPinDigits(['', '', '', '']);
                setIsProfileLoading(false);
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
        </div>
      )}

      <Header 
        onSearch={handleSearch} 
        onBrowse={handleBrowse} 
        onMyList={handleMyList}
        selectedProfile={selectedProfile}
        allProfiles={allProfiles}
        onSwitchProfile={handleSwitchProfile}
        onSelectProfile={(profileId) => {
          const profile = allProfiles.find(p => p.id === profileId);
          if (profile) {
            handleProfileSelect(profile);
          }
        }}
        onManageProfiles={handleManageProfiles}
        onSignOut={() => {
          localStorage.removeItem('selectedProfile');
          router.push('/');
        }}
      />

      {isSearching ? (
        <div className="pt-20 px-4 md:px-8">
          <h1 className="text-white text-2xl font-semibold mb-6">Search Results</h1>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {searchResults.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPlayTrailer={() => handlePlayTrailer(movie)}
                  onClick={() => openDetails(movie)}
                  isKidProfile={selectedProfile?.isKid}
                />
              ))}
            </div>
          ) : (
            <div className="text-white text-center py-12">No movies found</div>
          )}
        </div>
      ) : (
        <>
          {trendingMovies.length > 0 && (
            <Hero
              movie={trendingMovies[0]}
              onPlay={() => router.push(`/watch/${trendingMovies[0].id}`)}
              onMoreInfo={() => openDetails(trendingMovies[0])}
              trailerKey={heroTrailerKey}
            />
          )}

          <div id="movie-sections" className="relative z-10 -mt-32 pb-20">
            <MovieRow
              title="Trending Now"
              movies={trendingMovies}
              onMovieClick={openDetails}
              onPlayTrailer={handlePlayTrailer}
              isKidProfile={selectedProfile?.isKid}
            />
            <MovieRow
              title="Top Rated"
              movies={topRatedMovies}
              onMovieClick={openDetails}
              onPlayTrailer={handlePlayTrailer}
              isKidProfile={selectedProfile?.isKid}
            />
            <MovieRow
              title="Popular"
              movies={popularMovies}
              onMovieClick={openDetails}
              onPlayTrailer={handlePlayTrailer}
              isKidProfile={selectedProfile?.isKid}
            />

            {selectedProfile?.isKid ? (
              // Kid-friendly categories
              <>
                <MovieRow
                  title="Animation"
                  movies={animationMovies}
                  onMovieClick={openDetails}
                  onPlayTrailer={handlePlayTrailer}
                  isKidProfile={true}
                />
                <MovieRow
                  title="Comedy Movies"
                  movies={comedyMovies}
                  onMovieClick={openDetails}
                  onPlayTrailer={handlePlayTrailer}
                  isKidProfile={true}
                />
              </>
            ) : (
              // Adult categories
              <>
                <MovieRow
                  title="Action Movies"
                  movies={actionMovies}
                  onMovieClick={openDetails}
                  onPlayTrailer={handlePlayTrailer}
                  isKidProfile={false}
                />
                <MovieRow
                  title="Comedy Movies"
                  movies={comedyMovies}
                  onMovieClick={openDetails}
                  onPlayTrailer={handlePlayTrailer}
                  isKidProfile={false}
                />
                <MovieRow
                  title="Horror Movies"
                  movies={horrorMovies}
                  onMovieClick={openDetails}
                  onPlayTrailer={handlePlayTrailer}
                  isKidProfile={false}
                />
                <MovieRow
                  title="Romance Movies"
                  movies={romanceMovies}
                  onMovieClick={openDetails}
                  onPlayTrailer={handlePlayTrailer}
                  isKidProfile={false}
                />
                <MovieRow
                  title="Documentary"
                  movies={documentaryMovies}
                  onMovieClick={openDetails}
                  onPlayTrailer={handlePlayTrailer}
                  isKidProfile={false}
                />
                <MovieRow
                  title="Animation"
                  movies={animationMovies}
                  onMovieClick={openDetails}
                  onPlayTrailer={handlePlayTrailer}
                  isKidProfile={false}
                />
                <MovieRow
                  title="Thriller"
                  movies={thrillerMovies}
                  onMovieClick={openDetails}
                  onPlayTrailer={handlePlayTrailer}
                  isKidProfile={false}
                />
                <MovieRow
                  title="Drama"
                  movies={dramaMovies}
                  onMovieClick={openDetails}
                  onPlayTrailer={handlePlayTrailer}
                  isKidProfile={false}
                />
              </>
            )}
          </div>
        </>
      )}

      <TrailerModal
        isOpen={trailerModal.isOpen}
        onClose={closeTrailerModal}
        trailerKey={trailerModal.trailerKey}
        movieTitle={trailerModal.movieTitle}
      />
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
    </div>
  );
}
