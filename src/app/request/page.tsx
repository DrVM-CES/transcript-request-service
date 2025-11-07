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
          All information is secure and FERPA compliant.
        </p>
      </div>

      <TranscriptRequestForm />
    </div>
  );
}