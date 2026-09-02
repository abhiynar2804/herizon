"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

interface NavbarProps {
  userName?: string | null;
  userEmail?: string | null;
}

const navLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/period",
    label: "Period & Cycle",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/symptoms",
    label: "Symptoms",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/ai",
    label: "Herizon AI",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    badge: "AI",
  },
  {
    href: "/resources",
    label: "Resources",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

export default function Navbar({ userName, userEmail }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const quickLogRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const displayName = userName || session?.user?.name || "Herizon Member";
  const displayEmail = userEmail || session?.user?.email || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        quickLogRef.current &&
        !quickLogRef.current.contains(event.target as Node)
      ) {
        setQuickLogOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-pink-100/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
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
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 bg-clip-text text-transparent">
                  Herizon
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      active
                        ? "bg-pink-50 text-pink-700 font-semibold shadow-xs shadow-pink-100"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <span className={active ? "text-pink-600" : "text-gray-400"}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Quick Log, Notifications & Profile */}
          <div className="flex items-center gap-2.5">
            {/* Quick Log Button */}
            <div className="relative" ref={quickLogRef}>
              <button
                type="button"
                onClick={() => setQuickLogOpen(!quickLogOpen)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs font-semibold shadow-xs shadow-pink-500/20 hover:from-pink-700 hover:to-rose-600 transition-all active:scale-95"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Log</span>
              </button>

              {/* Quick Log Dropdown Menu */}
              {quickLogOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl shadow-pink-950/10 border border-pink-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Quick Track
                  </div>
                  <Link
                    href="/period"
                    onClick={() => setQuickLogOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-700 rounded-xl transition"
                  >
                    <span className="p-1 rounded-lg bg-pink-100 text-pink-600">
                      🌸
                    </span>
                    <span>Log Period / Cycle</span>
                  </Link>
                  <Link
                    href="/symptoms"
                    onClick={() => setQuickLogOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-700 rounded-xl transition"
                  >
                    <span className="p-1 rounded-lg bg-purple-100 text-purple-600">
                      🩺
                    </span>
                    <span>Check Symptoms</span>
                  </Link>
                  <Link
                    href="/ai"
                    onClick={() => setQuickLogOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-700 rounded-xl transition"
                  >
                    <span className="p-1 rounded-lg bg-amber-100 text-amber-600">
                      💬
                    </span>
                    <span>Ask Herizon AI</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-pink-50/70 transition focus:outline-none"
                aria-label="Notifications"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
              </button>

              {/* Notification Flyout */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl shadow-pink-950/10 border border-pink-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Health Insights
                    </h3>
                    <span className="text-[10px] font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                      2 New
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-pink-50/50 border border-pink-100/60 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-pink-800">
                        <span>✨ Cycle Phase Tip</span>
                      </div>
                      <p className="text-gray-600 mt-1 text-[11px] leading-relaxed">
                        Stay hydrated and nourish yourself with magnesium-rich foods today for balanced energy.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/60 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-purple-800">
                        <span>🌸 Log Reminder</span>
                      </div>
                      <p className="text-gray-600 mt-1 text-[11px] leading-relaxed">
                        Keep your predictions pinpoint accurate by logging today&apos;s mood and any physical sensations.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/period"
                    onClick={() => setNotificationsOpen(false)}
                    className="block text-center mt-3 text-xs font-medium text-pink-600 hover:text-pink-700 pt-2 border-t border-gray-100"
                  >
                    View Cycle Calendar →
                  </Link>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-pink-50/70 transition focus:outline-none group"
              >
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  {initials}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-gray-800 line-clamp-1 max-w-[100px]">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-pink-600 font-medium">
                    Wellness Member
                  </span>
                </div>
                <svg
                  className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* User Dropdown Flyout */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-pink-950/10 border border-pink-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3.5 py-3 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 line-clamp-1">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                      {displayEmail}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      Account Active &amp; Encrypted
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/onboarding"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-700 rounded-xl transition"
                    >
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>Update Health Profile</span>
                    </Link>

                    <Link
                      href="/period"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-700 rounded-xl transition"
                    >
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Cycle Log History</span>
                    </Link>

                    <Link
                      href="/symptoms"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-700 rounded-xl transition"
                    >
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <span>Symptom Records</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-pink-50/80 transition focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-pink-100 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex items-center gap-3 p-3 bg-pink-50/60 rounded-2xl mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center">
              {initials}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">{displayName}</p>
              <p className="text-[11px] text-gray-500">{displayEmail}</p>
            </div>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? "bg-pink-100/70 text-pink-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? "text-pink-600" : "text-gray-400"}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-200 text-pink-800">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2">
            <Link
              href="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-gray-600 hover:text-pink-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Update Health Profile</span>
            </Link>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
