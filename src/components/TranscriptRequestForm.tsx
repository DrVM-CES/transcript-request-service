'use client';

import { useState } from 'react';
import { transcriptRequestSchema, type TranscriptRequestFormData } from '../lib/validation';

interface TranscriptRequestFormProps {
  onSubmit?: (data: TranscriptRequestFormData) => void;
}

export function TranscriptRequestForm({ onSubmit }: TranscriptRequestFormProps) {
  const [formData, setFormData] = useState<Partial<TranscriptRequestFormData>>({
    documentType: 'Transcript - Final',
    currentEnrollment: true,
    consentGiven: false,
    ferpaDisclosureShown: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validationResult = transcriptRequestSchema.safeParse(formData);
      
      if (!validationResult.success) {
        const fieldErrors = validationResult.error.flatten().fieldErrors;
        const errorMap: Record<string, string> = {};
        
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          errorMap[field] = messages?.[0] || 'Invalid value';
        });
        
        setErrors(errorMap);
        return;
      }

      if (onSubmit) {
        onSubmit(validationResult.data);
      } else {
        // Default submission to our API
        const response = await fetch('/api/submit-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validationResult.data),
        });

        const result = await response.json();
        
        if (result.success) {
          alert(`Transcript request submitted successfully! Tracking ID: ${result.trackingId}`);
          // Reset form
          setFormData({
            documentType: 'Transcript - Final',
            currentEnrollment: true,
            consentGiven: false,
            ferpaDisclosureShown: false,
          });
        } else {
          alert(`Error: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('An error occurred while submitting the request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof TranscriptRequestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Student Information */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Student Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">First Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.studentFirstName || ''}
              onChange={(e) => updateField('studentFirstName', e.target.value)}
            />
            {errors.studentFirstName && (
              <div className="form-error">{errors.studentFirstName}</div>
            )}
          </div>
          
          <div>
            <label className="form-label">Last Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.studentLastName || ''}
              onChange={(e) => updateField('studentLastName', e.target.value)}
            />
            {errors.studentLastName && (
              <div className="form-error">{errors.studentLastName}</div>
            )}
          </div>

          <div>
            <label className="form-label">Middle Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.studentMiddleName || ''}
              onChange={(e) => updateField('studentMiddleName', e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-input"
              value={formData.studentEmail || ''}
              onChange={(e) => updateField('studentEmail', e.target.value)}
            />
            {errors.studentEmail && (
              <div className="form-error">{errors.studentEmail}</div>
            )}
          </div>

          <div>
            <label className="form-label">Date of Birth *</label>
            <input
              type="date"
              className="form-input"
              value={formData.studentDob || ''}
              onChange={(e) => updateField('studentDob', e.target.value)}
            />
            {errors.studentDob && (
              <div className="form-error">{errors.studentDob}</div>
            )}
          </div>

          <div>
            <label className="form-label">Last 4 digits of SSN</label>
            <input
              type="text"
              className="form-input"
              maxLength={4}
              value={formData.studentPartialSsn || ''}
              onChange={(e) => updateField('studentPartialSsn', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* School Information */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Current School Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">School Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.schoolName || ''}
              onChange={(e) => updateField('schoolName', e.target.value)}
            />
            {errors.schoolName && (
              <div className="form-error">{errors.schoolName}</div>
            )}
          </div>

          <div>
            <label className="form-label">CEEB Code</label>
            <input
              type="text"
              className="form-input"
              value={formData.schoolCeeb || ''}
              onChange={(e) => updateField('schoolCeeb', e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">School Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.schoolEmail || ''}
              onChange={(e) => updateField('schoolEmail', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Destination School */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Destination School</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">School Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.destinationSchool || ''}
              onChange={(e) => updateField('destinationSchool', e.target.value)}
            />
            {errors.destinationSchool && (
              <div className="form-error">{errors.destinationSchool}</div>
            )}
          </div>

          <div>
            <label className="form-label">CEEB Code *</label>
            <input
              type="text"
              className="form-input"
              value={formData.destinationCeeb || ''}
              onChange={(e) => updateField('destinationCeeb', e.target.value)}
            />
            {errors.destinationCeeb && (
              <div className="form-error">{errors.destinationCeeb}</div>
            )}
          </div>
        </div>
      </section>

      {/* Document Type */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Document Information</h2>
        <div>
          <label className="form-label">Document Type</label>
          <select
            className="form-input"
            value={formData.documentType || ''}
            onChange={(e) => updateField('documentType', e.target.value)}
          >
            <option value="Transcript - Final">Final Transcript</option>
            <option value="Transcript - Partial">Partial Transcript</option>
            <option value="Transcript - Unofficial">Unofficial Transcript</option>
          </select>
        </div>
      </section>

      {/* FERPA Consent */}
      <section>
        <h2 className="text-xl font-semibold mb-4">FERPA Consent & Authorization</h2>
        
        <div className="alert alert-info mb-4">
          <h3 className="font-semibold">Family Educational Rights and Privacy Act (FERPA) Notice</h3>
          <p className="mt-2 text-sm">
            By requesting this transcript, you are authorizing the release of your educational records 
            to the specified institution. Under FERPA, you have the right to inspect and review your 
            educational records, request amendments to records you believe are inaccurate, and file 
            complaints with the U.S. Department of Education concerning alleged failures to comply with FERPA.
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={formData.ferpaDisclosureShown || false}
              onChange={(e) => updateField('ferpaDisclosureShown', e.target.checked)}
            />
            <span className="text-sm">
              I have read and understand the FERPA disclosure above *
            </span>
          </label>
          {errors.ferpaDisclosureShown && (
            <div className="form-error">{errors.ferpaDisclosureShown}</div>
          )}

          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={formData.consentGiven || false}
              onChange={(e) => updateField('consentGiven', e.target.checked)}
            />
            <span className="text-sm">
              I consent to the release of my educational records to the specified institution *
            </span>
          </label>
          {errors.consentGiven && (
            <div className="form-error">{errors.consentGiven}</div>
          )}
        </div>
      </section>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary px-8 py-3 text-lg"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Transcript Request'}
        </button>
      </div>
    </form>
  );
}
