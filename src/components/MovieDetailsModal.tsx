'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import { Play, X, Star } from 'lucide-react';

interface MovieDetailsModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
  onWatchTrailer: () => void;
}

export default function MovieDetailsModal({ movie, isOpen, onClose, onPlay, onWatchTrailer }: MovieDetailsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !movie) return null;

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : '/placeholder-backdrop.jpg';

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"%3E%3Crect fill="%23333" width="500" height="750"/%3E%3Ctext fill="%23666" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-zinc-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Backdrop Image */}
        <div className="relative h-48 md:h-56">
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            className="object-cover rounded-t-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent rounded-t-lg" />
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster */}
            <div className="flex-shrink-0">
              <Image
                src={posterUrl}
                alt={movie.title}
                width={150}
                height={225}
                className="rounded-lg shadow-lg"
              />
            </div>

            {/* Details */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{movie.title}</h1>

              <div className="flex items-center gap-3 mb-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">{movie.vote_average.toFixed(1)}</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-gray-300">{new Date(movie.release_date).getFullYear()}</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-300">{movie.original_language.toUpperCase()}</span>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">{movie.overview}</p>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={onPlay}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-200 transition"
                >
                  <Play className="h-4 w-4" />
                  Play
                </button>
                <button
                  onClick={onWatchTrailer}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-500 transition"
                >
                  <Play className="h-4 w-4" />
                  Trailer
                </button>
                <button
                  onClick={() => {
                    const currentList = JSON.parse(localStorage.getItem('myList') || '[]');
                    const isAlreadyInList = currentList.some((m: Movie) => m.id === movie.id);
                    if (!isAlreadyInList) {
                      currentList.push(movie);
                      localStorage.setItem('myList', JSON.stringify(currentList));
                      alert('Added to My List!');
                    } else {
                      alert('Already in My List!');
                    }
                  }}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  My List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
