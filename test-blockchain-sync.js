// Quick test script to verify blockchain status synchronization
const { ethers } = require('ethers')

const THEATER_REGISTRY_ABI = [
    {
        "inputs": [{ "internalType": "string", "name": "applicationId", "type": "string" }],
        "name": "getApplication",
        "outputs": [
            { "internalType": "string", "name": "uid", "type": "string" },
            { "internalType": "address", "name": "ownerWallet", "type": "address" },
            { "internalType": "string", "name": "ipfsHash", "type": "string" },
            { "internalType": "uint8", "name": "status", "type": "uint8" },
            { "internalType": "uint256", "name": "submissionTimestamp", "type": "uint256" },
            { "internalType": "uint256", "name": "lastUpdated", "type": "uint256" },
            { "internalType": "string", "name": "reviewNotes", "type": "string" },
            { "internalType": "bool", "name": "isActive", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "string", "name": "uid", "type": "string" }],
        "name": "getUserApplications",
        "outputs": [
            {
                "components": [
                    { "internalType": "string", "name": "uid", "type": "string" },
                    { "internalType": "address", "name": "ownerWallet", "type": "address" },
                    { "internalType": "string", "name": "ipfsHash", "type": "string" },
                    { "internalType": "uint8", "name": "status", "type": "uint8" },
                    { "internalType": "uint256", "name": "submissionTimestamp", "type": "uint256" },
                    { "internalType": "uint256", "name": "lastUpdated", "type": "uint256" },
                    { "internalType": "string", "name": "reviewNotes", "type": "string" },
                    { "internalType": "bool", "name": "isActive", "type": "bool" }
                ],
                "internalType": "struct TheaterRegistry.TheaterApplication[]",
                "name": "applications",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

async function testBlockchainSync() {
    try {
        console.log('🔍 Testing blockchain status synchronization...')
        
        // Connect to Ganache
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545')
        const contractAddress = '0xb634D0116A12693b1C89EA7EcB50EE1622958B4D' // Replace with actual address
        
        const contract = new ethers.Contract(contractAddress, THEATER_REGISTRY_ABI, provider)
        
        // Test with a known UID (replace with actual UID from your tests)
        const testUID = 'did:privy:cm4ywqhqj00ej13oo7ywqhqj' // Replace with actual UID
        
        console.log('📡 Fetching user applications for UID:', testUID)
        const userApps = await contract.getUserApplications(testUID)
        console.log('📡 User applications count:', userApps.length)
        
        for (let i = 0; i < userApps.length; i++) {
            const app = userApps[i]
            const applicationId = `APP_${i + 1}`
            
            console.log(`\n📊 Application ${applicationId} from getUserApplications:`)
            console.log('- Status:', Number(app.status))
            console.log('- IPFS Hash:', app.ipfsHash)
            console.log('- Last Updated:', new Date(Number(app.lastUpdated) * 1000).toLocaleString())
            
            // Now fetch the same application by ID
            console.log(`📡 Fetching ${applicationId} by ID...`)
            try {
                const appById = await contract.getApplication(applicationId)
                console.log(`📊 Application ${applicationId} from getApplication:`)
                console.log('- Status:', Number(appById[3]))
                console.log('- IPFS Hash:', appById[2])
                console.log('- Last Updated:', new Date(Number(appById[5]) * 1000).toLocaleString())
                
                // Compare the two
                const userAppStatus = Number(app.status)
                const byIdStatus = Number(appById[3])
                
                if (userAppStatus !== byIdStatus) {
                    console.log('⚠️  STATUS MISMATCH DETECTED!')
                    console.log(`   getUserApplications status: ${userAppStatus}`)
                    console.log(`   getApplication status: ${byIdStatus}`)
                    console.log('   This confirms the smart contract bug!')
                } else {
                    console.log('✅ Status matches between both methods')
                }
            } catch (error) {
                console.error(`❌ Error fetching ${applicationId} by ID:`, error.message)
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error)
    }
}

testBlockchainSync()