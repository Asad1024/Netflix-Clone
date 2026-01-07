import { useRef } from 'react';
import { Movie } from '@/types/movie';
import MovieCard from './MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onMovieClick?: (movie: Movie) => void; // opens details
  onPlayTrailer?: (movie: Movie) => void; // plays trailer directly
  isKidProfile?: boolean;
}

export default function MovieRow({ title, movies, onMovieClick, onPlayTrailer, isKidProfile }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 800;
      const newScrollLeft = direction === 'left'
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-white text-2xl font-semibold mb-4 px-4 md:px-8">{title}</h2>
      <div className="relative group/row">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 text-white p-2 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 text-white p-2 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-scroll px-4 md:px-8 scrollbar-hide scroll-smooth"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-none w-48">
              <MovieCard
                movie={movie}
                onClick={() => onMovieClick?.(movie)}
                onPlayTrailer={() => onPlayTrailer?.(movie)}
                isKidProfile={isKidProfile}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}