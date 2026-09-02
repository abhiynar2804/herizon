import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-pink-100/80 mt-auto text-gray-600">
      {/* Top Banner Feature Ribbon */}
      <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-rose-500/10 border-b border-pink-100/60 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-pink-900 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Your personal data is encrypted &amp; stored securely.</span>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              HIPAA &amp; GDPR Compliant Standards
            </span>
            <span className="hidden sm:inline-block text-gray-300">|</span>
            <span className="hidden sm:inline-block">AI Guidance Powered by Gemini</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 bg-clip-text text-transparent">
                Herizon
              </span>
            </Link>

            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              Empowering women through proactive health intelligence, cycle tracking, hormonal care, symptom triage, and personalized AI wellness support.
            </p>

            <div className="flex items-center gap-3 pt-1 text-gray-400">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 border border-pink-100">
                ✨ Care for Every Phase
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-100">
                🔒 Privacy First
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-gray-500 hover:text-pink-600 transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/period" className="text-gray-500 hover:text-pink-600 transition">
                  Period Tracker
                </Link>
              </li>
              <li>
                <Link href="/symptoms" className="text-gray-500 hover:text-pink-600 transition">
                  Symptom Checker
                </Link>
              </li>
              <li>
                <Link href="/ai" className="text-gray-500 hover:text-pink-600 transition">
                  Herizon AI Companion
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-gray-500 hover:text-pink-600 transition">
                  Educational Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Health Tools
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <span className="hover:text-gray-700">Cycle Phase Forecasts</span>
              </li>
              <li>
                <span className="hover:text-gray-700">Ovulation &amp; Fertility Window</span>
              </li>
              <li>
                <span className="hover:text-gray-700">PCOS &amp; Hormonal Insights</span>
              </li>
              <li>
                <span className="hover:text-gray-700">Symptom Severity Triage</span>
              </li>
              <li>
                <span className="hover:text-gray-700">Partner Cycle Sync</span>
              </li>
            </ul>
          </div>

          {/* Medical Disclaimer & Emergency */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Safety &amp; Support
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Herizon is an educational &amp; wellness tracking tool. It is not intended to replace licensed medical diagnosis or clinical treatment.
            </p>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
              <span className="font-semibold text-gray-900 block mb-0.5">Emergency?</span>
              Please consult your local emergency services or healthcare provider immediately.
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Herizon Health Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-600 transition">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600 transition">Terms of Service</a>
            <a href="#" className="hover:text-gray-600 transition">Security Overview</a>
            <a href="#" className="hover:text-gray-600 transition">Help Center</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
