import axios from 'axios'
import { CreateEventData, Event } from '../types/event'

// Pinata IPFS Configuration for Events
const PINATA_API_KEY = '801420ef88d144bbd41c'
const PINATA_SECRET_API_KEY = '17787c717e33c6555e236e8b5a5f2c6f93effb8ed6858f9051a4bf8c22142fe3'
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzMTAzNGUyNC0yZjdjLTRkNzItYmZmZi0yZTY0MTJmNjhkODMiLCJlbWFpbCI6ImJoYXJhdGhrdW1hcmFjaGFyaXBzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4MDE0MjBlZjg4ZDE0NGJiZDQxYyIsInNjb3BlZEtleVNlY3JldCI6IjE3Nzg3YzcxN2UzM2M2NTU1ZTIzNmU4YjVhNWYyYzZmOTNlZmZiOGVkNjg1OGY5MDUxYTRiZjhjMjIxNDJmZTMiLCJleHAiOjE3ODU1MjE3MTd9.ZM-VPs8f_FxJ7jzlt4tzoB3mduFkIz4EeHXFpkuheso'

const PINATA_BASE_URL = 'https://api.pinata.cloud'

interface EventIPFSData {
    eventId: string
    theaterId: string
    theaterName: string
    movieTitle: string
    startDate: string
    endDate: string
    showTimes: string[]
    ticketPrice: number
    description?: string
    createdBy: string
    createdAt: string
    metadata: {
        type: 'theater_event'
        version: '1.0'
        platform: 'BookMyBlock'
    }
}

class IPFSEventService {
    private api = axios.create({
        baseURL: PINATA_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PINATA_JWT}`,
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_API_KEY
        }
    })

    // Upload event data to IPFS as JSON
    async uploadEventToIPFS(eventData: CreateEventData, theaterName: string, userId: string): Promise<string> {
        try {
            console.log('📤 Uploading event to IPFS:', eventData)

            // Create structured event data for IPFS
            const ipfsEventData: EventIPFSData = {
                eventId: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                theaterId: eventData.theaterId,
                theaterName: theaterName,
                movieTitle: eventData.movieTitle,
                startDate: eventData.startDate,
                endDate: eventData.endDate,
                showTimes: eventData.showTimes,
                ticketPrice: eventData.ticketPrice,
                description: eventData.description,
                createdBy: userId,
                createdAt: new Date().toISOString(),
                metadata: {
                    type: 'theater_event',
                    version: '1.0',
                    platform: 'BookMyBlock'
                }
            }

            // Upload JSON data to IPFS
            const response = await this.api.post('/pinning/pinJSONToIPFS', {
                pinataContent: ipfsEventData,
                pinataMetadata: {
                    name: `Event_${eventData.movieTitle}_${eventData.startDate}`,
                    keyvalues: {
                        type: 'theater_event',
                        movieTitle: eventData.movieTitle,
                        theaterId: eventData.theaterId,
                        startDate: eventData.startDate,
                        endDate: eventData.endDate,
                        createdBy: userId
                    }
                },
                pinataOptions: {
                    cidVersion: 1
                }
            })

            const ipfsHash = response.data.IpfsHash
            console.log('✅ Event uploaded to IPFS successfully:', ipfsHash)
            console.log('🔗 IPFS URL:', `https://gateway.pinata.cloud/ipfs/${ipfsHash}`)

            return ipfsHash

        } catch (error) {
            console.error('❌ Error uploading event to IPFS:', error)
            if (error.response) {
                console.error('Response data:', error.response.data)
                console.error('Response status:', error.response.status)
            }
            throw new Error(`Failed to upload event to IPFS: ${error.message}`)
        }
    }

    // Retrieve event data from IPFS
    async getEventFromIPFS(ipfsHash: string): Promise<EventIPFSData | null> {
        try {
            console.log('📥 Retrieving event from IPFS:', ipfsHash)

            const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`)

            console.log('✅ Event retrieved from IPFS successfully')
            return response.data as EventIPFSData

        } catch (error) {
            console.error('❌ Error retrieving event from IPFS:', error)
            return null
        }
    }

    // List all events pinned by this account
    async listPinnedEvents(): Promise<any[]> {
        try {
            console.log('📋 Listing pinned events from IPFS...')

            const response = await this.api.get('/data/pinList', {
                params: {
                    status: 'pinned',
                    pageLimit: 100,
                    metadata: {
                        keyvalues: {
                            type: {
                                value: 'theater_event',
                                op: 'eq'
                            }
                        }
                    }
                }
            })

            console.log('✅ Found pinned events:', response.data.rows.length)
            return response.data.rows

        } catch (error) {
            console.error('❌ Error listing pinned events:', error)
            return []
        }
    }

    // Unpin an event from IPFS
    async unpinEvent(ipfsHash: string): Promise<boolean> {
        try {
            console.log('📌 Unpinning event from IPFS:', ipfsHash)

            await this.api.delete(`/pinning/unpin/${ipfsHash}`)

            console.log('✅ Event unpinned successfully')
            return true

        } catch (error) {
            console.error('❌ Error unpinning event:', error)
            return false
        }
    }

    // Get IPFS gateway URL for an event
    getEventIPFSUrl(ipfsHash: string): string {
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    }

    // Validate IPFS hash format
    isValidIPFSHash(hash: string): boolean {
        // Basic IPFS hash validation (CIDv0 or CIDv1)
        const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/
        const cidv1Regex = /^b[a-z2-7]{58}$/
        return cidv0Regex.test(hash) || cidv1Regex.test(hash)
    }
}

export const ipfsEventService = new IPFSEventService()
export type { EventIPFSData }