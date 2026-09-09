# Grok Image Creator

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![React](https://img.shields.io/badge/React-20232A?style=flat# Grok Image Creatorlogo=react# Grok Image CreatorlogoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat# Grok Image Creatorlogo=typescript# Grok Image CreatorlogoColor=white) ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat# Grok Image Creatorlogo=vite# Grok Image CreatorlogoColor=FFD62E)


**xAI Grok text-to-image application** built with React and Vite. It routes prompt generation directly to Grok's image models, uses OpenRouter as an alternative endpoint fallback, and secures API keys locally without server-side credential storage.

## Features
- **xAI Grok Integration**: Send direct calls to Grok's image generation models.
- **OpenRouter Fallback**: Configured to support alternative OpenRouter API endpoints.
- **Client-Side Security**: Enter API keys at runtime via local `.env` or UI prompts. Zero server-side credential storage.
- **Responsive UI**: Frontend built with React and Tailwind CSS.

## Tech Stack
- React 19
- Vite
- Tailwind CSS
- TypeScript

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/markkirby125/Grok-Image-Creator.git
   cd Grok-Image-Creator
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env.local` file:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## License
MIT License
