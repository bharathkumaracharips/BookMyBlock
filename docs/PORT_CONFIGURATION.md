# BookMyBlock - Port Configuration

## Dashboard Ports

Each dashboard runs on separate ports to avoid conflicts:

### Frontend Ports
- **User Dashboard**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3001` 
- **Owner Dashboard**: `http://localhost:3002`

### Backend API Ports
- **User Backend**: `http://localhost:8000`
- **Admin Backend**: `http://localhost:8001`
- **Owner Backend**: `http://localhost:8002`

## Running the Dashboards

### Run All Dashboards Simultaneously
```bash
npm run dev:all
```

### Run Individual Dashboards
```bash
# User Dashboard (Port 3000)
npm run dev:user

# Admin Dashboard (Port 3001)
npm run dev:admin

# Owner Dashboard (Port 3002)
npm run dev:owner
```

### Run Individual Components
```bash
# From within each dashboard directory
cd User && npm run dev:frontend    # Frontend only
cd User && npm run dev:backend     # Backend only

cd Admin && npm run dev:frontend   # Frontend only
cd Admin && npm run dev:backend    # Backend only

cd Owner && npm run dev:frontend   # Frontend only
cd Owner && npm run dev:backend    # Backend only
```

## Environment Variables

You can override the default ports using environment variables:

```bash
# Frontend ports (in vite.config.ts)
PORT=3000  # User
PORT=3001  # Admin  
PORT=3002  # Owner

# Backend ports (in .env files)
PORT=8000  # User Backend
PORT=8001  # Admin Backend
PORT=8002  # Owner Backend
```

## Installation

Install dependencies for all dashboards:
```bash
npm run install:all
```

Or install individually:
```bash
cd User && npm install
cd Admin && npm install  
cd Owner && npm install
```