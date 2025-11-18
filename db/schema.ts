import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const transcriptRequests = sqliteTable('transcript_requests', {
  id: text('id').primaryKey(),
  // Student Information
  studentFirstName: text('student_first_name').notNull(),
  studentLastName: text('student_last_name').notNull(),
  studentMiddleName: text('student_middle_name'),
  studentEmail: text('student_email').notNull(),
  studentDob: text('student_dob').notNull(), // YYYY-MM-DD format
  studentPartialSsn: text('student_partial_ssn'), // Last 4 digits only
  
  // Current School Information
  schoolName: text('school_name').notNull(),
  schoolCeeb: text('school_ceeb'),
  schoolAddress: text('school_address'),
  schoolCity: text('school_city'),
  schoolState: text('school_state'),
  schoolZip: text('school_zip'),
  schoolPhone: text('school_phone'),
  schoolEmail: text('school_email'),
  
  // Student Attendance Info
  enrollDate: text('enroll_date'),
  exitDate: text('exit_date'),
  currentEnrollment: integer('current_enrollment', { mode: 'boolean' }).default(true),
  graduationDate: text('graduation_date'),
  
  // Destination Institution
  destinationSchool: text('destination_school').notNull(),
  destinationCeeb: text('destination_ceeb').notNull(),
  destinationAddress: text('destination_address'),
  destinationCity: text('destination_city'),
  destinationState: text('destination_state'),
  destinationZip: text('destination_zip'),
  
  // Document Information
  documentType: text('document_type').notNull().default('Transcript - Final'),
  requestTrackingId: text('request_tracking_id'),
  parchmentDocumentId: text('parchment_document_id'),
  
  // Compliance and Consent
  consentGiven: integer('consent_given', { mode: 'boolean' }).notNull(),
  consentTimestamp: integer('consent_timestamp', { mode: 'timestamp' }).notNull(),
  ferpaDisclosureShown: integer('ferpa_disclosure_shown', { mode: 'boolean' }).notNull(),
  mfcLiabilityAgreed: integer('mfc_liability_agreed', { mode: 'boolean' }).notNull(),
  releaseAuthorizedMethod: text('release_authorized_method').notNull().default('ElectronicSignature'),
  
  // Digital Signature
  studentSignature: text('student_signature').notNull(), // Base64 encoded PNG
  signatureDate: text('signature_date').notNull(), // YYYY-MM-DD format
  
  // Processing Information
  requestXml: text('request_xml').notNull(),
  status: text('status').notNull().default('submitted'), // submitted, processing, delivered, failed
  statusMessage: text('status_message'),
  
  // Audit Trail
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});

export type TranscriptRequest = typeof transcriptRequests.$inferSelect;
export type NewTranscriptRequest = typeof transcriptRequests.$inferInsert;

// Schools database for autocomplete
export const schools = sqliteTable('schools', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  schoolName: text('school_name').notNull(),
  schoolType: text('school_type').notNull(), // 'High School', 'University', 'Community College', 'Trade School'
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull().default('USA'),
  address: text('address'), // Street address
  zip: text('zip'), // ZIP code
  phone: text('phone'), // Phone number
  ceebCode: text('ceeb_code'),
  federalSchoolCode: text('federal_school_code'),
  website: text('website'),
  notes: text('notes'),
  searchText: text('search_text').notNull(), // Lowercase text for searching
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;