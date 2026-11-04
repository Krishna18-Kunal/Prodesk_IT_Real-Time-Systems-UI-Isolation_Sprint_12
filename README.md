# ConnectX — Sprint 12 Real-Time Chat Application

A full-stack real-time chat application built for Sprint 12 (Track B) using React, Node.js, Express and Socket.io.

## Features

### P0 — Mandatory
- Express server with Socket.io
- React client connected through `socket.io-client`
- Real-time message send/receive
- Server-side message validation and room broadcast

### P1 — Priority
- Username required before entering chat
- Messages display the sender's username
- Live typing indicator
- Join/leave system messages

### P2 — Advanced
- Two isolated rooms: **General** and **Tech Support**
- Room switching
- Messages and typing indicators are broadcast only to members of the selected room

## Project structure

```text
sprint12-connectx/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── socket.js
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
├── server/                 # Express + Socket.io backend
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Requirements

- Node.js 18 or newer
- npm
- Two browser tabs/windows for testing multiple users

## Run locally

### 1. Start the backend

Open a terminal:

```bash
cd server
npm install
```

Copy `.env.example` to `.env` (or use the default local values), then run:

```bash
npm run dev
```

The backend runs at `http://localhost:5000`.

### 2. Start the frontend

Open a second terminal from the project root:

```bash
cd client
npm install
```

Copy `client/.env.example` to `client/.env` if needed. Then run:

```bash
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

### 3. Test the application

1. Open the app in two separate browser tabs or browser profiles.
2. Enter a different username in each.
3. Join **General** in both tabs and exchange messages.
4. Switch one user to **Tech Support**. Messages sent there should not appear in General.
5. Type in one tab and verify that the other member of the same room sees the typing indicator.
6. Verify that a user in the other room does not see that typing indicator.

## Environment variables

### Backend (`server/.env`)

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

For production, set `CLIENT_ORIGIN` to your deployed frontend URL. Multiple origins can be comma-separated.

### Frontend (`client/.env`)

```env
VITE_SOCKET_URL=http://localhost:5000
```

For production, set `VITE_SOCKET_URL` to your deployed backend URL, for example `https://your-api.onrender.com`.

## Deployment guide

A simple deployment option is **Render (backend) + Vercel (frontend)**.

### Backend on Render

1. Push this project to GitHub.
2. In Render, create a new **Web Service** and connect the repository.
3. Set the **Root Directory** to `server`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variable `CLIENT_ORIGIN` with your deployed Vercel frontend URL.
7. Deploy and copy the backend URL.

### Frontend on Vercel

1. Import the same GitHub repository into Vercel.
2. Set the **Root Directory** to `client`.
3. Add environment variable `VITE_SOCKET_URL` with the Render backend URL.
4. Deploy and copy the frontend URL.

After changing environment variables, redeploy the affected service. Confirm that the hosting provider supports persistent WebSocket connections.

## Useful scripts

Backend:
- `npm run dev` — start with nodemon
- `npm start` — start production server

Frontend:
- `npm run dev` — start Vite development server
- `npm run build` — create production frontend build
- `npm run preview` — preview the production build locally

## Socket events

| Event | Direction | Purpose |
|---|---|---|
| `join-room` | Client → Server | Join a selected room |
| `room-joined` | Server → Client | Confirm room membership |
| `chat-message` | Client → Server | Submit a message |
| `new-message` | Server → Room | Broadcast a message to that room |
| `typing` | Client → Server | Notify server that user is typing |
| `user-typing` | Server → Room | Broadcast typing state within that room |
| `stop-typing` | Client → Server | Stop typing notification |
| `user-stop-typing` | Server → Room | Clear typing state within that room |
| `system-message` | Server → Room | Join/leave notification |
| `chat-error` | Server → Client | Report invalid event data |

## Notes

- This is a learning/sprint project. Messages are kept in the connected clients' current session and are not persisted in a database.
- The server validates usernames, room names and message length.
- Room broadcasts use `io.to(room)` / `socket.to(room)` rather than global broadcasting.
- For a production commercial chat service, add authentication, persistent storage, rate limiting, moderation and monitoring.
