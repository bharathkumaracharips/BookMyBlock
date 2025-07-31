# IPFS Event Storage Integration

This integration allows theater events to be stored on IPFS (InterPlanetary File System) for decentralized, permanent storage.

## Features

### 🌐 Decentralized Storage
- Event data is stored on IPFS using Pinata as the pinning service
- Each event gets a unique IPFS hash for permanent access
- Data remains accessible even if the main server goes down

### 📄 Event Data Structure
Events are stored as JSON with the following structure:
```json
{
  "eventId": "event_1738332000000_abc123def",
  "theaterId": "theater_123",
  "theaterName": "Cinema Palace",
  "movieTitle": "Avengers: Endgame",
  "startDate": "2025-02-01",
  "endDate": "2025-02-15",
  "showTimes": ["10:00", "14:00", "18:00", "21:00"],
  "ticketPrice": 250,
  "description": "Epic superhero movie finale",
  "createdBy": "user_123",
  "createdAt": "2025-01-31T12:00:00.000Z",
  "metadata": {
    "type": "theater_event",
    "version": "1.0",
    "platform": "BookMyBlock"
  }
}
```

## Configuration

### Pinata Credentials
```javascript
const PINATA_API_KEY = '801420ef88d144bbd41c'
const PINATA_SECRET_API_KEY = '17787c717e33c6555e236e8b5a5f2c6f93effb8ed6858f9051a4bf8c22142fe3'
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## Usage

### Creating an Event with IPFS Storage
```typescript
import { ipfsEventService } from './services/ipfsEventService'

const eventData = {
  theaterId: 'theater_123',
  movieTitle: 'Movie Title',
  startDate: '2025-02-01',
  endDate: '2025-02-07',
  showTimes: ['10:00', '14:00', '18:00'],
  ticketPrice: 250,
  description: 'Event description'
}

// Upload to IPFS
const ipfsHash = await ipfsEventService.uploadEventToIPFS(
  eventData,
  'Theater Name',
  'user_id'
)

// Get IPFS URL
const ipfsUrl = ipfsEventService.getEventIPFSUrl(ipfsHash)
```

### Retrieving Event Data from IPFS
```typescript
const eventData = await ipfsEventService.getEventFromIPFS(ipfsHash)
```

## API Methods

### `uploadEventToIPFS(eventData, theaterName, userId)`
- Uploads event data to IPFS
- Returns IPFS hash
- Adds metadata for searchability

### `getEventFromIPFS(ipfsHash)`
- Retrieves event data from IPFS
- Returns parsed JSON data

### `listPinnedEvents()`
- Lists all events pinned by this account
- Useful for management and analytics

### `unpinEvent(ipfsHash)`
- Unpins an event from IPFS
- Use with caution - data may become unavailable

### `getEventIPFSUrl(ipfsHash)`
- Returns the gateway URL for accessing the event
- Format: `https://gateway.pinata.cloud/ipfs/{hash}`

## Benefits

### 🔒 Data Integrity
- IPFS content addressing ensures data hasn't been tampered with
- Hash changes if content changes

### 🌍 Global Accessibility
- Data accessible from any IPFS gateway worldwide
- No single point of failure

### 💾 Permanent Storage
- Data persists as long as it's pinned
- Multiple backup locations automatically

### 🔍 Transparency
- Event data is publicly verifiable
- Builds trust with theater owners and customers

## Integration Flow

1. **Event Creation**: User fills out event form
2. **IPFS Upload**: Event data uploaded to IPFS via Pinata
3. **Hash Generation**: IPFS returns unique content hash
4. **Database Storage**: Event stored in backend with IPFS hash reference
5. **User Notification**: Success message shows IPFS hash and URL

## Error Handling

- Network failures are caught and reported
- Fallback to local storage if IPFS fails
- Retry mechanisms for temporary failures
- Clear error messages for users

## Security Considerations

- API keys are environment-specific
- No sensitive data stored on IPFS
- Public data only (event details, not personal info)
- Rate limiting to prevent abuse

## Future Enhancements

- Blockchain integration for event verification
- IPFS clustering for better availability
- Event updates via IPFS versioning
- Integration with other IPFS gateways