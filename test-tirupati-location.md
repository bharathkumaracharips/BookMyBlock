# Testing Tirupati Location Selection

## Quick Test Steps

### 1. Frontend Test
1. Open http://localhost:3000
2. Login with any account
3. Click on the location selector (should show "Select City" or current location)
4. In the search box, type "Tirupati"
5. You should see "Tirupati, Andhra Pradesh" in the dropdown
6. Click on it to select

### 2. Expected Results
After selecting Tirupati, you should see:
- Location updated to "Tirupati, Andhra Pradesh"
- Pincode detected as 517501
- 1 theater found: "PVR Cinemas Tirupati"
- 2 mock events displayed

### 3. API Test
You can also test the API directly:
```bash
# Test Tirupati location detection
curl http://localhost:8000/api/theaters/debug/location/Tirupati

# Should return:
# - detectedPincode: "517501"
# - cityTheaters: 1
# - nearbyTheaters: 1
```

### 4. Search Test
In the location dropdown:
- Search for "tiru" - should show Tirupati
- Search for "andhra" - should show all Andhra Pradesh cities including Tirupati
- Search for "517" - should work if user knows the pincode

### 5. Location Hierarchy
The cities are now organized as:
1. **Major Metro Cities** (Mumbai, Delhi, Bangalore, Hyderabad, etc.)
2. **Major Tier 2 Cities** (Jaipur, Surat, Lucknow, etc.)
3. **Andhra Pradesh & Telangana** (Tirupati is first in this section)
4. **Other states** organized by state

This makes Tirupati easy to find for users looking for theaters in Andhra Pradesh!

## Troubleshooting

If Tirupati doesn't appear:
1. Check if the User frontend is running on port 3000
2. Clear browser cache and reload
3. Check browser console for any JavaScript errors
4. Verify the LocationFinder component has been updated

The location dropdown now includes Tirupati and it's prominently placed in the Andhra Pradesh section! 🎭