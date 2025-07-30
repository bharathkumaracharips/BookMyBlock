import jsPDF from 'jspdf'
import { TheaterFormData } from '../types/theater'

export class PDFService {
    static async generateTheaterApplicationPDF(data: TheaterFormData): Promise<Blob> {
        try {
            console.log('📄 Generating PDF with images...')
            const pdf = new jsPDF()
            let yPosition = 20

            // Helper function to add text
            const addText = (text: string, x: number = 20, fontSize: number = 12, isBold: boolean = false) => {
                pdf.setFontSize(fontSize)
                if (isBold) {
                    pdf.setFont('helvetica', 'bold')
                } else {
                    pdf.setFont('helvetica', 'normal')
                }
                pdf.text(text, x, yPosition)
                yPosition += fontSize * 0.5 + 5
            }

            // Helper function to add image from FileList
            const addImageFromFile = async (fileList: FileList | undefined, label: string): Promise<void> => {
                if (!fileList || fileList.length === 0) {
                    addText(`${label}: Not provided`)
                    return
                }

                const file = fileList[0]
                if (!file.type.startsWith('image/')) {
                    addText(`${label}: ${file.name} (Non-image file)`)
                    return
                }

                try {
                    // Compress and resize image before adding to PDF
                    const compressedImageDataUrl = await this.compressImage(file, 400, 300, 0.7)
                    const imgWidth = 50  // Reduced size
                    const imgHeight = 35 // Reduced size

                    // Check if we need a new page
                    if (yPosition + imgHeight > 280) {
                        pdf.addPage()
                        yPosition = 20
                    }

                    addText(`${label}:`, 20, 12, true)
                    pdf.addImage(compressedImageDataUrl, 'JPEG', 20, yPosition, imgWidth, imgHeight)
                    yPosition += imgHeight + 10
                } catch (error) {
                    console.error(`Error adding image for ${label}:`, error)
                    addText(`${label}: ${file.name} (Error loading image)`)
                }
            }

            // Title
            addText('THEATER REGISTRATION APPLICATION', 20, 18, true)
            addText(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 10)
            yPosition += 10

            // Owner Details Section
            addText('OWNER DETAILS', 20, 16, true)
            addText(`Full Name: ${data.ownerName}`)
            addText(`Email: ${data.ownerEmail}`)
            addText(`Phone: ${data.ownerPhone}`)
            yPosition += 5

            // Owner Documents
            addText('Identity Documents:', 20, 14, true)
            await addImageFromFile(data.ownerPanCard, 'PAN Card')
            await addImageFromFile(data.ownerAadharFront, 'Aadhar Card (Front)')
            await addImageFromFile(data.ownerAadharBack, 'Aadhar Card (Back)')

            // Check if we need a new page
            if (yPosition > 200) {
                pdf.addPage()
                yPosition = 20
            }

            // Theater Details Section
            addText('THEATER DETAILS', 20, 16, true)
            addText(`Theater Name: ${data.theaterName}`)
            addText(`Address: ${data.address}`)
            addText(`City: ${data.city}`)
            addText(`State: ${data.state}`)
            addText(`Pincode: ${data.pincode}`)
            addText(`Number of Screens: ${data.numberOfScreens}`)
            addText(`Total Seats: ${data.totalSeats}`)
            addText(`Parking Spaces: ${data.parkingSpaces}`)
            addText(`Amenities: ${data.amenities?.join(', ') || 'None'}`)
            yPosition += 5

            // Legal Documents Section
            addText('LEGAL DOCUMENTS', 20, 16, true)
            addText(`GST Number: ${data.gstNumber}`)
            yPosition += 5

            addText('Required Documents:', 20, 14, true)
            await addImageFromFile(data.cinemaLicense, 'Cinema License')
            await addImageFromFile(data.fireNoc, 'Fire NOC Certificate')
            await addImageFromFile(data.buildingPermission, 'Building Permission')

            if (data.tradeLicense && data.tradeLicense.length > 0) {
                await addImageFromFile(data.tradeLicense, 'Trade License')
            }
            if (data.insurancePolicy && data.insurancePolicy.length > 0) {
                await addImageFromFile(data.insurancePolicy, 'Insurance Policy')
            }

            // Footer
            if (yPosition > 250) {
                pdf.addPage()
                yPosition = 20
            }
            yPosition += 10
            addText(`Application ID: ${Date.now()}`)
            addText('This is a system-generated document for theater registration application.', 20, 10)
            addText('BookMyBlock Platform - Theater Owner Dashboard', 20, 10)

            console.log('✅ PDF generated successfully with compressed images')

            // Generate PDF with compression
            const pdfBlob = pdf.output('blob')
            console.log('📊 PDF size:', (pdfBlob.size / 1024 / 1024).toFixed(2), 'MB')

            return pdfBlob
        } catch (error) {
            console.error('Error generating PDF:', error)
            // Fallback to text-based PDF
            return this.generateFallbackPDF(data)
        }
    }

