# Grok Image Creator

A sleek, dedicated text-to-image creation application powered by the xAI Grok Image API and OpenRouter. Built with React and Vite for lightning-fast performance.

## Features
- **xAI Grok Integration**: Seamlessly interface with Grok's image generation models.
- **OpenRouter Fallback**: Configured to support OpenRouter API endpoints.
- **Client-Side Security**: API keys are injected at runtime via local `.env` or UI prompts, ensuring zero server-side credential leakage.
- **Modern UI**: Fully responsive frontend built with React and Tailwind CSS.

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
