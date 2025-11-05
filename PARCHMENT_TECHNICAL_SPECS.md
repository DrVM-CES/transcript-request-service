# Parchment Technical Integration Specifications
## My Future Capacity Transcript Request Service

### **Service Overview**
My Future Capacity has developed a comprehensive transcript request service that integrates with the Parchment network for automated transcript processing and delivery.

---

## **PESC Compliance Details**

### **XML Standard Compliance**
- **PESC Version**: TranscriptRequest v1.2.0
- **Schema Validation**: Full compliance with official PESC schemas
- **Document Structure**: Complete student, school, and request information

### **Document ID Format**
- **Format**: UUID v4 with hyphens removed
- **Length**: 32 alphanumeric characters
- **Example**: `PESC20231105143022A1B2C3D4E5F6G7H8`
- **Uniqueness**: Guaranteed unique per request

### **File Naming Convention**
- **Pattern**: `PESC[YYYYMMDD]_[HHMMSS]_[FirstName]_[LastName]`
- **Request File**: `[basename]_request.xml`
- **Document File**: `[basename]_document.pdf` (if applicable)
- **Example**: `PESC20231105_143022_John_Doe_request.xml`

---

## **XML Structure Sample**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<TranscriptRequest xmlns="urn:org:pesc:message:TranscriptRequest:v1.2.0">
  <DocumentID>PESC20231105143022A1B2C3D4E5F6G7H8</DocumentID>
  <CreatedDateTime>2023-11-05T14:30:22</CreatedDateTime>
  <DocumentTypeCode>Request</DocumentTypeCode>
  
  <!-- Student Information -->
  <Student>
    <Person>
      <Name>
        <FirstName>John</FirstName>
        <LastName>Doe</LastName>
        <MiddleName>Michael</MiddleName>
      </Name>
      <Birth>
        <BirthDate>2000-01-15</BirthDate>
      </Birth>
      <Email>john.doe@email.com</Email>
      <SSN>
        <PartialSSN>1234</PartialSSN>
      </SSN>
    </Person>
  </Student>
  
  <!-- Source Institution -->
  <Source>
    <Organization>
      <OrganizationName>Lincoln High School</OrganizationName>
      <CEEB>123456</CEEB>
      <Contacts>
        <Address>
          <AddressLine>123 School Street</AddressLine>
          <City>Springfield</City>
          <StateProvince>IL</StateProvince>
          <PostalCode>62701</PostalCode>
        </Address>
        <Phone>217-555-0123</Phone>
        <Email>registrar@lincolnhs.edu</Email>
      </Contacts>
    </Organization>
  </Source>
  
  <!-- Destination Institution -->
  <Destination>
    <Organization>
      <OrganizationName>University of Illinois</OrganizationName>
      <CEEB>001775</CEEB>
      <Contacts>
        <Address>
          <AddressLine>506 S Wright St</AddressLine>
          <City>Urbana</City>
          <StateProvince>IL</StateProvince>
          <PostalCode>61801</PostalCode>
        </Address>
      </Contacts>
    </Organization>
  </Destination>
  
  <!-- Request Details -->
  <RequestDetails>
    <DocumentType>Transcript - Final</DocumentType>
    <RequestTrackingID>MFC_REQ_12345</RequestTrackingID>
    <RequestedDocument>
      <DocumentType>Transcript</DocumentType>
      <DocumentTypeCode>TRAN</DocumentTypeCode>
      <DocumentFormat>Electronic</DocumentFormat>
    </RequestedDocument>
  </RequestDetails>
  
  <!-- Student Attendance -->
  <Attendance>
    <School>
      <OrganizationName>Lincoln High School</OrganizationName>
      <EnrollmentBegin>2016-08-20</EnrollmentBegin>
      <EnrollmentEnd>2020-05-30</EnrollmentEnd>
      <CurrentEnrollment>false</CurrentEnrollment>
      <GraduationDate>2020-05-30</GraduationDate>
    </School>
  </Attendance>
  
  <!-- Release Authorization -->
  <ReleaseAuthorization>
    <ConsentGiven>true</ConsentGiven>
    <ConsentDate>2023-11-05T14:30:22</ConsentDate>
    <AuthorizedMethod>ElectronicSignature</AuthorizedMethod>
    <FERPADisclosure>true</FERPADisclosure>
  </ReleaseAuthorization>
  
