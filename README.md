# Aayu: Your AI Companion

This is a web-based AI chat application designed to be a warm, empathetic companion for users. It supports multilingual conversations (English and Hindi), voice chat, and a friendly, human-like interaction style.

## Key Features

- **Empathetic AI Persona**: Aayu is designed to be a supportive, non-judgmental listener.
- **Bilingual Support**: Full UI and AI support for both English and Hindi.
- **Voice Chat**: Continuous, hands-free voice conversation mode.
- **Hinglish Support**: The AI naturally understands and responds in Hinglish for more relatable conversations.
- **Secure & Deployable**: Built with a secure backend proxy for the API key and ready for one-click deployment.

## Tech Stack

- **Frontend**: React (with TypeScript) using a build-less CDN approach (`esm.sh`).
- **Backend**: Vercel Serverless Function (TypeScript) to securely proxy Gemini API requests.
- **AI**: Google Gemini API (`gemini-2.5-flash`).
- **Styling**: Tailwind CSS.
- **Deployment**: Vercel.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Vercel Account](https://vercel.com/signup)
- [GitHub Account](https://github.com/join)
- A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a new file named `.env.local` in the root of your project and add your Gemini API key:
    ```
    API_KEY="YOUR_GEMINI_API_KEY"
    ```

4.  **Run the development server:**
    This command uses the Vercel CLI to run the app locally, including the serverless function.
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

---

## Deployment

Deploying Aayu is simple with Vercel and GitHub.

1.  **Push to GitHub:**
    Create a new repository on GitHub and push the project code.

2.  **Import Project on Vercel:**
    - Log in to your Vercel account.
    - Click on "Add New..." -> "Project".
    - Import the GitHub repository you just created.

3.  **Configure Environment Variables:**
    - In the project settings on Vercel, navigate to the "Environment Variables" section.
    - Add a new variable:
        - **Name**: `API_KEY`
        - **Value**: Paste your Gemini API key here.
    - Vercel will automatically detect the framework and settings.

4.  **Deploy:**
    - Click the "Deploy" button. Vercel will build and deploy your application.
    - Once finished, you will be given a public URL for your live Aayu application.
