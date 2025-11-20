// Quick test to see if PDF generation works
const { generateTranscriptRequestPDF } = require('./src/lib/pdf-generator-compact.ts');

const testData = {
  studentFirstName: 'Test',
  studentLastName: 'Student',
  studentEmail: 'test@example.com',
  studentDob: '2005-01-15',
  schoolName: 'Test High School',
  schoolCity: 'Los Angeles',
  schoolState: 'CA',
  destinationSchool: 'UCLA',
  destinationCeeb: '4837',
  documentType: 'Official Transcript',
  requestTrackingId: 'test-123'
};

async function testPDF() {
  try {
    console.log('Testing PDF generation...');
    const pdfBuffer = await generateTranscriptRequestPDF(testData);
    console.log('✅ PDF generated successfully!', pdfBuffer.length, 'bytes');
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
  }
}

testPDF();
