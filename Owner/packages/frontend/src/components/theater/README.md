# Theater Registration Component

This component provides a comprehensive multi-step form for theater owners to register their theaters in the BookMyBlock platform.

## Features

### Multi-Step Form
1. **Owner Details & Documents** - Owner personal information and identity document uploads with preview
2. **Theater Details** - Theater information, location, and amenities
3. **Legal Documents** - Required licenses and legal documentation

### Validation
- Comprehensive form validation using Zod schemas
- File upload validation (size, type, required fields)
- Real-time validation feedback
- Step-by-step completion tracking

### File Uploads
- PAN Card, Aadhar Card (front/back) for owner verification
- Cinema operator license, Fire NOC, Building permission
- Optional trade license and insurance policy
- File size limit: 5MB per file
- Supported formats: JPG, PNG, PDF

## Usage

```tsx
import { AddTheaterForm } from '../components/theater/AddTheaterForm'
import { TheaterDashboard } from '../components/pages/TheaterDashboard'

// In your component
function OwnerDashboard() {
  return <TheaterDashboard />
}
```

## Required Fields

### Step 1: Owner Details & Documents
- Owner Full Name (2-100 characters)
- Owner Email (valid email format)
- Owner Mobile Number (10-digit Indian mobile number)
- Owner PAN Card (image/PDF with preview)
- Owner Aadhar Card Front (image/PDF with preview)
- Owner Aadhar Card Back (image/PDF with preview)

### Step 2: Theater Details
- Theater Name (2-200 characters)
- Complete Address (10-500 characters)
- City (2-100 characters)
- State (2-100 characters)
- Pincode (6-digit Indian pincode)
- Number of Screens (1-20)
- Total Seats (50-5000)
- Parking Spaces (0-1000, optional)
- Amenities (optional, max 10)

### Step 3: Legal Documents
- GST Number (valid GST format)
- Cinema Operator License (PDF/image)
- Fire NOC Certificate (PDF/image)
- Building Permission (PDF/image)
- Trade License (optional, PDF/image)
- Insurance Policy (optional, PDF/image)

## Available Amenities
- Air Conditioning
- Dolby Atmos
- IMAX
- 3D Capability
- Recliner Seats
- Food Court
- Wheelchair Accessible
- Online Booking
- Valet Parking
- Premium Lounge

## Form Behavior
- Users can navigate between completed steps
- Form data is preserved when moving between steps
- Final submission only occurs after all required fields are completed
- Loading states during submission
- Error handling with user feedback

## Integration with Backend

The component expects an `onSubmit` function that:
- Accepts `TheaterFormData` object
- Returns `Promise<boolean>` indicating success/failure
- Handles file uploads via FormData
- Provides appropriate error handling

```tsx
const handleTheaterSubmission = async (data: TheaterFormData): Promise<boolean> => {
  try {
    await theaterService.submitTheaterApplication(data)
    return true
  } catch (error) {
    console.error('Submission failed:', error)
    return false
  }
}
```

## Styling
- Uses Tailwind CSS for styling
- Responsive design (mobile-first)
- Consistent with the application's design system
- Loading states and disabled states for better UX

## Dependencies
- React Hook Form for form management
- Zod for validation schemas
- Lucide React for icons
- Tailwind CSS for styling

## File Structure
```
theater/
├── AddTheaterForm.tsx     # Main form component
├── index.ts              # Export file
└── README.md            # This file

types/
└── theater.ts           # TypeScript interfaces

services/
└── theaterService.ts    # API service functions

hooks/
└── useTheater.ts        # Custom hook for theater management
```