</TranscriptRequest>
```

---

## **SFTP Integration Requirements**

### **Connection Specifications**
- **Protocol**: SFTP (SSH File Transfer Protocol)
- **Port**: 22 (standard) or as specified by Parchment
- **Authentication**: Username/Password
- **Security**: TLS/SSL encryption required
- **Timeout**: 20 second connection timeout with 2 retries

### **Upload Process**
1. **Connection**: Establish secure SFTP connection
2. **Directory**: Navigate to designated upload directory (typically `/incoming`)
3. **Upload**: Transfer XML file with proper naming convention
4. **Verification**: Confirm successful upload
5. **Cleanup**: Close connection securely

### **File Handling**
- **Format**: UTF-8 encoded XML
- **Size**: Typically 2-5KB per request
- **Frequency**: Variable based on request volume
- **Retention**: Files processed and archived by Parchment

---

## **Quality Assurance**

### **Validation Checks**
- **Schema Validation**: All XML validated against PESC schemas
- **Required Fields**: Verification of all mandatory elements
- **Data Integrity**: Student information completeness checks
- **Format Compliance**: Document ID and file naming validation

### **Error Handling**
- **Connection Failures**: Automatic retry with exponential backoff
- **Upload Failures**: Error logging and alert generation
- **Invalid Data**: Comprehensive validation with user feedback
- **Network Issues**: Robust error recovery and reporting

---

## **Security & Compliance**

### **FERPA Compliance**
- **Consent Tracking**: Complete audit trail of student consent
- **Data Protection**: Encryption in transit and at rest
- **Access Logging**: Full audit trail for compliance reporting
- **Privacy Protection**: Minimal data collection, secure transmission

### **Data Security**
- **Encryption**: TLS 1.2+ for all transmissions
- **Authentication**: Secure credential management
- **Audit Trail**: Complete logging of all transactions
- **Access Control**: Role-based access to sensitive data

---

## **Monitoring & Support**

### **Health Monitoring**
- **Connection Testing**: Regular SFTP connection validation
- **Upload Monitoring**: Success/failure rate tracking
- **Performance Metrics**: Response time and throughput monitoring
- **Error Alerting**: Immediate notification of issues

### **Support Information**
- **Technical Contact**: [Your Technical Lead]
- **Business Contact**: [Your Business Lead]
- **Emergency Support**: 24/7 monitoring for critical issues
- **Documentation**: Comprehensive API and technical documentation

---

## **Implementation Status**

### **Current Status**
- ✅ PESC XML generation fully implemented and tested
- ✅ SFTP client developed and ready for production
- ✅ FERPA compliance implemented and validated
- ✅ Error handling and monitoring systems operational
- 🔄 **Awaiting production SFTP credentials from Parchment**

### **Testing Requirements**
- **Staging Environment**: Available for pre-production testing
- **Test Data**: Sample XML files available for validation
- **Connection Testing**: Ready to test SFTP connectivity immediately
- **Validation**: End-to-end testing once credentials are provided

---

## **Next Steps**

1. **Credential Provision**: Parchment provides production SFTP access
2. **Connection Testing**: Validate SFTP connectivity and permissions
3. **File Format Validation**: Confirm XML format meets Parchment requirements
4. **Production Deployment**: Go-live with full integration
5. **Monitoring Setup**: Establish ongoing monitoring and support

---

**Contact Information:**
- **Technical Lead**: [Name, Email, Phone]
- **Project Manager**: [Name, Email, Phone]
- **Organization**: My Future Capacity
- **Service URL**: [Production URL when available]

**Ready for immediate integration upon receipt of SFTP credentials.**