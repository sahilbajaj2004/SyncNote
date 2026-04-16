# SyncNote

A full-stack real-time collaborative notes application where multiple users can create, edit, and share notes simultaneously. Built with the MERN stack, Socket.io, Yjs, and TipTap.

**Author:** Sahil Bajaj — [GitHub @sahilbajaj2004](https://github.com/sahilbajaj2004)

---

## What It Does

- Register and log in securely with JWT-based authentication
- Create, edit, and delete notes
- Invite collaborators to notes via email
- Edit notes together in real time — changes sync instantly across all connected users
- Rich text editing with TipTap (bold, italic, headings, lists)
- Conflict-free syncing using Yjs CRDT (no merge conflicts)

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database and schema definitions |
| JWT (jsonwebtoken) | Stateless authentication |
| bcryptjs | Password hashing |
| Socket.io | Real-time WebSocket communication |
| dotenv | Environment variable management |
| cors | Cross-origin request handling |

### Frontend
| Technology | Purpose |
|---|---|
| React (Vite) | UI framework |
| Tailwind CSS | Utility-first styling |
| React Router DOM | Client-side routing |
| Axios | HTTP requests to the API |
| Socket.io Client | Real-time connection to backend |
| Yjs | CRDT-based conflict-free document syncing |
| TipTap | Rich text editor with Yjs integration |

---

## Project Structure

```
syncnote/
├── server/                          # Node.js + Express backend
│   ├── models/
│   │   ├── User.js                  # User schema (name, email, hashed password)
│   │   └── Note.js                  # Note schema (title, content, owner, collaborators)
│   ├── routes/
│   │   ├── auth.js                  # POST /register, POST /login
│   │   └── notes.js                 # Full CRUD + collaborator management
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification middleware
│   ├── .env                         # Environment variables (never commit this)
│   ├── .env.example                 # Safe template for environment setup
│   ├── package.json
│   └── index.js                     # Entry point — Express app + Socket.io
│
├── client/                          # React frontend (Vite)
│   └── src/
│       ├── api/
│       │   └── axios.js             # Axios instance with base URL + auth header
│       ├── components/
│       │   └── Navbar.jsx           # Top navigation bar
│       ├── context/
│       │   └── AuthContext.jsx      # Global auth state (user, token, login, logout)
│       ├── pages/
│       │   ├── Login.jsx            # Login page
│       │   ├── Register.jsx         # Register page
│       │   ├── Dashboard.jsx        # Notes list — create, delete, open notes
│       │   └── NoteEditor.jsx       # Real-time collaborative editor
│       ├── App.jsx                  # Route definitions
│       └── main.jsx                 # React entry point
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm

### 1. Clone the repo

```bash
git clone https://github.com/sahilbajaj2004/syncnote.git
cd syncnote
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:

```env
MONGODB_URI=mongodb://localhost:27017/collaborative-notes
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

Start the backend:

```bash
npm run dev
```

Server runs at `http://localhost:5000`

### 3. Set up the frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Reference

### Auth Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Log in and get JWT token | No |

**Register body:**
```json
{
  "name": "Sahil Bajaj",
  "email": "sahil@example.com",
  "password": "yourpassword"
}
```

**Login body:**
```json
{
  "email": "sahil@example.com",
  "password": "yourpassword"
}
```

**Response (both):**
```json
{
  "message": "User registered successfully",
  "token": "<jwt_token>",
  "user": {
    "id": "...",
    "name": "Sahil Bajaj",
    "email": "sahil@example.com"
  }
}
```

---

### Notes Routes

All routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | Get all notes (owned + shared) |
| POST | `/api/notes` | Create a new note |
| GET | `/api/notes/:id` | Get a single note by ID |
| PUT | `/api/notes/:id` | Update note title or content |
| DELETE | `/api/notes/:id` | Delete a note (owner only) |
| POST | `/api/notes/:id/collaborators` | Add a collaborator by email |

**Create note body:**
```json
{
  "title": "My Note"
}
```

**Update note body:**
```json
{
  "title": "Updated Title",
  "content": "Note content here"
}
```

**Add collaborator body:**
```json
{
  "collaboratorEmail": "friend@example.com"
}
```

---

## How Authentication Works

1. User registers or logs in → server returns a JWT token
2. Frontend stores the token in `localStorage`
3. Every API request includes the token in the `Authorization` header
4. The `authMiddleware` on the server verifies the token on every protected route
5. If the token is invalid or missing → `401 Unauthorized`

---

## How Real-Time Collaboration Works

1. When a user opens a note, the frontend connects to the Socket.io server
2. The user joins a room identified by the note's ID
3. TipTap editor is backed by a Yjs document (Y.Doc)
4. Every change in the editor is encoded as a Yjs update and emitted via Socket.io
5. The server broadcasts the update to all other users in the same room
6. Their Yjs documents apply the update, and TipTap re-renders the changes
7. Yjs uses CRDT (Conflict-free Replicated Data Type) — so simultaneous edits never conflict

```
User A types → Yjs encodes update → Socket.io emits to room
                                          ↓
                              User B receives update → Yjs applies it → TipTap re-renders
```

---

## Permission Model

| Action | Owner | Collaborator |
|---|---|---|
| View note | ✅ | ✅ |
| Edit note | ✅ | ✅ |
| Add collaborator | ✅ | ❌ |
| Delete note | ✅ | ❌ |

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/collaborative-notes` |
| `JWT_SECRET` | Secret key for signing JWTs | `my_super_secret_key` |
| `PORT` | Port the server runs on | `5000` |

Never commit your `.env` file. Add it to `.gitignore`.

---

## .gitignore

```
node_modules/
.env
dist/
.DS_Store
```

---

## License

MIT — use it, fork it, build on it.