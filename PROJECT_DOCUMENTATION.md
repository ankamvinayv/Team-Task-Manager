# Team Task Management

## Complete Project Documentation

---

## 1. Project Overview

**Team Task Management** is a full-stack Team Task Management application built using the **MERN stack** (MongoDB, Express.js, React, Node.js). It provides role-based access control where **Admins** can create projects, assign tasks, and manage team members, while **Members** can view their assigned tasks, update task statuses, and add comments.

The application features a modern, responsive UI with a **light/dark theme toggle**, real-time data visualization using charts, and a comprehensive dashboard for tracking project progress.

---

## 2. Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 20.x+ | JavaScript runtime |
| **Express.js** | 4.21.x | Web framework for REST API |
| **MongoDB** | Cloud (Atlas) | NoSQL database |
| **Mongoose** | 8.7.x | MongoDB ODM (Object Document Mapper) |
| **JSON Web Token (JWT)** | 9.0.x | Authentication & authorization |
| **bcryptjs** | 2.4.x | Password hashing |
| **express-validator** | 7.2.x | Request body validation |
| **cors** | 2.8.x | Cross-Origin Resource Sharing |
| **dotenv** | 16.4.x | Environment variable management |
| **nodemon** | 3.1.x | Development auto-restart (dev dependency) |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI component library |
| **Vite** | 8.x | Build tool & dev server |
| **React Router DOM** | 7.x | Client-side routing |
| **Axios** | 1.16.x | HTTP client for API calls |
| **React Hook Form** | 7.x | Form handling (available) |
| **React Hot Toast** | 2.6.x | Notification toasts |
| **React Icons** | 5.6.x | Icon library (Heroicons) |
| **Recharts** | 3.8.x | Data visualization (pie/bar charts) |

---

## 3. Folder Structure

```
Team Task Manager/
├── server/                          # Backend API
│   ├── config/
│   │   └── db.js                    # MongoDB connection setup
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication middleware
│   │   └── roleCheck.js             # Role-based access (admin/member)
│   ├── models/
│   │   ├── User.js                  # User schema (name, email, password, role)
│   │   ├── Project.js               # Project schema (title, members, owner)
│   │   ├── Task.js                  # Task schema (title, assignee, priority, status)
│   │   └── Comment.js               # Comment schema (task, author, text)
│   ├── routes/
│   │   ├── auth.js                  # POST /register, /login, GET /me
│   │   ├── projects.js              # CRUD + member management
│   │   ├── tasks.js                 # CRUD + comments
│   │   ├── teams.js                 # GET all users
│   │   └── dashboard.js             # Aggregated statistics
│   ├── .env                         # Environment variables (not committed)
│   ├── .env.example                 # Template for .env
│   ├── package.json                 # Server dependencies
│   ├── seed.js                      # Database seeder script
│   └── server.js                    # Express app entry point
│
├── client/                          # Frontend React App
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance with JWT interceptor
│   │   ├── components/
│   │   │   └── AppLayout.jsx        # Sidebar + main layout with theme toggle
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Authentication state management
│   │   │   └── ThemeContext.jsx      # Light/dark theme state management
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # Login form with demo credentials
│   │   │   ├── RegisterPage.jsx     # Registration form with role selection
│   │   │   ├── DashboardPage.jsx    # Stats, charts, recent activity
│   │   │   ├── ProjectsPage.jsx     # Project grid with create modal
│   │   │   ├── ProjectDetailPage.jsx# Project info, members, tasks
│   │   │   ├── TasksPage.jsx        # Task table with filters & search
│   │   │   ├── TaskDetailPage.jsx   # Task info, comments, status toggle
│   │   │   └── TeamPage.jsx         # Team member listing (admin only)
│   │   ├── utils/
│   │   │   └── helpers.js           # Date formatting, badges, initials
│   │   ├── App.jsx                  # Route definitions
│   │   ├── App.css                  # (empty — all styles in index.css)
│   │   ├── index.css                # Complete design system + components
│   │   └── main.jsx                 # App entry with providers
│   ├── index.html                   # HTML shell
│   ├── vite.config.js               # Vite configuration
│   └── package.json                 # Client dependencies
```

