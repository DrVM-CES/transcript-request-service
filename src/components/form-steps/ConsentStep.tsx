import { FormButtons } from '../FormButtons';
import { SignatureCanvas } from '../SignatureCanvas';

interface ConsentStepProps {
  data: any;
  errors: Record<string, string>;
  onChange: (updates: any) => void;
  onSubmit: () => void;
  onPrevious: () => void;
  isSubmitting: boolean;
}

const FERPA_DISCLOSURE = `
The Family Educational Rights and Privacy Act (FERPA) (20 U.S.C. § 1232g; 34 CFR Part 99) is a Federal law that protects the privacy of student education records. The law applies to all schools that receive funds under an applicable program of the U.S. Department of Education.

FERPA gives parents certain rights with respect to their children's education records. These rights transfer to the student when he or she reaches the age of 18 or attends a school beyond the high school level. Students to whom the rights have transferred are "eligible students."

Generally, schools must have written permission from the parent or eligible student in order to release any information from a student's education record. However, FERPA allows schools to disclose those records, without consent, to the following parties or under the following conditions:

• School officials with legitimate educational interest;
• Other schools to which a student is transferring;
• Specified officials for audit or evaluation purposes;
• Appropriate parties in connection with financial aid to a student;
• Organizations conducting certain studies for or on behalf of the school;
• Accrediting organizations;
• To comply with a judicial order or lawfully issued subpoena;
• Appropriate officials in cases of health and safety emergencies; and
• State and local authorities, within a juvenile justice system, pursuant to specific State law.

By submitting this transcript request, you are providing written consent for your educational institution to release your academic records to the specified receiving institution for the purpose of college admission or enrollment.

Your consent allows:
1. The release of your official academic transcript
2. Verification of your academic standing
3. Electronic transmission through secure networks
4. Processing by the receiving institution's admissions office

You have the right to:
• Request a copy of records disclosed
• Request an amendment to records you believe are inaccurate
• File a complaint with the U.S. Department of Education if you believe your rights have been violated

This consent is voluntary and you may revoke it at any time before processing is complete.
`;

const MFC_LIABILITY_RELEASE = `
My Future Capacity Liability Release

This transcript request service is provided by My Future Capacity as a courtesy to students and educational institutions. By using this service, you acknowledge and agree to the following:

1. Facilitator Role: My Future Capacity acts solely as a facilitator to transmit transcript requests between students and educational institutions. We do not create, modify, verify, or certify the content of any transcripts.

2. Institutional Responsibility: All transcript content, accuracy, processing, and delivery is the sole responsibility of the originating educational institution (high school, college, or university). My Future Capacity has no control over transcript content or institutional processing timelines.

3. No Guarantee of Delivery: While we use industry-standard secure transmission methods, My Future Capacity does not guarantee the delivery, timeliness, or receipt of transcript requests or transcripts by receiving institutions.

4. Technical Issues: My Future Capacity is not liable for any technical issues, system outages, network failures, or other circumstances beyond our control that may affect the transmission or processing of transcript requests.

5. Information Accuracy: You are solely responsible for ensuring all information provided in your transcript request is accurate and complete. My Future Capacity is not responsible for errors, omissions, or consequences resulting from inaccurate information provided by the student.

6. Third-Party Services: Transcript delivery may involve third-party services (such as SFTP providers, educational networks, or institutional systems). My Future Capacity is not liable for the actions, errors, or omissions of any third-party service providers.

7. Release of Claims: By using this service, you release My Future Capacity, its officers, employees, agents, and affiliates from any and all claims, damages, losses, or liabilities arising from or related to the use of this transcript request service, including but not limited to missed application deadlines, admission decisions, or any other consequences.

8. Service "As Is": This service is provided "as is" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.

If you do not agree to these terms, please do not use this service. Contact your educational institution directly to request transcripts through their standard procedures.
`;

