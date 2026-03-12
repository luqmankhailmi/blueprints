# FlowTracker - API Flow Visualization Tool

A powerful full-stack application that helps you track and visualize your Express.js API flows. Upload your Express.js project, and FlowTracker will automatically analyze your routes, middleware chains, and handlers, presenting them as beautiful, interactive flow diagrams.

## Features

### ✨ Current Features

1. **User Authentication**
   - Email-based registration and login
   - JWT-based authentication
   - **Google OAuth 2.0 integration** (fully functional)

2. **Project Management**
   - Create multiple projects
   - Upload Express.js projects as ZIP files
   - View project list with metadata

3. **Flow Analysis**
   - Automatic route detection from Express.js code
   - Middleware chain analysis
   - Handler function tracking
   - Interactive flow visualization using React Flow

4. **Beautiful UI**
   - Modern, dark-themed interface
   - Responsive design
   - Smooth animations and transitions
   - Technical, data-visualization aesthetic

5. **Settings**
   - User profile management
   - Logout functionality
   - Placeholders for future features (GitHub integration, theme customization)

## Tech Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **PostgreSQL** - Database for users, projects, and flows
- **JWT** - Authentication
- **Multer** - File upload handling
- **@babel/parser** - AST parsing for Express.js route detection
- **AdmZip** - ZIP file extraction

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **React Flow** - Interactive flow diagrams
- **Axios** - HTTP client
- **Lucide React** - Icons

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation & Setup

### 1. Clone or Extract the Project

```bash
cd flow-tracker
```

### 2. Google OAuth Setup (Optional but Recommended)

To enable Google OAuth login:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. For Application type, select "Web application"
7. Add these URLs:

**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:5000
```

**Authorized redirect URIs:**
```
http://localhost:5000/api/auth/google/callback
```

8. Copy your Client ID and Client Secret
9. Add them to `backend/.env`:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

**For Production:** Replace localhost URLs with your actual domain.

### 3. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE flow_tracker;
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your database credentials
# Example:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=flow_tracker
# JWT_SECRET=your-secret-key-here

# The database tables will be created automatically when the server starts
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# The default API URL (http://localhost:5000/api) should work if backend runs on port 5000
```

### 5. Running the Application

You'll need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server will run on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# React app will run on http://localhost:3000
```

The application will automatically open in your browser at `http://localhost:3000`.

## Usage Guide

### 1. Create an Account
- Visit the registration page
- Enter your name, email, and password
- Click "Create Account"

### 2. Create a Project
- Click "New Project" on the dashboard
- Enter a project name
- Click "Create"

### 3. Upload Express.js Code
- Click on a project to open its details
- Click "Choose ZIP file" and select your Express.js project ZIP
- Click "Upload & Analyze"
- The system will automatically detect routes and create flow diagrams

### 4. View Flow Diagrams
- After analysis, you'll see a list of detected API endpoints
- Click on any endpoint to see its interactive flow diagram
- The diagram shows:
  - Request entry point
  - Source file
  - Middleware chain
  - Handler functions
  - Response output

## Project Structure

```
flow-tracker/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Flow analyzer service
│   │   └── server.js       # Express app setup
│   ├── uploads/           # Uploaded project files
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service
│   │   ├── styles/         # CSS files
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - Get all user projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects/:id/upload` - Upload project ZIP file
- `DELETE /api/projects/:id` - Delete project

### Flows
- `GET /api/flows/project/:projectId` - Get all flows for a project
- `GET /api/flows/:flowId` - Get specific flow details

## How Flow Analysis Works

The FlowAnalyzer service:
1. Extracts the uploaded ZIP file
2. Recursively searches for JavaScript files that look like routes
3. Uses Babel parser to create an Abstract Syntax Tree (AST)
4. Traverses the AST to find Express route definitions:
   - `router.get()`, `router.post()`, etc.
   - `app.get()`, `app.post()`, etc.
5. Extracts:
   - HTTP method (GET, POST, PUT, DELETE, etc.)
   - Route path/endpoint
   - Middleware functions
   - Handler functions
