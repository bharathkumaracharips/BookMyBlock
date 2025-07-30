import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building2,
  User,
  FileText,
  Upload,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  Clock
} from 'lucide-react'
import { TheaterFormData } from '../../types/theater'
import { PDFService } from '../../services/pdfService'
import { BackendPinataService } from '../../services/backendPinataService'

// File validation helper
const validateFile = (file: File | undefined): string | null => {
  if (!file) return null

  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']

  if (file.size > maxSize) {
    return 'File size must be less than 5MB'
  }

  if (!allowedTypes.includes(file.type)) {
    return 'Only JPG, PNG, and PDF files are allowed'
  }

  return null
}

// Validation schemas for each step
const ownerDetailsSchema = z.object({
  ownerName: z.string()
    .min(2, 'Owner name must be at least 2 characters')
    .max(100, 'Owner name is too long'),
  ownerEmail: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email is too long'),
  ownerPhone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  ownerPanCard: z.instanceof(FileList, { message: 'PAN card is required' })
    .refine(files => files.length > 0, 'PAN card is required')
    .refine(files => validateFile(files[0]) === null,
      files => ({ message: validateFile(files[0])! })),
  ownerAadharFront: z.instanceof(FileList, { message: 'Aadhar front is required' })
    .refine(files => files.length > 0, 'Aadhar front image is required')
    .refine(files => validateFile(files[0]) === null,
      files => ({ message: validateFile(files[0])! })),
  ownerAadharBack: z.instanceof(FileList, { message: 'Aadhar back is required' })
    .refine(files => files.length > 0, 'Aadhar back image is required')
    .refine(files => validateFile(files[0]) === null,
      files => ({ message: validateFile(files[0])! })),
})

type OwnerDetailsForm = z.infer<typeof ownerDetailsSchema>

const theaterDetailsSchema = z.object({
  theaterName: z.string()
    .min(2, 'Theater name must be at least 2 characters')
    .max(200, 'Theater name is too long'),
  address: z.string()
    .min(10, 'Please provide a complete address')
    .max(500, 'Address is too long'),
  city: z.string()
    .min(2, 'City is required')
    .max(100, 'City name is too long'),
  state: z.string()
    .min(2, 'State is required')
    .max(100, 'State name is too long'),
  pincode: z.string()
    .regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode'),
  numberOfScreens: z.number()
    .min(1, 'At least 1 screen is required')
    .max(20, 'Maximum 20 screens allowed'),
  totalSeats: z.number()
    .min(50, 'Minimum 50 seats required')
    .max(5000, 'Maximum 5000 seats allowed'),
  parkingSpaces: z.number()
    .min(0, 'Parking spaces cannot be negative')
    .max(1000, 'Maximum 1000 parking spaces allowed'),
  amenities: z.array(z.string())
    .max(10, 'Maximum 10 amenities allowed')
    .optional(),
})

type TheaterDetailsForm = z.infer<typeof theaterDetailsSchema>

const legalDocumentsSchema = z.object({
  gstNumber: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number'),
  cinemaLicense: z.instanceof(FileList, { message: 'Cinema license is required' })
    .refine(files => files.length > 0, 'Cinema license is required')
    .refine(files => validateFile(files[0]) === null,
      files => ({ message: validateFile(files[0])! })),
  fireNoc: z.instanceof(FileList, { message: 'Fire NOC is required' })
    .refine(files => files.length > 0, 'Fire NOC is required')
    .refine(files => validateFile(files[0]) === null,
      files => ({ message: validateFile(files[0])! })),
  buildingPermission: z.instanceof(FileList, { message: 'Building permission is required' })
    .refine(files => files.length > 0, 'Building permission is required')
    .refine(files => validateFile(files[0]) === null,
      files => ({ message: validateFile(files[0])! })),
  tradeLicense: z.instanceof(FileList)
    .refine(files => !files.length || validateFile(files[0]) === null,
      files => ({ message: validateFile(files[0])! }))
    .optional(),
  insurancePolicy: z.instanceof(FileList)
    .refine(files => !files.length || validateFile(files[0]) === null,
      files => ({ message: validateFile(files[0])! }))
    .optional(),
})

type LegalDocumentsForm = z.infer<typeof legalDocumentsSchema>

interface AddTheaterFormProps {
  onSubmit: (data: TheaterFormData) => Promise<boolean>
  onCancel: () => void
}

const AMENITIES_OPTIONS = [
  'Air Conditioning',
  'Dolby Atmos',
  'IMAX',
  '3D Capability',
  'Recliner Seats',
  'Food Court',
  'Wheelchair Accessible',
  'Online Booking',
  'Valet Parking',
  'Premium Lounge'
]

