# My Future Capacity API Integration Guide
## Transcript Request Service Integration

## 🔗 **Integration Overview**

The transcript service now provides **RESTful APIs** for seamless integration with the My Future Capacity main application. This enables "push button" transcript requests directly from MFC.

### **Integration Flow**
1. **MFC Interface**: Student selects destination school in MFC
2. **API Call**: MFC calls transcript service with pre-populated data
3. **Processing**: Transcript service generates PESC XML and uploads to Parchment
4. **Status Updates**: MFC can check status via API
5. **Completion**: Student notified when transcript is delivered

---

## 🔑 **Authentication**

### **API Key Setup**
- Set environment variable: `MFC_API_KEY=your-secure-api-key`
- Include in all API requests as: `x-api-key: your-secure-api-key`
- Generate a secure 32+ character key

---

## 📡 **API Endpoints**

### **1. Submit Transcript Request**
**POST** `/api/external/submit`

Submit a transcript request with pre-populated student and school data from MFC.

#### **Headers**
```
Content-Type: application/json
x-api-key: your-secure-api-key
```

#### **Request Body**
```json
{
  "apiKey": "your-secure-api-key",
  
  // Student info (from MFC user profile)
  "studentFirstName": "John",
  "studentLastName": "Doe",
  "studentMiddleName": "Michael",
  "studentEmail": "john.doe@email.com",
  "studentDob": "2000-01-15",
  "studentPartialSsn": "1234",
  
  // Source school (from MFC school database)
  "schoolName": "Lincoln High School",
  "schoolCeeb": "123456",
  "schoolAddress": "123 School St",
  "schoolCity": "Springfield",
  "schoolState": "IL",
  "schoolZip": "62701",
  "schoolPhone": "217-555-0123",
  "schoolEmail": "registrar@lincolnhs.edu",
  
  // Student attendance (from MFC records)
  "enrollDate": "2016-08-20",
  "exitDate": "2020-05-30",
  "currentEnrollment": false,
  "graduationDate": "2020-05-30",
  
  // Destination (user selected in MFC)
  "destinationSchool": "University of Illinois",
  "destinationCeeb": "001775",
  "destinationAddress": "506 S Wright St",
  "destinationCity": "Urbana",
  "destinationState": "IL",
  "destinationZip": "61801",
  
  // Request settings
  "documentType": "Transcript - Final",
  
  // Consent (handled in MFC interface)
  "consentGiven": true,
  "ferpaDisclosureShown": true,
  
  // MFC tracking
  "mfcUserId": "user_12345",
  "mfcRequestId": "mfc_req_67890",
  "callbackUrl": "https://mfc.com/api/transcript-status-update"
}
```

#### **Success Response**
```json
{
  "success": true,
  "requestId": "uuid-transcript-request-id",
  "documentId": "PESC12345678901234567890123456789012",
  "status": "processing",
  "message": "Transcript request submitted successfully",
  "trackingInfo": {
    "parchmentDocumentId": "PESC12345678901234567890123456789012",
    "fileName": "PESC20231105_143022_John_Doe",
    "uploadPath": "/incoming/PESC20231105_143022_John_Doe_request.xml"
  }
}
```

#### **Error Response**
```json
{
  "error": "Invalid request data",
  "details": [
    {
      "field": "studentEmail",
      "message": "Valid email required"
    }
  ]
}
```

---

### **2. Check Request Status**
**GET** `/api/external/status/{requestId}`

Check the status of a submitted transcript request.

#### **Headers**
```
x-api-key: your-secure-api-key
```

#### **Response**
```json
{
  "requestId": "uuid-transcript-request-id",
  "status": "processing",
  "statusMessage": "XML uploaded to /incoming/file.xml",
  "student": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com"
  },
  "destination": {
    "school": "University of Illinois",
    "ceeb": "001775"
  },
  "document": {
    "type": "Transcript - Final",
    "parchmentId": "PESC12345678901234567890123456789012"
  },
  "tracking": {
    "mfcRequestId": "mfc_req_67890",
    "createdAt": "2023-11-05T14:30:22Z",
    "updatedAt": "2023-11-05T14:30:25Z"
  },
  "statusHistory": [
    {
      "status": "submitted",
      "timestamp": "2023-11-05T14:30:22Z",
      "message": "Request received and validated"
    },
    {
      "status": "processing",
      "timestamp": "2023-11-05T14:30:25Z",
      "message": "XML uploaded to Parchment SFTP"
    }
  ]
}
```

---

## 🔄 **Status Values**

| Status | Description | Next Steps |
|--------|-------------|------------|
| `submitted` | Request received and validated | Processing will begin |
| `processing` | XML uploaded to Parchment | Waiting for Parchment processing |
| `delivered` | Transcript delivered to destination | Request complete |
| `failed` | Processing failed | Check statusMessage for details |

