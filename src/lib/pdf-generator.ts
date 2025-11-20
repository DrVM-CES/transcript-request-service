// Dynamic import to avoid build-time issues
// pdf-lib will only be imported at runtime when actually generating PDFs

interface TranscriptRequestData {
  // Student Info
  studentFirstName: string;
  studentLastName: string;
  studentMiddleName?: string;
  studentEmail: string;
  studentDob: string;
  studentPartialSsn?: string;
  
  // School Info
  schoolName: string;
  schoolCeeb?: string;
  schoolAddress?: string;
  schoolCity?: string;
  schoolState?: string;
  schoolZip?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  enrollDate?: string;
  exitDate?: string;
  currentEnrollment?: boolean;
  graduationDate?: string;
  
  // Destination Info
  destinationSchool: string;
  destinationCeeb: string;
  destinationAddress?: string;
  destinationCity?: string;
  destinationState?: string;
  destinationZip?: string;
  
  // Document Type
  documentType: string;
  
  // Consent
  ferpaDisclosureRead?: boolean;
  mfcLiabilityRead?: boolean;
  consentGiven?: boolean;
  certifyInformation?: boolean;
  
  // Signature
  studentSignature?: string; // Base64 image
  signatureDate?: string;
  
  // Metadata
  requestTrackingId?: string;
}

/**
 * Generate PDF as Buffer using pdf-lib (pure JavaScript, server-side compatible)
 * Returns Promise<Buffer> for use in API routes
 */
