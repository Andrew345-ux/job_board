import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JobBoard – Find Your Next Opportunity',
  description: 'A modern job board platform connecting recruiters and job seekers. Post jobs, browse listings, and apply instantly.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center animate-pulse-glow">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-white font-bold text-xl">JobBoard</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="text-slate-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-slate-700/50"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition"
            >
              Sign up
            </Link>
          </div>
          <div className="md:hidden flex space-x-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Find Your{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Perfect Job
              </span>
            </h1>
          </div>

          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto animate-fade-in-up-delay-1">
            Connect with top opportunities and build your career. Whether you&apos;re a
            recruiter looking for talent or a job seeker searching for your next role.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up-delay-2">
            <Link
              href="/auth/signup?role=seeker"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
            >
              🔍 I&apos;m Looking for Jobs
            </Link>
            <Link
              href="/auth/signup?role=recruiter"
              className="px-8 py-4 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all duration-300 border border-slate-600 transform hover:scale-105"
            >
              🏢 I&apos;m Hiring
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-20 animate-fade-in-up-delay-3">
            {[
              {
                icon: '🎯',
                title: 'For Job Seekers',
                desc: 'Browse jobs, apply instantly, and track your applications in real time',
              },
              {
                icon: '🏢',
                title: 'For Recruiters',
                desc: 'Post jobs, review applications, and find the perfect candidates for your team',
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                desc: 'Built with Next.js & Supabase for the best performance and real‑time updates',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl glass hover:border-slate-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-8 text-center">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} JobBoard. Built with Next.js, Tailwind CSS & Supabase.
        </p>
      </footer>
    </div>
  );
}
