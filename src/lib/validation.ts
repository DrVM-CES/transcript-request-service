import { z } from 'zod';

const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
const ceebCodeRegex = /^[A-Za-z0-9]{6}$/;
const ssnLastFourRegex = /^\d{4}$/;

export const transcriptRequestSchema = z.object({
  // Student Information
  studentFirstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less'),
  
  studentLastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less'),
  
  studentMiddleName: z.string()
    .max(50, 'Middle name must be 50 characters or less')
    .optional(),
  
  studentEmail: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be 100 characters or less'),
  
  studentDob: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter date in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      const now = new Date();
      const age = now.getFullYear() - parsedDate.getFullYear();
      return age >= 14 && age <= 100;
    }, 'Student must be between 14 and 100 years old'),
  
  studentPartialSsn: z.string()
    .regex(ssnLastFourRegex, 'Please enter the last 4 digits of SSN')
    .optional()
    .or(z.literal('')),

  // Current School Information
  schoolName: z.string()
    .min(1, 'School name is required')
    .max(100, 'School name must be 100 characters or less'),
  
  schoolCeeb: z.string()
    .regex(ceebCodeRegex, 'CEEB code must be 6 alphanumeric characters')
    .optional()
    .or(z.literal('')),
  
  schoolAddress: z.string()
    .max(100, 'Address must be 100 characters or less')
    .optional(),
  
  schoolCity: z.string()
    .max(50, 'City must be 50 characters or less')
    .optional(),
  
  schoolState: z.string()
    .length(2, 'State must be 2 characters')
    .optional()
    .or(z.literal('')),
  
  schoolZip: z.string()
    .optional()
    .refine((val) => !val || /^\d{5}(-\d{4})?$/.test(val), {
      message: 'Please enter a valid ZIP code'
    }),
  
  schoolPhone: z.string()
    .regex(phoneRegex, 'Please enter phone in format (xxx) xxx-xxxx')
    .optional()
    .or(z.literal('')),
  
  schoolEmail: z.string()
    .email('Please enter a valid school email address')
    .optional()
    .or(z.literal('')),

  // Student Attendance Information
  enrollDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter date in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  
  exitDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter date in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  
  currentEnrollment: z.boolean().default(true),
  
  graduationDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter date in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),

  // Destination Institution
  destinationSchool: z.string()
    .min(1, 'Destination school name is required')
    .max(100, 'Destination school name must be 100 characters or less'),
  
  destinationCeeb: z.string()
    .regex(ceebCodeRegex, 'CEEB code must be 6 alphanumeric characters')
    .min(1, 'Destination CEEB code is required'),
  
  destinationAddress: z.string()
    .max(100, 'Address must be 100 characters or less')
    .optional(),
  
  destinationCity: z.string()
    .max(50, 'City must be 50 characters or less')
    .optional(),
  
  destinationState: z.string()
    .length(2, 'State must be 2 characters')
    .optional()
    .or(z.literal('')),
  
  destinationZip: z.string()
    .optional()
    .transform(val => !val || val === '' ? undefined : val)
    .refine((val) => val === undefined || /^\d{5}(-\d{4})?$/.test(val), {
      message: 'Please enter a valid ZIP code'
    }),

  // Document Type
  documentType: z.enum([
    'Transcript',
    'Transcript - Final',
    'Transcript - Initial',
    'Transcript - Midyear',
    'Transcript - Optional'
  ]).default('Transcript - Final'),

  // Compliance and Consent
  ferpaDisclosureRead: z.boolean()
    .refine(val => val === true, 'You must read and acknowledge the FERPA disclosure'),
  
  consentGiven: z.boolean()
    .refine(val => val === true, 'You must provide consent to release your transcript'),
  
  certifyInformation: z.boolean()
    .refine(val => val === true, 'You must certify that the information provided is accurate'),
});

export type TranscriptRequestFormData = z.infer<typeof transcriptRequestSchema>;

// Validation for individual form steps
export const studentInfoSchema = transcriptRequestSchema.pick({
  studentFirstName: true,
  studentLastName: true,
  studentMiddleName: true,
  studentEmail: true,
  studentDob: true,
  studentPartialSsn: true,
});

export const schoolInfoSchema = transcriptRequestSchema.pick({
  schoolName: true,
  schoolCeeb: true,
  schoolAddress: true,
  schoolCity: true,
  schoolState: true,
  schoolZip: true,
  schoolPhone: true,
  schoolEmail: true,
  enrollDate: true,
  exitDate: true,
  currentEnrollment: true,
  graduationDate: true,
});

export const destinationInfoSchema = transcriptRequestSchema.pick({
  destinationSchool: true,
  destinationCeeb: true,
  destinationAddress: true,
  destinationCity: true,
  destinationState: true,
  destinationZip: true,
  documentType: true,
});

export const consentSchema = transcriptRequestSchema.pick({
  ferpaDisclosureRead: true,
  consentGiven: true,
  certifyInformation: true,
});