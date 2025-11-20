// Professional PDF generator for transcript requests with MFC branding

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
  studentSignature?: string;
  signatureDate?: string;
  
  // Metadata
  requestTrackingId?: string;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return dateStr;
  }
}

function formatPhone(phone?: string): string {
  if (!phone) return 'N/A';
  return phone;
}

/**
 * Generate professional PDF with MFC branding
 */
export async function generateTranscriptRequestPDF(data: TranscriptRequestData): Promise<Buffer> {
  console.log('🎨 PDF Generator: Starting professional PDF creation...');
  console.log('📄 PDF Generator: Student:', data.studentFirstName, data.studentLastName);
  
  try {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
    console.log('✅ PDF Generator: pdf-lib imported successfully');
    
    const pdfDoc = await PDFDocument.create();
    console.log('✅ PDF Generator: PDF document created');
    
    const page = pdfDoc.addPage([612, 792]); // US Letter
    const { width, height } = page.getSize();
    console.log('✅ PDF Generator: Page added, size:', width, 'x', height);
    
    // Load fonts
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const headingFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const labelFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Color palette - MFC brand colors
    const mfcGreen = rgb(0, 128/255, 55/255);      // #008037
    const mfcBlue = rgb(0, 112/255, 192/255);      // #0070C0
    const headerBlue = rgb(91/255, 95/255, 245/255); // #5B5FF5
    const darkGray = rgb(51/255, 51/255, 51/255);
    const mediumGray = rgb(102/255, 102/255, 102/255);
    const lightGray = rgb(200/255, 200/255, 200/255);
    const white = rgb(1, 1, 1);
    
    let y = height - 40; // Start position
    
    // ==================== HEADER ====================
    // Blue header bar
    page.drawRectangle({
      x: 0,
      y: height - 80,
      width: width,
      height: 80,
      color: headerBlue,
    });
    
    // Company name (logo placeholder)
    page.drawText('MY FUTURE CAPACITY', {
      x: 50,
      y: height - 45,
      size: 20,
      font: titleFont,
      color: white,
    });
    
    page.drawText('Transcript Request Service', {
      x: 50,
      y: height - 65,
      size: 11,
      font: bodyFont,
      color: white,
    });
    
    // Request ID
    if (data.requestTrackingId) {
      const idText = `Request ID: ${data.requestTrackingId}`;
      const idWidth = bodyFont.widthOfTextAtSize(idText, 9);
      page.drawText(idText, {
        x: width - idWidth - 50,
        y: height - 50,
        size: 9,
        font: bodyFont,
        color: white,
      });
    }
    
    y = height - 100;
    
    // ==================== DOCUMENT TITLE ====================
    y -= 30;
    page.drawText('OFFICIAL TRANSCRIPT REQUEST CONFIRMATION', {
      x: 50,
      y: y,
      size: 14,
      font: headingFont,
      color: darkGray,
    });
    
    // Date
    y -= 20;
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    page.drawText(`Submitted: ${currentDate}`, {
      x: 50,
      y: y,
      size: 9,
      font: bodyFont,
      color: mediumGray,
    });
    
    y -= 30;
    
    // ==================== STUDENT INFORMATION ====================
    // Section header with underline
    page.drawText('STUDENT INFORMATION', {
      x: 50,
      y: y,
      size: 12,
      font: headingFont,
      color: mfcGreen,
    });
    
    y -= 5;
    page.drawRectangle({
      x: 50,
      y: y - 2,
      width: 150,
      height: 1.5,
      color: mfcGreen,
    });
    
    y -= 20;
    
    // Student details in two columns
    const col1X = 70;
    const col2X = 320;
    const lineHeight = 18;
    
    // Column 1
    page.drawText('Name:', { x: col1X, y, size: 9, font: labelFont, color: darkGray });
    page.drawText(
      `${data.studentFirstName} ${data.studentMiddleName || ''} ${data.studentLastName}`.trim(),
      { x: col1X + 80, y, size: 9, font: bodyFont, color: darkGray }
    );
    
    y -= lineHeight;
    page.drawText('Email:', { x: col1X, y, size: 9, font: labelFont, color: darkGray });
    page.drawText(data.studentEmail, { x: col1X + 80, y, size: 9, font: bodyFont, color: darkGray });
    
    y -= lineHeight;
    page.drawText('Date of Birth:', { x: col1X, y, size: 9, font: labelFont, color: darkGray });
    page.drawText(formatDate(data.studentDob), { x: col1X + 80, y, size: 9, font: bodyFont, color: darkGray });
    
    y -= 30;
    
    // ==================== FROM SCHOOL ====================
    page.drawText('FROM SCHOOL (Sending Institution)', {
      x: 50,
      y: y,
      size: 12,
      font: headingFont,
      color: mfcGreen,
    });
    
    y -= 5;
    page.drawRectangle({
      x: 50,
      y: y - 2,
      width: 200,
      height: 1.5,
      color: mfcGreen,
    });
    
    y -= 20;
    
    page.drawText('School Name:', { x: col1X, y, size: 9, font: labelFont, color: darkGray });
    page.drawText(data.schoolName, { x: col1X + 80, y, size: 9, font: bodyFont, color: darkGray });
    
    if (data.schoolCeeb) {
      y -= lineHeight;
      page.drawText('CEEB Code:', { x: col1X, y, size: 9, font: labelFont, color: darkGray });
      page.drawText(data.schoolCeeb, { x: col1X + 80, y, size: 9, font: bodyFont, color: darkGray });
    }
    
    y -= lineHeight;
    const schoolLocation = `${data.schoolCity || ''}, ${data.schoolState || ''}`.trim();
    page.drawText('Location:', { x: col1X, y, size: 9, font: labelFont, color: darkGray });
    page.drawText(schoolLocation, { x: col1X + 80, y, size: 9, font: bodyFont, color: darkGray });
    
    if (data.schoolPhone) {
      y -= lineHeight;
      page.drawText('Phone:', { x: col1X, y, size: 9, font: labelFont, color: darkGray });
      page.drawText(formatPhone(data.schoolPhone), { x: col1X + 80, y, size: 9, font: bodyFont, color: darkGray });
    }
    
    if (data.graduationDate) {
      y -= lineHeight;
      page.drawText('Graduation:', { x: col1X, y, size: 9, font: labelFont, color: darkGray });
      page.drawText(formatDate(data.graduationDate), { x: col1X + 80, y, size: 9, font: bodyFont, color: darkGray });
    }
    
    y -= 30;
    
    // ==================== TO SCHOOL ====================
    page.drawText('TO SCHOOL (Receiving Institution)', {
      x: 50,
      y: y,
      size: 12,
      font: headingFont,
      color: mfcBlue,
    });
    
    y -= 5;
    page.drawRectangle({
      x: 50,
      y: y - 2,
      width: 200,
      height: 1.5,
      color: mfcBlue,
    });
    
    y -= 20;
    
    page.drawText('School Name:', { x: col1X, y, size: 9, font: labelFont, color: darkGray });
    page.drawText(data.destinationSchool, { x: col1X + 80, y, size: 9, font: bodyFont, color: darkGray });
    
    y -= lineHeight;
    page.drawText('CEEB Code:', { x: col1X, y, size: 9, font: labelFont, color: darkGray });
    page.drawText(data.destinationCeeb, { x: col1X + 80, y, size: 9, font: bodyFont, color: darkGray });
    
    y -= lineHeight;
    const destLocation = `${data.destinationCity || ''}, ${data.destinationState || ''}`.trim();
    page.drawText('Location:', { x: col1X, y, size: 9, font: labelFont, color: darkGray });
    page.drawText(destLocation, { x: col1X + 80, y, size: 9, font: bodyFont, color: darkGray });
    
    y -= 30;
    
    // ==================== REQUEST DETAILS ====================
    page.drawText('REQUEST DETAILS', {
      x: 50,
      y: y,
      size: 12,
      font: headingFont,
      color: darkGray,
    });
    
    y -= 5;
    page.drawRectangle({
      x: 50,
      y: y - 2,
      width: 120,
      height: 1.5,
      color: darkGray,
    });
    
    y -= 20;
    
    page.drawText('Document Type:', { x: col1X, y, size: 9, font: labelFont, color: darkGray });
    page.drawText(data.documentType, { x: col1X + 100, y, size: 9, font: bodyFont, color: darkGray });
    
    y -= 30;
    
    // ==================== CONSENT & AUTHORIZATION ====================
    page.drawText('FERPA CONSENT & AUTHORIZATION', {
      x: 50,
      y: y,
      size: 12,
      font: headingFont,
      color: darkGray,
    });
    
    y -= 5;
    page.drawRectangle({
      x: 50,
      y: y - 2,
      width: 200,
      height: 1.5,
      color: darkGray,
    });
    
    y -= 20;
    
    // Consent checkboxes
    const consentItems = [
      { label: 'FERPA Disclosure Authorization', checked: data.ferpaDisclosureRead },
      { label: 'Liability Waiver Agreement', checked: data.mfcLiabilityRead },
      { label: 'Information Release Consent', checked: data.consentGiven },
      { label: 'Information Accuracy Certification', checked: data.certifyInformation },
    ];
    
    consentItems.forEach(item => {
      if (item.checked) {
        // Checkbox
        page.drawRectangle({
          x: col1X,
          y: y - 2,
          width: 8,
          height: 8,
          borderColor: darkGray,
          borderWidth: 1,
        });
        
        // Checkmark
        page.drawText('X', {
          x: col1X + 1.5,
          y: y - 1,
          size: 8,
          font: headingFont,
          color: mfcGreen,
        });
        
        page.drawText(item.label, {
          x: col1X + 15,
          y: y,
          size: 8,
          font: bodyFont,
          color: darkGray,
        });
        
        y -= 14;
      }
    });
    
    y -= 10;
    
    // ==================== SIGNATURE ====================
    if (data.studentSignature) {
      y -= 10;
      page.drawText('Student Signature:', {
        x: col1X,
        y: y,
        size: 9,
        font: labelFont,
        color: darkGray,
      });
      
      y -= 10;
      
      try {
        const base64Data = data.studentSignature.replace(/^data:image\/\w+;base64,/, '');
        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        let image;
        if (data.studentSignature.includes('png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }
        
        const scale = Math.min(150 / image.width, 30 / image.height);
        const imgW = image.width * scale;
        const imgH = image.height * scale;
        
        page.drawImage(image, {
          x: col1X + 10,
          y: y - imgH,
          width: imgW,
          height: imgH,
        });
        
        y -= imgH + 5;
      } catch (error) {
        console.error('Signature embedding error:', error);
        page.drawText('Digital signature on file', {
          x: col1X + 10,
          y: y,
          size: 8,
          font: bodyFont,
          color: mediumGray,
        });
        y -= 20;
      }
      
      if (data.signatureDate) {
        page.drawText(`Date: ${formatDate(data.signatureDate)}`, {
          x: col1X + 10,
          y: y,
          size: 8,
          font: bodyFont,
          color: mediumGray,
        });
      }
    }
    
    // ==================== FOOTER ====================
    const footerY = 50;
    
    // Footer line
    page.drawRectangle({
      x: 50,
      y: footerY + 30,
      width: width - 100,
      height: 1,
      color: lightGray,
    });
    
    // Footer text
    page.drawText('My Future Capacity - Transcript Request Service', {
      x: 50,
      y: footerY + 15,
      size: 8,
      font: bodyFont,
      color: mediumGray,
    });
    
    page.drawText('Empowering Students Through Education', {
      x: 50,
      y: footerY + 4,
      size: 7,
      font: bodyFont,
      color: lightGray,
    });
    
    // Page number
    page.drawText('Page 1 of 1', {
      x: width - 100,
      y: footerY + 10,
      size: 8,
      font: bodyFont,
      color: mediumGray,
    });
    
    const pdfBytes = await pdfDoc.save();
    console.log('✅ PDF Generator: PDF saved, size:', pdfBytes.length, 'bytes');
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('❌ PDF Generator: Fatal error:', error);
    throw error;
  }
}