export async function generateTranscriptRequestPDF(data: TranscriptRequestData): Promise<Buffer> {
  // Dynamically import pdf-lib at runtime only
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
  const fs = await import('fs/promises');
  const path = await import('path');
  
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a single page
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();
  
  // Embed fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const smallFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // MFC Brand Colors
  const primaryColor = rgb(91 / 255, 95 / 255, 245 / 255); // #5B5FF5
  const darkGray = rgb(50 / 255, 50 / 255, 50 / 255);
  const lightGray = rgb(100 / 255, 100 / 255, 100 / 255);
  const white = rgb(1, 1, 1);
  
  // Try to load and embed logo
  let logoImage;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'mfc-logo.svg');
    // For now, skip logo if SVG (pdf-lib doesn't support SVG directly)
    // We'll use text-based header instead
  } catch (error) {
    console.log('Logo not available, using text header');
  }
  
  // Compact Header with MFC branding
  page.drawRectangle({
    x: 0,
    y: height - 60,
    width: width,
    height: 60,
    color: primaryColor,
  });
  
  page.drawText('MY FUTURE CAPACITY', {
    x: 50,
    y: height - 30,
    size: 20,
    font: boldFont,
    color: white,
  });
  
  page.drawText('Official Transcript Request Confirmation', {
    x: 50,
    y: height - 50,
    size: 11,
    font: regularFont,
    color: white,
  });
  
  let yPosition = height - 80;
  
  // Request ID
  if (data.requestTrackingId) {
    page.drawText(`Request ID: ${data.requestTrackingId}`, {
      x: width / 2 - 70,
      y: yPosition,
      size: 9,
      font: regularFont,
      color: lightGray,
    });
    yPosition -= 30;
  } else {
    yPosition -= 10;
  }
  
  // Helper function to add section
  const addSection = (title: string) => {
    if (yPosition < 100) {
      page = pdfDoc.addPage([612, 792]);
      yPosition = height - 50;
    }
    
    page.drawText(title, {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: primaryColor,
    });
    
    page.drawLine({
      start: { x: 50, y: yPosition - 5 },
      end: { x: width - 50, y: yPosition - 5 },
      thickness: 1,
      color: primaryColor,
    });
    
    yPosition -= 25;
  };
  
  // Helper function to add field
  const addField = (label: string, value: string | boolean | undefined) => {
    if (!value && value !== false) return;
    
    if (yPosition < 80) {
      page = pdfDoc.addPage([612, 792]);
      yPosition = height - 50;
    }
    
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
    
    page.drawText(`${label}:`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: darkGray,
    });
    
    const labelWidth = boldFont.widthOfTextAtSize(`${label}: `, 10);
    page.drawText(displayValue, {
      x: 50 + labelWidth,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: darkGray,
    });
    
    yPosition -= 15;
  };
  
  // Student Information Section
  addSection('Student Information');
  addField('Name', `${data.studentFirstName}${data.studentMiddleName ? ' ' + data.studentMiddleName : ''} ${data.studentLastName}`);
  addField('Email', data.studentEmail);
  addField('Date of Birth', formatDate(data.studentDob));
  if (data.studentPartialSsn) {
    addField('Last 4 SSN', data.studentPartialSsn);
  }
  
  yPosition -= 10;
  
  // High School Information Section
  addSection('High School Information');
  addField('School Name', data.schoolName);
  if (data.schoolCeeb) addField('CEEB Code', data.schoolCeeb);
  if (data.schoolAddress) addField('Address', data.schoolAddress);
  if (data.schoolCity && data.schoolState) {
    addField('City, State', `${data.schoolCity}, ${data.schoolState} ${data.schoolZip || ''}`.trim());
  }
  if (data.schoolPhone) addField('Phone', data.schoolPhone);
  if (data.schoolEmail) addField('Email', data.schoolEmail);
  if (data.enrollDate) addField('Enrollment Date', formatDate(data.enrollDate));
  if (data.exitDate) addField('Exit Date', formatDate(data.exitDate));
  addField('Currently Enrolled', data.currentEnrollment);
  if (data.graduationDate) addField('Expected Graduation', formatDate(data.graduationDate));
  
  yPosition -= 10;
  
  // Destination School Information Section
  addSection('Destination School Information');
  addField('School Name', data.destinationSchool);
  addField('CEEB Code', data.destinationCeeb);
  if (data.destinationAddress) addField('Address', data.destinationAddress);
  if (data.destinationCity && data.destinationState) {
    addField('City, State', `${data.destinationCity}, ${data.destinationState} ${data.destinationZip || ''}`.trim());
  }
  
  yPosition -= 10;
  
  // Document Type Section
  addSection('Request Details');
  addField('Document Type', data.documentType);
  
  yPosition -= 10;
  
  // Consent Section
  addSection('Consent & Certification');
  addField('FERPA Disclosure Read', data.ferpaDisclosureRead);
  addField('MFC Liability Waiver Read', data.mfcLiabilityRead);
  addField('Consent Given', data.consentGiven);
  addField('Information Certified as Accurate', data.certifyInformation);
  
  // Signature Section
  if (data.studentSignature || data.signatureDate) {
    yPosition -= 10;
    addSection('Digital Signature');
    
    // Add signature image if available
    if (data.studentSignature) {
      try {
        // Remove data URL prefix if present
        const base64Data = data.studentSignature.replace(/^data:image\/\w+;base64,/, '');
        
        // Try to embed the image
        let image;
        if (data.studentSignature.includes('data:image/png')) {
          image = await pdfDoc.embedPng(base64Data);
        } else {
          image = await pdfDoc.embedJpg(base64Data);
        }
        
        const imageDims = image.scale(0.5);
        
        if (yPosition - imageDims.height < 80) {
          page = pdfDoc.addPage([612, 792]);
          yPosition = height - 50;
        }
        
        page.drawImage(image, {
          x: 50,
          y: yPosition - imageDims.height,
          width: imageDims.width,
          height: imageDims.height,
        });
        
        yPosition -= imageDims.height + 10;
      } catch (error) {
        console.error('Error adding signature to PDF:', error);
        addField('Digital Signature', 'Signature included');
      }
    }
    
    if (data.signatureDate) {
      addField('Signature Date', formatDate(data.signatureDate));
    }
  }
  
  // Add footer to all pages
  const pages = pdfDoc.getPages();
  const pageCount = pages.length;
  
  for (let i = 0; i < pageCount; i++) {
    const currentPage = pages[i];
    const { height } = currentPage.getSize();
    
    // Footer line
    currentPage.drawLine({
      start: { x: 50, y: 80 },
      end: { x: width - 50, y: 80 },
      thickness: 1,
      color: primaryColor,
    });
    
    // MFC branding
    currentPage.drawText('MY FUTURE CAPACITY', {
      x: width / 2 - 80,
      y: 65,
      size: 9,
      font: boldFont,
      color: primaryColor,
    });
    
    currentPage.drawText('Empowering Students to Achieve Their Educational Goals', {
      x: width / 2 - 140,
      y: 52,
      size: 7,
      font: regularFont,
      color: lightGray,
    });
    
    // Timestamp and page number
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
    
    currentPage.drawText(`Generated: ${timestamp}`, {
      x: 50,
      y: 35,
      size: 7,
      font: regularFont,
      color: lightGray,
    });
    
    currentPage.drawText(`Page ${i + 1} of ${pageCount}`, {
      x: width - 100,
      y: 35,
      size: 7,
      font: regularFont,
      color: lightGray,
    });
  }
  
  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  
  // Convert to Buffer
  return Buffer.from(pdfBytes);
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get PDF as Blob (for client-side download - not used in server routes)
 */
export function getPDFBlob(buffer: Buffer): Blob {
  return new Blob([buffer], { type: 'application/pdf' });
}

/**
 * Get PDF as Base64 string
 */
export function getPDFBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}
