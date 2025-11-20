'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { transcriptRequestSchema, type TranscriptRequestFormData } from '../lib/validation';
import { StudentInfoStep } from './form-steps/StudentInfoStep';
import { SchoolInfoStep } from './form-steps/SchoolInfoStep';
import { DestinationInfoStep } from './form-steps/DestinationInfoStep';
import { ConsentStep } from './form-steps/ConsentStep';
import { ProgressIndicator } from './ProgressIndicator';
// PDF generation now happens server-side only (via email)

type FormStep = 'student' | 'school' | 'destination' | 'consent' | 'submitted';

interface FormState extends Partial<TranscriptRequestFormData> {}

export function TranscriptRequestForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>('student');
  const [formData, setFormData] = useState<FormState>({
    currentEnrollment: true,
    documentType: 'Transcript - Final'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: { id: FormStep; title: string; description: string }[] = [
    { id: 'student', title: 'Student Info', description: 'Personal information' },
    { id: 'school', title: 'Current School', description: 'School details' },
    { id: 'destination', title: 'Destination', description: 'Where to send' },
    { id: 'consent', title: 'Consent', description: 'FERPA & permissions' },
  ];

  const updateFormData = (updates: Partial<FormState>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => delete newErrors[field]);
      return newErrors;
    });
  };

  const validateStep = (step: FormStep): boolean => {
    try {
      switch (step) {
        case 'student':
          transcriptRequestSchema.pick({
            studentFirstName: true,
            studentLastName: true,
            studentEmail: true,
            studentDob: true,
          }).parse(formData);
          break;
        case 'school':
          transcriptRequestSchema.pick({
            schoolName: true,
          }).parse(formData);
          break;
        case 'destination':
          transcriptRequestSchema.pick({
            destinationSchool: true,
            destinationCeeb: true,
          }).parse(formData);
          break;
        case 'consent':
          transcriptRequestSchema.pick({
            ferpaDisclosureRead: true,
            mfcLiabilityRead: true,
            consentGiven: true,
            certifyInformation: true,
            studentSignature: true,
            signatureDate: true,
          }).parse(formData);
          break;
      }
      setErrors({});
      return true;
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const goToNextStep = () => {
    if (!validateStep(currentStep)) return;

    const stepOrder: FormStep[] = ['student', 'school', 'destination', 'consent'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    } else if (currentStep === 'consent') {
      handleSubmit();
    }
  };

  const goToPreviousStep = () => {
    const stepOrder: FormStep[] = ['student', 'school', 'destination', 'consent'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    console.log('====== SUBMIT HANDLER CALLED ======');
    console.log('Form data:', JSON.stringify(formData, null, 2));
    console.log('isSubmitting:', isSubmitting);
    console.log('Submit clicked - starting validation');
    if (!validateStep('consent')) {
      console.log('Consent validation failed');
      console.log('Validation errors:', errors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Final validation
      console.log('Parsing form data with Zod...');
      const validatedData = transcriptRequestSchema.parse(formData);
      console.log('Validation passed, submitting to API...');
      
      const response = await fetch('/api/submit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API error:', error);
        throw new Error(error.message || 'Failed to submit request');
      }

      const result = await response.json();
      console.log('Submission successful, generating PDF...');
      // PDF is generated server-side and sent via email
      // (No client-side PDF download needed)
      
      // Redirect to success page
      console.log('Redirecting to success page...');
      router.push('/success');
    } catch (error: any) {
      console.error('Submission error:', error);
      setErrors({ submit: error.message || 'Failed to submit request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStep === 'submitted') {
    return (
      <div className="card text-center">
        <div className="w-16 h-16 bg-success-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
          Request Submitted Successfully!
        </h2>
        <p className="text-neutral-600 mb-6">
          Your transcript request has been submitted and will be processed within 1-3 business days. 
          The receiving institution will be notified once your transcript has been delivered.
        </p>
        <div className="bg-neutral-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-neutral-600">
            <strong>Next Steps:</strong>
          </p>
          <ul className="text-sm text-neutral-600 mt-2 space-y-1">
            <li>• Your high school will verify and process your request</li>
            <li>• The official transcript will be sent electronically</li>
            <li>• The receiving institution will confirm receipt</li>
            <li>• Processing typically takes 1-3 business days</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.href = '/'}
          className="btn btn-primary"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProgressIndicator 
        steps={steps} 
        currentStep={currentStep} 
      />

      <div className="card">
        {errors.submit && (
          <div className="alert alert-error mb-6">
            {errors.submit}
          </div>
        )}

        {currentStep === 'student' && (
          <StudentInfoStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
            onNext={goToNextStep}
          />
        )}

        {currentStep === 'school' && (
          <SchoolInfoStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        )}

        {currentStep === 'destination' && (
          <DestinationInfoStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        )}

        {currentStep === 'consent' && (
          <ConsentStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
            onSubmit={handleSubmit}
            onPrevious={goToPreviousStep}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}