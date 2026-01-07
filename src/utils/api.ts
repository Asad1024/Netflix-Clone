import axios from 'axios';
import { Movie, MovieResponse, Genre } from '@/types/movie';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || 'your_api_key_here'; // Replace with your TMDB API key
const BASE_URL = 'https://api.themoviedb.org/3';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export const getTrendingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await api.get<MovieResponse>('/trending/movie/week');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};

export const getTopRatedMovies = async (): Promise<Movie[]> => {
  try {
    const response = await api.get<MovieResponse>('/movie/top_rated');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return [];
  }
};

export const getPopularMovies = async (): Promise<Movie[]> => {
  try {
    const response = await api.get<MovieResponse>('/movie/popular');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

export const getMoviesByGenre = async (genreId: number): Promise<Movie[]> => {
  try {
    const response = await api.get<MovieResponse>('/discover/movie', {
      params: {
        with_genres: genreId,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    return [];
  }
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  try {
    const response = await api.get<MovieResponse>('/search/movie', {
      params: {
        query,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

export const getGenres = async (): Promise<Genre[]> => {
  try {
    const response = await api.get<{ genres: Genre[] }>('/genre/movie/list');
    return response.data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

export const getMovieTrailers = async (id: number): Promise<any[]> => {
  try {
    const response = await api.get(`/movie/${id}/videos`);
    return response.data.results.filter((video: any) => video.type === 'Trailer' && video.site === 'YouTube');
  } catch (error) {
    console.error('Error fetching movie trailers:', error);
    return [];
  }
};

export const getMovieDetails = async (id: number): Promise<Movie | null> => {
  try {
    const response = await api.get<Movie>(`/movie/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};