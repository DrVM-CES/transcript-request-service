import { FormButtons } from '../FormButtons';
import { DatePicker } from '../DatePicker';
import { SchoolAutocomplete } from '../SchoolAutocomplete';

interface SchoolInfoStepProps {
  data: any;
  errors: Record<string, string>;
  onChange: (updates: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

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

export function SchoolInfoStep({ data, errors, onChange, onNext, onPrevious }: SchoolInfoStepProps) {
  const handleInputChange = (field: string, value: string) => {
    onChange({ [field]: value });
  };

  const handlePhoneChange = (value: string) => {
    // Format phone number as (xxx) xxx-xxxx
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      onChange({ schoolPhone: `(${match[1]}) ${match[2]}-${match[3]}` });
    } else if (cleaned.length <= 10) {
      onChange({ schoolPhone: value });
    }
  };

  const handleSchoolSelect = (school: any) => {
    // Auto-fill school information when selected from autocomplete
    onChange({
      schoolName: school.schoolName,
      schoolCeeb: school.ceebCode || '',
      schoolAddress: school.address || '',
      schoolCity: school.city,
      schoolState: school.state,
      schoolZip: school.zip || '',
      schoolPhone: school.phone || '',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Current School Information
        </h2>
        <p className="text-neutral-600">
          Please provide information about the high school from which you're requesting a transcript.
        </p>
      </div>

      <div className="space-y-6">
        <SchoolAutocomplete
          id="schoolName"
          name="schoolName"
          value={data.schoolName || ''}
          onChange={(value) => handleInputChange('schoolName', value)}
          onSchoolSelect={handleSchoolSelect}
          label="School Name"
          required
          error={errors.schoolName}
          placeholder="Start typing your high school name..."
          schoolType="High School"
        />

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">
              CEEB Code
            </label>
            <input
              type="text"
              className="form-input"
              value={data.schoolCeeb || ''}
              onChange={(e) => handleInputChange('schoolCeeb', e.target.value.toUpperCase())}
              placeholder="123456"
              maxLength={6}
            />
            {errors.schoolCeeb && (
              <p className="form-error">{errors.schoolCeeb}</p>
            )}
            <p className="text-sm text-neutral-600 mt-1">
              If you don't know your school's CEEB code, leave this blank.
            </p>
          </div>

          <div>
            <label className="form-label">
              School Phone
            </label>
            <input
              type="tel"
              className="form-input"
              value={data.schoolPhone || ''}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(555) 123-4567"
            />
            {errors.schoolPhone && (
              <p className="form-error">{errors.schoolPhone}</p>
            )}
          </div>
        </div>

        <div>
          <label className="form-label">
            School Address
          </label>
          <input
            type="text"
            className="form-input"
            value={data.schoolAddress || ''}
            onChange={(e) => handleInputChange('schoolAddress', e.target.value)}
            placeholder="Street address"
          />
          {errors.schoolAddress && (
            <p className="form-error">{errors.schoolAddress}</p>
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
              value={data.schoolCity || ''}
              onChange={(e) => handleInputChange('schoolCity', e.target.value)}
              placeholder="City"
            />
            {errors.schoolCity && (
              <p className="form-error">{errors.schoolCity}</p>
            )}
          </div>

          <div>
            <label className="form-label">
              State
            </label>
            <select
              className="form-input"
              value={data.schoolState || ''}
              onChange={(e) => handleInputChange('schoolState', e.target.value)}
            >
              <option value="">Select State</option>
              {US_STATES.map(state => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors.schoolState && (
              <p className="form-error">{errors.schoolState}</p>
            )}
          </div>

          <div>
            <label className="form-label">
              ZIP Code
            </label>
            <input
              type="text"
              className="form-input"
              value={data.schoolZip || ''}
              onChange={(e) => handleInputChange('schoolZip', e.target.value)}
              placeholder="12345"
            />
            {errors.schoolZip && (
              <p className="form-error">{errors.schoolZip}</p>
            )}
          </div>
        </div>

        <div>
          <label className="form-label">
            School Email
          </label>
          <input
            type="email"
            className="form-input"
            value={data.schoolEmail || ''}
            onChange={(e) => handleInputChange('schoolEmail', e.target.value)}
            placeholder="registrar@school.edu"
          />
          {errors.schoolEmail && (
            <p className="form-error">{errors.schoolEmail}</p>
          )}
        </div>

        <div className="border-t border-neutral-200 pt-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Attendance Information
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <DatePicker
              id="enrollDate"
              name="enrollDate"
              value={data.enrollDate || ''}
              onChange={(value) => handleInputChange('enrollDate', value)}
              label="Enrollment Date"
              error={errors.enrollDate}
              placeholder="MM/DD/YYYY"
            />

            <DatePicker
              id="graduationDate"
              name="graduationDate"
              value={data.graduationDate || ''}
              onChange={(value) => handleInputChange('graduationDate', value)}
              label="Expected Graduation Date"
              error={errors.graduationDate}
              placeholder="MM/DD/YYYY"
            />
          </div>

          <div className="mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data.currentEnrollment === true}
                onChange={(e) => onChange({ currentEnrollment: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-900">
                I am currently enrolled at this school
              </span>
            </label>
          </div>

          {!data.currentEnrollment && (
            <div className="mt-4">
              <DatePicker
                id="exitDate"
                name="exitDate"
                value={data.exitDate || ''}
                onChange={(value) => handleInputChange('exitDate', value)}
                label="Exit Date"
                error={errors.exitDate}
                placeholder="MM/DD/YYYY"
              />
            </div>
          )}
        </div>
      </div>

      <FormButtons 
        onPrevious={onPrevious}
        onNext={onNext}
        nextLabel="Continue to Destination"
      />
    </div>
  );
}