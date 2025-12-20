# AI Against Humanity – AI Party Game

A real-time, multiplayer "prompt-and-response" game where an AI agent competes against human players to see who is the funniest. Built with **Next.js**, **Firebase**, and **Google Gemini**.

---

## 🛠 Project Layout

- **`/src/app`**: The root file of the application
  - `/api`: Server-side routes that securely call the Gemini API. One file for `/prompt` and one for `/ai-answer`. Includes the rules for each file 
  - `page.tsx`: The main game controller and UI entry point. Asks players to join. sends users to `/join` where they scan a qr code to take them to the site on their phone. from there `/play` is the main webpage for gameplay.
- **`/src/hooks`**: Contains all hooks and important methods for gameplay. 
  - > `useEvent.ts`: The **Game Engine**. Manages Firestore state transitions, judging logic, and score tracking.
- **`/src/components`**: Modular UI pieces (Lobby, Submission Form, Judge Panel, Winner Reveal).
- **`/src/lib`**: Initialization for Firebase and shared utility functions.
- **`/src/types`**: TypeScript interfaces for consistent data modeling across the app.

---

## 🎮 How to Play

1.  **Join the Game:** Players enter the landing page, sent to a page for all players to scan a Qr code and taken to a last page where players join a game session. From there players create a user name and select join. 
2.  **The Judge:** One player is designated as the Judge for the round. This player enters in a "judge key" which will give them the role of judge with a new play layout. The judge select "Start Round" moving the game to the next stage. 
3.  **The Prompt:** The AI (Gemini) generates a creative, open-ended prompt for everyone.
4.  **Submission:** - Human players type in their funniest responses.
    - The AI Player automatically generates its own response in the background.
5.  **Judging:** The Judge reviews all responses **anonymously**. They pick the best one without knowing who (or what) wrote it.
6.  **The Reveal:** Points are awarded, and the game reveals if a human or the AI won that round.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed.

### 2. Setup Environment Variables
This project requires Firebase and Google Gemini credentials. 
1. Create a `.env.local` file in the root directory.
2. Copy the structure from the **Configuration** section below and fill in your keys.

### 3. Installation
```bash
npm install
4. Run Development Server
Bash

npm run dev
Navigate to http://localhost:3000 to start playing.

🔑 Configuration (.env.local)
To run this project, you will need to provide the following environment variables. Note to Grading Team: These values are excluded for security but are required for the AI and Database features to function.

Plaintext

# Google Gemini API Key
GEMINI_API_KEY=your_api_key_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

