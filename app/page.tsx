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
  Star,
  Smartphone,
  Lock,
  RefreshCw,
  DollarSign,
  PieChart,
  LineChart,
} from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600 text-white pb-20">
        {/* Animated Background Patterns */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute -bottom-10 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/30 shadow-xl animate-fade-in">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-semibold">Ireland's #1 Tax & Investment Platform</span>
              <span className="bg-yellow-400 text-purple-900 px-2 py-0.5 rounded-full text-xs font-bold">
                TRUSTED BY 10K+
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight animate-slide-up">
              Your Complete Irish
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
                Tax & Investment
              </span>
              <br />
              Platform
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-white/95 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in font-light">
              Calculate PAYE, contractor tax, rental income, and track your <strong className="font-semibold">crypto & stock investments</strong>.
              Automatic CGT calculations. <span className="text-yellow-300">Built exclusively for Ireland</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 animate-scale-in">
              {session ? (
                <>
                  <Link
                    href="/portfolio"
                    className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-brand-600 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 transform"
                  >
                    <Wallet className="h-6 w-6" />
                    Go to Portfolio
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/paye-calculator"
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold text-lg hover:bg-white/30 transition-all border-2 border-white/40 shadow-xl hover:scale-105 transform"
                  >
                    <Calculator className="h-6 w-6" />
                    Tax Calculators
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-brand-600 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 transform"
                  >
                    Start Free Trial
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/paye-calculator"
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold text-lg hover:bg-white/30 transition-all border-2 border-white/40 shadow-xl hover:scale-105 transform"
                  >
                    <Calculator className="h-6 w-6" />
                    Try Free Calculator
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-white/90 text-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-300" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-300" />
                <span>Free PAYE calculator</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-300" />
                <span>Revenue compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="rgb(249, 250, 251)"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group cursor-default">
              <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform">
                €1.5M+
              </div>
              <div className="text-gray-600 font-medium">Tax Calculated</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform">
                12K+
              </div>
              <div className="text-gray-600 font-medium">Happy Users</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform">
                15+
              </div>
              <div className="text-gray-600 font-medium">Exchanges Supported</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform">
                4.9★
              </div>
              <div className="text-gray-600 font-medium">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-2 rounded-full mb-6 font-semibold text-sm">
              <Zap className="h-4 w-4" />
              ALL-IN-ONE PLATFORM
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From PAYE to crypto investments, we've got every aspect of Irish taxes covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* PAYE Calculator */}
            <Link href="/paye-calculator" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-blue-100 hover:border-blue-300 h-full hover:-translate-y-2 transform">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">PAYE Calculator</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Calculate income tax, USC, and PRSI for employees. Instant results for 2023-2026 with tax credit optimization.
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                  Try Free
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>

            {/* Contractor Calculator */}
            <Link href="/contractor-calculator" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-purple-100 hover:border-purple-300 h-full hover:-translate-y-2 transform relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                  PREMIUM
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Contractor Tax</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Self-employed tax calculator with expense tracking, VAT, preliminary tax, and profit analysis.
                </p>
                <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                  Calculate Now
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>

            {/* Rental Calculator */}
            <Link href="/rental-calculator" className="group">
              <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-green-100 hover:border-green-300 h-full hover:-translate-y-2 transform relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                  PREMIUM
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Rental Income</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Landlord tax calculator with mortgage interest relief, expense tracking, and rental tax credits.
                </p>
                <div className="flex items-center text-green-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>

            {/* Investment Portfolio */}
            <Link href="/portfolio" className="group">
              <div className="bg-gradient-to-br from-orange-50 to-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-orange-100 hover:border-orange-300 h-full hover:-translate-y-2 transform relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  NEW!
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Investment Portfolio</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Track crypto & stocks, auto-sync from exchanges, calculate CGT automatically with FIFO method.
                </p>
                <div className="flex items-center text-orange-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                  View Portfolio
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>

            {/* Redundancy Calculator */}
            <Link href="/redundancy-calculator" className="group">
              <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-indigo-100 hover:border-indigo-300 h-full hover:-translate-y-2 transform">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Redundancy</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Calculate tax-free lump sum, SCSB, top-slicing relief, and optimize your redundancy payment.
                </p>
                <div className="flex items-center text-indigo-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                  Calculate
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>

            {/* AI Tax Assistant */}
            <div className="group cursor-default">
              <div className="bg-gradient-to-br from-pink-50 to-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-pink-100 hover:border-pink-300 h-full hover:-translate-y-2 transform relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                  PRO
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Tax Assistant</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Get instant answers to Irish tax questions with our GPT-4 powered AI assistant. Available 24/7.
                </p>
                <div className="flex items-center text-pink-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                  Coming Soon
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Why Choose MyIrishTax?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built by Irish taxpayers, for Irish taxpayers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                Instant tax calculations with real-time results. No waiting, no delays.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Secure</h3>
              <p className="text-gray-600">
                Bank-level encryption. Your data is private and protected.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Revenue Compliant</h3>
              <p className="text-gray-600">
                All calculations follow official Irish Revenue guidelines.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <RefreshCw className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Always Updated</h3>
              <p className="text-gray-600">
                Tax rates and credits updated for every budget automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Loved by Irish Taxpayers
            </h2>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-8 w-8 fill-current" />
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-1 text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "Finally, a tax calculator that actually makes sense for Ireland! The portfolio tracking is a game-changer for my crypto investments."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  SM
                </div>
                <div>
                  <div className="font-bold text-gray-900">Sarah Murphy</div>
                  <div className="text-sm text-gray-600">Software Engineer, Dublin</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-1 text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "As a freelance contractor, this saves me hours every year. The expense tracking and preliminary tax calculator are brilliant!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  JD
                </div>
                <div>
                  <div className="font-bold text-gray-900">John Doyle</div>
                  <div className="text-sm text-gray-600">Contractor, Cork</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-1 text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "The automatic CGT calculation from my Binance account is incredible. Saved me from a headache at tax time!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  EK
                </div>
                <div>
                  <div className="font-bold text-gray-900">Emma Kelly</div>
                  <div className="text-sm text-gray-600">Investor, Galway</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
            Ready to Simplify Your Taxes?
          </h2>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            Join thousands of Irish taxpayers who trust MyIrishTax. Start for free today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/auth/signup"
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-brand-600 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 transform"
            >
              Get Started Free
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold text-lg hover:bg-white/30 transition-all border-2 border-white/40 shadow-xl"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
