# Taskora — Personal Task Planner

Taskora is a personal day-to-day task planner built with MongoDB, Express.js, React with TypeScript, and Node.js. Create an account, add tasks with due dates and times, group them with your own categories, and see what remains, what is coming up, and what is overdue. Each account sees and manages only its own tasks.

---

## Table of Contents

1. [Project Overview & Key Features](#1-project-overview--key-features)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture & Folder Structure](#3-system-architecture--folder-structure)
4. [Installation & Setup Guide](#4-installation--setup-guide)
5. [Environment Variables Configuration](#5-environment-variables-configuration)
6. [Database Configuration (Local, Atlas & Zero-Config In-Memory)](#6-database-configuration)
7. [Accounts](#7-accounts)
8. [Running the Application](#8-running-the-application)
9. [REST API Documentation](#9-rest-api-documentation)
10. [Automated & Manual Testing](#10-automated--manual-testing)
11. [Git Workflow & Commit Milestones](#11-git-workflow--commit-milestones)
12. [Connection to 10 Web Technology Syllabus Experiments](#12-connection-to-10-web-technology-experiments)
13. [Deployment Instructions](#13-deployment-instructions)
14. [Known Limitations & Future Enhancements](#14-known-limitations--future-enhancements)

---

## 1. Project Overview & Key Features

### Core User Capabilities:
- **Personal dashboard**: At-a-glance totals for tasks left, completed work, and overdue tasks, with overdue items shown first.
- **Task management**:
  - Create, view, edit, and delete personal to-dos.
  - Add a due date and time, category, priority, and notes.
  - Filter by category, status, and priority.
  - Instant search by task name, category, or notes.
  - Due date sorting (earliest first, latest first, priority order, title A-Z).
  - Quick status toggles (Mark Done / In Progress / Pending) directly from cards or tables.
  - Overdue detection based on exact calendar due dates.
- **Dual View Modes**: Switch seamlessly between interactive card view and structured data table view.
- **Private accounts**: Self-service sign-up and sign-in with JSON Web Tokens (JWT), bcrypt password hashing, and per-user task ownership.

---

## 2. Technology Stack

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, React Router v6 | Single Page Application (SPA), typed interfaces, client routing |
| **Styling** | Vanilla CSS3 (Custom Design System), Lucide Icons | Clean modern SaaS design (Linear/Notion style), zero framework bloat |
| **Backend** | Node.js (v22+), Express.js (v4.21+) | RESTful API server, routing, central error handling, CORS |
| **Database** | MongoDB, Mongoose ODM (v8.9+) | Document schema modeling, validation, indexing, and data persistence |
| **Authentication** | JWT (jsonwebtoken), bcryptjs | Secure password hashing (salt rounds = 10) & token-based route authorization |
| **Testing** | Jest, Supertest, MongoDB Memory Server | Automated HTTP endpoint integration tests & isolated DB mocks |

---

## 3. System Architecture & Folder Structure

Taskora follows a decoupled client-server architectural pattern. The React Single Page Application communicates with the Node/Express backend via standard JSON REST endpoints.

```text
Hack/
├── client/                     # Frontend (React 18 + TypeScript + Vite)
│   ├── public/
│   │   └── favicon.svg         # Taskora brand logo SVG
│   ├── src/
│   │   ├── components/
│   │   │   ├── assignments/    # AssignmentCard, AssignmentForm, FilterPanel, SearchBar
│   │   │   └── common/         # Navbar, Sidebar, StatCard, StatusBadge, PriorityBadge, ConfirmDialog, LoadingSpinner
│   │   ├── context/            # AuthContext.tsx (Global auth state & token management)
│   │   ├── pages/              # LoginPage, DashboardPage, AssignmentsPage, AddAssignmentPage, EditAssignmentPage, AssignmentDetailsPage, SubjectsPage, SettingsPage
│   │   ├── services/           # api.ts (Centralized Fetch API client with async/await)
│   │   ├── types/              # index.ts (TypeScript domain models and interfaces)
│   │   ├── utils/              # dateUtils.ts, educationalTsDemo.ts (interfaces/classes/generics demo)
│   │   ├── App.tsx             # Route definitions & ProtectedRoute guard
│   │   ├── index.css           # Vanilla CSS design tokens, resets, responsive layout
│   │   ├── main.tsx            # React 18 DOM mount point
│   │   └── vite-env.d.ts       # TypeScript Vite definitions
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts          # Vite proxy to backend port 5000
│
├── server/                     # Backend (Node.js + Express.js + Mongoose)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Mongoose connection with automatic in-memory fallback
│   │   ├── controllers/        # authController, assignmentController, subjectController, dashboardController
│   │   ├── middleware/         # authMiddleware (JWT protect), errorMiddleware (central 404 & errors)
│   │   ├── models/             # User.js, Subject.js, Assignment.js (Mongoose schemas)
│   │   ├── routes/             # authRoutes, assignmentRoutes, subjectRoutes, dashboardRoutes
│   │   ├── utils/              # Shared backend utilities
│   │   ├── app.js              # Express app instance (CORS, parsers, routes, error handlers)
│   │   └── server.js           # HTTP listener on port 5000
│   ├── tests/                  # Automated integration tests (Supertest + Jest)
│   │   ├── setup.js            # In-memory test database setup
│   │   ├── auth.test.js        # Login, token verification, and security tests
│   │   ├── assignments.test.js # Full CRUD and input validation tests
│   │   ├── subjects.test.js    # Subject management and deletion protection tests
│   │   └── dashboard.test.js   # Calculations, deadline tracking, and metrics tests
│   ├── .env.example
│   └── package.json
│
├── .gitignore                  # Ignores .env, node_modules, dist, logs
├── package.json                # Root package.json with concurrent run scripts
├── README.md                   # Complete architectural and setup guide
└── CODE_EXPLANATION.md         # Detailed viva preparation guide for IT students
```

---

## 4. Installation & Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20 / v22 recommended).
- **npm**: v9.0.0 or higher.
- **Git**: Installed and configured.

### Step-by-Step Installation:

1. Clone or open the project folder in your terminal:
   ```bash
   cd Hack
   ```

2. Install all root and sub-project dependencies:
   ```bash
   npm run install:all
   ```
   *Alternatively, install individually:*
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

---

## 5. Environment Variables Configuration

### Server Configuration (`server/.env`)
Create a `.env` file in the `server/` directory (or copy from `.env.example`):
```env
# Server Port & Mode
PORT=5000
NODE_ENV=development

# Database Connection (MongoDB URI)
MONGO_URI=mongodb://127.0.0.1:27017/taskora

# Authentication (JWT Secret)
JWT_SECRET=taskora_development_jwt_secret_key_change_in_production_123456
JWT_EXPIRES_IN=7d

# CORS Allowed Origin (Client URL)
CLIENT_URL=http://localhost:5173

```

### Client Configuration (`client/.env`)
Create a `.env` file in the `client/` directory (or copy from `.env.example`):
```env
VITE_API_URL=/api
```

---

## 6. Database Configuration

Taskora supports 3 database modes with **zero friction during viva presentations**:

1. **Automatic In-Memory Fallback (Zero Config)**:
   - If a local MongoDB service (`mongod`) is not running on your laptop, the backend detects this during startup and seamlessly boots `mongodb-memory-server` in development mode.
   - You can evaluate the entire application and run tests without installing or starting MongoDB manually!

2. **Local MongoDB**:
   - If MongoDB Community Server is installed, start it with:
     ```bash
     mongod --dbpath <path-to-data>
     ```
   - Taskora will automatically connect to `mongodb://127.0.0.1:27017/taskora`.

3. **MongoDB Atlas (Cloud)**:
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
   - Obtain your connection URI and set in `server/.env`:
     ```env
     MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskora?retryWrites=true&w=majority
     ```

---

## 7. Accounts

Taskora does not create demo users or sample tasks when the server starts. Open the app and create an account from the sign-in screen. Tasks belong to the account that created them.

---

## 8. Running the Application

### Option A: Run Both Client & Server Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

### Option B: Run Individually in Separate Terminals

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```

Open your browser and navigate to `http://localhost:5173`. Create a personal account to get started, or sign in to an existing account.

---

## 9. REST API Documentation

All administrative endpoints require the HTTP header:
`Authorization: Bearer <your_jwt_token>`

### Authentication Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns JWT token & user |
| `GET` | `/api/auth/me` | Protected | Returns authenticated user profile |

### Assignment Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assignments` | Protected | Get assignments (supports query params: `search`, `subject`, `status`, `priority`, `sort`) |
| `GET` | `/api/assignments/:id` | Protected | Get a single assignment by its MongoDB `_id` |
| `POST` | `/api/assignments` | Protected | Create a new coursework assignment |
| `PUT` | `/api/assignments/:id` | Protected | Update assignment title, subject, due date, priority, or status |
| `PATCH` | `/api/assignments/:id/status` | Protected | Fast status update (`Pending`, `In Progress`, `Completed`) |
| `DELETE` | `/api/assignments/:id` | Protected | Permanently delete an assignment |

### Subject Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/subjects` | Protected | Get all subjects with active assignment counts |
| `POST` | `/api/subjects` | Protected | Create a new subject |
| `PUT` | `/api/subjects/:id` | Protected | Update subject name, code, or description |
| `DELETE` | `/api/subjects/:id` | Protected | Delete subject (protected: rejects if assignments exist) |

### Dashboard Metrics Endpoint
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Protected | Calculates total, pending, in-progress, completed, overdue, completion percentage, upcoming deadlines, and recent activity |

---

## 10. Automated & Manual Testing

### Running Automated Test Suites
Taskora includes 21 comprehensive integration tests using Jest and Supertest against an in-memory database instance.

```bash
npm test
# or: cd server && npm test
```

### Verified Test Coverage:
- **Authentication**: Valid login, invalid password, missing fields, profile fetching, token expiration rejection.
- **Assignments**: Creation with required validation, field validation, list retrieval, single item retrieval, invalid ID error handling (400), updates, status toggles, deletion, unauthorized 401 guard.
- **Subjects**: Unique name constraint (409), assignment count calculation, deletion safety check (prevents orphan assignments).
- **Dashboard Calculations**: Total calculation, pending/completed counting, overdue detection (`dueDate < now && status != 'Completed'`), completion percentage calculation with zero-assignment safety.

### Manual Testing Checklist for Evaluation:
1. **Account**: Navigate to `/login` and create an account, then sign in.
2. **Dashboard**: Verify that the stat cards (Total, Pending, Completed, Overdue) and progress bar match the actual number of assignments.
3. **Add Assignment**: Click "New Assignment". Submit an empty form to observe field-specific validation. Add an assignment with tomorrow's date.
4. **Search & Filters**: Go to `/assignments`. Type part of your assignment title in the search bar. Filter by Subject and Priority.
5. **Status Toggle**: Click "Complete" on an assignment card. Notice the badge updates to "Completed", the progress bar increases on the dashboard, and overdue state clears.
6. **Edit Assignment**: Click the three dots -> "Edit". Change the due date or description. Save and verify persistence across browser refresh.
7. **Subject Safety**: Navigate to `/subjects`. Attempt to delete a subject that currently has assignments; verify that the system blocks deletion and displays an informative dialog.
8. **Sign Out**: Click "Sign Out". Confirm the modal dialog appears. Verify that protected routes redirect to `/login`.

---

## 11. Git Workflow & Commit Milestones

Development was carried out across 16 structured, atomic Git milestones following industry best practices:

- `ed5e6f2` — **chore**: initialize project structure and git configuration
- `cabffba` — **feat**: build responsive dashboard layout and design system
- `65ebaf1` — **feat**: implement assignment list and reusable UI components
- `53b6eeb` — **feat**: add assignment creation and form validation
- `3f558bc` — **feat**: implement assignment editing and deletion
- `054e4f4` — **feat**: add assignment search filtering and sorting
- `68c4e6e` — **feat**: configure Express server and REST API
- `1b1be4e` — **feat**: connect MongoDB and implement assignment CRUD
- `e24df04` — **feat**: integrate React frontend with backend APIs
- `ac036a2` — **feat**: implement dashboard statistics and deadline tracking
- `[upcoming]` — **feat**: add subject management
- `[upcoming]` — **feat**: implement JWT authentication and protected routes
- `[upcoming]` — **test**: add backend and frontend tests
- `[upcoming]` — **fix**: resolve integration issues and improve error handling
- `[upcoming]` — **docs**: add setup instructions API documentation and README
- `[upcoming]` — **chore**: prepare production build and deployment configuration

---

## 12. Connection to 10 Web Technology Experiments

Taskora is purposefully designed to directly map to the standard engineering Web Technology laboratory curriculum:

| Lab Experiment # | Curriculum Objective | Taskora Implementation Reference |
| :--- | :--- | :--- |
| **Exp 1: HTML5 & Semantic Web** | Semantic markup, metadata, accessibility | `client/index.html`, semantic `<header>`, `<aside>`, `<main>`, `<nav>`, `<h1>` hierarchy |
| **Exp 2: CSS3 & Responsive Design** | Media queries, flexbox, grid, design tokens | `client/src/index.css` (custom CSS variables, CSS grid dashboards, mobile breakpoints) |
| **Exp 3: JavaScript ES6+ Fundamentals** | Destructuring, arrow functions, template literals | Implemented across all components; see `client/src/services/api.ts` & `dateUtils.ts` |
| **Exp 4: TypeScript Programming** | Interfaces, classes, generics, strong typing | `client/src/types/index.ts` and `client/src/utils/educationalTsDemo.ts` |
| **Exp 5: React Component Architecture** | State management, reusable components, props | `Navbar.tsx`, `Sidebar.tsx`, `StatCard.tsx`, `AssignmentCard.tsx`, `ConfirmDialog.tsx` |
| **Exp 6: React Hooks & Lifecycle** | `useState`, `useEffect`, `useContext`, custom events | `AuthContext.tsx`, `DashboardPage.tsx`, `AssignmentsPage.tsx` |
| **Exp 7: Node.js & Express.js Backend** | HTTP server, REST routing, middleware pipeline | `server/src/app.js`, `server/src/server.js`, custom `authMiddleware.js` |
| **Exp 8: MongoDB & Mongoose Modeling** | NoSQL schemas, validations, relationships | `server/src/models/Assignment.js`, `Subject.js`, `User.js` |
| **Exp 9: REST APIs & CRUD Operations** | HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) | `assignmentController.js`, `subjectController.js`, status update patch |
| **Exp 10: Web Security & Testing** | Password hashing, JWT auth, automated testing | `bcryptjs` hashing, JWT bearer verification, 21 automated tests in `server/tests/` |

---

## 13. Deployment Instructions

### Frontend Production Build
To create an optimized production bundle:
```bash
npm run build:client
# or: cd client && npm run build
```
The output is generated in `client/dist/` with bundled JavaScript, CSS, and HTML.

### MongoDB Atlas + Render API + Vercel frontend

1. In Atlas, create a database user and cluster. Add the backend host's outbound addresses to the project's IP access list. Use `0.0.0.0/0` only if the host has dynamic outbound IPs and no narrower option is available; protect the database with a strong database-user password.
2. In Atlas, choose **Connect → Drivers**, copy the connection string, replace `<db_password>` with the database user's password (URL-encode special characters), and add a database name such as `taskora`.
3. Deploy the API as a Render Web Service from this repository. Set **Root Directory** to `server`, **Build Command** to `npm install`, **Start Command** to `npm start`, and **Health Check Path** to `/api/health`.
4. Add these Render environment variables:
   - `NODE_ENV=production`
   - `MONGO_URI=<Atlas connection string>`
   - `JWT_SECRET=<random secret of at least 32 characters>`
   - `CLIENT_URL=<deployed frontend URL>`
5. Deploy the frontend to Vercel with **Root Directory** `client`, **Build Command** `npm run build`, and **Output Directory** `dist`. Add `VITE_API_URL=<Render API URL>/api`, then redeploy.
6. Once both are deployed, open the frontend URL and create an account. The API refuses production startup without `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`; it does not use the temporary development database in production.

Keep Atlas and JWT credentials in the hosting provider's environment settings. Do not commit them into `.env` files or source control.

---

## 14. Known Limitations & Future Enhancements

- **Reminders**: Tasks are shown as overdue in the app, but notifications and email reminders are not yet implemented.
- **Calendar View**: The current interface offers Grid Card and Table Views. A monthly calendar visualizer would be an attractive future addition.
- **Email Reminders**: Adding automated NodeMailer email alerts 24 hours prior to deadline expirations.