export function ConsentStep({ data, errors, onChange, onSubmit, onPrevious, isSubmitting }: ConsentStepProps) {
  const handleCheckboxChange = (field: string, checked: boolean) => {
    onChange({ [field]: checked });
  };

  const handleSignatureChange = (signature: string) => {
    onChange({ 
      studentSignature: signature,
      // Auto-populate signature date when signature is provided
      signatureDate: signature ? new Date().toISOString().split('T')[0] : ''
    });
  };

  const allConsentGiven = data.ferpaDisclosureRead && 
                          data.mfcLiabilityRead && 
                          data.consentGiven && 
                          data.certifyInformation && 
                          data.studentSignature && 
                          data.signatureDate;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Consent & Authorization
        </h2>
        <p className="text-neutral-600">
          Please review the following information and provide your consent to process your transcript request.
        </p>
      </div>

      {/* FERPA Disclosure */}
      <div className="card bg-neutral-50">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          FERPA Privacy Rights Disclosure
        </h3>
        <div className="max-h-60 overflow-y-auto border border-neutral-200 bg-white p-4 rounded text-sm text-neutral-700 leading-relaxed">
          <pre className="whitespace-pre-wrap font-sans">{FERPA_DISCLOSURE}</pre>
        </div>
      </div>

      {/* MFC Liability Release */}
      <div className="card bg-amber-50 border border-amber-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          My Future Capacity Liability Release
        </h3>
        <div className="max-h-60 overflow-y-auto border border-amber-200 bg-white p-4 rounded text-sm text-neutral-700 leading-relaxed">
          <pre className="whitespace-pre-wrap font-sans">{MFC_LIABILITY_RELEASE}</pre>
        </div>
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-4">
        <div className="border border-neutral-200 rounded-lg p-4">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={data.ferpaDisclosureRead === true}
              onChange={(e) => handleCheckboxChange('ferpaDisclosureRead', e.target.checked)}
              className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 mt-0.5 flex-shrink-0"
            />
            <div>
              <span className="text-sm font-medium text-neutral-900">
                I have read and understand the FERPA disclosure above <span className="text-error-600">*</span>
              </span>
              <p className="text-xs text-neutral-600 mt-1">
                This disclosure explains your privacy rights under federal law.
              </p>
            </div>
          </label>
          {errors.ferpaDisclosureRead && (
            <p className="form-error mt-2">{errors.ferpaDisclosureRead}</p>
          )}
        </div>

        <div className="border border-neutral-200 rounded-lg p-4">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={data.mfcLiabilityRead === true}
              onChange={(e) => handleCheckboxChange('mfcLiabilityRead', e.target.checked)}
              className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 mt-0.5 flex-shrink-0"
            />
            <div>
              <span className="text-sm font-medium text-neutral-900">
                I have read, understand, and agree to the My Future Capacity Liability Release <span className="text-error-600">*</span>
              </span>
              <p className="text-xs text-neutral-600 mt-1">
                This release explains My Future Capacity's role as a facilitator and limits of liability.
              </p>
            </div>
          </label>
          {errors.mfcLiabilityRead && (
            <p className="form-error mt-2">{errors.mfcLiabilityRead}</p>
          )}
        </div>

        <div className="border border-neutral-200 rounded-lg p-4">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={data.consentGiven === true}
              onChange={(e) => handleCheckboxChange('consentGiven', e.target.checked)}
              className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 mt-0.5 flex-shrink-0"
            />
            <div>
              <span className="text-sm font-medium text-neutral-900">
                I consent to the release of my academic transcript <span className="text-error-600">*</span>
              </span>
              <p className="text-xs text-neutral-600 mt-1">
                I authorize my school to release my official academic transcript to the specified receiving institution 
                for the purpose of college admission, enrollment, or scholarship consideration.
              </p>
            </div>
          </label>
          {errors.consentGiven && (
            <p className="form-error mt-2">{errors.consentGiven}</p>
          )}
        </div>

        <div className="border border-neutral-200 rounded-lg p-4">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={data.certifyInformation === true}
              onChange={(e) => handleCheckboxChange('certifyInformation', e.target.checked)}
              className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 mt-0.5 flex-shrink-0"
            />
            <div>
              <span className="text-sm font-medium text-neutral-900">
                I certify that the information provided is accurate <span className="text-error-600">*</span>
              </span>
              <p className="text-xs text-neutral-600 mt-1">
                I certify that all information provided in this request is true and accurate to the best of my knowledge. 
                I understand that providing false information may result in the rejection of my transcript request.
              </p>
            </div>
          </label>
          {errors.certifyInformation && (
            <p className="form-error mt-2">{errors.certifyInformation}</p>
          )}
        </div>
      </div>

      {/* Digital Signature */}
      <div className="card bg-white border-2 border-mfc-primary-500">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Digital Signature
        </h3>
        <p className="text-sm text-neutral-600 mb-4">
          By signing below, you acknowledge that you have read and agree to all statements above, 
          and authorize the release of your transcript as described.
        </p>
        
        <div className="space-y-4">
          <SignatureCanvas
            value={data.studentSignature || ''}
            onChange={handleSignatureChange}
            error={errors.studentSignature}
            label="Your Signature"
            required
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Signature Date <span className="text-error-600">*</span>
            </label>
            <input
              type="date"
              value={data.signatureDate || ''}
              onChange={(e) => onChange({ signatureDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mfc-primary-500 focus:border-transparent"
              required
            />
            {errors.signatureDate && (
              <p className="text-sm text-error-600 mt-1">{errors.signatureDate}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Date will be automatically set when you sign above
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Request Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div><strong>Student:</strong> {data.studentFirstName} {data.studentLastName}</div>
          <div><strong>From:</strong> {data.schoolName}</div>
          <div><strong>To:</strong> {data.destinationSchool} ({data.destinationCeeb})</div>
          <div><strong>Document Type:</strong> {data.documentType}</div>
          <div><strong>Email:</strong> {data.studentEmail}</div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="alert alert-warning">
        <h4 className="font-semibold mb-2">Important Notes</h4>
        <ul className="text-sm space-y-1">
          <li>• This request cannot be cancelled once submitted and processing has begun</li>
          <li>• Processing typically takes 1-3 business days</li>
          <li>• You will not receive a confirmation email, but the receiving institution will be notified</li>
          <li>• Contact your school's registrar if you need to make changes or check status</li>
          <li>• This service is provided free of charge</li>
        </ul>
      </div>

      {!allConsentGiven && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-sm text-yellow-800">
            Please read and acknowledge all consent items above before submitting.
          </p>
        </div>
      )}

      <FormButtons 
        onPrevious={onPrevious}
        onSubmit={allConsentGiven ? onSubmit : undefined}
        isSubmitting={isSubmitting}
        submitLabel="Submit Transcript Request"
        submitDisabled={!allConsentGiven}
      />

      {errors.submit && (
        <div className="alert alert-error">
          {errors.submit}
        </div>
      )}
    </div>
  );
}