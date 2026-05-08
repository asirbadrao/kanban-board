# ⬡ Kanban Board — Real-Time Collaborative Task Manager

A full-stack collaborative Kanban board with real-time updates, drag-and-drop, JWT authentication, and Socket.IO. Think Trello, built from scratch.

---

## ✨ Features

- **JWT Authentication** — Register, login, secure token-based sessions
- **Board Management** — Create boards with custom colors, invite members by email
- **Lists / Columns** — Create, rename, and delete columns (To Do, In Progress, Done…)
- **Tasks** — Create, edit, delete tasks with title, description, priority, due date, assignee, labels
- **Drag & Drop** — Reorder tasks within lists and move between lists using `@hello-pangea/dnd`
- **Real-Time** — All changes broadcast live via Socket.IO to every connected user on the same board
- **Responsive** — Works on desktop and tablet

---

## 🗂 Folder Structure

```
kanban-board/
├── backend/
│   ├── config/
│   │   └── socket.js          # Socket.IO auth + event setup
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── boardController.js
│   │   ├── listController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   └── auth.js            # JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Board.js
│   │   ├── List.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── boards.js
│   │   ├── lists.js
│   │   └── tasks.js
│   ├── server.js              # Express + Socket.IO entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board/
│   │   │   │   ├── CreateBoardModal.js
│   │   │   │   ├── InviteMemberModal.js
│   │   │   │   ├── KanbanList.js + .css
│   │   │   │   ├── TaskCard.js + .css
│   │   │   │   └── TaskModal.js
│   │   │   └── Layout/
│   │   │       ├── Navbar.js + .css
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── DashboardPage.js + .css
│   │   │   ├── BoardPage.js + .css
│   │   │   └── AuthPage.css
│   │   ├── utils/
│   │   │   ├── api.js         # Axios instance with auth interceptors
│   │   │   └── socket.js      # Socket.IO client singleton
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** v18+ — [nodejs.org](https://nodejs.org)
- **MongoDB** running locally, or a free [MongoDB Atlas](https://cloud.mongodb.com) cluster
- **npm** or **yarn**

---

### 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/kanban-board.git
cd kanban-board
```

---

### 2 — Backend setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kanban_db
JWT_SECRET=change_this_to_a_long_random_secret
CLIENT_URL=http://localhost:3000
```

> **MongoDB Atlas?** Replace `MONGO_URI` with your Atlas connection string, e.g.:
> `MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/kanban_db`

Start the backend:

```bash
# Development (auto-restart with nodemon)
npm run dev

# OR production
npm start
```

Backend runs at: `http://localhost:5000`

---

### 3 — Frontend setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `frontend/.env` (defaults work for local dev):

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔌 REST API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ✗ | Register new user |
| POST | `/auth/login` | ✗ | Login, get JWT token |
| GET | `/auth/me` | ✓ | Get current user |
| POST | `/boards` | ✓ | Create a board |
| GET | `/boards` | ✓ | Get all user boards |
| GET | `/boards/:id` | ✓ | Get board + lists + tasks |
| POST | `/boards/:id/invite` | ✓ | Invite member by email |
| POST | `/lists` | ✓ | Create a list |
| PATCH | `/lists/:id` | ✓ | Rename / reorder list |
| DELETE | `/lists/:id` | ✓ | Delete list + its tasks |
| POST | `/tasks` | ✓ | Create a task |
| PATCH | `/tasks/:id` | ✓ | Update a task |
| DELETE | `/tasks/:id` | ✓ | Delete a task |
| PATCH | `/tasks/reorder` | ✓ | Bulk reorder after drag |

---

## 📡 Socket.IO Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join-board` | `boardId` | Subscribe to board room |
| `leave-board` | `boardId` | Unsubscribe |

### Server → Client (broadcast to board room)
| Event | Description |
|-------|-------------|
| `task-created` | New task added |
| `task-updated` | Task edited / moved |
| `task-deleted` | Task removed |
| `tasks-reordered` | Bulk position update after drag |
| `list-created` | New list added |
| `list-updated` | List renamed |
| `list-deleted` | List removed |
| `board-member-added` | New member invited |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Axios |
| Drag & Drop | @hello-pangea/dnd |
| Real-Time | Socket.IO Client |
| Backend | Node.js, Express 4 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Real-Time | Socket.IO |
| Database | MongoDB + Mongoose |
| Fonts | Syne + DM Sans (Google Fonts) |

---

## 🖥 Screen Descriptions

1. **Login / Register** — Dark themed auth page with animated gradient orbs, brand logo, form validation
2. **Dashboard** — Grid of board cards with color accent stripe, member avatars, "Create Board" modal with color picker
3. **Board View** — Horizontal scrollable columns, sticky board header with member row and invite button
4. **Kanban Lists** — Each column shows task count, supports inline rename on click, delete with confirm
5. **Task Cards** — Priority color stripe, labels, due date, assignee avatar; draggable anywhere
6. **Task Modal** — Full edit form: title, description, priority dropdown, date picker, assignee select, label toggles, delete button

---

## 🚀 Deploy to Production

### Backend (Railway / Render / Fly.io)
1. Set environment variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`)
2. Build command: `npm install`
3. Start command: `npm start`

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL` to your backend URL
2. Build command: `npm run build`
3. Publish directory: `build`

---

## 📋 Sample Test Flow

```bash
# 1. Register a user
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"test123"}'

# 2. Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"test123"}'

# 3. Create a board (use token from login)
curl -X POST http://localhost:5000/boards \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Board","background":"#6366f1"}'
```

---

## 📝 License

MIT — free to use, modify, and distribute.
