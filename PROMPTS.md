# PROMPTS.md — ConnectX Sprint 12

This file records the main development prompts/specifications used to build the project.

## Project objective

Build a real-time, bidirectional chat application for Sprint 12 Track B using React, Node.js, Express and Socket.io.

## Prompt 1 — Backend setup

Create an Express and Socket.io server. Configure CORS using environment variables, expose a health-check endpoint, and log successful socket connections and disconnections.

## Prompt 2 — Real-time chat (P0)

Implement client/server Socket.io communication. A client should emit a message, the server should validate it, and the server should broadcast it to clients subscribed to the same room. Render received messages in React immediately.

## Prompt 3 — Session identity and typing (P1)

Require a username before joining chat. Include the username and timestamp with each message. Implement typing and stop-typing events and show a typing indicator to other users in the same room.

## Prompt 4 — Room isolation (P2)

Implement General and Tech Support rooms. Allow users to switch rooms. Ensure messages, typing indicators and room system events are scoped to the relevant room; do not use global broadcasts for chat content.

## Prompt 5 — Interface

Create a responsive chat interface with a username entry screen, room selector, message list, message composer, connection status, typing indicator and clear empty states.

## Manual verification checklist

- [ ] Backend starts successfully.
- [ ] Frontend starts successfully.
- [ ] Socket connection is established.
- [ ] Two clients can exchange messages in real time.
- [ ] Messages show the sender's username.
- [ ] Typing indicator appears for other users in the same room.
- [ ] General and Tech Support are isolated.
- [ ] Switching rooms updates the active subscription.
- [ ] The project builds successfully.