export function AddTheaterForm({ onSubmit, onCancel }: AddTheaterFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [formData, setFormData] = useState<Partial<TheaterFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewTimer, setPreviewTimer] = useState(60)
  const [canFinalSubmit, setCanFinalSubmit] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // Form instances for each step
  const ownerForm = useForm<OwnerDetailsForm>({
    resolver: zodResolver(ownerDetailsSchema),
    mode: 'onChange'
  })

  const theaterForm = useForm<TheaterDetailsForm>({
    resolver: zodResolver(theaterDetailsSchema),
    mode: 'onChange'
  })

  const legalForm = useForm<LegalDocumentsForm>({
    resolver: zodResolver(legalDocumentsSchema),
    mode: 'onChange'
  })

  // Timer effect for preview
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (showPreview && previewTimer > 0) {
      interval = setInterval(() => {
        setPreviewTimer(prev => {
          if (prev <= 1) {
            setCanFinalSubmit(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [showPreview, previewTimer])

  const handleStepSubmit = async (step: number, data: any) => {
    setFormData(prev => ({ ...prev, ...data }))
    setCompletedSteps(prev => [...prev.filter(s => s !== step), step])

    if (step < 3) {
      setCurrentStep(step + 1)
    } else {
      // Show preview instead of immediate submission
      const completeData = { ...formData, ...data } as TheaterFormData
      setFormData(completeData)
      setShowPreview(true)
      setPreviewTimer(60)
      setCanFinalSubmit(false)
    }
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true)
    setIsGeneratingPDF(true)

    try {
      const completeData = formData as TheaterFormData
      console.log('🚀 Starting final submission process...')

      // Debug backend configuration
      BackendPinataService.debugCredentials()

      // Test IPFS connection first
      console.log('🔍 Testing IPFS connection...')
      const connectionTest = await BackendPinataService.testConnection()
      if (!connectionTest) {
        throw new Error('Failed to connect to IPFS service')
      }
      console.log('✅ IPFS connection successful')

      // Generate PDF
      console.log('📄 Generating PDF...')
      const pdfBlob = await PDFService.generateTheaterApplicationPDF(completeData)
      const pdfSizeMB = (pdfBlob.size / 1024 / 1024).toFixed(2)
      console.log('✅ PDF generated successfully, size:', pdfSizeMB, 'MB')

      // Upload PDF to IPFS
      console.log('📤 Uploading PDF to IPFS...')
      const pdfResponse = await BackendPinataService.uploadFile(pdfBlob, {
        name: `Theater Application - ${completeData.theaterName}`,
        keyvalues: {
          type: 'theater-application-pdf',
          theaterName: completeData.theaterName,
          ownerName: completeData.ownerName,
          submissionDate: new Date().toISOString()
        }
      })
      console.log('✅ PDF uploaded to IPFS:', pdfResponse.IpfsHash)

      setIsGeneratingPDF(false)

      // Add IPFS hash to the form data (only PDF, no JSON upload)
      const finalData = {
        ...completeData,
        pdfHash: pdfResponse.IpfsHash,
        ipfsUrls: {
          pdf: BackendPinataService.getIPFSUrl(pdfResponse.IpfsHash)
        }
      }

      console.log('🎯 Final data with IPFS hash:', {
        pdfHash: finalData.pdfHash,
        pdfUrl: finalData.ipfsUrls.pdf
      })

      console.log('📨 Submitting to parent component...')
      const success = await onSubmit(finalData)
      if (!success) {
        console.error('❌ Parent component rejected submission')
        setIsSubmitting(false)
        setIsGeneratingPDF(false)
      } else {
        console.log('✅ Submission completed successfully!')
        alert(`🎉 Theater Application Submitted Successfully!\n\n📄 PDF saved to IPFS: ${finalData.pdfHash}\n🔗 View PDF: ${finalData.ipfsUrls.pdf}\n\nYour application is now permanently stored on IPFS and ready for review.`)
      }
    } catch (error) {
      console.error('❌ Error in final submission:', error)

      // More detailed error handling
      if (error instanceof Error) {
        if (error.message.includes('IPFS') || error.message.includes('upload')) {
          alert('IPFS upload failed. Please check your internet connection and try again.')
        } else if (error.message.includes('PDF')) {
          alert('PDF generation failed. Please try again.')
        } else {
          alert(`Submission failed: ${error.message}`)
        }
      } else {
        alert('Error submitting application. Please try again.')
      }

      setIsSubmitting(false)
      setIsGeneratingPDF(false)
    }
  }

  const goToStep = (step: number) => {
    if (step <= Math.max(...completedSteps) + 1) {
      setCurrentStep(step)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-all ${currentStep === step
              ? 'bg-violet-500 border-violet-500 text-white'
              : completedSteps.includes(step)
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 text-gray-400'
              }`}
            onClick={() => goToStep(step)}
          >
            {completedSteps.includes(step) ? <Check size={16} /> : step}
          </div>
          {step < 3 && (
            <div className={`w-16 h-0.5 mx-2 ${completedSteps.includes(step) ? 'bg-green-500' : 'bg-gray-300'
              }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  const renderFileUpload = (
    name: string,
    label: string,
    register: any,
    error?: string,
    accept: string = "image/*,.pdf",
    watchedValue?: FileList
  ) => {
    const hasFile = watchedValue && watchedValue.length > 0
    const file = hasFile ? watchedValue[0] : null
    const isImage = file && file.type.startsWith('image/')

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {!label.includes('Optional') && <span className="text-red-500">*</span>}
        </label>
        <div className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${hasFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-violet-400'
          }`}>
          {hasFile ? (
            <div className="space-y-2">
              {isImage ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={label}
                  className="mx-auto h-20 w-20 object-cover rounded-lg"
                />
              ) : (
                <div className="mx-auto h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
              )}
              <p className="text-sm font-medium text-green-700">{file?.name}</p>
              <p className="text-xs text-gray-500">{file ? (file.size / 1024 / 1024).toFixed(2) : '0'} MB</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-violet-600 hover:text-violet-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 5MB</p>
            </>
          )}
          <input
            type="file"
            accept={accept}
            {...register}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id={name}
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle size={14} />
            {error}
          </p>
        )}
      </div>
    )
  }

  const renderStep1 = () => {
    const watchedFiles = ownerForm.watch(['ownerPanCard', 'ownerAadharFront', 'ownerAadharBack'])

    return (
      <form onSubmit={ownerForm.handleSubmit((data) => handleStepSubmit(1, data))} className="space-y-6">
        <div className="text-center mb-6">
          <User className="mx-auto h-12 w-12 text-violet-500 mb-2" />
          <h3 className="text-xl font-semibold text-gray-900">Owner Details & Documents</h3>
          <p className="text-gray-600">Enter your personal information and upload identity documents</p>
        </div>

        {/* Owner Personal Details */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...ownerForm.register('ownerName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
              {ownerForm.formState.errors.ownerName && (
                <p className="text-red-500 text-sm mt-1">{ownerForm.formState.errors.ownerName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...ownerForm.register('ownerEmail')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="your@email.com"
              />
              {ownerForm.formState.errors.ownerEmail && (
                <p className="text-red-500 text-sm mt-1">{ownerForm.formState.errors.ownerEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...ownerForm.register('ownerPhone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="9876543210"
              />
              {ownerForm.formState.errors.ownerPhone && (
                <p className="text-red-500 text-sm mt-1">{ownerForm.formState.errors.ownerPhone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Identity Documents */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Identity Documents</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderFileUpload(
              'ownerPanCard',
              'PAN Card',
              ownerForm.register('ownerPanCard'),
              ownerForm.formState.errors.ownerPanCard?.message,
              "image/*,.pdf",
              watchedFiles[0]
            )}
            {renderFileUpload(
              'ownerAadharFront',
              'Aadhar Card (Front)',
              ownerForm.register('ownerAadharFront'),
              ownerForm.formState.errors.ownerAadharFront?.message,
              "image/*,.pdf",
              watchedFiles[1]
            )}
            {renderFileUpload(
              'ownerAadharBack',
              'Aadhar Card (Back)',
              ownerForm.register('ownerAadharBack'),
              ownerForm.formState.errors.ownerAadharBack?.message,
              "image/*,.pdf",
              watchedFiles[2]
            )}
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 flex items-center gap-2 disabled:opacity-50"
            disabled={isSubmitting}
          >
            Next Step <ChevronRight size={16} />
          </button>
        </div>
      </form>
    )
  }

  const renderStep2 = () => {
    return (
      <form onSubmit={theaterForm.handleSubmit((data) => handleStepSubmit(2, data))} className="space-y-6">
        <div className="text-center mb-6">
          <Building2 className="mx-auto h-12 w-12 text-violet-500 mb-2" />
          <h3 className="text-xl font-semibold text-gray-900">Theater Details</h3>
          <p className="text-gray-600">Provide comprehensive information about your theater</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theater Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...theaterForm.register('theaterName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Enter theater name"
            />
            {theaterForm.formState.errors.theaterName && (
              <p className="text-red-500 text-sm mt-1">{theaterForm.formState.errors.theaterName.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complete Address <span className="text-red-500">*</span>
            </label>
            <textarea
              {...theaterForm.register('address')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Enter complete address with landmarks"
            />
            {theaterForm.formState.errors.address && (
              <p className="text-red-500 text-sm mt-1">{theaterForm.formState.errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...theaterForm.register('city')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Enter city"
            />
            {theaterForm.formState.errors.city && (
              <p className="text-red-500 text-sm mt-1">{theaterForm.formState.errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...theaterForm.register('state')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Enter state"
            />
            {theaterForm.formState.errors.state && (
              <p className="text-red-500 text-sm mt-1">{theaterForm.formState.errors.state.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...theaterForm.register('pincode')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="123456"
            />
            {theaterForm.formState.errors.pincode && (
              <p className="text-red-500 text-sm mt-1">{theaterForm.formState.errors.pincode.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Screens <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="20"
              {...theaterForm.register('numberOfScreens', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="1"
            />
            {theaterForm.formState.errors.numberOfScreens && (
              <p className="text-red-500 text-sm mt-1">{theaterForm.formState.errors.numberOfScreens.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Seats <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="50"
              max="5000"
              {...theaterForm.register('totalSeats', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="200"
            />
            {theaterForm.formState.errors.totalSeats && (
              <p className="text-red-500 text-sm mt-1">{theaterForm.formState.errors.totalSeats.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parking Spaces
            </label>
            <input
              type="number"
              min="0"
              max="1000"
              {...theaterForm.register('parkingSpaces', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="50"
            />
            {theaterForm.formState.errors.parkingSpaces && (
              <p className="text-red-500 text-sm mt-1">{theaterForm.formState.errors.parkingSpaces.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Amenities & Features
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AMENITIES_OPTIONS.map((amenity) => (
              <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={amenity}
                  {...theaterForm.register('amenities')}
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            disabled={isSubmitting}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 flex items-center gap-2 disabled:opacity-50"
            disabled={isSubmitting}
          >
            Next Step <ChevronRight size={16} />
          </button>
        </div>
      </form>
    )
  }

  const renderStep3 = () => {
    const watchedLegalFiles = legalForm.watch(['cinemaLicense', 'fireNoc', 'buildingPermission', 'tradeLicense', 'insurancePolicy'])

    return (
      <form onSubmit={legalForm.handleSubmit((data) => handleStepSubmit(3, data))} className="space-y-6">
        <div className="text-center mb-6">
          <FileText className="mx-auto h-12 w-12 text-violet-500 mb-2" />
          <h3 className="text-xl font-semibold text-gray-900">Legal Documents</h3>
          <p className="text-gray-600">Upload required legal documents and licenses</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GST Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...legalForm.register('gstNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent uppercase"
              placeholder="22AAAAA0000A1Z5"
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase()
              }}
            />
            {legalForm.formState.errors.gstNumber && (
              <p className="text-red-500 text-sm mt-1">{legalForm.formState.errors.gstNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderFileUpload(
              'cinemaLicense',
              'Cinema Operator License',
              legalForm.register('cinemaLicense'),
              legalForm.formState.errors.cinemaLicense?.message,
              "image/*,.pdf",
              watchedLegalFiles[0]
            )}
            {renderFileUpload(
              'fireNoc',
              'Fire NOC Certificate',
              legalForm.register('fireNoc'),
              legalForm.formState.errors.fireNoc?.message,
              "image/*,.pdf",
              watchedLegalFiles[1]
            )}
            {renderFileUpload(
              'buildingPermission',
              'Building Permission',
              legalForm.register('buildingPermission'),
              legalForm.formState.errors.buildingPermission?.message,
              "image/*,.pdf",
              watchedLegalFiles[2]
            )}
            {renderFileUpload(
              'tradeLicense',
              'Trade License (Optional)',
              legalForm.register('tradeLicense'),
              legalForm.formState.errors.tradeLicense?.message,
              "image/*,.pdf",
              watchedLegalFiles[3]
            )}
            {renderFileUpload(
              'insurancePolicy',
              'Insurance Policy (Optional)',
              legalForm.register('insurancePolicy'),
              legalForm.formState.errors.insurancePolicy?.message,
              "image/*,.pdf",
              watchedLegalFiles[4]
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Important Notes</h4>
              <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>All documents should be clear and readable</li>
                <li>File size should not exceed 5MB per document</li>
                <li>Accepted formats: PDF, JPG, JPEG, PNG</li>
                <li>Documents will be verified before theater approval</li>
                <li>Processing time: 2-3 business days after submission</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            disabled={isSubmitting}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <button
            type="submit"
            className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check size={16} />
                Submit Application
              </>
            )}
          </button>
        </div>
      </form>
    )
  }

  const renderPreview = () => {
    const data = formData as TheaterFormData

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className="mb-8 text-center">
          <Eye className="mx-auto h-12 w-12 text-violet-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Preview</h2>
          <p className="text-gray-600">Please review your application details carefully</p>

          {/* Timer */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <span className="text-lg font-semibold text-orange-600">
              {previewTimer > 0 ? `${previewTimer}s remaining` : 'Review complete'}
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {/* Owner Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Owner Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Full Name</span>
                <p className="text-gray-900">{data.ownerName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Email</span>
                <p className="text-gray-900">{data.ownerEmail}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Phone</span>
                <p className="text-gray-900">{data.ownerPhone}</p>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-sm font-medium text-gray-600">Documents</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                <div className="text-sm text-gray-700">✓ PAN Card: {data.ownerPanCard?.[0]?.name}</div>
                <div className="text-sm text-gray-700">✓ Aadhar Front: {data.ownerAadharFront?.[0]?.name}</div>
                <div className="text-sm text-gray-700">✓ Aadhar Back: {data.ownerAadharBack?.[0]?.name}</div>
              </div>
            </div>
          </div>

          {/* Theater Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Theater Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Theater Name</span>
                <p className="text-gray-900">{data.theaterName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Location</span>
                <p className="text-gray-900">{data.city}, {data.state} - {data.pincode}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Screens</span>
                <p className="text-gray-900">{data.numberOfScreens}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Total Seats</span>
                <p className="text-gray-900">{data.totalSeats}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Parking Spaces</span>
                <p className="text-gray-900">{data.parkingSpaces}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Amenities</span>
                <p className="text-gray-900">{data.amenities?.join(', ') || 'None'}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-600">Address</span>
              <p className="text-gray-900">{data.address}</p>
            </div>
          </div>

          {/* Legal Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Legal Documents
            </h3>
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-600">GST Number</span>
              <p className="text-gray-900">{data.gstNumber}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="text-sm text-gray-700">✓ Cinema License: {data.cinemaLicense?.[0]?.name}</div>
              <div className="text-sm text-gray-700">✓ Fire NOC: {data.fireNoc?.[0]?.name}</div>
              <div className="text-sm text-gray-700">✓ Building Permission: {data.buildingPermission?.[0]?.name}</div>
              {data.tradeLicense?.[0] && (
                <div className="text-sm text-gray-700">✓ Trade License: {data.tradeLicense[0].name}</div>
              )}
              {data.insurancePolicy?.[0] && (
                <div className="text-sm text-gray-700">✓ Insurance Policy: {data.insurancePolicy[0].name}</div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-8 border-t">
          <button
            onClick={() => setShowPreview(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            disabled={isSubmitting}
          >
            <ChevronLeft size={16} />
            Back to Edit
          </button>

          <div className="flex gap-4">
            <button
              onClick={async () => {
                try {
                  console.log('📄 Generating PDF preview...')
                  const pdfBlob = await PDFService.generateTheaterApplicationPDF(data)
                  await PDFService.downloadPDF(pdfBlob, `theater-application-${data.theaterName}.pdf`)
                  console.log('✅ PDF preview downloaded successfully')
                } catch (error) {
                  console.error('❌ Error generating PDF preview:', error)
                  alert('Error generating PDF preview. Please try again.')
                }
              }}
              className="px-6 py-2 border border-violet-500 text-violet-600 rounded-lg hover:bg-violet-50 flex items-center gap-2"
              disabled={isSubmitting}
            >
              <Download size={16} />
              Download Preview
            </button>

            <button
              onClick={handleFinalSubmit}
              disabled={!canFinalSubmit || isSubmitting}
              className={`px-8 py-2 rounded-lg flex items-center gap-2 font-semibold transition-all ${canFinalSubmit && !isSubmitting
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isGeneratingPDF ? 'Uploading PDF to IPFS...' : 'Uploading to IPFS...'}
                </>
              ) : (
                <>
                  <Check size={16} />
                  Submit to IPFS
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showPreview) {
    return renderPreview()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Add New Theater</h2>
        <p className="text-gray-600 text-center">Complete all steps to register your theater</p>
      </div>

      {renderStepIndicator()}

      <div className="bg-gray-50 rounded-lg p-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  )
}