# Testing Location-Based Theater Discovery

## Quick Test Steps

### 1. Start the Services

**Terminal 1 - Owner Backend:**
```bash
cd Owner/packages/backend
npm run dev
```

**Terminal 2 - User Backend:**
```bash
cd User/packages/backend
npm run dev
```

**Terminal 3 - User Frontend:**
```bash
cd User/packages/frontend
npm run dev
```

### 2. Test API Endpoints

**Test 1: Check if theaters are loaded**
```bash
curl http://localhost:8000/api/theaters
```

**Test 2: Debug Hyderabad location**
```bash
curl http://localhost:8000/api/theaters/debug/location/Hyderabad
```

**Test 3: Get theaters near Hyderabad pincode**
```bash
curl http://localhost:8000/api/theaters/near/500001
```

**Test 4: Get pincode for Hyderabad**
```bash
curl http://localhost:8000/api/theaters/utils/pincode/Hyderabad
```

### 3. Frontend Testing

1. Open http://localhost:3000
2. Login with any account
3. When prompted for location, allow access
4. You should see:
   - Your detected location (Hyderabad, Telangana)
   - Warning if pincode is not detected
   - List of nearby theaters in Hyderabad
   - Mock events for those theaters

### 4. Manual Location Testing

1. Click on the location selector
2. Search for "Hyderabad" or select it from the list
3. System should:
   - Set location to Hyderabad
   - Fetch pincode (500001) from backend
   - Show Hyderabad theaters
   - Display events

### 5. Expected Results

**For Hyderabad location, you should see:**
- INOX GVK One Mall (Banjara Hills) - 500034
- PVR Forum Sujana Mall (Kukatpally) - 500072  
- AMB Cinemas (Gachibowli) - 500032
- Mock events for each theater

**API Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": "theater_app_2",
      "name": "INOX GVK One Mall",
      "location": "Hyderabad, Telangana",
      "pincode": "500034",
      "city": "Hyderabad",
      "state": "Telangana",
      "address": "GVK One Mall, Banjara Hills",
      "screens": 6,
      "totalSeats": 1200,
      "distance": 0
    }
  ],
  "total": 3
}
```

## Troubleshooting

### Issue: Pincode is undefined
**Solution:** The system now has multiple fallbacks:
1. Geocoding API tries to get pincode
2. If failed, backend city mapping is used
3. If still no pincode, city-based search is used
4. UI shows warning when pincode is not available

### Issue: No theaters found
**Check:**
1. Owner backend is running on port 8002
2. User backend is running on port 8000
3. Sample theater data exists in Owner backend
4. API connectivity between services

### Issue: Location detection fails
**Fallback:**
1. Manual city selection works
2. City-based theater search is available
3. All theaters shown if no location

## Debug Commands

**Check Owner backend theaters:**
```bash
curl http://localhost:8002/api/admin/theater-requests
```

**Test User backend connectivity:**
```bash
curl http://localhost:8000/api/theaters/debug/location/Mumbai
```

**Test pincode mapping:**
```bash
curl http://localhost:8000/api/theaters/utils/pincode/Delhi
curl http://localhost:8000/api/theaters/utils/pincode/Bangalore
curl http://localhost:8000/api/theaters/utils/pincode/Hyderabad
```

The system is now robust and handles the pincode undefined issue gracefully!