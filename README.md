# Blueprints - Project Architecture Analyzer

A full-stack application that analyzes your codebase and visualizes its architecture. Upload a ZIP of any project to get a comprehensive breakdown of its tech stack, dependencies, file structure, API flows, and statistics — enhanced with optional AI-powered analysis.

## Features

### Lite version (demo)
Link: https://luqmankhailmi.github.io/blueprints-lite/

### ✨ Current Features

1. **User Authentication**
   - Email-based registration and login
   - JWT-based authentication
   - Google OAuth 2.0 integration

2. **Project Management**
   - Create multiple projects
   - Upload projects as ZIP files or connect via GitHub
   - View project list with metadata

3. **Tech Stack Analysis**
   - Automatic detection of frameworks, libraries, databases, DevOps tools, and testing setups
   - Scans all `package.json` files recursively (not just root)
   - Detects by file extensions, config files, and dependency names
   - Covers frontend, backend, database, DevOps, and testing categories

4. **Dependency Analysis**
   - Finds all `package.json` files across the project
   - Categorizes packages (Backend, Frontend, Database, Testing, etc.)
   - Shows versions and total package counts per file

5. **AI-Powered Analysis** *(requires Groq API key)*
   - Uses **Llama 3.3 70B** via Groq to read actual source files
   - Detects technologies not visible in `package.json` alone
   - Adds confidence scores (`high / medium / low`) to each detected technology
   - Tags each detection as `ai`, `basic`, or `both`
   - Generates architecture insights: overall pattern, design patterns, and improvement recommendations
   - Results are **persisted to the database** — no need to re-run on every visit

6. **API Flow Visualization**
   - Interactive flow diagrams using React Flow
   - See request → middleware chain → handler → response visually
   - ⚠️ **See limitations section below**

7. **File Browser**
   - Full directory tree view
   - File content viewer
   - Works with any project type

8. **Statistics**
   - File count, directory count, total size
   - Language breakdown by file extension

9. **Performance: Analysis Caching**
   - All analysis results (directory, dependencies, tech stack) are stored in the database on first upload
   - Subsequent page loads read from the cache instantly — no re-scanning files every visit
   - Cache is refreshed automatically when a new file is uploaded

## ⚠️ API Flow Visualization — Limitations

The API Flow tab detects and visualizes routes **only for Express.js projects written in plain JavaScript (`.js` files)**.

Specifically, it looks for this pattern using a Babel AST parser:

```js
router.get('/path', middleware, handler)
app.post('/path', handler)
```

**What it supports:**
- Express.js with `router.METHOD()` or `app.METHOD()` patterns
- `.js` files only (not `.ts`)
- Standard Express middleware chains

**What it does NOT support:**
- TypeScript (`.ts` / `.tsx`) — even Express projects written in TypeScript
- NestJS (uses decorators like `@Get()`, `@Post()`)
- Fastify, Koa, Hapi, Restify
- Any non-JavaScript backend (Python, Go, Java, PHP, Ruby, etc.)
- GraphQL resolvers
- Non-standard or dynamic route registration

All other features (Tech Stack, Dependencies, Files, Statistics, AI Analysis) work with **any project in any language**.

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **PostgreSQL** — stores users, projects, flows, and cached analysis results
- **JWT** — authentication
- **Multer** — file upload handling
- **@babel/parser** — AST parsing for Express.js route detection
- **AdmZip** — ZIP extraction
- **Groq API (Llama 3.3 70B)** — optional AI analysis

