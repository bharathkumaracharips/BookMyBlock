import express from 'express'
import multer from 'multer'
import { PinataService } from '../services/pinataService'

const router = express.Router()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

// Test IPFS connection
router.get('/test', async (_req, res) => {
  try {
    const isConnected = await PinataService.testConnection()
    res.json({
      success: isConnected,
      message: isConnected ? 'IPFS connection successful' : 'IPFS connection failed'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing IPFS connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Upload file to IPFS
router.post('/upload-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      })
    }

    const { name, keyvalues } = req.body
    const metadata = {
      name: name || req.file.originalname,
      keyvalues: keyvalues ? JSON.parse(keyvalues) : {}
    }

    console.log('📤 Uploading file to IPFS:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      metadata
    })

    const result = await PinataService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      metadata
    )

    console.log('✅ File uploaded successfully:', result.IpfsHash)

    res.json({
      success: true,
      data: {
        IpfsHash: result.IpfsHash,
        PinSize: result.PinSize,
        Timestamp: result.Timestamp,
        url: PinataService.getIPFSUrl(result.IpfsHash)
      }
    })
  } catch (error) {
    console.error('❌ Error uploading file:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to upload file to IPFS',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Upload JSON to IPFS
router.post('/upload-json', async (req, res) => {
  try {
    const { data, metadata } = req.body

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'No data provided'
      })
    }

    console.log('📤 Uploading JSON to IPFS:', {
      dataSize: JSON.stringify(data).length,
      metadata
    })

    const result = await PinataService.uploadJSON(data, metadata)

    console.log('✅ JSON uploaded successfully:', result.IpfsHash)

    res.json({
      success: true,
      data: {
        IpfsHash: result.IpfsHash,
        PinSize: result.PinSize,
        Timestamp: result.Timestamp,
        url: PinataService.getIPFSUrl(result.IpfsHash)
      }
    })
  } catch (error) {
    console.error('❌ Error uploading JSON:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to upload JSON to IPFS',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router