6. Builds a flow graph with nodes and edges
7. Stores the flow data in PostgreSQL as JSONB

## File Storage

Currently, uploaded ZIP files are stored on the server's file system in `backend/uploads/`. The file path is stored in the PostgreSQL database. For production use, consider:
- Using cloud storage (AWS S3, Google Cloud Storage, etc.)
- Implementing file size limits
- Adding virus scanning
- Implementing cleanup of old files

## Future Enhancements

- ✅ GitHub integration (direct repository import)
- ✅ Theme customization (light/dark modes)
- ✅ Export flow diagrams as images
- ✅ Collaboration features (team sharing)
- ✅ Advanced filtering and search
- ✅ Support for other frameworks (NestJS, Fastify, etc.)
- ✅ Real-time collaboration
- ✅ API documentation generation from flows

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `.env` credentials match your PostgreSQL setup
- Verify database `flow_tracker` exists

### Port Conflicts
- Backend default port: 5000 (change in `backend/.env`)
- Frontend default port: 3000 (React will suggest 3001 if 3000 is taken)

### Upload Issues
- Ensure the `backend/uploads/` directory exists and is writable
- Check file size limits in `backend/src/routes/projects.js`
- Verify uploaded ZIP contains JavaScript files

### Flow Analysis Not Working
- Ensure your Express.js project uses standard route patterns
- Check server logs for parsing errors
- The analyzer looks for files with keywords: 'route', 'router', 'controller', 'api', 'endpoint'

## Development

### Running in Development Mode

Backend with auto-reload:
```bash
cd backend
npm install -g nodemon  # If not already installed
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

---

## Deployment

### Deploy to Railway (Recommended)

FlowTracker is optimized for deployment on Railway.app with PostgreSQL:

1. **Quick Deploy:**
   - See detailed guide: [`RAILWAY_DEPLOYMENT.md`](./RAILWAY_DEPLOYMENT.md)
   - Railway provides free PostgreSQL database
   - Automatic SSL/HTTPS
   - Easy environment variable management
   - Auto-deployment from GitHub

2. **Key Features on Railway:**
   - 🚀 Automatic deployments on git push
   - 📊 Built-in monitoring and logs
   - 🔒 SSL certificates included
   - 💾 PostgreSQL database included
   - 🌍 CDN and edge caching

3. **Estimated Costs:**
   - Free tier: $5 credits/month
   - Typical usage: ~$2-5/month for small projects
   - Scales automatically with traffic

For complete deployment instructions, see [`RAILWAY_DEPLOYMENT.md`](./RAILWAY_DEPLOYMENT.md)

### Alternative Deployment Options

<details>
<summary>Deploy to Heroku</summary>

Similar setup to Railway, use Heroku PostgreSQL add-on:
```bash
heroku create flowtracker-api
heroku addons:create heroku-postgresql:mini
heroku config:set JWT_SECRET=your-secret-key
git push heroku main
```
</details>

<details>
<summary>Deploy to Vercel (Frontend) + Railway (Backend)</summary>

**Frontend on Vercel:**
```bash
cd frontend
vercel
```

**Backend on Railway:**
Follow Railway deployment guide for backend only.
</details>

<details>
<summary>Self-Hosted (VPS/Docker)</summary>

Requires:
- Node.js 18+
- PostgreSQL 12+
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt)

See deployment guides for DigitalOcean, AWS, or Docker setup.
</details>

---

## Development

### Running in Development Mode

Backend with auto-reload:
```bash
cd backend
npm install -g nodemon  # If not already installed
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

## Security Notes

- Change the default `JWT_SECRET` in production
- Use environment variables for all sensitive data
- Implement rate limiting for API endpoints
- Add input validation and sanitization
- Use HTTPS in production
- Implement proper error handling without exposing sensitive info

## License

This project is provided as-is for educational and development purposes.

## Support

For issues or questions, please check:
1. This README for setup instructions
2. Server logs in the terminal
3. Browser console for frontend errors
4. PostgreSQL logs for database issues

---

Built with ❤️ for developers who want to understand their API flows better.
