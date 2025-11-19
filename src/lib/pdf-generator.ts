import PDFDocument from 'pdfkit';

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
 * Generate PDF as Buffer (server-side compatible)
 * Returns Promise<Buffer> for use in API routes
 */
export async function generateTranscriptRequestPDF(data: TranscriptRequestData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const chunks: Buffer[] = [];
      
      // Collect PDF chunks
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // MFC Brand Colors
      const primaryColor = '#5B5FF5';
      const darkGray = '#323232';
      const lightGray = '#808080';
      
      // Header with MFC branding
      doc
        .rect(0, 0, doc.page.width, 80)
        .fill(primaryColor);
      
      doc
        .fillColor('white')
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('MY FUTURE CAPACITY', 50, 20, { align: 'center' });
      
      doc
        .fontSize(16)
        .font('Helvetica')
        .text('Official Transcript Request', 50, 50, { align: 'center' });
      
      // Reset y position after header
      doc.y = 100;
      
      // Request ID
      if (data.requestTrackingId) {
        doc
          .fillColor(lightGray)
          .fontSize(9)
          .font('Helvetica')
          .text(`Request ID: ${data.requestTrackingId}`, { align: 'center' });
        
        doc.moveDown();
      }
      
      // Helper function to add section
      const addSection = (title: string) => {
        doc.moveDown(0.5);
        doc
          .fillColor(primaryColor)
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(title);
        
        doc
          .moveTo(doc.x, doc.y)
          .lineTo(doc.page.width - 50, doc.y)
          .stroke(primaryColor);
        
        doc.moveDown(0.5);
      };
      
      // Helper function to add field
      const addField = (label: string, value: string | boolean | undefined) => {
        if (value === undefined || value === null) return;
        
        const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
        
        doc
          .fillColor(darkGray)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(`${label}: `, { continued: true })
          .font('Helvetica')
          .text(displayValue);
      };
      
      // Student Information Section
      addSection('Student Information');
      addField('Name', `${data.studentFirstName}${data.studentMiddleName ? ' ' + data.studentMiddleName : ''} ${data.studentLastName}`);
      addField('Email', data.studentEmail);
      addField('Date of Birth', formatDate(data.studentDob));
      if (data.studentPartialSsn) {
        addField('Last 4 SSN', data.studentPartialSsn);
      }
      
      // High School Information Section
      addSection('High School Information');
      addField('School Name', data.schoolName);
      if (data.schoolCeeb) addField('CEEB Code', data.schoolCeeb);
      if (data.schoolAddress) addField('Address', data.schoolAddress);
      if (data.schoolCity && data.schoolState) {
        addField('City, State', `${data.schoolCity}, ${data.schoolState} ${data.schoolZip || ''}`);
      }
      if (data.schoolPhone) addField('Phone', data.schoolPhone);
      if (data.schoolEmail) addField('Email', data.schoolEmail);
      if (data.enrollDate) addField('Enrollment Date', formatDate(data.enrollDate));
      if (data.exitDate) addField('Exit Date', formatDate(data.exitDate));
      addField('Currently Enrolled', data.currentEnrollment);
      if (data.graduationDate) addField('Expected Graduation', formatDate(data.graduationDate));
      
      // Destination School Information Section
      addSection('Destination School Information');
      addField('School Name', data.destinationSchool);
      addField('CEEB Code', data.destinationCeeb);
      if (data.destinationAddress) addField('Address', data.destinationAddress);
      if (data.destinationCity && data.destinationState) {
        addField('City, State', `${data.destinationCity}, ${data.destinationState} ${data.destinationZip || ''}`);
      }
      
      // Document Type Section
      addSection('Request Details');
      addField('Document Type', data.documentType);
      
      // Consent Section
      addSection('Consent & Certification');
      addField('FERPA Disclosure Read', data.ferpaDisclosureRead);
      addField('MFC Liability Waiver Read', data.mfcLiabilityRead);
      addField('Consent Given', data.consentGiven);
      addField('Information Certified as Accurate', data.certifyInformation);
      
      // Signature Section
      if (data.studentSignature || data.signatureDate) {
        addSection('Digital Signature');
        
        // Add signature image if available
        if (data.studentSignature) {
          try {
            // Remove data URL prefix if present
            const base64Data = data.studentSignature.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            doc.image(buffer, doc.x, doc.y, {
              width: 200,
              height: 75
            });
            
            doc.moveDown(5);
          } catch (error) {
            console.error('Error adding signature to PDF:', error);
            doc.text('[Digital signature included]');
          }
        }
        
        if (data.signatureDate) {
          addField('Signature Date', formatDate(data.signatureDate));
        }
      }
      
      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        
        // Footer line
        doc
          .moveTo(50, doc.page.height - 80)
          .lineTo(doc.page.width - 50, doc.page.height - 80)
          .stroke(primaryColor);
        
        // MFC branding in footer
        doc
          .fillColor(primaryColor)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('MY FUTURE CAPACITY', 50, doc.page.height - 70, { align: 'center' });
        
        doc
          .fillColor(lightGray)
          .fontSize(7)
          .font('Helvetica')
          .text('Empowering Students to Achieve Their Educational Goals', 50, doc.page.height - 60, { align: 'center' });
        
        // Timestamp and page number
        const timestamp = new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        });
        
        doc
          .fontSize(7)
          .text(`Generated: ${timestamp}`, 50, doc.page.height - 45, { align: 'left' });
        
        doc
          .text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 45, { align: 'right' });
      }
      
      // Finalize PDF
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
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
