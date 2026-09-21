import { publicSubmissionsEnabled } from '../../lib/delivery-policy';
export const dynamic = 'force-dynamic';
import { TranscriptRequestForm } from '../../components/TranscriptRequestForm';

export default function RequestPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Request Your Transcript
        </h1>
        <p className="text-lg text-neutral-600">
          Complete the following steps to submit your official transcript request. 
          Submission records your request; transcript delivery must be confirmed separately.
        </p>
      </div>

      {publicSubmissionsEnabled(process.env)
        ? <TranscriptRequestForm />
        : <p role="status" className="rounded-lg border p-6">Public transcript requests are not available yet. Please contact your school or MFC administrator.</p>}
    </div>
  );
}