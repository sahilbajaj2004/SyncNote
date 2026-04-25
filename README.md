# SyncNote

A full-stack collaborative notes application built with React, Node.js, Express, MongoDB, Socket.io, and TipTap.

SyncNote supports:
- Email/password auth
- Google OAuth login
- Username setup and availability checks
- Note CRUD with owner/collaborator permissions
- Public share links for anonymous editing
- Rich text editing (TipTap)
- Presence and collaboration events with Socket.io

## Author
- Sahil Bajaj
- GitHub: https://github.com/sahilbajaj2004

## Tech Stack

### Frontend
- React (Vite)
- React Router
- Axios
- Tailwind CSS
- TipTap editor
- Yjs
- Socket.io client

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Passport Google OAuth 2.0
- Cloudinary (profile image uploads)
- Socket.io

## Project Structure

```text
SyncNote/
|-- CODEBASE.md
|-- README.md
|-- package.json
|-- client/
|   |-- package.json
|   |-- index.html
|   |-- vite.config.js
|   |-- tailwind.config.js
|   |-- postcss.config.js
|   |-- src/
|       |-- main.jsx
|       |-- App.jsx
|       |-- index.css
|       |-- api/
|       |   |-- axios.js
|       |-- components/
|       |   |-- Navbar.jsx
|       |-- context/
|       |   |-- AuthContext.jsx
|       |-- pages/
|           |-- Landing.jsx
|           |-- Login.jsx
|           |-- Register.jsx
|           |-- AuthCallback.jsx
|           |-- SetupUsername.jsx
|           |-- Dashboard.jsx
|           |-- NoteEditor.jsx
|           |-- SharedNote.jsx
|           |-- Settings.jsx
|-- server/
|   |-- package.json
|   |-- index.js
|   |-- config/
|   |   |-- passport.js
|   |-- middleware/
|   |   |-- authMiddleware.js
|   |-- models/
|   |   |-- User.js
|   |   |-- Note.js
|   |-- routes/
|       |-- auth.js
|       |-- notes.js
|       |-- users.js
```

## Environment Variables

Create `server/.env` with:

```env
MONGODB_URI=mongodb://localhost:27017/syncnote
JWT_SECRET=your_super_secret_key
PORT=5000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Install and Run

### Prerequisites
- Node.js 18+
- npm
- MongoDB (local or Atlas)

### Install dependencies
From project root:

```bash
npm install
npm --prefix server install
npm --prefix client install
```

### Run both frontend and backend

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Run separately

```bash
npm run server
npm run client
```

## Scripts

### Root (`package.json`)
- `npm run dev` -> runs server + client with concurrently
- `npm run server` -> starts server dev script
- `npm run client` -> starts client dev script

### Server (`server/package.json`)
- `npm run dev` -> nodemon index.js
- `npm start` -> node index.js

### Client (`client/package.json`)
- `npm run dev` -> vite
- `npm run build` -> vite build
- `npm run preview` -> vite preview
- `npm run lint` -> eslint .

## API Reference

Base URL: `http://localhost:5000/api`

