'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import { getMovieDetails, getMovieTrailers } from '@/utils/api';
import { ArrowLeft, Play } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  avatar: string;
  isKid: boolean;
  password?: string;
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [trailerKey, setTrailerKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const isKidFriendlyContent = (movie: Movie | any) => {
    // Strictly exclude adult content
    if (movie.adult) return false;

    // Get genre IDs - handle both genre_ids (from list) and genres (from details)
    let genreIds: number[] = [];
    if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
      genreIds = movie.genre_ids;
    } else if (movie.genres && Array.isArray(movie.genres)) {
      genreIds = movie.genres.map((g: any) => g.id);
    }

    if (genreIds.length === 0) return false;

    // Only allow very kid-friendly genres (suitable for under 12) - SAME AS MAIN PAGE
    const kidFriendlyGenres = [16, 10751, 12, 14, 35]; // Animation, Family, Adventure, Fantasy, Comedy
    const inappropriateGenres = [27, 53, 80, 99, 10402, 9648, 28, 10749, 37, 10752, 18]; // Horror, Thriller, Crime, Documentary, Music, Mystery, Action, Romance, Western, War, Drama

    // Check if movie has any inappropriate genres
    const hasInappropriateGenre = genreIds.some(genreId => inappropriateGenres.includes(genreId));

    // If it has inappropriate genres, exclude it
    if (hasInappropriateGenre) return false;

    // Must have at least one kid-friendly genre
    const hasKidFriendlyGenre = genreIds.some(genreId => kidFriendlyGenres.includes(genreId));
    
    // Additional safety: filter by vote average - must be family appropriate
    const hasSafeRating = movie.vote_average >= 5.0 && movie.vote_average <= 8.0;

    return hasKidFriendlyGenre && hasSafeRating;
  };

  useEffect(() => {
    // Check if profile is selected
    const savedProfile = localStorage.getItem('selectedProfile');
    if (savedProfile) {
      setSelectedProfile(JSON.parse(savedProfile));
    } else {
      // No profile selected, redirect to home
      router.push('/');
      return;
    }
  }, [router]);

  useEffect(() => {
    const fetchMovieAndTrailer = async () => {
      if (!params.id || !selectedProfile) return;

      try {
        const movieId = parseInt(params.id as string);
        const [movieData, trailers] = await Promise.all([
          getMovieDetails(movieId),
          getMovieTrailers(movieId),
        ]);

        if (movieData) {
          // Check if kid profile trying to access inappropriate content
          if (selectedProfile.isKid && !isKidFriendlyContent(movieData)) {
            setError('This content is not available for kids');
            setLoading(false);
            return;
          }
          setMovie(movieData);
        } else {
          setError('Movie not found');
        }

        if (trailers.length > 0) {
          setTrailerKey(trailers[0].key);
        } else {
          setError('No trailer available for this movie');
        }
      } catch (err) {
        console.error('Error fetching movie or trailer:', err);
        setError('Failed to load movie or trailer');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndTrailer();
  }, [params.id, selectedProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-red-600 border-r-red-600 border-b-red-600 border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl mb-4">Error</h1>
          <p className="text-gray-400 mb-6">{error || 'Movie not found'}</p>
          <button
            onClick={() => router.back()}
            className="bg-white text-black px-6 py-3 rounded-md font-semibold hover:bg-gray-200 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const trailerUrl = `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1&showinfo=0`;

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player - Fullscreen */}
      <div className="relative w-full h-screen">
        <iframe
          src={trailerUrl}
          title={`${movie.title} Trailer`}
          className="absolute top-0 left-0 w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media"
        />
        {/* Back Button Overlay */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-white bg-black/50 hover:bg-black/70 transition-colors px-4 py-2 rounded-md backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-semibold">Back</span>
        </button>
      </div>

      {/* Movie Info */}
      <div className="px-4 md:px-8 py-6">
        <h1 className="text-white text-3xl font-bold mb-2">{movie.title}</h1>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-gray-300">{new Date(movie.release_date).getFullYear()}</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-300">{movie.original_language.toUpperCase()}</span>
          <span className="text-gray-300">•</span>
          <span className="text-yellow-400">★ {movie.vote_average.toFixed(1)}</span>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">{movie.overview}</p>
      </div>
    </div>
  );
}