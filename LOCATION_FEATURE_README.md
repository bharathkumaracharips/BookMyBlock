# Location-Based Theater Discovery Feature

## Overview

This feature enables users to discover theaters and events based on their current location or selected city. The system extracts pincode information from theater registration PDFs and matches them with user locations to show relevant content.

## Architecture

### Backend Services (User App)

1. **PDFParsingService** (`User/packages/backend/src/services/pdfParsingService.ts`)
   - Extracts theater data from PDF content stored on IPFS
   - Parses pincode, theater name, city, state, and other details
   - Provides pincode proximity checking functionality

2. **TheaterService** (`User/packages/backend/src/services/theaterService.ts`)
   - Fetches approved theaters from Owner backend
   - Filters theaters by location (pincode/city)
   - Provides mock events for demonstration

3. **Theater API Routes** (`User/packages/backend/src/routes/theaters.ts`)
   - `GET /api/theaters` - Get all approved theaters
   - `GET /api/theaters/near/:pincode` - Get theaters near a pincode
   - `GET /api/theaters/city/:cityName` - Get theaters in a city
   - `GET /api/theaters/events/near/:pincode` - Get events near a pincode
   - `GET /api/theaters/search?q=query` - Search theaters
   - `GET /api/theaters/utils/pincode/:cityName` - Get pincode for city

### Frontend Services (User App)

1. **LocationService** (`User/packages/frontend/src/services/locationService.ts`)
   - Handles geolocation detection
   - Communicates with backend theater APIs
   - Provides location-based data fetching

2. **useLocationTheaters Hook** (`User/packages/frontend/src/hooks/useLocationTheaters.ts`)
   - React hook for managing location-based theater data
   - Handles loading states and error handling
   - Provides search functionality

3. **Enhanced LocationFinder** (`User/packages/frontend/src/components/ui/LocationFinder.tsx`)
   - Updated to integrate with LocationService
   - Supports pincode detection for cities
   - Triggers location-based data updates

4. **Updated HomePage** (`User/packages/frontend/src/components/pages/HomePage.tsx`)
   - Shows location-based theaters and events
   - Displays user's current location
   - Provides refresh and location change functionality

## How It Works

### 1. Theater Registration (Owner App)
- Theater owners fill registration form with pincode
- Form data is converted to PDF and stored on IPFS
- PDF contains structured data including pincode information

### 2. Location Detection (User App)
- User's location is detected via HTML5 Geolocation API
- City name is converted to pincode using mapping service
- User can manually select location using LocationFinder

### 3. Theater Discovery
- Backend fetches approved theaters from Owner API
- PDF content is parsed to extract location data
- Theaters are filtered based on pincode proximity
- Results are sorted by distance from user

### 4. Event Discovery
- Events are fetched for nearby theaters
- Mock events are provided for demonstration
- Real events would come from Owner's event management system

## API Endpoints

### User Backend APIs

```
GET /api/theaters
- Returns all approved theaters

GET /api/theaters/near/:pincode?maxDistance=50
- Returns theaters within specified distance of pincode

GET /api/theaters/city/:cityName
- Returns theaters in specified city

GET /api/theaters/events/near/:pincode
- Returns events from theaters near pincode

GET /api/theaters/search?q=query
- Search theaters by name, city, or pincode

GET /api/theaters/utils/pincode/:cityName
- Get pincode for city name

GET /api/theaters/:theaterId/events
- Get events for specific theater
```

## Setup Instructions

### 1. Start Owner Backend (Port 8002)
```bash
cd Owner/packages/backend
npm run dev
```

### 2. Start User Backend (Port 8000)
```bash
cd User/packages/backend
npm run dev
```

### 3. Start User Frontend (Port 3000)
```bash
cd User/packages/frontend
npm run dev
```

### 4. Environment Configuration

**User Backend (.env)**
```
PORT=8000
CORS_ORIGIN=http://localhost:3000
OWNER_API_BASE_URL=http://localhost:8002/api
```

**User Frontend (.env)**
```
VITE_API_BASE_URL=http://localhost:8000/api
```

## Testing the Feature

### 1. Sample Data
The Owner backend includes a sample approved theater:
- **Name**: PVR Cinemas Tirupati
- **Location**: Tirupati, Andhra Pradesh
- **Pincode**: 517501

### 2. Test Scenarios

**Scenario 1: Current Location Detection**
1. Open User app (http://localhost:3000)
2. Login with any account
3. Allow location access when prompted
4. System will detect your location and show nearby theaters

**Scenario 2: Manual Location Selection**
1. Click on "Select City" in the location finder
2. Search for "Tirupati" or select from the list
3. System will show the sample theater and mock events

**Scenario 3: API Testing**
```bash
# Get theaters near Tirupati pincode
curl http://localhost:8000/api/theaters/near/517501

# Get theaters in Tirupati city
curl http://localhost:8000/api/theaters/city/Tirupati

# Get events near Tirupati
curl http://localhost:8000/api/theaters/events/near/517501
```

## Key Features

### ✅ Implemented
- PDF parsing for theater location data
- Pincode-based proximity matching
- Location detection and selection
- Theater and event filtering by location
- Responsive UI with location display
- API endpoints for location-based queries

### 🔄 Future Enhancements
- Real PDF parsing using libraries like pdf-parse
- Proper geocoding service integration
- Real-time event data from Owner backend
- Advanced distance calculations
- Location-based push notifications
- Caching for improved performance

## Troubleshooting

### Common Issues

1. **No theaters found**
   - Ensure Owner backend is running on port 8002
   - Check that sample theater data exists in admin.ts
   - Verify API connectivity between User and Owner backends

2. **Location detection fails**
   - Ensure HTTPS or localhost for geolocation API
   - Check browser permissions for location access
   - Fallback to manual city selection

3. **PDF parsing errors**
   - Current implementation uses simple text parsing
   - For production, implement proper PDF parsing library
   - Ensure IPFS gateway accessibility

## Architecture Decisions

### Why PDF Parsing?
- Theater data is already stored as PDF on IPFS
- Maintains data integrity and immutability
- Leverages existing Owner app infrastructure

### Why Pincode-Based Matching?
- Indian postal system provides good geographic granularity
- Simple proximity calculations without complex geocoding
- Reliable for local theater discovery

### Why Mock Events?
- Demonstrates the complete user flow
- Owner app event management is separate concern
- Easy to replace with real event API integration

## Next Steps

1. **Integrate Real Event Data**: Connect to Owner's event management system
2. **Enhance PDF Parsing**: Use proper PDF parsing libraries for binary PDFs
3. **Improve Location Services**: Integrate with Google Maps or similar geocoding APIs
4. **Add Caching**: Implement Redis caching for theater and location data
5. **Performance Optimization**: Add pagination and lazy loading for large datasets