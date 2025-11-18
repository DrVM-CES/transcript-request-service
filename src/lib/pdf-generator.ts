import { jsPDF } from 'jspdf';

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

export function generateTranscriptRequestPDF(data: TranscriptRequestData): jsPDF {
  const doc = new jsPDF();
  
  // MFC Brand Colors
  const primaryColor = [91, 95, 245]; // #5B5FF5
  const darkGray = [50, 50, 50];
  const lightGray = [128, 128, 128];
  
  let yPosition = 20;
  
  // Header with MFC branding
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Transcript Request', 105, 18, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('My Future Capacity', 105, 25, { align: 'center' });
  
  yPosition = 40;
  
  // Request ID if available
  if (data.requestTrackingId) {
    doc.setTextColor(...lightGray);
    doc.setFontSize(9);
    doc.text(`Request ID: ${data.requestTrackingId}`, 105, yPosition, { align: 'center' });
    yPosition += 10;
  }
  
  // Helper function to add section
  const addSection = (title: string) => {
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, yPosition);
    yPosition += 2;
    
    // Underline
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 8;
  };
  
  // Helper function to add field
  const addField = (label: string, value: string | undefined, indent: number = 20) => {
    if (!value) return;
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', indent, yPosition);
    
    doc.setFont('helvetica', 'normal');
    const textWidth = doc.getTextWidth(label + ': ');
    doc.text(value, indent + textWidth, yPosition);
    yPosition += 6;
  };
  
  // Check if we need a new page
  const checkPageBreak = () => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
  };
  
  // Student Information Section
  addSection('Student Information');
  const fullName = [data.studentFirstName, data.studentMiddleName, data.studentLastName]
    .filter(Boolean)
    .join(' ');
  addField('Name', fullName);
  addField('Email', data.studentEmail);
  addField('Date of Birth', formatDate(data.studentDob));
  if (data.studentPartialSsn) {
    addField('SSN (Last 4)', data.studentPartialSsn);
  }
  yPosition += 5;
  
  checkPageBreak();
  
  // Current School Section
  addSection('Current School');
  addField('School Name', data.schoolName);
  addField('CEEB Code', data.schoolCeeb);
  if (data.schoolAddress) {
    addField('Address', data.schoolAddress);
  }
  const schoolLocation = [data.schoolCity, data.schoolState, data.schoolZip]
    .filter(Boolean)
    .join(', ');
  if (schoolLocation) {
    addField('Location', schoolLocation);
  }
  addField('Phone', data.schoolPhone);
  addField('Email', data.schoolEmail);
  addField('Enrollment Date', data.enrollDate ? formatDate(data.enrollDate) : undefined);
  if (!data.currentEnrollment && data.exitDate) {
    addField('Exit Date', formatDate(data.exitDate));
  }
  addField('Expected Graduation', data.graduationDate ? formatDate(data.graduationDate) : undefined);
  addField('Current Enrollment', data.currentEnrollment ? 'Yes' : 'No');
  yPosition += 5;
  
  checkPageBreak();
  
  // Destination Institution Section
  addSection('Destination Institution');
  addField('Institution Name', data.destinationSchool);
  addField('CEEB Code', data.destinationCeeb);
  if (data.destinationAddress) {
    addField('Address', data.destinationAddress);
  }
  const destLocation = [data.destinationCity, data.destinationState, data.destinationZip]
    .filter(Boolean)
    .join(', ');
  if (destLocation) {
    addField('Location', destLocation);
  }
  yPosition += 5;
  
  checkPageBreak();
  
  // Document Type Section
  addSection('Document Information');
  addField('Document Type', data.documentType);
  yPosition += 5;
  
  checkPageBreak();
  
  // Consent & Certification Section
  addSection('Consent & Certification');
  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const consentItems = [
    '✓ I have read and understand the FERPA Privacy Rights Disclosure',
    '✓ I have read and agree to the My Future Capacity Liability Release',
    '✓ I consent to the release of my academic transcript',
    '✓ I certify that all information provided is true and accurate',
  ];
  
  consentItems.forEach(item => {
    doc.text(item, 25, yPosition);
    yPosition += 5;
  });
  yPosition += 5;
  
  checkPageBreak();
  
  // Signature Section
  if (data.studentSignature) {
    addSection('Digital Signature');
    
    try {
      // Add signature image
      doc.addImage(data.studentSignature, 'PNG', 20, yPosition, 80, 30);
      yPosition += 35;
      
      // Signature line
      doc.setDrawColor(...darkGray);
      doc.setLineWidth(0.3);
      doc.line(20, yPosition, 100, yPosition);
      yPosition += 5;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Student Signature', 20, yPosition);
      
      if (data.signatureDate) {
        doc.text(`Date: ${formatDate(data.signatureDate)}`, 120, yPosition);
      }
      yPosition += 10;
    } catch (error) {
      console.error('Error adding signature to PDF:', error);
      addField('Signature Date', data.signatureDate ? formatDate(data.signatureDate) : undefined);
    }
  }
  
  checkPageBreak();
  
  // Footer with timestamp
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(...lightGray);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
    
    doc.text(`Generated: ${timestamp}`, 105, 285, { align: 'center' });
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }
  
  return doc;
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

export function downloadPDF(doc: jsPDF, fileName: string = 'transcript-request.pdf') {
  doc.save(fileName);
}

export function getPDFBlob(doc: jsPDF): Blob {
  return doc.output('blob');
}

export function getPDFBase64(doc: jsPDF): string {
  return doc.output('datauristring');
}
