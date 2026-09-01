import Link from "next/link";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  activeTab: "login" | "signup";
  title: string;
  subtitle: string;
}

export default function AuthLayout({
  children,
  activeTab,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/80 via-pink-50/40 to-purple-50/60 flex flex-col justify-between selection:bg-pink-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 bg-clip-text text-transparent">
              Herizon
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-100/70 text-pink-700">
              Women&apos;s Health &amp; Cycle Care
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <svg
            className="w-4 h-4 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>Encrypted &amp; Confidential</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero / Brand Showcase (visible on lg+) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100/80 text-pink-700 text-xs font-semibold tracking-wide w-fit">
              <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
              Empowering Women&apos;s Health
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Understand your body. <br />
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Track with confidence.
              </span>
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed">
              Herizon is your all-in-one companion for cycle tracking, hormonal health insights, smart symptom analysis, and AI-powered wellness guidance.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 backdrop-blur-sm border border-pink-100/60 shadow-xs">
                <div className="p-2 rounded-lg bg-pink-50 text-pink-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Intelligent Cycle Predictions</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Accurate forecasting for periods, ovulation, and fertile windows.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 backdrop-blur-sm border border-pink-100/60 shadow-xs">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Symptom Checker &amp; Rules</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Identify patterns, manage PCOS symptoms, and receive triage advice.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 backdrop-blur-sm border border-pink-100/60 shadow-xs">
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Herizon AI Companion</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Ask questions and get empathetic, medically-grounded explanations.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Auth Card */}
          <div className="w-full lg:col-span-7 max-w-md mx-auto">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-900/5 border border-pink-100">
              {/* Tab Switcher */}
              <div className="flex p-1 rounded-2xl bg-gray-100/80 mb-6">
                <Link
                  href="/login"
                  className={`flex-1 text-center py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                    activeTab === "login"
                      ? "bg-white text-gray-900 shadow-xs shadow-gray-200"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className={`flex-1 text-center py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                    activeTab === "signup"
                      ? "bg-white text-gray-900 shadow-xs shadow-gray-200"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Create Account
                </Link>
              </div>

              {/* Header Title */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {title}
                </h1>
                <p className="text-sm text-gray-500 mt-1.5">{subtitle}</p>
              </div>

              {/* Form Content */}
              {children}
            </div>

            {/* Privacy footnote */}
            <p className="text-center text-xs text-gray-400 mt-5">
              By continuing, you agree to Herizon&apos;s{" "}
              <a href="#" className="underline hover:text-gray-600">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-gray-600">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Herizon Health Inc. All rights reserved.
      </footer>
    </div>
  );
}
