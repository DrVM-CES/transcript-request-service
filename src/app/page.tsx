import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
          Request Your Official Transcript
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
          Submit a secure request for your high school transcript to be sent directly 
          to colleges and universities. Completely free and FERPA compliant.
        </p>
        <Link 
          href="/request" 
          className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-mfc-purple-600 rounded-lg hover:bg-mfc-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Start Your Request
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <p className="text-sm text-slate-500 mt-4">
          Takes about 5-10 minutes • No credit card required
        </p>
      </div>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center hover:shadow-lg transition-all">
          <div className="w-16 h-16 bg-mfc-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-mfc-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Secure & Compliant</h3>
          <p className="text-slate-600 leading-relaxed">
            Full FERPA compliance ensures your educational records are protected and handled properly.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center hover:shadow-lg transition-all">
          <div className="w-16 h-16 bg-mfc-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-mfc-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Completely Free</h3>
          <p className="text-slate-600 leading-relaxed">
            No fees, no hidden charges. This service is provided at no cost to students.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center hover:shadow-lg transition-all">
          <div className="w-16 h-16 bg-mfc-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-mfc-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Fast Processing</h3>
          <p className="text-slate-600 leading-relaxed">
            Most transcript requests are processed and sent within 1-3 business days.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-12 border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">How It Works</h2>
        <div className="space-y-8 max-w-2xl mx-auto">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-mfc-purple-600 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Provide Your Information</h4>
              <p className="text-slate-600">Enter your personal details, current school information, and destination institution.</p>
            </div>
          </div>
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-mfc-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Review & Consent</h4>
              <p className="text-slate-600">Read the FERPA disclosure and provide your consent for transcript release.</p>
            </div>
          </div>
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-mfc-orange-600 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Submit Request</h4>
              <p className="text-slate-600">Your request is securely submitted and processed through the official transcript network.</p>
            </div>
          </div>
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-mfc-green-600 text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Transcript Delivered</h4>
              <p className="text-slate-600">Your official transcript is sent directly to the receiving institution.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="bg-mfc-purple-50 border-l-4 border-mfc-purple-600 rounded-r-xl p-6">
        <h4 className="text-lg font-bold text-mfc-purple-900 mb-4">Important Information</h4>
        <ul className="space-y-2 text-slate-700">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-mfc-purple-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>This service is for high school students requesting transcripts to be sent to colleges/universities</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-mfc-purple-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>You must have attended or currently attend the school from which you're requesting transcripts</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-mfc-purple-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Transcripts are sent electronically through the secure Parchment network</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-mfc-purple-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Simply search for your school and destination by name - we'll handle the codes automatically</span>
          </li>
        </ul>
      </div>

      {/* Final CTA */}
      <div className="text-center py-8">
        <Link 
          href="/request" 
          className="inline-flex items-center px-10 py-5 text-xl font-semibold text-white bg-mfc-purple-600 rounded-xl hover:bg-mfc-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Get Started Now
          <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
