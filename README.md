# Grok Image Creator

A text-to-image creation application powered by the xAI Grok Image API and OpenRouter. 

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
