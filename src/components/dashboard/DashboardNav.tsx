"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/period", label: "Period Tracker" },
  { href: "/symptoms", label: "Symptoms" },
  { href: "/resources", label: "Resources" },
  { href: "/ai", label: "Herizon AI" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-6 py-3">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-pink-100 text-pink-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}