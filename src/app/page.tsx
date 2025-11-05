import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <img 
            src="/logo.svg" 
            alt="My Future Capacity - Pathways to Success" 
            className="h-24 w-24"
          />
        </div>
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">
          Request Your Official Transcript
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Submit a secure request for your high school transcript to be sent directly 
          to colleges and universities. This service is completely free and FERPA compliant.
        </p>
        <p className="text-sm text-success-600 font-medium mt-2">
          Powered by My Future Capacity - Creating pathways to success for every student
        </p>
      </div>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Secure & Compliant</h3>
          <p className="text-neutral-600">
            Full FERPA compliance ensures your educational records are protected and handled properly.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-success-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Completely Free</h3>
          <p className="text-neutral-600">
            No fees, no hidden costs. Request as many transcripts as you need at no charge.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-warning-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Fast Processing</h3>
          <p className="text-neutral-600">
            Most transcript requests are processed and sent within 1-3 business days.
          </p>
        </div>
      </div>

      {/* Process Overview */}
      <div className="card">
        <h3 className="text-xl font-semibold text-neutral-900 mb-6">How It Works</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-medium text-neutral-900">Provide Your Information</h4>
              <p className="text-neutral-600">Enter your personal details, current school information, and destination institution.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-medium text-neutral-900">Review & Consent</h4>
              <p className="text-neutral-600">Read the FERPA disclosure and provide your consent for transcript release.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-medium text-neutral-900">Submit Request</h4>
              <p className="text-neutral-600">Your request is securely submitted and processed through the official transcript network.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-success-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              4
            </div>
            <div>
              <h4 className="font-medium text-neutral-900">Transcript Delivered</h4>
              <p className="text-neutral-600">Your official transcript is sent directly to the receiving institution.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="alert alert-info">
        <h4 className="font-semibold mb-2">Important Information</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>This service is for high school students requesting transcripts to be sent to colleges/universities</li>
          <li>You must have attended or currently attend the school from which you're requesting transcripts</li>
          <li>Transcripts are sent electronically through the secure Parchment network</li>
          <li>Processing time is typically 1-3 business days after submission</li>
          <li>You will need your destination institution's CEEB code</li>
        </ul>
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <Link 
          href="/request" 
          className="btn btn-primary text-lg px-8 py-4"
        >
          Start Your Transcript Request
        </Link>
        <p className="text-sm text-neutral-600 mt-4">
          The process takes about 5-10 minutes to complete
        </p>
      </div>
    </div>
  );
}