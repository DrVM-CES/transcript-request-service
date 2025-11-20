// Compact single-page PDF generator for transcript requests

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

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return dateStr;
  }
}

/**
 * Generate ultra-compact single-page PDF
 */
export async function generateTranscriptRequestPDF(data: TranscriptRequestData): Promise<Buffer> {
  console.log('🎨 PDF Generator: Starting PDF creation...');
  console.log('📄 PDF Generator: Student:', data.studentFirstName, data.studentLastName);
  
  try {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
    console.log('✅ PDF Generator: pdf-lib imported successfully');
    
    const pdfDoc = await PDFDocument.create();
    console.log('✅ PDF Generator: PDF document created');
    
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const { width, height } = page.getSize();
    console.log('✅ PDF Generator: Page added, size:', width, 'x', height);
  
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const primaryColor = rgb(91 / 255, 95 / 255, 245 / 255);
  const darkGray = rgb(40 / 255, 40 / 255, 40 / 255);
  const lightGray = rgb(120 / 255, 120 / 255, 120 / 255);
  const white = rgb(1, 1, 1);
  
  // Compact header (50px tall)
  page.drawRectangle({
    x: 0,
    y: height - 50,
    width: width,
    height: 50,
    color: primaryColor,
  });
  
  page.drawText('MY FUTURE CAPACITY', {
    x: 40,
    y: height - 25,
    size: 16,
    font: boldFont,
    color: white,
  });
  
  page.drawText('Transcript Request Confirmation', {
    x: 40,
    y: height - 42,
    size: 10,
    font: regularFont,
    color: white,
  });
  
  // Request ID (right side of header)
  if (data.requestTrackingId) {
    page.drawText(`ID: ${data.requestTrackingId}`, {
      x: width - 180,
      y: height - 30,
      size: 9,
      font: regularFont,
      color: white,
    });
  }
  
  let y = height - 70;
  
  // Two-column layout helpers
  const col1X = 40;
  const col2X = width / 2 + 10;
  const lineHeight = 12;
  const sectionSpacing = 8;
  
  const addText = (text: string, x: number, bold: boolean = false, size: number = 9) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: bold ? boldFont : regularFont,
      color: bold ? primaryColor : darkGray,
    });
    y -= lineHeight;
  };
  
  const addField = (label: string, value: string | undefined, x: number = col1X) => {
    if (!value) return;
    page.drawText(`${label}: ${value}`, {
      x,
      y,
      size: 8,
      font: regularFont,
      color: darkGray,
    });
    y -= lineHeight;
  };
  
  // STUDENT INFO (Column 1)
  addText('STUDENT', col1X, true, 10);
  addField('Name', `${data.studentFirstName} ${data.studentLastName}`);
  addField('Email', data.studentEmail);
  addField('DOB', formatDate(data.studentDob));
  
  // Reset to top of column 2
  y = height - 70;
  
  // HIGH SCHOOL (Column 2)
  addText('FROM SCHOOL', col2X, true, 10);
  addField('School', data.schoolName, col2X);
  if (data.schoolCeeb) addField('CEEB', data.schoolCeeb, col2X);
  if (data.schoolCity && data.schoolState) {
    addField('Location', `${data.schoolCity}, ${data.schoolState}`, col2X);
  }
  
  // Back to column 1
  y = Math.min(y, height - 70 - (lineHeight * 5));
  y -= sectionSpacing;
  
  // DESTINATION (Column 1)
  addText('TO SCHOOL', col1X, true, 10);
  addField('School', data.destinationSchool);
  addField('CEEB', data.destinationCeeb);
  if (data.destinationCity && data.destinationState) {
    addField('Location', `${data.destinationCity}, ${data.destinationState}`);
  }
  
  // Document type (Column 2)
  const destY = y;
  y = Math.min(y, height - 70 - (lineHeight * 10));
  y -= sectionSpacing;
  
  addText('REQUEST DETAILS', col2X, true, 10);
  addField('Document Type', data.documentType, col2X);
  if (data.graduationDate) {
    addField('Grad Date', formatDate(data.graduationDate), col2X);
  }
  
  // Consent section (full width, bottom)
  y = Math.min(y, destY) - sectionSpacing - 10;
  
  addText('CONSENT & SIGNATURE', col1X, true, 10);
  y -= 5;
  
  // Compact consent checkboxes
  const checkSize = 6;
  const checks = [
    { label: '[X] FERPA Disclosure Read', checked: data.ferpaDisclosureRead },
    { label: '[X] Liability Waiver Agreed', checked: data.mfcLiabilityRead },
    { label: '[X] Consent Given', checked: data.consentGiven },
    { label: '[X] Information Certified', checked: data.certifyInformation },
  ];
  
  checks.forEach(check => {
    if (check.checked) {
      page.drawText(check.label, {
        x: col1X,
        y,
        size: 7,
        font: regularFont,
        color: darkGray,
      });
      y -= 10;
    }
  });
  
  // Signature
  if (data.studentSignature) {
    y -= 5;
    try {
      const base64Data = data.studentSignature.replace(/^data:image\/\w+;base64,/, '');
      const image = data.studentSignature.includes('png') 
        ? await pdfDoc.embedPng(base64Data)
        : await pdfDoc.embedJpg(base64Data);
      
      const scale = Math.min(200 / image.width, 40 / image.height);
      const imgW = image.width * scale;
      const imgH = image.height * scale;
      
      page.drawImage(image, {
        x: col1X,
        y: y - imgH,
        width: imgW,
        height: imgH,
      });
      
      if (data.signatureDate) {
        page.drawText(`Date: ${formatDate(data.signatureDate)}`, {
          x: col1X + imgW + 10,
          y: y - imgH + 10,
          size: 8,
          font: regularFont,
          color: lightGray,
        });
      }
      
      y -= imgH + 10;
    } catch (error) {
      console.error('Signature embedding error:', error);
      addField('Signature', 'Digital signature on file');
    }
  } else if (data.signatureDate) {
    addField('Signed', formatDate(data.signatureDate));
  }
  
  // Footer
  page.drawLine({
    start: { x: 40, y: 60 },
    end: { x: width - 40, y: 60 },
    thickness: 0.5,
    color: primaryColor,
  });
  
  page.drawText('My Future Capacity - Transcript Request Service', {
    x: width / 2 - 120,
    y: 45,
    size: 8,
    font: regularFont,
    color: lightGray,
  });
  
  page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
    x: width / 2 - 60,
    y: 32,
    size: 7,
    font: regularFont,
    color: lightGray,
  });
  
    const pdfBytes = await pdfDoc.save();
    console.log('✅ PDF Generator: PDF saved, size:', pdfBytes.length, 'bytes');
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('❌ PDF Generator: Fatal error:', error);
    throw error;
  }
}