### Auth Routes
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/google`
- `GET /auth/google/callback`
- `POST /auth/setup-username`
- `GET /auth/check-username/:username`

### Notes Routes
Public (no auth):
- `GET /notes/shared/:token`
- `PUT /notes/shared/:token`

Protected (Bearer token required):
- `GET /notes`
- `POST /notes`
- `GET /notes/:id`
- `PUT /notes/:id`
- `DELETE /notes/:id`
- `POST /notes/:id/collaborators`
- `POST /notes/:id/share`
- `DELETE /notes/:id/share`

### User Routes
Protected:
- `PUT /users/profile`

## Frontend Routes
- `/` -> Landing
- `/login` -> Login
- `/register` -> Register
- `/auth/callback` -> Google OAuth callback handler
- `/setup-username` -> username setup flow
- `/dashboard` -> notes workspace (protected)
- `/notes/:id` -> note editor (protected)
- `/settings` -> profile settings (protected)
- `/shared/:token` -> shared note editor (public)

## Socket.io Events

Server listens and emits:
- `join-note` (client -> server)
- `room-users` (server -> room)
- `yjs-update` (client <-> server)
- `disconnect` cleanup

## Authentication Flow

1. User registers/logs in (or uses Google OAuth).
2. Server returns JWT token.
3. Frontend stores token in localStorage.
4. Axios interceptor adds `Authorization: Bearer <token>` to protected requests.
5. `authMiddleware` validates token and sets `req.userId`.

## Permission Model

### Notes
- Owner can: read, edit, delete, add collaborators, generate/revoke share links.
- Collaborator can: read and edit.
- Public shared link users can: read and edit via share token route.

## Modules Used

This section lists all modules in this repository.

### Root modules

#### Dev dependencies
| Module | Version | Usage |
|---|---|---|
| concurrently | ^9.2.1 | Runs client and server dev processes together |

### Server modules (`server/package.json`)

#### Runtime dependencies
| Module | Version | Usage |
|---|---|---|
| bcryptjs | ^3.0.3 | Password hashing and compare |
| cloudinary | ^2.9.0 | Profile image upload hosting |
| cors | ^2.8.6 | Cross-origin API access |
| dotenv | ^17.4.1 | Loads environment variables |
| express | ^5.2.1 | HTTP server and routing |
| express-session | ^1.19.0 | Session middleware for OAuth flow |
| jsonwebtoken | ^9.0.3 | JWT sign/verify |
| mongoose | ^9.4.1 | MongoDB ODM |
| passport | ^0.7.0 | Auth middleware framework |
| passport-google-oauth20 | ^2.0.0 | Google OAuth strategy |
| socket.io | ^4.8.3 | Realtime transport/presence/events |
| uuid | ^14.0.0 | Share token generation |

#### Dev dependencies
| Module | Version | Usage |
|---|---|---|
| nodemon | ^3.1.14 | Auto-restart backend in development |

### Client modules (`client/package.json`)

#### Runtime dependencies
| Module | Version | Usage |
|---|---|---|
| @tiptap/extension-text-align | ^3.22.4 | Rich-text alignment extension |
| @tiptap/extension-underline | ^3.22.4 | Underline formatting extension |
| @tiptap/pm | ^3.22.4 | ProseMirror bindings used by TipTap ecosystem |
| @tiptap/react | ^3.22.4 | TipTap React editor integration |
| @tiptap/starter-kit | ^3.22.4 | Core TipTap editing toolkit |
| axios | ^1.15.0 | HTTP client |
| react | ^19.2.4 | UI library |
| react-dom | ^19.2.4 | React DOM renderer |
| react-router-dom | ^7.14.0 | Client-side routing |
| socket.io-client | ^4.8.3 | Realtime socket client |
| y-prosemirror | ^1.3.7 | Yjs + ProseMirror integration helpers |
| y-websocket | ^3.0.0 | Yjs websocket provider package |
| yjs | ^13.6.30 | CRDT collaboration engine |

#### Dev dependencies
| Module | Version | Usage |
|---|---|---|
| @eslint/js | ^9.39.4 | ESLint JS config |
| @tailwindcss/typography | ^0.5.19 | Tailwind typography plugin |
| @types/react | ^19.2.14 | React type definitions |
| @types/react-dom | ^19.2.3 | React DOM type definitions |
| @vitejs/plugin-react | ^6.0.1 | React plugin for Vite |
| autoprefixer | ^10.4.27 | Adds CSS vendor prefixes |
| eslint | ^9.39.4 | Linting engine |
| eslint-plugin-react-hooks | ^7.0.1 | React hooks lint rules |
| eslint-plugin-react-refresh | ^0.5.2 | React refresh lint rules |
| globals | ^17.4.0 | Shared global variable definitions for linting |
| postcss | ^8.5.9 | CSS transform pipeline |
| tailwindcss | ^3.4.19 | Utility-first CSS framework |
| vite | ^8.0.4 | Dev server and build tool |

## Notes
- Current API and client URLs are hardcoded for local development (`localhost:5000` and `localhost:5173`) in multiple files.
- Keep secrets out of version control.

## License

MIT
