"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Calculator,
  TrendingUp,
  Home,
  Briefcase,
  Wallet,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileText,
  Users,
} from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Ireland's Complete Tax Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Complete Irish
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                Tax & Investment
              </span>
              <br />
              Platform
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Calculate PAYE, contractor tax, rental income, and track your crypto & stock
              investments. Automatic CGT calculations. Built for Ireland.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <>
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
                  >
                    <Wallet className="h-5 w-5" />
                    Go to Portfolio
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/calculators"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/30 transition-all border-2 border-white/30"
                  >
                    <Calculator className="h-5 w-5" />
                    Tax Calculators
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
                  >
                    Start Free Trial
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/paye-calculator"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/30 transition-all border-2 border-white/30"
                  >
                    <Calculator className="h-5 w-5" />
                    Try Calculator
                  </Link>
                </>
              )}
            </div>
            <p className="text-white/70 text-sm mt-6">
              Trusted by thousands of Irish taxpayers and investors
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="rgb(249, 250, 251)"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-600 mb-2">€1M+</div>
              <div className="text-gray-600">Tax Calculated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-600 mb-2">9</div>
              <div className="text-gray-600">Exchanges Supported</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-600 mb-2">4.9★</div>
              <div className="text-gray-600">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From PAYE to crypto investments, we've got Ireland's taxes covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* PAYE Calculator */}
            <Link href="/paye-calculator" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 h-full hover:-translate-y-1">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calculator className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">PAYE Calculator</h3>
                <p className="text-gray-600 mb-4">
                  Calculate income tax, USC, and PRSI for employees. Instant results for
                  2023-2026.
                </p>
                <div className="flex items-center text-brand-600 font-medium">
                  Try now <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Contractor Calculator */}
            <Link href="/contractor-calculator" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 h-full hover:-translate-y-1">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Briefcase className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Contractor Tax</h3>
                <p className="text-gray-600 mb-4">
                  Self-employed? Calculate Class S PRSI, preliminary tax, and track
                  expenses.
                </p>
                <div className="flex items-center text-brand-600 font-medium">
                  Calculate <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Investment Portfolio */}
            <Link href="/portfolio" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 h-full hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                  NEW
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Investment Portfolio
                </h3>
                <p className="text-gray-600 mb-4">
                  Track crypto & stocks. Auto-calculate CGT. Binance, Coinbase, Degiro & more.
                </p>
                <div className="flex items-center text-brand-600 font-medium">
                  Start tracking <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Rental Income */}
            <Link href="/rental-calculator" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 h-full hover:-translate-y-1">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Home className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Rental Income</h3>
                <p className="text-gray-600 mb-4">
                  Landlords: Calculate tax with 75% mortgage interest relief and €600 credit.
                </p>
                <div className="flex items-center text-brand-600 font-medium">
                  Calculate <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Redundancy */}
            <Link href="/redundancy-calculator" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 h-full hover:-translate-y-1">
                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="h-7 w-7 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Redundancy Calculator
                </h3>
                <p className="text-gray-600 mb-4">
                  Calculate statutory, enhanced, and ex-gratia redundancy payments.
                </p>
                <div className="flex items-center text-brand-600 font-medium">
                  Calculate <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-yellow-400 text-purple-900 text-xs font-bold px-3 py-1 rounded-bl-xl">
                PRO
              </div>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Tax Assistant</h3>
              <p className="text-white/90 mb-4">
                Ask any Irish tax question. Get instant answers powered by ChatGPT.
              </p>
              <div className="flex items-center font-medium">
                Professional tier <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Irish Taxpayers Choose Us
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                Instant calculations. No waiting. Results in real-time as you type.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Accurate</h3>
              <p className="text-gray-600">
                Up-to-date with latest Irish Revenue rates. 2023-2026 tax years.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Save Time</h3>
              <p className="text-gray-600">
                What takes hours manually takes seconds with our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Simplify Your Irish Taxes?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of Irish taxpayers and investors using our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard/subscription"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/30 transition-all border-2 border-white/30"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