### Frontend
- **React 18**
- **React Router** — client-side routing
- **React Flow** — interactive flow diagrams
- **Axios** — HTTP client
- **Lucide React** — icons

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Groq API key *(optional, for AI analysis — free tier available at [console.groq.com](https://console.groq.com))*

## Installation & Setup

### 1. Clone or Extract the Project

```bash
cd blueprints
```

### 2. Database Setup

```sql
CREATE DATABASE blueprints;
```

Then run the migration to add all required columns:

```bash
psql -U your_user -d blueprints -f migration_add_cache_columns.sql
```

This migration adds: `tech_stack`, `directory_data`, `dependencies_data`, `ai_analyzed`, `ai_analysis_date`, `ai_model` to the `projects` table.

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=blueprints
JWT_SECRET=your-secret-key-here

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Optional: AI Analysis (free tier at console.groq.com)
GROQ_API_KEY=gsk_your_key_here
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

The default `REACT_APP_API_URL=http://localhost:5000/api` works out of the box.

### 5. Running the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm start
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

App opens at `http://localhost:3000`.

## Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable the Google+ API
3. Credentials → Create OAuth 2.0 Client ID (Web application)
4. Authorized JavaScript origins: `http://localhost:3000`, `http://localhost:5000`
5. Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
6. Add Client ID and Secret to `backend/.env`

## AI Analysis Setup (Optional)

1. Sign up at [console.groq.com](https://console.groq.com) (free)
2. Create an API key (starts with `gsk_`)
3. Add to `backend/.env`: `GROQ_API_KEY=gsk_your_key_here`
4. Restart the backend server

Free tier limits: 30 requests/minute, 14,400/day — more than enough for personal use.

Once configured, an **AI Analysis** section appears on the Overview tab of each project. Click **Execute AI Analysis** to run it. Results are saved to the database and persist across sessions.

## Usage Guide

1. **Register / Login** at the home page
2. **Create a project** from the dashboard
3. **Upload a ZIP** of your codebase (up to 50MB)
4. The system immediately analyzes and caches: directory structure, dependencies, tech stack, and API flows (if Express.js)
5. **Browse tabs**: Overview, API Flow, Files, Dependencies, Tech Stack, Statistics
6. Optionally run **AI Analysis** from the Overview tab for deeper insights

## Project Structure

```
blueprints/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── passport.js
│   │   │   └── schema.js          # DB table definitions (includes all cache columns)
│   │   ├── controllers/
│   │   │   ├── aiAnalysisController.js
│   │   │   ├── architectureController.js  # Reads from DB cache
│   │   │   ├── authController.js
│   │   │   ├── flowController.js
│   │   │   └── projectController.js       # Runs + caches analysis on upload
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── architecture.js
│   │   │   ├── auth.js
│   │   │   ├── flows.js
│   │   │   └── projects.js                # Includes AI analysis routes
│   │   └── services/
│   │       ├── aiTechStackAnalyzer.js     # Groq / Llama integration
│   │       ├── dependencyAnalyzer.js      # Scans all package.json files
│   │       ├── directoryAnalyzer.js
│   │       ├── flowAnalyzer.js            # Express.js AST route detection
│   │       └── techStackDetector.js       # Recursive multi-package.json detection
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIAnalysisButton.js
│   │   │   ├── DependenciesTab.js
│   │   │   ├── FilesTab.js
│   │   │   ├── OverviewTab.js             # Hosts the AI Analysis section
│   │   │   ├── StatsTab.js
│   │   │   └── TechStackTab.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   ├── Project.js
│   │   │   ├── Register.js
│   │   │   └── Settings.js
│   │   └── services/
│   │       └── api.js
│   └── package.json
│
├── migration_add_cache_columns.sql        # Run this once after setup
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET  /api/auth/me`

### Projects
- `POST   /api/projects` — Create project
- `GET    /api/projects` — List all user projects
- `GET    /api/projects/:id` — Get project
- `POST   /api/projects/:id/upload` — Upload ZIP (triggers full analysis + caching)
- `DELETE /api/projects/:id` — Delete project

### Architecture
- `GET /api/architecture/:id` — Get full analysis (reads from DB cache)
- `GET /api/architecture/:id/directory` — Directory structure only
- `GET /api/architecture/:id/file` — File content

### Flows
- `GET /api/flows/project/:projectId` — All flows for a project
- `GET /api/flows/:flowId` — Specific flow

### AI Analysis
- `POST /api/projects/:id/ai-analyze` — Run AI analysis (requires `GROQ_API_KEY`)
- `GET  /api/projects/:id/ai-status` — Check if AI analysis has been run

## How Analysis Works

### On Upload
All analysis runs once and is stored in the database:
1. ZIP is extracted to a permanent directory
2. `FlowAnalyzer` detects Express.js routes → saved to `flows` table
3. `DirectoryAnalyzer` scans file tree → saved to `projects.directory_data`
4. `DependencyAnalyzer` finds all `package.json` files → saved to `projects.dependencies_data`
5. `TechStackDetector` scans all deps + file extensions → saved to `projects.tech_stack`

### On Page Load
Reads directly from the database — no file scanning. Fast and consistent.

### AI Analysis (On Demand)
1. Reads up to 10 source files + all config files
2. Sends to Groq API (Llama 3.3 70B) with the basic analysis as context
3. AI returns enhanced tech stack with confidence scores + insights
4. Result overwrites `projects.tech_stack` in the database
5. All future page loads use the AI-enhanced version

## Troubleshooting

**Database connection issues** — verify PostgreSQL is running and `.env` credentials are correct.

**`tech_stack` / `directory_data` column not found** — run `migration_add_cache_columns.sql`.

**AI analysis shows "GROQ_API_KEY missing"** — add the key to `backend/.env` and **restart the backend** (env vars are loaded once at startup).

**API Flow tab shows no routes** — your project must use Express.js with `.js` files and standard `router.METHOD()` / `app.METHOD()` route patterns. See limitations above.

**Upload fails** — ensure `backend/uploads/` exists and is writable. Max file size is 50MB.

**Existing projects show no cached data** — open each project once; the fallback will run live analysis and cache it automatically on that first load.

## Deployment (Railway)

1. Push to GitHub
2. Create a Railway project, add PostgreSQL
3. Set all environment variables from `.env`
4. Run the migration SQL in the Railway database console
5. Railway auto-deploys on push

## Future Enhancements

- TypeScript support for API Flow detection
- NestJS decorator-based route detection
- Fastify / Koa support
- Export flow diagrams as images
- Multi-user collaboration
- API documentation generation from flows
- Scheduled re-analysis on file changes

## Security Notes

- Change the default `JWT_SECRET` in production
- Never commit `.env` to git — it's in `.gitignore`
- `GROQ_API_KEY` is backend-only and never exposed to the frontend
- Use HTTPS in production
- Rate limiting is handled by Groq on AI endpoints

## License

Provided as-is for educational and development purposes.
