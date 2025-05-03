# PFE Platform

This project is a basic React frontend with a Node.js + Express backend.

## Getting Started

### 1. Install dependencies
```bash
cd server
npm install
cd ../client
npm install
```

### 2. Run in development
- **Backend**:  `cd server && npm run dev` (uses nodemon)
- **Frontend**: `cd client && npm start`

### 3. Production build & start
```bash
# Build React app
cd client && npm run build
# Start server (serves React build)
cd ../server && npm start
```

Open http://localhost:5000 to view the app.
