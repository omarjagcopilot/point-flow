# Point Flow 🎯

A lightweight planning poker app for agile teams to estimate stories in real-time.

## Features

- **Real-time Voting**: Instant synchronization across all participants
- **Two Session Types**: 
  - **Planned**: Pre-add stories before inviting team
  - **Quick**: Start immediately, add stories on the fly
- **Multiple Point Scales**: Fibonacci, T-Shirt sizes, Powers of 2
- **Voting Timer**: Optional time limits for focused discussions
- **Session Summary**: Export results as CSV or copy to clipboard
- **No Login Required**: Join with just a 6-character code

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm

### Installation

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Development

Run both servers in separate terminals:

```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend dev server
cd client
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## Usage

### As a Scrum Master

1. Click **"Start New Session"** on the landing page
2. Fill in session details:
   - Session name (e.g., "Sprint 42 Planning")
   - Your name
   - Point scale preference
   - Session type (Planned or Quick)
3. **For Planned Sessions**: Add stories before starting, then click "Start Session"
4. **For Quick Sessions**: You'll go directly to the session room
5. Share the 6-character code or invite link with your team
6. Select a story and click **"Vote"** to start voting
7. Click **"Reveal Votes"** when ready
8. Select the final point value
9. When finished, click **"End Session"** to see the summary

### As a Developer

1. Click **"Join Session"** or use a direct invite link
2. Enter the session code and your name
3. Wait for the Scrum Master to start voting on a story
4. Click a card to cast your vote
5. Wait for votes to be revealed and discuss

## Project Structure

```
point-flow/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level components
│   │   ├── hooks/          # Custom hooks (useSocket)
│   │   ├── stores/         # Zustand state management
│   │   └── index.css       # Tailwind CSS styles
│   └── package.json
│
├── server/                 # Express + Socket.IO backend
│   ├── src/
│   │   ├── handlers/       # Socket event handlers
│   │   ├── store/          # In-memory session store
│   │   └── index.ts        # Server entry point
│   └── package.json
│
└── shared/                 # Shared TypeScript types
    └── types.ts
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + Vite | Fast, modern UI framework |
| Styling | Tailwind CSS | Utility-first CSS |
| State | Zustand | Lightweight state management |
| Backend | Express + Socket.IO | Real-time WebSocket server |
| Language | TypeScript | Type safety across stack |

## Environment Variables

### Client (`client/.env`)
```
VITE_SOCKET_URL=http://localhost:3001
```

### Server (`server/.env`)
```
PORT=3001
CLIENT_URL=http://localhost:5173
```

## License

MIT
