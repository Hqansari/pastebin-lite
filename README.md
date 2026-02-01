# Pastebin Lite

A modern, beautiful pastebin application for sharing text and code snippets with optional expiration and view limits.

## Features

- 🎨 Modern glassmorphic UI with animated gradient backgrounds
- 📝 Create and share text/code snippets with unique URLs
- ⏰ Optional time-based expiration (TTL)
- 👁️ Optional view count limits
- 🔒 Secure and simple to use
- 📱 Fully responsive design

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Custom CSS with glassmorphism and gradient mesh
- **Backend**: Next.js API Routes
- **Persistence**: Vercel KV (Redis) for production, in-memory mock storage for local development

## Running Locally

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Hqansari/pastebin-lite.git
cd pastebin-lite
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Local Development Notes

- The application uses **mock in-memory storage** for local development
- Pastes are stored in memory and will be lost when the dev server restarts
- This is sufficient for testing functionality locally

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will auto-detect Next.js configuration
4. Add a Vercel KV (Redis) database:
   - Go to your Vercel project
   - Navigate to Storage tab
   - Create a KV database
   - Connect it to your project
5. Deploy!

### Environment Variables

For production with Vercel KV, these variables are automatically set by Vercel when you connect the KV database:

- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

## Persistence Layer

### Local Development
- **Type**: In-memory storage using Node.js global object
- **Implementation**: `lib/storage.ts` uses `global.mockStore` Map
- **Pros**: No setup required, instant testing
- **Cons**: Data is lost on server restart
- **Use case**: Local development and testing

### Production
- **Type**: Vercel KV (Redis)
- **Implementation**: `@vercel/kv` package
- **Pros**: Persistent, fast, scalable, automatic TTL support
- **Cons**: Requires Vercel account and KV database
- **Use case**: Production deployment on Vercel

The application automatically detects the environment and uses the appropriate storage backend.

## API Endpoints

### Health Check
```
GET /api/healthz
```
Returns: `{"ok": true}`

### Create Paste
```
POST /api/pastes
Content-Type: application/json

{
  "content": "Your text here",
  "ttl_seconds": 3600,    // optional
  "max_views": 10         // optional
}
```

Returns:
```json
{
  "id": "abc123",
  "url": "https://your-domain.com/p/abc123"
}
```

### Get Paste (API)
```
GET /api/pastes/:id
```

Returns:
```json
{
  "content": "Your text here",
  "remaining_views": 9,
  "expires_at": "2026-02-01T12:00:00.000Z"
}
```

### View Paste (HTML)
```
GET /p/:id
```
Returns HTML page with the paste content

## Design Decisions

### UI/UX
- **Neo-brutalist typography** with Syne font for bold, modern headings
- **Glassmorphism** with backdrop blur for depth and elegance
- **Animated gradient mesh** background for visual interest
- **Space Mono** for code/content display (distinctive monospace)
- **Micro-interactions** and smooth animations for delightful UX

### Architecture
- **Server Components** for paste viewing (better SEO, faster initial load)
- **Client Components** for interactive forms (rich UX)
- **API Routes** following RESTful conventions
- **Hybrid storage** strategy (mock for dev, Redis for production)

### Security
- Content is HTML-escaped to prevent XSS attacks
- No user authentication required (simplicity)
- Pastes are public but obscure (long random IDs)

## Project Structure
```
pastebin-lite/
├── app/
│   ├── api/
│   │   ├── healthz/
│   │   │   └── route.ts          # Health check endpoint
│   │   └── pastes/
│   │       ├── route.ts           # Create paste
│   │       └── [id]/
│   │           └── route.ts       # Get paste API
│   ├── p/
│   │   └── [id]/
│   │       └── page.tsx           # View paste page
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   ├── not-found.tsx              # 404 page
│   └── page.tsx                   # Home page (create paste)
├── lib/
│   ├── storage.ts                 # Storage layer abstraction
│   ├── types.ts                   # TypeScript types
│   └── utils.ts                   # Utility functions
├── next.config.js                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies
└── README.md                      # This file
```

## Author

Created as part of a coding assessment.
