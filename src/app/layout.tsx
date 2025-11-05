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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
          <header className="bg-white border-b border-neutral-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center space-x-4">
                  <img 
                    src="/logo.svg" 
                    alt="My Future Capacity" 
                    className="h-16 w-16"
                  />
                  <div>
                    <h1 className="text-xl font-semibold text-neutral-900">
                      My Future Capacity
                    </h1>
                    <p className="text-sm text-neutral-600">
                      Transcript Request Service
                    </p>
                  </div>
                </div>
                <div className="text-sm text-neutral-600">
                  Secure • FERPA Compliant • Free
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="bg-neutral-50 border-t border-neutral-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-sm text-neutral-600">
                <p>© 2024 Transcript Request Service. FERPA Compliant.</p>
                <p className="mt-2">
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