---

## 4. Features — Step by Step

### 4.1 Authentication System
- **Register**: Users can create accounts with name, email, password, and role (admin/member)
- **Login**: JWT-based authentication; token stored in localStorage
- **Auto-login**: On page reload, the saved token is validated with the server via `GET /api/auth/me`
- **Protected Routes**: Unauthenticated users are redirected to `/login`
- **401 Handling**: Expired tokens auto-logout and redirect to login

### 4.2 Dashboard
- **4 Stat Cards**: Total Projects, Total Tasks, Completed Tasks, Overdue Tasks
- **Pie Chart**: Tasks broken down by status (Pending, In Progress, Completed)
- **Bar Chart**: Tasks broken down by priority (High, Medium, Low)
- **Recent Activity Table**: Last 5 updated tasks with clickable navigation
- **Role-Aware**: Admins see all data; members see only their assigned tasks

### 4.3 Projects Management
- **Project Grid**: Cards showing title, description, status badge, member/task counts, progress bar
- **Create Project** (Admin): Modal with title, description, due date, status
- **Project Detail Page**:
  - Project info card with owner, due date, progress
  - Members card with avatars, roles, and remove button
  - **Searchable Member Picker**: Add members by browsing all users (search by name/email) instead of typing emails
  - Tasks table with inline status/priority badges
  - Create Task modal (admin)
  - Edit Project modal (admin)
  - Delete Project with cascade delete of tasks (admin)

### 4.4 Task Management
- **Task List**: Sortable table view with columns for task, project, assignee, priority, status, due date
- **Filters**: Search by name, filter by status, priority, and project — all combinable
- **Overdue Indicators**: Tasks past their due date show a ⚠ warning
- **Task Detail Page**:
  - Description panel
  - **Status Toggle**: Click buttons to change status (Pending / In Progress / Completed) — available to both admins and members
  - Sidebar with priority, project link, assignee avatar, due date, creator
  - **Comments Section**: Threaded comments with author avatars and relative timestamps
  - Edit Task modal with all fields (admin)
  - Delete Task (admin)

### 4.5 Team Management (Admin Only)
- **Member Grid**: Cards showing each registered user's name, email, role badge, and join date
- Visible only to users with the `admin` role

### 4.6 Role-Based Access Control (RBAC)
| Action | Admin | Member |
|---|:---:|:---:|
| View Dashboard | ✅ (all data) | ✅ (own data) |
| Create Project | ✅ | ❌ |
| Edit/Delete Project | ✅ | ❌ |
| Add/Remove Members | ✅ | ❌ |
| Create Task | ✅ | ❌ |
| Edit/Delete Task | ✅ | ❌ |
| Update Task Status | ✅ | ✅ (own tasks) |
| Add Comments | ✅ | ✅ |
| View Team Page | ✅ | ❌ |

### 4.7 Light/Dark Theme
- **Default**: Light theme (white backgrounds, dark text)
- **Toggle**: Sun/Moon button in sidebar footer switches between themes
- **Persistence**: Theme preference saved in localStorage
- **Implementation**: CSS custom properties on `:root` (light) and `[data-theme="dark"]`

### 4.8 Responsive Design
- **Desktop**: Full sidebar + main content area
- **Tablet/Mobile**: Collapsible sidebar with hamburger menu, stacked grids
- **Breakpoints**: 768px (tablet), 480px (mobile)

---

## 5. API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | Yes | Get current user profile |

