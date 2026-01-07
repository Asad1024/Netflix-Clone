'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';

interface HeroProps {
  movie: Movie;
  onPlay?: () => void;
  onMoreInfo?: () => void;
  trailerKey?: string;
}

export default function Hero({ movie, onPlay, onMoreInfo, trailerKey }: HeroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const videoRef = useRef<HTMLIFrameElement>(null);
  
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : '/placeholder-backdrop.jpg';

  useEffect(() => {
    // Auto-play trailer after 3 seconds
    const timer = setTimeout(() => {
      if (trailerKey) {
        setShowVideo(true);
      }
    }, 3000);

    // Hide description after 4 seconds
    const descTimer = setTimeout(() => {
      setShowDescription(false);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(descTimer);
    };
  }, [trailerKey]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Get age rating based on vote average and content
  const getAgeRating = () => {
    if (movie.adult) return '18+';
    if (movie.vote_average >= 7.5) return '16+';
    if (movie.vote_average >= 6) return '13+';
    return '7+';
  };

  return (
    <div className="relative overflow-hidden" style={{ height: '90vh', minHeight: '650px' }}>
      {/* Background Image or Video */}
      <div className="absolute inset-0 overflow-hidden">
        {showVideo && trailerKey ? (
          <div className="relative w-full h-full">
            <iframe
              ref={videoRef}
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerKey}&modestbranding=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{
                width: '100vw',
                height: '100vh',
                transform: 'scale(1.5)',
                transformOrigin: 'center center'
              }}
            />
          </div>
        ) : (
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-end h-full pb-52">
        <div className="w-full flex items-end justify-between px-4 md:px-12 max-w-[1400px] mx-auto">
          <div className="max-w-2xl">
            {/* Netflix Logo Badge */}
            <div className="mb-4">
              <Image src="/logo.svg" alt="Netflix" width={80} height={21} priority />
            </div>
            
            {/* Movie Title */}
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-4 tracking-wider" style={{ letterSpacing: '0.08em' }}>
              {movie.title.toUpperCase()}
            </h1>
            
            {/* Movie Description with animation */}
            <div className={`transition-all duration-700 overflow-hidden ${
              showDescription ? 'max-h-32 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'
            }`}>
              <p className="text-white text-base md:text-lg line-clamp-3 max-w-xl leading-relaxed">
                {movie.overview}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={onPlay}
                className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-white/90 transition-all transform hover:scale-105"
              >
                <Play className="h-6 w-6 fill-black" />
                <span className="text-lg">Play</span>
              </button>
              <button
                onClick={onMoreInfo}
                className="flex items-center space-x-2 bg-gray-500/70 text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-500/50 transition-all backdrop-blur-sm"
              >
                <Info className="h-6 w-6" />
                <span className="text-lg">More Info</span>
              </button>
            </div>
          </div>
          
          {/* Right Side Controls - Same row as buttons */}
          <div className="flex items-center space-x-4 mb-3">
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              className="p-3 rounded-full border-2 border-white/80 hover:border-white hover:bg-white/10 transition-all"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-white" />
              ) : (
                <Volume2 className="h-5 w-5 text-white" />
              )}
            </button>

            {/* Age Rating Badge */}
            <div className="px-4 py-2 border-2 border-white/70 text-white font-semibold text-base">
              {getAgeRating()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}