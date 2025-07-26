import { Request, Response, NextFunction } from 'express'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email?: string
    phone?: string
    walletAddress?: string
    createdAt: Date
  }
}

// Placeholder for Privy authentication - will be implemented when Privy server SDK is properly configured
export async function authenticatePrivyUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '')
    
    if (!authToken) {
      return res.status(401).json({ error: 'No authorization token provided' })
    }

    // TODO: Implement actual Privy token verification
    // For now, create a mock user for development
    req.user = {
      id: 'mock-user-id',
      email: 'user@example.com',
      phone: undefined,
      walletAddress: '0x1234567890123456789012345678901234567890',
      createdAt: new Date(),
    }

    next()
  } catch (error) {
    console.error('Privy authentication error:', error)
    return res.status(401).json({ error: 'Authentication failed' })
  }
}

export async function optionalPrivyAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '')
    
    if (authToken) {
      // TODO: Implement actual Privy token verification
      req.user = {
        id: 'mock-user-id',
        email: 'user@example.com',
        phone: undefined,
        walletAddress: '0x1234567890123456789012345678901234567890',
        createdAt: new Date(),
      }
    }
    
    next()
  } catch (error) {
    // Continue without authentication for optional auth
    next()
  }
}