---

## 🎨 **MFC Frontend Integration**

### **Button Implementation Example**
```javascript
// In MFC student dashboard
async function requestTranscript(destinationSchool) {
  const studentData = getCurrentStudentData();
  const schoolData = getStudentSchoolData();
  
  const request = {
    apiKey: MFC_API_KEY,
    // Student data from MFC profile
    studentFirstName: studentData.firstName,
    studentLastName: studentData.lastName,
    studentEmail: studentData.email,
    studentDob: studentData.dateOfBirth,
    
    // School data from MFC database
    schoolName: schoolData.name,
    schoolCeeb: schoolData.ceebCode,
    schoolAddress: schoolData.address,
    
    // User-selected destination
    destinationSchool: destinationSchool.name,
    destinationCeeb: destinationSchool.ceebCode,
    
    // Consent (show FERPA disclosure in MFC)
    consentGiven: true,
    ferpaDisclosureShown: true,
    
    // MFC tracking
    mfcUserId: studentData.id,
    mfcRequestId: generateMFCRequestId(),
  };
  
  try {
    const response = await fetch('/api/transcript/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': MFC_API_KEY
      },
      body: JSON.stringify(request)
    });
    
    const result = await response.json();
    
    if (result.success) {
      showSuccessMessage('Transcript request submitted!');
      trackRequestStatus(result.requestId);
    } else {
      showError('Request failed: ' + result.error);
    }
  } catch (error) {
    showError('Network error: ' + error.message);
  }
}
```

---

## ⚙️ **Environment Configuration**

Add these environment variables to both applications:

### **Transcript Service (.env)**
```env
MFC_API_KEY=your-secure-32-character-api-key
MFC_WEBHOOK_SECRET=webhook-signature-secret
```

### **My Future Capacity (.env)**
```env
TRANSCRIPT_API_URL=https://transcript-service.netlify.app
TRANSCRIPT_API_KEY=your-secure-32-character-api-key
```

---

## 🔒 **Security Considerations**

### **API Key Management**
- Generate cryptographically secure API keys
- Store securely (environment variables, not code)
- Rotate keys periodically
- Use different keys for staging/production

### **Data Validation**
- All input validated server-side
- FERPA compliance maintained
- Audit trail preserved for all requests

### **Rate Limiting** (Future Enhancement)
- Implement rate limiting per API key
- Monitor for unusual usage patterns
- Alert on failed authentication attempts

---

## 📊 **Implementation Phases**

### **Phase 1: Basic Integration** (Current)
- [x] API endpoints for request submission
- [x] Status checking functionality
- [x] Error handling and validation
- [x] Authentication system

### **Phase 2: Enhanced Features** (Future)
- [ ] Webhook notifications for status updates
- [ ] Bulk request processing
- [ ] Request history and analytics
- [ ] Advanced error reporting

### **Phase 3: Advanced Integration** (Future)
- [ ] Real-time status updates via WebSocket
- [ ] Document preview and verification
- [ ] Multi-institution request handling
- [ ] Integration with MFC notification system

---

## 🧪 **Testing**

### **Test Environment**
```bash
# Test API endpoint
curl -X POST https://transcript-service-staging.netlify.app/api/external/submit \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-api-key" \
  -d @test-request.json

# Check status
curl -X GET https://transcript-service-staging.netlify.app/api/external/status/request-id \
  -H "x-api-key: test-api-key"
```

### **Test Data**
Sample test requests are available in the `/test-data` directory.

---

## 📞 **Support**

### **Technical Questions**
- **API Issues**: Check health endpoint `/api/health`
- **Authentication**: Verify API key configuration
- **Data Format**: Validate request against schema
- **Status Updates**: Use status endpoint for tracking

### **Implementation Support**
- **API Documentation**: This document
- **Code Examples**: See integration examples above
- **Testing**: Use staging environment for development

---

## ✅ **Integration Checklist**

### **MFC Team Tasks**
- [ ] Generate secure API key
- [ ] Add API key to environment variables
- [ ] Implement FERPA disclosure in MFC interface
- [ ] Create "Request Transcript" button/flow
- [ ] Add status checking functionality
- [ ] Test with staging environment
- [ ] Deploy to production

### **Transcript Service Tasks**
- [x] Create API endpoints
- [x] Implement authentication
- [x] Add status tracking
- [x] Document API interface
- [ ] Set up webhook system (Phase 2)
- [ ] Configure rate limiting (Phase 2)

---

**Ready for MFC Integration!** 🚀

The transcript service now provides complete API integration capabilities. The MFC team can implement the frontend interface and start using the APIs immediately.