### Projects
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/projects` | Yes | Any | List projects (admin=all, member=own) |
| POST | `/api/projects` | Yes | Admin | Create a project |
| GET | `/api/projects/:id` | Yes | Any | Get project with task counts |
| PUT | `/api/projects/:id` | Yes | Admin | Update project |
| DELETE | `/api/projects/:id` | Yes | Admin | Delete project + its tasks |
| POST | `/api/projects/:id/members` | Yes | Admin | Add member by email |
| DELETE | `/api/projects/:id/members/:userId` | Yes | Admin | Remove member |

### Tasks
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/tasks` | Yes | Any | List tasks (filterable by project/status/priority) |
| POST | `/api/tasks` | Yes | Admin | Create a task |
| GET | `/api/tasks/:id` | Yes | Any | Get task with comments |
| PUT | `/api/tasks/:id` | Yes | Any | Update task (admin=all fields, member=status only) |
| DELETE | `/api/tasks/:id` | Yes | Admin | Delete task + comments |
| POST | `/api/tasks/:id/comments` | Yes | Any | Add comment to task |

### Dashboard & Teams
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard` | Yes | Aggregated stats, charts data, recent activity |
| GET | `/api/teams` | Yes | List all registered users |
| GET | `/api/teams/:id` | Yes | Get single user |

---

## 6. Database Models

### User
```
name       : String (required)
email      : String (required, unique, lowercase)
password   : String (required, min 6 chars, bcrypt hashed)
role       : String (enum: 'admin', 'member', default: 'member')
avatar     : String (default: '')
timestamps : createdAt, updatedAt
```

### Project
```
title       : String (required)
description : String
status      : String (enum: 'active', 'completed', 'on-hold')
dueDate     : Date
owner       : ObjectId → User
members     : [{ user: ObjectId → User, role: 'admin'|'member' }]
timestamps  : createdAt, updatedAt
```

### Task
```
title       : String (required)
description : String
project     : ObjectId → Project (required)
assignedTo  : ObjectId → User
createdBy   : ObjectId → User
priority    : String (enum: 'low', 'medium', 'high')
status      : String (enum: 'pending', 'in-progress', 'completed')
dueDate     : Date
timestamps  : createdAt, updatedAt
```

### Comment
```
task        : ObjectId → Task (required)
author      : ObjectId → User (required)
text        : String (required)
timestamps  : createdAt, updatedAt
```

---

## 7. How to Run the Project

### Prerequisites
- **Node.js** v18 or higher installed
- **npm** (comes with Node.js)
- A **MongoDB Atlas** account (free tier works) or local MongoDB

### Step 1: Clone / Open the Project
```bash
cd "Team Task Manager"
```

### Step 2: Configure Environment Variables
Edit `server/.env` with your MongoDB connection string:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/taskmanager
JWT_SECRET=your_secret_key_at_least_32_characters
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Step 3: Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 4: Seed the Database (Optional but Recommended)
```bash
cd server
npm run seed
```
This creates:
- **Admin**: admin@taskflow.com / Admin@123
- **Member**: john@taskflow.com / John@123
- **Member**: sara@taskflow.com / Sara@123
- 2 projects, 6 tasks, 8 comments

### Step 5: Start the Application
Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
Server starts on `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
Client starts on `http://localhost:5173`

### Step 6: Open in Browser
Navigate to `http://localhost:5173` → you'll see the login page.

---

## 8. Build for Production

### Build Frontend
```bash
cd client
npm run build
```
This creates an optimized build in `client/dist/`.

### Run Production Server
```bash
cd server
NODE_ENV=production npm start
```
In production mode, Express serves the React build as static files.

---

## 9. Key Design Decisions

1. **JWT in localStorage**: Simple implementation suitable for this assignment. Token is attached to every API request via Axios interceptors.
2. **Role-based middleware**: `auth.js` validates the JWT and loads the user; `roleCheck.js` restricts admin-only routes.
3. **CSS Custom Properties**: The entire design system uses CSS variables, making theme switching instantaneous without re-renders.
4. **No Redux**: React Context is sufficient for auth and theme state in an app of this scale.
5. **Searchable Member Picker**: Instead of requiring email input, the member modal fetches all users and provides search/filter for better UX.

---

## 10. Test Credentials (After Seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@taskflow.com | Admin@123 |
| Member | john@taskflow.com | John@123 |
| Member | sara@taskflow.com | Sara@123 |
