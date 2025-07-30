import { TheaterFormData } from '../types/theater'

export class PDFService {
    static async generateTheaterApplicationPDF(data: TheaterFormData): Promise<Blob> {
        try {
            // Create a text-based document that can be properly downloaded
            const textContent = this.createTextContent(data)
            
            // Create a proper text file that can be downloaded
            return new Blob([textContent], { 
                type: 'text/plain;charset=utf-8' 
            })
        } catch (error) {
            console.error('Error generating PDF:', error)
            // Fallback content
            const fallbackContent = `Theater Registration Application\n\nError generating full document.\nPlease contact support.`
            return new Blob([fallbackContent], { 
                type: 'text/plain;charset=utf-8' 
            })
        }
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
            // Change extension to .txt since we're generating text files
            const textFilename = filename.replace('.pdf', '.txt')
            link.download = textFilename
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