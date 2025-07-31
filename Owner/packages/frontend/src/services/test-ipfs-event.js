// Simple test script to verify IPFS event upload works
import { ipfsEventService } from './ipfsEventService.js'

async function testIPFSEventUpload() {
  try {
    console.log('🧪 Testing IPFS Event Upload...')
    
    const testEventData = {
      theaterId: 'theater_123',
      movieTitle: 'Test Movie',
      startDate: '2025-02-01',
      endDate: '2025-02-07',
      showTimes: ['10:00', '14:00', '18:00', '21:00'],
      ticketPrice: 250,
      description: 'Test event for IPFS integration'
    }
    
    const ipfsHash = await ipfsEventService.uploadEventToIPFS(
      testEventData,
      'Test Theater',
      'test_user_123'
    )
    
    console.log('✅ Test successful!')
    console.log('📄 IPFS Hash:', ipfsHash)
    console.log('🔗 IPFS URL:', ipfsEventService.getEventIPFSUrl(ipfsHash))
    
    // Test retrieval
    console.log('📥 Testing retrieval...')
    const retrievedData = await ipfsEventService.getEventFromIPFS(ipfsHash)
    console.log('📊 Retrieved data:', retrievedData)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testIPFSEventUpload()
}

export { testIPFSEventUpload }