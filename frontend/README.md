# GeminiWatermark.ai Frontend

Production-ready Next.js application for GeminiWatermark.ai - The AI-powered watermark remover.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Icons**: Lucide React
- **Validation**: React Hook Form + Zod

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: React components grouped by feature (home, layout, ui).
- `hooks/`: Custom React hooks (e.g., `use-upload`).
- `lib/`: Utility functions and shared logic.

## Key Features

- **Dark Mode UI**: Premium aesthetic using Tailwind variables.
- **Drag & Drop Upload**: Interactive zone with animations.
- **Before/After Comparison**: Custom comparison slider.
- **SEO Optimized**: Metatags, JSON-LD, Sitemap, and Robots.txt included.

## Deployment

Ready for deployment on Vercel.
```bash
vercel deploy
```
