import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8002

// Middleware
app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    process.env.CORS_ORIGIN || 'http://localhost:3002'
  ],
  credentials: true,
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'BookMyBlock Backend API is running',
    timestamp: new Date().toISOString()
  })
})

// Import routes
import ipfsRoutes from './routes/ipfs'
import adminRoutes from './routes/admin'
import eventRoutes from './routes/events'

// API routes
app.use('/api/ipfs', ipfsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/events', eventRoutes)

app.get('/api', (_req, res) => {
  res.json({
    message: 'BookMyBlock API v1.0.0',
    status: 'Backend setup complete ✅',
    features: [
      'Privy authentication integration',
      'Embedded wallet support',
      'Social login (Email, SMS, Google, Apple)',
      'Automatic wallet creation',
      'IPFS file uploads via Pinata',
      'Event management with IPFS storage',
      'Theater application management'
    ],
    endpoints: {
      events: '/api/events',
      ipfs: '/api/ipfs',
      admin: '/api/admin'
    }
  })
})

// Protected route example
import { authenticatePrivyUser, AuthenticatedRequest } from './middleware/privy'

app.get('/api/profile', authenticatePrivyUser, (req: AuthenticatedRequest, res) => {
  res.json({
    user: req.user,
    message: 'User profile retrieved successfully'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 BookMyBlock Backend running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`)
  console.log(`🎬 Events API: http://localhost:${PORT}/api/events`)
  console.log(`📄 IPFS API: http://localhost:${PORT}/api/ipfs`)
  console.log(`👨‍💼 Admin API: http://localhost:${PORT}/api/admin`)
})