    // Helper function to convert File to DataURL
    private static fileToDataURL(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    // Helper function to compress and resize images
    private static compressImage(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()

            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let { width, height } = img

                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width
                        width = maxWidth
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height
                        height = maxHeight
                    }
                }

                canvas.width = width
                canvas.height = height

                // Draw and compress the image
                ctx?.drawImage(img, 0, 0, width, height)

                // Convert to compressed JPEG
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
                resolve(compressedDataUrl)
            }

            img.onerror = reject

            // Convert file to data URL first
            const reader = new FileReader()
            reader.onload = (e) => {
                img.src = e.target?.result as string
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    // Fallback text-based PDF
    private static generateFallbackPDF(data: TheaterFormData): Blob {
        const textContent = this.createTextContent(data)
        return new Blob([textContent], {
            type: 'text/plain;charset=utf-8'
        })
    }

    private static createHTMLContent(data: TheaterFormData): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Theater Registration Application</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
            color: #333;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #6366f1;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #6366f1;
            margin-bottom: 10px;
        }
        .section { 
            margin-bottom: 25px; 
            page-break-inside: avoid;
        }
        .section h3 { 
            color: #6366f1; 
            border-bottom: 1px solid #6366f1; 
            padding-bottom: 5px; 
            margin-bottom: 15px;
        }
        .field { 
            margin-bottom: 10px; 
            display: flex;
        }
        .field strong { 
            display: inline-block; 
            width: 150px; 
            color: #555;
        }
        .documents { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 10px; 
        }
        .document-item {
            padding: 5px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        @media print { 
            body { margin: 0; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Theater Registration Application</h1>
        <p><strong>BookMyBlock Platform</strong></p>
        <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>

    <div class="section">
        <h3>Owner Details</h3>
        <div class="field"><strong>Full Name:</strong> <span>${data.ownerName}</span></div>
        <div class="field"><strong>Email:</strong> <span>${data.ownerEmail}</span></div>
        <div class="field"><strong>Phone:</strong> <span>${data.ownerPhone}</span></div>
    </div>

    <div class="section">
        <h3>Theater Details</h3>
        <div class="field"><strong>Theater Name:</strong> <span>${data.theaterName}</span></div>
        <div class="field"><strong>Address:</strong> <span>${data.address}</span></div>
        <div class="field"><strong>City:</strong> <span>${data.city}</span></div>
        <div class="field"><strong>State:</strong> <span>${data.state}</span></div>
        <div class="field"><strong>Pincode:</strong> <span>${data.pincode}</span></div>
        <div class="field"><strong>Screens:</strong> <span>${data.numberOfScreens}</span></div>
        <div class="field"><strong>Total Seats:</strong> <span>${data.totalSeats}</span></div>
        <div class="field"><strong>Parking:</strong> <span>${data.parkingSpaces}</span></div>
        <div class="field"><strong>Amenities:</strong> <span>${data.amenities?.join(', ') || 'None'}</span></div>
    </div>

    <div class="section">
        <h3>Legal Information</h3>
        <div class="field"><strong>GST Number:</strong> <span>${data.gstNumber}</span></div>
    </div>

    <div class="section">
        <h3>Document Status</h3>
        <div class="documents">
            <div class="document-item">✓ PAN Card: ${data.ownerPanCard && data.ownerPanCard.length > 0 ? 'Uploaded' : 'Not Uploaded'}</div>
            <div class="document-item">✓ Aadhar Front: ${data.ownerAadharFront && data.ownerAadharFront.length > 0 ? 'Uploaded' : 'Not Uploaded'}</div>
            <div class="document-item">✓ Aadhar Back: ${data.ownerAadharBack && data.ownerAadharBack.length > 0 ? 'Uploaded' : 'Not Uploaded'}</div>
            <div class="document-item">✓ Cinema License: ${data.cinemaLicense && data.cinemaLicense.length > 0 ? 'Uploaded' : 'Not Uploaded'}</div>
            <div class="document-item">✓ Fire NOC: ${data.fireNoc && data.fireNoc.length > 0 ? 'Uploaded' : 'Not Uploaded'}</div>
            <div class="document-item">✓ Building Permission: ${data.buildingPermission && data.buildingPermission.length > 0 ? 'Uploaded' : 'Not Uploaded'}</div>
            ${data.tradeLicense && data.tradeLicense.length > 0 ? '<div class="document-item">✓ Trade License: Uploaded</div>' : ''}
            ${data.insurancePolicy && data.insurancePolicy.length > 0 ? '<div class="document-item">✓ Insurance Policy: Uploaded</div>' : ''}
        </div>
    </div>

    <div class="section">
        <p><strong>Application ID:</strong> ${Date.now()}</p>
        <p><em>This is a system-generated document for theater registration application.</em></p>
    </div>
</body>
</html>
        `
    }

    private static createTextContent(data: TheaterFormData): string {
        return `THEATER REGISTRATION APPLICATION
========================================

Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

OWNER DETAILS
-------------
Full Name: ${data.ownerName}
Email: ${data.ownerEmail}
Phone: ${data.ownerPhone}

THEATER DETAILS
---------------
Theater Name: ${data.theaterName}
Address: ${data.address}
City: ${data.city}
State: ${data.state}
Pincode: ${data.pincode}
Number of Screens: ${data.numberOfScreens}
Total Seats: ${data.totalSeats}
Parking Spaces: ${data.parkingSpaces}
Amenities: ${data.amenities?.join(', ') || 'None'}

LEGAL INFORMATION
-----------------
GST Number: ${data.gstNumber}

DOCUMENT STATUS
---------------
✓ PAN Card: ${data.ownerPanCard && data.ownerPanCard.length > 0 ? 'Uploaded' : 'Not Uploaded'}
✓ Aadhar Front: ${data.ownerAadharFront && data.ownerAadharFront.length > 0 ? 'Uploaded' : 'Not Uploaded'}
✓ Aadhar Back: ${data.ownerAadharBack && data.ownerAadharBack.length > 0 ? 'Uploaded' : 'Not Uploaded'}
✓ Cinema License: ${data.cinemaLicense && data.cinemaLicense.length > 0 ? 'Uploaded' : 'Not Uploaded'}
✓ Fire NOC: ${data.fireNoc && data.fireNoc.length > 0 ? 'Uploaded' : 'Not Uploaded'}
✓ Building Permission: ${data.buildingPermission && data.buildingPermission.length > 0 ? 'Uploaded' : 'Not Uploaded'}
${data.tradeLicense && data.tradeLicense.length > 0 ? '✓ Trade License: Uploaded\n' : ''}${data.insurancePolicy && data.insurancePolicy.length > 0 ? '✓ Insurance Policy: Uploaded\n' : ''}

Application ID: ${Date.now()}

---
This is a system-generated document for theater registration application.
BookMyBlock Platform - Theater Owner Dashboard
        `
    }

    static async downloadPDF(blob: Blob, filename: string) {
        try {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            // Keep .pdf extension for proper PDF files
            link.download = filename.endsWith('.pdf') ? filename : filename + '.pdf'
            link.style.display = 'none'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error downloading file:', error)
            alert('Error downloading file. Please try again.')
        }
    }
}