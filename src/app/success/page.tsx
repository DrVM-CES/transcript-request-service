import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-mfc-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-mfc-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Transcript Request Information
        </h1>
        
        <p className="text-lg text-slate-600 mb-8">
          A saved request or email receipt does not confirm that a transcript has been sent or delivered. Use the reference shown after submission when following up with your school.
        </p>

        {/* What's Next */}
        <div className="bg-mfc-primary-50 rounded-xl p-6 mb-8 text-left">
          <h2 className="text-xl font-bold text-slate-900 mb-4">What Happens Next?</h2>
          <ol className="space-y-3 text-slate-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-mfc-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span><strong>Processing:</strong> Your school or service team must confirm the request can be processed</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-mfc-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span><strong>Delivery:</strong> The delivery method and timing must be confirmed separately</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-mfc-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span><strong>Confirmation:</strong> Ask the receiving institution to confirm receipt</span>
            </li>
          </ol>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border-l-4 border-mfc-blue-600 rounded-r-xl p-6 mb-8 text-left">
          <h3 className="font-bold text-slate-900 mb-2">Important Information</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• If you receive an email receipt, keep it for your records</li>
            <li>• Processing times are not confirmed on this page</li>
            <li>• This page does not verify request status or transcript delivery</li>
            <li>• If you need to follow up, contact your school's registrar office</li>
            <li>• Keep your confirmation email for your records</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-mfc-primary-500 rounded-lg hover:bg-mfc-primary-600 transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return to Home
          </Link>
          
          <a 
            href="https://myfuturecapacity.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-mfc-primary-500 bg-white border-2 border-mfc-primary-500 rounded-lg hover:bg-mfc-primary-50 transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Go to My Future Capacity
          </a>
        </div>

        {/* Help Text */}
        <p className="text-sm text-slate-500 mt-8">
          Questions? Contact your school's guidance office or{' '}
          <Link href="/contact" className="text-mfc-primary-500 hover:underline font-medium">
            contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
