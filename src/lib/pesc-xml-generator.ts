import { v4 as uuidv4 } from 'uuid';

export interface TranscriptRequestData {
  // Student Information
  studentFirstName: string;
  studentLastName: string;
  studentMiddleName?: string;
  studentEmail: string;
  studentDob: string; // YYYY-MM-DD
  studentPartialSsn?: string;
  
  // Current School
  schoolName: string;
  schoolCeeb?: string;
  schoolAddress?: string;
  schoolCity?: string;
  schoolState?: string;
  schoolZip?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  
  // Attendance
  enrollDate?: string;
  exitDate?: string;
  currentEnrollment?: boolean;
  graduationDate?: string;
  
  // Destination
  destinationSchool: string;
  destinationCeeb: string;
  destinationAddress?: string;
  destinationCity?: string;
  destinationState?: string;
  destinationZip?: string;
  
  // Document Info
  documentType?: string;
  requestTrackingId?: string;
}

export function generateTranscriptRequestXML(data: TranscriptRequestData): {
  xml: string;
  documentId: string;
  fileName: string;
} {
  // Generate unique identifiers
  const documentId = uuidv4().replace(/-/g, '');
  const requestTrackingId = data.requestTrackingId || uuidv4().replace(/-/g, '');
  const fileName = `transcript_request_${Date.now()}`;
  const currentDateTime = new Date().toISOString();
  
  // Default values
  const sourceSchoolCeeb = data.schoolCeeb || 'unknown';
  const documentType = data.documentType || 'Transcript - Final';
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ns1:TranscriptRequest
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xmlns:ns1="urn:org:pesc:message:TranscriptRequest:v1.2.0"
 xmlns:ns2="urn:org:pesc:message:ParchmentExtensions:v1.0.0"
 xsi:schemaLocation="urn:org:pesc:message:TranscriptRequest:v1.2.0
 http://www.pesc.org/library/docs/standards/College%20Transcript/TranscriptRequest_v1.2.0.xsd
 urn:org:pesc:core:CoreMain:v1.12.0
 http://www.pesc.org/library/docs/standards/Core%20Main/CoreMain_v1.12.0.xsd
 urn:org:pesc:sector:AcademicRecord:v1.7.0
 http://www.pesc.org/library/docs/standards/High%20School%20Transcript/AcademicRecord_v1.7.0.xsd
 urn:org:pesc:message:ParchmentExtensions:v1.0.0 ParchmentExtensions_v1.0.0.xsd">
 <ns1:TransmissionData>
  <DocumentID>${documentId}</DocumentID>
  <CreatedDateTime>${currentDateTime}</CreatedDateTime>
  <DocumentTypeCode>Request</DocumentTypeCode>
  <TransmissionType>Original</TransmissionType>
  <Source>
   <Organization>
    <CEEBACT>${sourceSchoolCeeb}</CEEBACT>
    <OrganizationName>${escapeXml(data.schoolName)}</OrganizationName>
    ${data.schoolAddress || data.schoolCity || data.schoolState ? `<Contacts>
     <Address>
      ${data.schoolAddress ? `<AddressLine>${escapeXml(data.schoolAddress)}</AddressLine>` : ''}
      ${data.schoolCity ? `<City>${escapeXml(data.schoolCity)}</City>` : ''}
      ${data.schoolState ? `<StateProvinceCode>${escapeXml(data.schoolState)}</StateProvinceCode>` : ''}
      ${data.schoolZip ? `<PostalCode>${escapeXml(data.schoolZip)}</PostalCode>` : ''}
     </Address>
     ${data.schoolPhone ? `<Phone><PhoneNumber>${escapeXml(data.schoolPhone)}</PhoneNumber></Phone>` : ''}
     ${data.schoolEmail ? `<Email><EmailAddress>${escapeXml(data.schoolEmail)}</EmailAddress></Email>` : ''}
    </Contacts>` : ''}
   </Organization>
  </Source>
  <Destination>
   <Organization>
    <CEEBACT>${escapeXml(data.destinationCeeb)}</CEEBACT>
    <OrganizationName>${escapeXml(data.destinationSchool)}</OrganizationName>
    ${data.destinationAddress || data.destinationCity || data.destinationState ? `<Contacts>
     <Address>
      ${data.destinationAddress ? `<AddressLine>${escapeXml(data.destinationAddress)}</AddressLine>` : ''}
      ${data.destinationCity ? `<City>${escapeXml(data.destinationCity)}</City>` : ''}
      ${data.destinationState ? `<StateProvinceCode>${escapeXml(data.destinationState)}</StateProvinceCode>` : ''}
      ${data.destinationZip ? `<PostalCode>${escapeXml(data.destinationZip)}</PostalCode>` : ''}
     </Address>
    </Contacts>` : ''}
   </Organization>
  </Destination>
  <RequestTrackingID>${requestTrackingId}</RequestTrackingID>
  <UserDefinedExtensions>
   <ns2:ParchmentDocumentInfo>
    <ns2:FileName>${fileName}_document.pdf</ns2:FileName>
    <ns2:DocumentType>${escapeXml(documentType)}</ns2:DocumentType>
    <ns2:ExchangeType>PESC XML Document Request and PDF</ns2:ExchangeType>
   </ns2:ParchmentDocumentInfo>
  </UserDefinedExtensions>
 </ns1:TransmissionData>
 <ns1:Request>
  <CreatedDateTime>${currentDateTime}</CreatedDateTime>
  <RequestedStudent>
   <Person>
    ${data.studentPartialSsn ? `<PartialSSN>${escapeXml(data.studentPartialSsn)}</PartialSSN>` : ''}
    <Birth>
     <BirthDate>${escapeXml(data.studentDob)}</BirthDate>
    </Birth>
    <Name>
     <FirstName>${escapeXml(data.studentFirstName)}</FirstName>
     ${data.studentMiddleName ? `<MiddleName>${escapeXml(data.studentMiddleName)}</MiddleName>` : ''}
     <LastName>${escapeXml(data.studentLastName)}</LastName>
    </Name>
    <Contacts>
     <Email>
      <EmailAddress>${escapeXml(data.studentEmail)}</EmailAddress>
     </Email>
    </Contacts>
   </Person>
   <Attendance>
    <School>
     <OrganizationName>${escapeXml(data.schoolName)}</OrganizationName>
     <CEEBACT>${sourceSchoolCeeb}</CEEBACT>
    </School>
    ${data.enrollDate ? `<EnrollDate>${formatDateForPESC(data.enrollDate)}</EnrollDate>` : ''}
    ${data.exitDate ? `<ExitDate>${formatDateForPESC(data.exitDate)}</ExitDate>` : ''}
    <CurrentEnrollmentIndicator>${data.currentEnrollment !== false ? 'true' : 'false'}</CurrentEnrollmentIndicator>
    ${data.graduationDate ? `<AcademicAwards><Reported><AcademicAwardDate>${formatDateForPESC(data.graduationDate)}</AcademicAwardDate></Reported></AcademicAwards>` : ''}
   </Attendance>
   <ReleaseAuthorizedIndicator>true</ReleaseAuthorizedIndicator>
   <ReleaseAuthorizedMethod>ElectronicSignature</ReleaseAuthorizedMethod>
  </RequestedStudent>
 </ns1:Request>
</ns1:TranscriptRequest>`;

  return {
    xml,
    documentId,
    fileName
  };
}

function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDateForPESC(dateString: string): string {
  // Convert YYYY-MM-DD to YYYYMMDD format required by PESC
  return dateString.replace(/-/g, '');
}