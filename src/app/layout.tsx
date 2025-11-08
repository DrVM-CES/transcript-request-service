import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Transcript Request Service",
  description: "Request official transcripts from your high school",
  keywords: "transcript, high school, college application, FERPA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen" style={{ backgroundColor: '#F5F5F0' }}>
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-24">
                <div className="flex items-center gap-4">
                  <img 
                    src="/My-Future-Capacity (1).jpg" 
                    alt="My Future Capacity - Pathways to Success" 
                    className="h-16 w-auto"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-mfc-primary-600">
                      My Future Capacity
                    </h1>
                    <p className="text-sm text-gray-600">
                      Official Transcript Request Service
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-mfc-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">FERPA Compliant</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-mfc-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Secure</span>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {children}
          </main>
          <footer className="bg-white border-t border-slate-200 mt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src="/My-Future-Capacity (1).jpg" 
                    alt="My Future Capacity - Pathways to Success" 
                    className="h-10 w-auto"
                  />
                  <p className="text-slate-600">
                    © 2025 My Future Capacity • FERPA Compliant • Powered by Parchment
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  This service is provided free of charge to students requesting official transcripts.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}