# Netflix Clone

A fully functional Netflix clone built with Next.js, TypeScript, and Tailwind CSS. Features movie browsing, search, and responsive design.

## Features

- 🎬 Browse trending, top-rated, and popular movies
- 🔍 Search for movies
- 📱 Responsive design
- 🎨 Netflix-like UI with dark theme
- ⚡ Built with Next.js 15 and TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- TMDB API Key (free)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Get your TMDB API key:
   - Go to [TMDB](https://www.themoviedb.org/settings/api)
   - Create an account and request an API key
   - Add it to `.env.local`:
   ```
   NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **API:** TMDB (The Movie Database)
- **HTTP Client:** Axios

## Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── MovieCard.tsx
│   └── MovieRow.tsx
├── types/
│   └── movie.ts
└── utils/
    └── api.ts
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add your TMDB API key to Vercel environment variables
4. Deploy!

### Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables in Netlify dashboard

## API

This app uses The Movie Database (TMDB) API. All endpoints are free and don't require payment.

## Contributing

Feel free to submit issues and pull requests.

## License

MIT License
