import { useState, useEffect } from 'react';
import { lookupSchoolByCeeb, determineProcessingMethod, getProcessingInstructions, type SchoolInfo } from '@/lib/school-lookup';

interface DestinationInfoStepProps {
  data: any;
  errors: Record<string, string>;
  onChange: (updates: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'Transcript', label: 'Standard Transcript' },
  { value: 'Transcript - Final', label: 'Final Transcript (Recommended)' },
  { value: 'Transcript - Initial', label: 'Initial Transcript' },
  { value: 'Transcript - Midyear', label: 'Midyear Transcript' },
  { value: 'Transcript - Optional', label: 'Optional Transcript' },
];

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

export function DestinationInfoStep({ data, errors, onChange, onNext, onPrevious }: DestinationInfoStepProps) {
  const [destinationSchool, setDestinationSchool] = useState<SchoolInfo | null>(null);
  const [processingInfo, setProcessingInfo] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    onChange({ [field]: value });
    
    // If CEEB code changes, lookup school info
    if (field === 'destinationCeeb' && value.length === 6) {
      lookupDestinationSchool(value);
    }
  };

  const lookupDestinationSchool = async (ceebCode: string) => {
    setIsLookingUp(true);
    try {
      const school = await lookupSchoolByCeeb(ceebCode);
      setDestinationSchool(school);
      
      if (school) {
        // Auto-populate school name if found
        onChange({ destinationSchool: school.name });
        
        // Determine processing method (assuming source school for now)
        const sourceSchool = data.schoolCeeb ? await lookupSchoolByCeeb(data.schoolCeeb) : null;
        const method = determineProcessingMethod(sourceSchool, school);
        setProcessingInfo(method);
      }
    } catch (error) {
      console.error('School lookup failed:', error);
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Destination Institution
        </h2>
        <p className="text-neutral-600">
          Please provide information about where you want your transcript sent.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="form-label">
            Institution Name <span className="text-error-600">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={data.destinationSchool || ''}
            onChange={(e) => handleInputChange('destinationSchool', e.target.value)}
            placeholder="University name or college name"
          />
          {errors.destinationSchool && (
            <p className="form-error">{errors.destinationSchool}</p>
          )}
        </div>

        <div>
          <label className="form-label">
            Institution CEEB Code <span className="text-error-600">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={data.destinationCeeb || ''}
            onChange={(e) => handleInputChange('destinationCeeb', e.target.value.toUpperCase())}
            placeholder="123456"
            maxLength={6}
          />
          {errors.destinationCeeb && (
            <p className="form-error">{errors.destinationCeeb}</p>
          )}
          <p className="text-sm text-neutral-600 mt-1">
            You can find the CEEB code on the institution's admissions website or by contacting their admissions office.
          </p>
        </div>

        <div>
          <label className="form-label">
            Institution Address
          </label>
          <input
            type="text"
            className="form-input"
            value={data.destinationAddress || ''}
            onChange={(e) => handleInputChange('destinationAddress', e.target.value)}
            placeholder="Street address (optional)"
          />
          {errors.destinationAddress && (
            <p className="form-error">{errors.destinationAddress}</p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="form-label">
              City
            </label>
            <input
              type="text"
              className="form-input"
              value={data.destinationCity || ''}
              onChange={(e) => handleInputChange('destinationCity', e.target.value)}
              placeholder="City"
            />
            {errors.destinationCity && (
              <p className="form-error">{errors.destinationCity}</p>
            )}
          </div>

          <div>
            <label className="form-label">
              State
            </label>
            <select
              className="form-input"
              value={data.destinationState || ''}
              onChange={(e) => handleInputChange('destinationState', e.target.value)}
            >
              <option value="">Select State</option>
              {US_STATES.map(state => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors.destinationState && (
              <p className="form-error">{errors.destinationState}</p>
            )}
          </div>

          <div>
            <label className="form-label">
              ZIP Code
            </label>
            <input
              type="text"
              className="form-input"
              value={data.destinationZip || ''}
              onChange={(e) => handleInputChange('destinationZip', e.target.value)}
              placeholder="12345"
            />
            {errors.destinationZip && (
              <p className="form-error">{errors.destinationZip}</p>
            )}
          </div>
        </div>

        <div>
          <label className="form-label">
            Document Type
          </label>
          <select
            className="form-input"
            value={data.documentType || 'Transcript - Final'}
            onChange={(e) => handleInputChange('documentType', e.target.value)}
          >
            {DOCUMENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.documentType && (
            <p className="form-error">{errors.documentType}</p>
          )}
          <p className="text-sm text-neutral-600 mt-1">
            "Final Transcript" is recommended for college applications as it includes all completed coursework.
          </p>
        </div>
      </div>

      {/* Processing Method Information */}
      {processingInfo && (
        <div className={`border rounded-lg p-4 ${
          processingInfo.method === 'PARCHMENT' ? 'bg-green-50 border-green-200' :
          processingInfo.method === 'HYBRID' ? 'bg-yellow-50 border-yellow-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
              processingInfo.method === 'PARCHMENT' ? 'bg-green-600 text-white' :
              processingInfo.method === 'HYBRID' ? 'bg-yellow-600 text-white' :
              'bg-blue-600 text-white'
            }`}>
              {processingInfo.method === 'PARCHMENT' ? '⚡' : processingInfo.method === 'HYBRID' ? '🔄' : '📋'}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-neutral-900 mb-1">
                Processing Method: {processingInfo.method}
              </h4>
              <p className="text-sm text-neutral-700 mb-2">
                {processingInfo.description}
              </p>
              <p className="text-sm font-medium text-neutral-900">
                Estimated Time: {processingInfo.estimatedTime}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* School Lookup Status */}
      {destinationSchool && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-green-800">
              Institution Verified: {destinationSchool.name}
            </span>
          </div>
          {destinationSchool.inParchmentNetwork && (
            <p className="text-xs text-green-700 mt-1">
              ✓ This institution participates in electronic transcript delivery
            </p>
          )}
        </div>
      )}

      {data.destinationCeeb && data.destinationCeeb.length === 6 && !destinationSchool && !isLookingUp && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-yellow-800">
              Institution not found in directory
            </span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            This may require manual processing. Please verify the CEEB code is correct.
          </p>
        </div>
      )}

      <div className="alert alert-info">
        <h4 className="font-semibold mb-2">Important Information</h4>
        <ul className="text-sm space-y-1">
          <li>• Make sure the institution name and CEEB code are correct</li>
          <li>• Processing method depends on institutional network participation</li>
          <li>• You can find CEEB codes on institution websites or admissions offices</li>
          <li>• The receiving institution will be notified when the transcript is delivered</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <button 
          onClick={onPrevious}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <button 
          onClick={onNext}
          className="btn btn-primary"
        >
          Continue to Consent
        </button>
      </div>
    </div>
  );
}