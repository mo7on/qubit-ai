# Qubit AI - Real-time Problem-Solving Application

## Overview
A Next.js-based AI application that uses Google's Gemini API to provide intelligent responses for IT support and problem-solving. The app includes both text and image-based AI interactions.

**Current State**: Successfully migrated from Vercel to Replit and running in development mode.

## Recent Changes (November 12, 2025)
- ✅ Migrated project from Vercel to Replit
- ✅ Configured Next.js to run on port 5000 with host 0.0.0.0 (required for Replit)
- ✅ Set up pnpm package manager
- ✅ Configured development workflow
- ✅ Added GEMINI_API_KEY secret to environment
- ✅ Configured autoscale deployment for production

## Project Architecture

### Framework & Stack
- **Framework**: Next.js 15.2.2 (App Router)
- **Package Manager**: pnpm
- **Runtime**: Node.js
- **Deployment**: Replit Autoscale (stateless)

### Key Features
- Text-based AI conversations using Gemini 2.5 Flash
- Image analysis using Gemini 2.0 Flash
- Retry logic for API requests (3 retries with 1s delay)
- Responsive UI built with Radix UI components
- Enhanced error handling to prevent circular reference issues

### Environment Variables
- `GEMINI_API_KEY`: Google Gemini API key for AI functionality (required)

## Development

### Running Locally
```bash
pnpm run dev
```
App runs on http://0.0.0.0:5000

### Scripts
- `dev`: Start development server with Turbopack on port 5000
- `build`: Build for production
- `start`: Start production server on port 5000
- `lint`: Run ESLint

## Deployment

### Configuration
- **Type**: Autoscale (stateless)
- **Build Command**: `pnpm run build`
- **Start Command**: `pnpm start`
- **Port**: 5000

### Known Issues
- Production builds may fail in memory-constrained environments due to Next.js 15.2.2 build process requiring significant memory
- Solution: Deploy directly from Replit (builds run with adequate resources on deployment infrastructure)

## API Routes
- `/api/gemini/text`: Text-based AI responses
- `/api/gemini/image`: Image analysis with AI
- `/api/conversation-history`: Conversation history management

## Dependencies of Note
- `@google/generative-ai`: Google's Gemini API client
- `@radix-ui/*`: UI component library
- `next-themes`: Dark mode support
- `zod`: Schema validation
- `zustand`: State management

## User Preferences
None specified yet.
