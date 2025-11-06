import { TranscriptRequestForm } from '../../components/TranscriptRequestForm';

export default function RequestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Request Official Transcript
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Submit a request for your official academic transcript to be sent directly 
            to your chosen institution. All requests are processed electronically and 
            comply with FERPA regulations.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <TranscriptRequestForm />
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Questions about your transcript request? Contact your school registrar 
            or admissions office for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
