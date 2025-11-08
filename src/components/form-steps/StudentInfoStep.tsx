import { FormButtons } from '../FormButtons';
import { DatePicker } from '../DatePicker';

interface StudentInfoStepProps {
  data: any;
  errors: Record<string, string>;
  onChange: (updates: any) => void;
  onNext: () => void;
}

export function StudentInfoStep({ data, errors, onChange, onNext }: StudentInfoStepProps) {
  const handleInputChange = (field: string, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Student Information
        </h2>
        <p className="text-neutral-600">
          Please provide your personal information as it appears on your school records.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="form-label">
            First Name <span className="text-error-600">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={data.studentFirstName || ''}
            onChange={(e) => handleInputChange('studentFirstName', e.target.value)}
            placeholder="Enter your first name"
          />
          {errors.studentFirstName && (
            <p className="form-error">{errors.studentFirstName}</p>
          )}
        </div>

        <div>
          <label className="form-label">
            Last Name <span className="text-error-600">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={data.studentLastName || ''}
            onChange={(e) => handleInputChange('studentLastName', e.target.value)}
            placeholder="Enter your last name"
          />
          {errors.studentLastName && (
            <p className="form-error">{errors.studentLastName}</p>
          )}
        </div>

        <div>
          <label className="form-label">
            Middle Name
          </label>
          <input
            type="text"
            className="form-input"
            value={data.studentMiddleName || ''}
            onChange={(e) => handleInputChange('studentMiddleName', e.target.value)}
            placeholder="Enter your middle name (optional)"
          />
          {errors.studentMiddleName && (
            <p className="form-error">{errors.studentMiddleName}</p>
          )}
        </div>

        <DatePicker
          id="studentDob"
          name="studentDob"
          value={data.studentDob || ''}
          onChange={(value) => handleInputChange('studentDob', value)}
          label="Date of Birth"
          required
          error={errors.studentDob}
          minAge={14}
          maxAge={100}
          placeholder="MM/DD/YYYY"
        />

        <div className="md:col-span-2">
          <label className="form-label">
            Email Address <span className="text-error-600">*</span>
          </label>
          <input
            type="email"
            className="form-input"
            value={data.studentEmail || ''}
            onChange={(e) => handleInputChange('studentEmail', e.target.value)}
            placeholder="Enter your email address"
          />
          {errors.studentEmail && (
            <p className="form-error">{errors.studentEmail}</p>
          )}
          <p className="text-sm text-neutral-600 mt-1">
            This email will be used for any communication regarding your transcript request.
          </p>
        </div>

        <div>
          <label className="form-label">
            Last 4 Digits of SSN
          </label>
          <input
            type="text"
            className="form-input"
            value={data.studentPartialSsn || ''}
            onChange={(e) => handleInputChange('studentPartialSsn', e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="1234"
            maxLength={4}
          />
          {errors.studentPartialSsn && (
            <p className="form-error">{errors.studentPartialSsn}</p>
          )}
          <p className="text-sm text-neutral-600 mt-1">
            Optional but recommended for identity verification.
          </p>
        </div>
      </div>

      <div className="alert alert-info">
        <h4 className="font-semibold mb-2">Privacy Notice</h4>
        <p className="text-sm">
          Your personal information is protected by FERPA and will only be used to process your transcript request. 
          We use secure encryption to protect your data during transmission and storage.
        </p>
      </div>

      <FormButtons 
        onNext={onNext}
        nextLabel="Continue to School Information"
      />
    </div>
  );
}