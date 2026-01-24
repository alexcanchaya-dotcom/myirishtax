"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, CreditCard } from "lucide-react";

export function UserNav() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/auth/login"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Sign in
        </Link>
        <Link
          href="/auth/signup"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700"
        >
          Get Started
        </Link>
      </div>
    );
  }

  const tierBadgeColors = {
    FREE: "bg-gray-100 text-gray-800",
    PREMIUM: "bg-blue-100 text-blue-800",
    PROFESSIONAL: "bg-purple-100 text-purple-800",
  };

  const tierColor =
    tierBadgeColors[session.user.subscriptionTier as keyof typeof tierBadgeColors] ||
    tierBadgeColors.FREE;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-medium">
            {session.user.name?.[0]?.toUpperCase() ||
              session.user.email?.[0]?.toUpperCase()}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium text-gray-900">
              {session.user.name}
            </p>
            <p className={`text-xs px-2 py-0.5 rounded-full ${tierColor}`}>
              {session.user.subscriptionTier}
            </p>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {session.user.name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {session.user.email}
              </p>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4" />
              Dashboard
            </Link>

            <Link
              href="/dashboard/subscription"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <CreditCard className="h-4 w-4" />
              Subscription
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
