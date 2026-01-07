'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import MovieCard from '@/components/MovieCard';
import TrailerModal from '@/components/TrailerModal';
import MovieDetailsModal from '@/components/MovieDetailsModal';
import { Movie } from '@/types/movie';
import { searchMovies, getMovieTrailers } from '@/utils/api';

interface Profile {
  id: string;
  name: string;
  avatar: string;
  isKid: boolean;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [trailerModal, setTrailerModal] = useState<{ isOpen: boolean; trailerKey: string; movieTitle: string }>({
    isOpen: false,
    trailerKey: '',
    movieTitle: '',
  });
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; movie: Movie | null }>({ isOpen: false, movie: null });

  useEffect(() => {
    const savedProfile = localStorage.getItem('selectedProfile');
    if (savedProfile) {
      setSelectedProfile(JSON.parse(savedProfile));
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (query && selectedProfile) {
      fetchSearchResults();
    }
  }, [query, selectedProfile]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const results = await searchMovies(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
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

  const handleSwitchProfile = () => {
    localStorage.removeItem('selectedProfile');
    router.push('/');
  };

  if (!selectedProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <Header 
        onSearch={handleSearch}
        onBrowse={() => router.push('/')}
        onMyList={() => router.push('/my-list')}
        selectedProfile={selectedProfile}
        onSwitchProfile={handleSwitchProfile}
      />

      <div className="pt-24 px-4 md:px-8 pb-20">
        <h1 className="text-white text-2xl md:text-3xl font-semibold mb-6">
          {query ? `Search results for "${query}"` : 'Search'}
        </h1>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-t-red-600 border-r-red-600 border-b-red-600 border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
          <div className="text-white text-center py-20">
            <p className="text-xl mb-2">No results found for "{query}"</p>
            <p className="text-gray-400">Try searching for something else</p>
          </div>
        )}
      </div>

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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-red-600 border-r-red-600 border-b-red-600 border-l-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
