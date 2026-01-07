'use client';

import { X } from 'lucide-react';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerKey: string;
  movieTitle: string;
}

export default function TrailerModal({ isOpen, onClose, trailerKey, movieTitle }: TrailerModalProps) {
  if (!isOpen) return null;

  const trailerUrl = `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Close trailer"
          >
            <X className="h-8 w-8" />
          </button>
        </div>
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={trailerUrl}
            title={`${movieTitle} Trailer`}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        </div>
        <h3 className="text-white text-xl font-semibold mt-4">{movieTitle} - Official Trailer</h3>
      </div>
    </div>
  );
}