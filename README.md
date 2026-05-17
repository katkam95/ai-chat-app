# AI Chat

Simple AI chat app built with React and Node.js.

Frontend sends messages to backend and backend returns AI responses using Groq/OpenAI API.

Built this mainly to practice API integration and chat UI.

---

## Project Structure

ai-chat-app/

- public/
  - index.html
  - manifest.json

- server/
  - .env
  - package.json
  - package-lock.json
  - server.js

- src/
  - api.js
  - App.js
  - App.css
  - App.test.js
  - index.js
  - index.css
  - logo.svg
  - reportWebVitals.js
  - setupTests.js

- .gitignore
- package.json
- README.md

---

## Install

npm install

---

## Environment setup

Create .env file inside server folder

Example:

PORT=5050

GROQ_API_KEY=your_key_here

Frontend env:

REACT_APP_API_URL=http://localhost:5050

---

## Run backend

cd server

node server.js

---

## Run frontend

npm start

Frontend:
http://localhost:3000

Backend:
http://localhost:5050

---

## API

POST /chat

Request:

{ "prompt": "hello" }

Response:

{ "message": "AI response" }

---

GET /health

Checks if backend is running.

---

## Features

- Chat UI
- AI responses
- Loading state
- Error handling
- Clear chat button
- Enter to send message
- Responsive layout

---

## Run tests

npm test

---

## Build

npm run build


---

