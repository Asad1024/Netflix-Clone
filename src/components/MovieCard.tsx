import Image from 'next/image';
import { Movie } from '@/types/movie';
import { Play, Star } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onPlayTrailer?: () => void;
  onClick?: () => void;
  isKidProfile?: boolean;
  isMyListPage?: boolean;
}

export default function MovieCard({ movie, onPlayTrailer, onClick, isKidProfile, isMyListPage = false }: MovieCardProps) {
  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"%3E%3Crect fill="%23333" width="500" height="750"/%3E%3Ctext fill="%23666" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

  return (
    <div className="relative group cursor-pointer transition-transform duration-200 hover:scale-105" onClick={onClick}>
      <div className="aspect-[2/3] relative overflow-hidden rounded-md">
        <Image
          src={imageUrl}
          alt={movie.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {onPlayTrailer && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3" onClick={onClick}>
            <div className="text-white">
              <h3 className="text-sm font-bold mb-1 line-clamp-1">{movie.title}</h3>
              <div className="flex items-center gap-1 mb-2 text-xs">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-gray-300">{new Date(movie.release_date).getFullYear()}</span>
              </div>
              <p className="text-xs text-gray-200 mb-3 line-clamp-2 leading-tight">{movie.overview.length > 100 ? movie.overview.substring(0, 100) + '...' : movie.overview}</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onClick) onClick();
                  }}
                  className="flex items-center gap-1 bg-white text-black px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  Open
                </button>
                {(!isKidProfile || !movie.adult) && !isMyListPage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const selectedProfile = JSON.parse(localStorage.getItem('selectedProfile') || '{}');
                      const profileId = selectedProfile.id || 'default';
                      const currentList = JSON.parse(localStorage.getItem(`myList_${profileId}`) || '[]');
                      const isAlreadyInList = currentList.some((m: Movie) => m.id === movie.id);
                      if (!isAlreadyInList) {
                        currentList.push(movie);
                        localStorage.setItem(`myList_${profileId}`, JSON.stringify(currentList));
                        // Show success feedback
                        const btn = e.currentTarget;
                        btn.innerHTML = '✓';
                        btn.classList.add('bg-green-600', 'text-white');
                        setTimeout(() => {
                          btn.innerHTML = `
                            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                          `;
                          btn.classList.remove('bg-green-600', 'text-white');
                        }, 1500);
                      } else {
                        const btn = e.currentTarget;
                        btn.innerHTML = '✓';
                        btn.classList.add('bg-green-600');
                        setTimeout(() => {
                          btn.innerHTML = `
                            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                          `;
                          btn.classList.remove('bg-green-600');
                        }, 1500);
                      }
                    }}
                    className="flex items-center justify-center bg-gray-600/80 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-500 transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}