# Taskora — Code Explanation & Viva Voce Preparation Guide

> **Target Audience:** Information Technology Engineering Students  
> **Course:** Web Technology Laboratory / Project Evaluation  
> **Purpose:** This document provides a file-by-file walkthrough of the core code in Taskora, explaining architecture, logic, inputs, outputs, ES6/TypeScript concepts, and anticipated viva questions with ideal answers.

---

## Table of Contents

1. [Architectural Overview & Data Flow](#1-architectural-overview--data-flow)
2. [Frontend Core Files](#2-frontend-core-files)
   - [client/src/App.tsx](#clientsrcapptsx)
   - [client/src/context/AuthContext.tsx](#clientsrccontextauthcontexttsx)
   - [client/src/services/api.ts](#clientsrcservicesapits)
   - [client/src/pages/DashboardPage.tsx](#clientsrcpagesdashboardpagetsx)
   - [client/src/pages/AssignmentsPage.tsx](#clientsrcpagesassignmentspagetsx)
   - [client/src/components/assignments/AssignmentForm.tsx](#clientsrccomponentsassignmentsassignmentformtsx)
   - [client/src/utils/educationalTsDemo.ts](#clientsrcutilseducationaltsdemots)
   - [client/src/utils/dateUtils.ts](#clientsrcutilsdateutilsts)
   - [client/src/index.css](#clientsrcindexcss)
3. [Backend Core Files](#3-backend-core-files)
   - [server/src/server.js & server/src/app.js](#serversrcserverjs--serversrcappjs)
   - [server/src/config/db.js](#serversrcconfigdbjs)
   - [server/src/models/Assignment.js](#serversrcmodelsassignmentjs)
   - [server/src/models/User.js](#serversrcmodelsuserjs)
   - [server/src/models/Subject.js](#serversrcmodelssubjectjs)
   - [server/src/middleware/authMiddleware.js](#serversrcmiddlewareauthmiddlewarejs)
   - [server/src/middleware/errorMiddleware.js](#serversrcmiddlewareerrormiddlewarejs)
   - [server/src/controllers/assignmentController.js](#serversrccontrollersassignmentcontrollerjs)
   - [server/src/controllers/dashboardController.js](#serversrccontrollersdashboardcontrollerjs)
   - [server/src/controllers/subjectController.js](#serversrccontrollerssubjectcontrollerjs)
   - [server/src/utils/seedData.js](#serversrcutilsseeddatajs)
4. [Master Viva Voce Questions & Answers](#4-master-viva-voce-questions--answers)

---

## 1. Architectural Overview & Data Flow

```text
[ Browser (React + TypeScript) ]
            │
            ▼ (HTTP / JSON Requests with JWT Header)
    [ Express API Server ]
            │
      ├── [ authMiddleware ]  --> Validates JWT token
      ├── [ Controllers ]     --> Business logic & validation
      └── [ Mongoose Models ] --> Schema validation & queries
            │
            ▼
     [ MongoDB Database ]
```

When a user visits the dashboard:
1. `DashboardPage.tsx` mounts and calls `dashboardApi.getStats()` in a `useEffect` hook.
2. `api.ts` attaches `Authorization: Bearer <token>` from `localStorage` and sends a `GET /api/dashboard/stats` request.
3. Express routes the request through `protect` middleware (`authMiddleware.js`), which verifies the JWT signature with `jwt.verify()`.
4. `dashboardController.js` executes Mongoose count queries against MongoDB (`countDocuments`, `find`), calculates the completion percentage, and sends a JSON response.
5. The React component receives the JSON data, updates local state (`useState`), and triggers a re-render to display the stat cards, progress bar, and deadline lists.

---

## 2. Frontend Core Files

### `client/src/App.tsx`

#### What it does:
Defines the routing architecture for Taskora using `react-router-dom` (v6). It establishes public routes (e.g., `/login`) and wraps private routes within a custom `<ProtectedRoute>` guard and `<DashboardLayout>`.

#### Key Concepts:
- **`ProtectedRoute` Component**: Checks `isAuthenticated` from `useAuth()`. If false, redirects to `/login` using `<Navigate to="/login" state={{ from: location }} replace />`, preserving the intended destination.
- **Composition**: Injects the active page into `<DashboardLayout>`, ensuring the `Sidebar` and `Navbar` persist across route changes without unmounting.

#### Likely Viva Question:
> *Q: How do protected routes prevent unauthorized users from viewing the dashboard?*  
> *A:* The `ProtectedRoute` component interrogates `AuthContext`. If the user is unauthenticated or the session check is still resolving, it renders a loading state or uses React Router's `<Navigate>` to redirect to `/login`. Even if someone manipulates frontend state, all backend REST endpoints verify the JWT token independently.

---

### `client/src/context/AuthContext.tsx`

#### What it does:
Provides global authentication state (`user`, `token`, `isAuthenticated`, `isLoading`, `login`, `logout`) to all components in the React tree using React's Context API.

#### Key Functions:
- `initializeAuth()`: Runs once on mount (`useEffect`). Checks `localStorage` for `taskora_token`. If found, calls `GET /api/auth/me` to fetch the user profile.
- `login(email, password)`: Sends credentials to the backend, stores the received JWT in `localStorage`, and updates React state.
- `logout()`: Clears `localStorage` and resets state to `null`.
- Custom Event Listener: Listens for `taskora_unauthorized` dispatched by `api.ts` when a 401 response is received, instantly logging the user out.

#### Relevant ES6 & React Concepts:
- `createContext`, `useContext`, `useState`, `useEffect`.
- `async/await` for promise resolution.

#### Likely Viva Question:
> *Q: Why use React Context instead of Redux or prop drilling?*  
> *A:* Prop drilling requires passing authentication state through every intermediate component. Redux introduces unnecessary boilerplate (actions, reducers, store configuration) for a single-role application. React Context provides a native, clean, lightweight solution for global authentication state.

---

### `client/src/services/api.ts`

#### What it does:
Centralizes all HTTP network requests using the standard browser `fetch` API. It automatically attaches the JWT Bearer token to request headers and standardizes error responses.

#### Key Architecture:
- `request<T>(endpoint, options)`: A generic wrapper function that sets `'Content-Type': 'application/json'`, retrieves the token from `localStorage`, and checks `response.ok`. If `response.status === 401`, it triggers the `taskora_unauthorized` event.
- Exported namespaces: `authApi`, `assignmentsApi`, `subjectsApi`, `dashboardApi`.

#### Relevant Concepts:
- **TypeScript Generics (`<T>`)**: Allows `request<T>` to return strongly-typed data (e.g., `Promise<DashboardStats>`).
- **Fetch API & Promises**: Native browser HTTP client.

---

### `client/src/pages/DashboardPage.tsx`

#### What it does:
The landing view for authenticated users. It visualizes academic performance through 4 summary cards (Total, Pending, Completed, Overdue), a completion progress bar, upcoming deadlines, and recent activity.

#### Key Functions & Logic:
- `fetchStats()`: Asynchronously fetches stats from `/api/dashboard/stats`.
- Overdue Detection: Uses `isAssignmentOverdue(item.dueDate, item.status)` to highlight past-due deadlines in red.
- Percentage Display: Renders dynamic gradient progress bar:
  ```tsx
  <div className="progress-bar-fill" style={{ width: `${stats.completionPercentage}%` }} />
  ```

---

### `client/src/pages/AssignmentsPage.tsx`

#### What it does:
The primary coursework management interface. Provides search, filtering (by subject, status, priority), sorting, dual view modes (cards vs. responsive table), quick completion toggling, and deletion.

#### Key Concepts & Performance:
- **`useMemo` for Filtering**: Performs client-side search, filtering, and sorting over the cached assignment list without triggering redundant server round-trips:
  ```ts
  const filteredAssignments = useMemo(() => {
    let result = [...assignments];
    // apply search, subject, status, priority, and sort
    return result;
  }, [assignments, search, selectedSubject, selectedStatus, selectedPriority, sortBy]);
  ```
- **State Optimization**: Instant UI feedback when updating a task's status with `handleStatusChange()`.

---

### `client/src/components/assignments/AssignmentForm.tsx`

#### What it does:
A reusable form component used for both **Adding** and **Editing** assignments.

#### Validation Logic:
- Validates that `title` is not empty and has at least 3 characters.
- Validates that `subject` is selected.
- Validates that `dueDate` is a valid date.
- Displays field-specific inline error messages with red borders and icons.

---

### `client/src/utils/educationalTsDemo.ts`

#### What it does:
A dedicated pedagogical file designed specifically for your viva demonstration. It explicitly implements:
1. **Interface (`ITrackableEntity`)**: A contract requiring `id`, `createdAt`, and `isOverdue()`.
2. **Class (`AssignmentManager`)**: Encapsulates assignment properties and methods (`getDaysRemaining()`, `isOverdue()`).
3. **Generics (`filterItems<T>()` and `ApiResponse<T>`)**: Demonstrates reusable, type-safe data wrappers.

---

## 3. Backend Core Files

### `server/src/server.js` & `server/src/app.js`

#### Why they are separated:
- `app.js` sets up Express middlewares, CORS, route handlers, and error handlers without binding to a network port. This allows **Supertest** to test the API in memory during automated testing.
- `server.js` handles startup side-effects: calling `connectDB()`, executing `seedDatabase()`, and calling `app.listen(PORT)`.

---

### `server/src/config/db.js`

#### What it does:
Connects to MongoDB using Mongoose.
- First attempts to connect to `process.env.MONGO_URI` (or local `mongodb://127.0.0.1:27017/taskora`).
- **In-Memory Fallback**: If local MongoDB is not running, it automatically starts `mongodb-memory-server` in development mode. This guarantees the application works out-of-the-box on any machine.

---

### `server/src/models/Assignment.js`

#### What it does:
Defines the Mongoose schema for assignments with strict server-side validation:
- `title`: String, required, minlength 3, maxlength 150.
- `subject`: String, required.
- `dueDate`: Date, required, validated.
- `priority`: Enum `['Low', 'Medium', 'High']`, default `'Medium'`.
- `status`: Enum `['Pending', 'In Progress', 'Completed']`, default `'Pending'`.
- `timestamps`: Automatically adds `createdAt` and `updatedAt`.
- Indexes: Text index on `title` and `description` for fast searching; single-field indexes on `dueDate` and `status`.

---

### `server/src/models/User.js`

#### What it does:
Defines the User schema with `bcryptjs` password hashing.

#### Crucial Hooks & Methods:
```javascript
// Pre-save hook: Hashes password before storing in DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: Compares password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

---

### `server/src/middleware/authMiddleware.js`

#### What it does:
Protects private REST routes.
1. Inspects `req.headers.authorization`.
2. Extracts the token from `Bearer <token>`.
3. Calls `jwt.verify(token, process.env.JWT_SECRET)`.
4. Queries `User.findById(decoded.id).select('-password')`.
5. Attaches the user object to `req.user` and calls `next()`.
6. Returns `401 Unauthorized` if token is missing, invalid, or expired.

---

### `server/src/middleware/errorMiddleware.js`

#### What it does:
Centralized error handling middleware.
- Catches Mongoose `CastError` (invalid ObjectId format) -> Returns `400 Bad Request`.
- Catches Mongoose `ValidationError` -> Formats field-specific error list.
- Catches MongoDB duplicate key error (code 11000) -> Returns `409 Conflict`.
- Prevents leaking stack traces in production (`process.env.NODE_ENV === 'production'`).

---

### `server/src/controllers/dashboardController.js`

#### How calculations work:
```javascript
// 1. Total assignments
const total = await Assignment.countDocuments();

// 2. Pending & Completed counts
const pending = await Assignment.countDocuments({ status: 'Pending' });
const completed = await Assignment.countDocuments({ status: 'Completed' });

// 3. Overdue count: Due date has passed AND status is not Completed
const overdue = await Assignment.countDocuments({
  status: { $ne: 'Completed' },
  dueDate: { $lt: new Date() },
});

// 4. Safe completion percentage calculation
const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);
```

---

### `server/src/controllers/subjectController.js`

#### Referential Integrity / Safe Deletion:
Before deleting a subject, `deleteSubject` executes:
```javascript
const assignmentCount = await Assignment.countDocuments({ subject: subject.name });
if (assignmentCount > 0) {
  return res.status(400).json({
    success: false,
    message: `Cannot delete "${subject.name}" because ${assignmentCount} assignment(s) are currently assigned to it.`,
  });
}
```
This guarantees that assignments are never left with invalid subject references.

---

## 4. Master Viva Voce Questions & Answers

### Q1: What is the MERN stack and how do its components interact in Taskora?
> **Answer:** MERN stands for **MongoDB** (NoSQL database), **Express.js** (backend web framework), **React** (frontend UI library), and **Node.js** (JavaScript runtime). In Taskora, React renders the user interface in the client's browser. When actions occur (e.g., adding an assignment), React sends an HTTP fetch request to the Express server running on Node.js. Express validates the request and uses Mongoose to perform CRUD queries on MongoDB, returning JSON data back to React.

### Q2: What is the difference between SQL and NoSQL databases? Why choose MongoDB for this project?
> **Answer:** SQL databases (e.g., MySQL, PostgreSQL) are relational, table-based, and enforce rigid schemas with predefined columns. NoSQL databases (e.g., MongoDB) are document-oriented, storing flexible JSON-like documents (BSON). MongoDB was selected because assignments and subjects map naturally to JSON objects, eliminating complex object-relational impedance and making data exchange with JavaScript/Node.js seamless.

### Q3: How does JWT authentication work and where is the token stored?
> **Answer:** When an administrator logs in with valid credentials, the server signs a JSON Web Token containing the user's ID using a secret key (`jwt.sign()`). The client stores this token in `localStorage`. For subsequent requests to protected routes, the client includes the token in the `Authorization: Bearer <token>` header. The server verifies the signature using `jwt.verify()` without needing to query a session table.

### Q4: Why should passwords never be stored in plain text? How does bcrypt protect them?
> **Answer:** If a database is compromised, plain-text passwords expose user accounts across all services where they reuse that password. `bcrypt` solves this using **one-way cryptographic hashing** combined with a random **salt** (e.g., 10 rounds). The salt prevents dictionary and rainbow-table attacks. The original password can never be decrypted; instead, incoming login attempts are hashed with the same salt and compared using `bcrypt.compare()`.

### Q5: What is CORS and how is it handled in Taskora?
> **Answer:** CORS (Cross-Origin Resource Sharing) is a browser security mechanism that blocks web pages from making requests to a different domain or port than the one that served the page. Since our React client runs on port `5173` and Express runs on port `5000`, they are considered different origins. We configure the `cors` middleware in `server/src/app.js` to whitelist `http://localhost:5173`, allowing authorized cross-origin requests.

### Q6: What are React Hooks? Which hooks are used in Taskora?
> **Answer:** Hooks are functions introduced in React 16.8 that allow functional components to use state and lifecycle features:
> - `useState`: Manages local component state (e.g., form inputs, modal visibility, filter selections).
> - `useEffect`: Handles side effects such as fetching data from the API on mount or listening for window events.
> - `useContext`: Subscribes to global context (`AuthContext`) without prop drilling.
> - `useMemo`: Memoizes expensive calculations, such as filtering and sorting assignment lists.
> - `useParams` & `useNavigate`: React Router hooks for reading URL parameters and programmatic redirection.

### Q7: How does Taskora determine whether an assignment is overdue?
> **Answer:** An assignment is overdue if and only if **two conditions** are met simultaneously:
> 1. The assignment's `dueDate` is strictly less than the current timestamp (`new Date() > dueDate`).
> 2. The assignment's `status` is **not** equal to `'Completed'`.
> If an assignment has passed its due date but was marked `'Completed'`, it is recognized as finished work, not overdue.

### Q8: What is the purpose of TypeScript in this project?
> **Answer:** TypeScript adds static typing on top of JavaScript ES6. In Taskora, TypeScript defines interfaces (e.g., `Assignment`, `Subject`, `DashboardStats`) in `client/src/types/index.ts`. This catches bugs (e.g., misspelled field names, null references) at compile time before code ever runs in the browser.
