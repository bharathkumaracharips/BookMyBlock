import { ethers } from 'ethers'

// For now, we'll use a placeholder ABI until the contract is compiled
// This will need to be updated with the actual ABI after compilation
export const THEATER_REGISTRY_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "uid", "type": "string" },
            { "internalType": "address", "name": "ownerWallet", "type": "address" },
            { "internalType": "string", "name": "ipfsHash", "type": "string" }
        ],
        "name": "submitApplication",
        "outputs": [{ "internalType": "string", "name": "applicationId", "type": "string" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
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
    },
    {
        "inputs": [],
        "name": "getTotalApplications",
        "outputs": [{ "internalType": "uint256", "name": "count", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "string", "name": "applicationId", "type": "string" },
            { "indexed": true, "internalType": "string", "name": "uid", "type": "string" },
            { "indexed": true, "internalType": "address", "name": "ownerWallet", "type": "address" },
            { "indexed": false, "internalType": "string", "name": "ipfsHash", "type": "string" },
            { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "name": "ApplicationSubmitted",
        "type": "event"
    }
]

export enum ApplicationStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    UnderReview = 3
}

export interface TheaterApplication {
    uid: string
    ownerWallet: string
    ipfsHash: string
    status: ApplicationStatus
    submissionTimestamp: number
    lastUpdated: number
    reviewNotes: string
    isActive: boolean
}

export class TheaterRegistryService {
    private contract: ethers.Contract | null = null
    private signer: ethers.Signer | null = null
    private provider: ethers.Provider | null = null

    async initialize(provider: ethers.Provider, signer: ethers.Signer): Promise<boolean> {
        try {
            this.provider = provider
            this.signer = signer

            const contractAddress = import.meta.env.VITE_THEATER_REGISTRY_CONTRACT_ADDRESS

            if (!contractAddress) {
                throw new Error('Theater Registry contract address not found in environment variables')
            }

            this.contract = new ethers.Contract(
                contractAddress,
                THEATER_REGISTRY_ABI,
                signer
            )

            console.log('✅ TheaterRegistry contract initialized at:', contractAddress)
            return true
        } catch (error) {
            console.error('❌ Failed to initialize TheaterRegistry contract:', error)
            return false
        }
    }

    async submitApplication(uid: string, ownerWallet: string, ipfsHash: string): Promise<string> {
        if (!this.contract) {
            throw new Error('Contract not initialized')
        }

        try {
            console.log('📝 Submitting application to blockchain...')
            console.log('- UID:', uid)
            console.log('- Wallet:', ownerWallet)
            console.log('- IPFS Hash:', ipfsHash)

            // Estimate gas
            const gasEstimate = await this.contract.submitApplication.estimateGas(uid, ownerWallet, ipfsHash)
            console.log('⛽ Gas estimate:', gasEstimate.toString())

            // Submit transaction
            const tx = await this.contract.submitApplication(uid, ownerWallet, ipfsHash, {
                gasLimit: gasEstimate + 50000n // Add buffer
            })

            console.log('⏳ Transaction sent:', tx.hash)
            console.log('⏳ Waiting for confirmation...')

            const receipt = await tx.wait()
            console.log('✅ Transaction confirmed:', receipt.hash)

            // Parse the ApplicationSubmitted event to get the application ID
            const event = receipt.logs.find((log: any) => {
                try {
                    const parsed = this.contract!.interface.parseLog(log)
                    return parsed?.name === 'ApplicationSubmitted'
                } catch {
                    return false
                }
            })

            if (event) {
                const parsed = this.contract.interface.parseLog(event)
                const applicationId = parsed?.args[0]
                console.log('🎯 Application ID:', applicationId)
                console.log('🔗 Transaction Hash:', receipt.hash)

                // Return both application ID and transaction hash as a string
                // Format: "applicationId|transactionHash"
                return `${applicationId}|${receipt.hash}`
            }

            throw new Error('Application ID not found in transaction receipt')

        } catch (error: any) {
            console.error('❌ Failed to submit application to blockchain:', error)

            if (error.message.includes('out of gas')) {
                throw new Error('Transaction failed: Insufficient gas. Please try again.')
            } else if (error.message.includes('user rejected')) {
                throw new Error('Transaction was rejected by user.')
            } else {
                throw new Error(`Blockchain submission failed: ${error.message}`)
            }
        }
    }

    async getApplication(applicationId: string): Promise<TheaterApplication | null> {
        if (!this.contract) {
            throw new Error('Contract not initialized')
        }

        try {
            const result = await this.contract.getApplication(applicationId)

            return {
                uid: result[0],
                ownerWallet: result[1],
                ipfsHash: result[2],
                status: result[3],
                submissionTimestamp: Number(result[4]),
                lastUpdated: Number(result[5]),
                reviewNotes: result[6],
                isActive: result[7]
            }
        } catch (error) {
            console.error('Failed to get application:', error)
            return null
        }
    }

    async getUserApplications(uid: string): Promise<TheaterApplication[]> {
        if (!this.contract) {
            throw new Error('Contract not initialized')
        }

        try {
            const applications = await this.contract.getUserApplications(uid)

            return applications.map((app: any) => ({
                uid: app.uid,
                ownerWallet: app.ownerWallet,
                ipfsHash: app.ipfsHash,
                status: app.status,
                submissionTimestamp: Number(app.submissionTimestamp),
                lastUpdated: Number(app.lastUpdated),
                reviewNotes: app.reviewNotes,
                isActive: app.isActive
            }))
        } catch (error) {
            console.error('Failed to get user applications:', error)
            return []
        }
    }

    async getTotalApplications(): Promise<number> {
        if (!this.contract) {
            throw new Error('Contract not initialized')
        }

        try {
            const count = await this.contract.getTotalApplications()
            return Number(count)
        } catch (error) {
            console.error('Failed to get total applications:', error)
            return 0
        }
    }

    getContract(): ethers.Contract | null {
        return this.contract
    }
}