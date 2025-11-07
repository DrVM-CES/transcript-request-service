// Simple test script to verify the API is working
const testTranscriptRequest = async () => {
  const testData = {
    // Student Information
    studentFirstName: "John",
    studentLastName: "Doe", 
    studentMiddleName: "Michael",
    studentEmail: "john.doe@email.com",
    studentDob: "2005-06-15",
    studentPartialSsn: "1234",

    // School Information
    schoolName: "Lincoln High School",
    schoolCeeb: "ABC123",
    schoolAddress: "123 School St",
    schoolCity: "Springfield",
    schoolState: "IL",
    schoolZip: "62701",
    schoolPhone: "(555) 123-4567",
    schoolEmail: "registrar@lincoln.edu",

    // Attendance
    enrollDate: "2021-08-15",
    currentEnrollment: false,
    graduationDate: "2024-06-15",
    exitDate: "2024-06-15",

    // Destination
    destinationSchool: "University of Illinois",
    destinationCeeb: "DEF456",
    destinationAddress: "456 University Ave",
    destinationCity: "Urbana",
    destinationState: "IL",
    destinationZip: "61801",

    // Document
    documentType: "Transcript - Final",

    // Consent
    ferpaDisclosureRead: true,
    consentGiven: true,
    certifyInformation: true
  };

  try {
    console.log('Testing transcript request submission...');
    
    const response = await fetch('http://localhost:3000/api/submit-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('Request ID:', result.requestId);
      console.log('Document ID:', result.documentId);
      console.log('Message:', result.message);
    } else {
      console.log('❌ Error:', result.error);
      if (result.details) {
        console.log('Details:', result.details);
      }
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
};

// Import fetch for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

testTranscriptRequest();