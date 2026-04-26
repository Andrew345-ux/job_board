'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function SignupForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'seeker';

  const [role, setRole] = useState<'recruiter' | 'seeker'>(initialRole);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // 1. Create auth user
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role,
            full_name: formData.fullName,
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        // 2. Create user profile row
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          role,
          full_name: formData.fullName,
          email: formData.email,
        });

        if (profileError) throw profileError;

        // 3. Redirect based on role
        if (role === 'recruiter') {
          router.push('/recruiter/dashboard');
        } else {
          router.push('/seeker/dashboard');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">J</span>
          </div>
          <span className="text-white font-bold text-2xl">JobBoard</span>
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Get Started</h1>
        <p className="text-slate-400">Create your account to begin</p>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setRole('seeker')}
          className={`p-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
            role === 'seeker'
              ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/10'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
          }`}
          id="role-seeker"
        >
          🔍 Job Seeker
        </button>
        <button
          type="button"
          onClick={() => setRole('recruiter')}
          className={`p-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
            role === 'recruiter'
              ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/10'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
          }`}
          id="role-recruiter"
        >
          🏢 Recruiter
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSignup} className="space-y-4" id="signup-form">
        {error && (
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-700 text-red-300 text-sm animate-fade-in">
            {error}
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="John Doe"
          required
          id="signup-fullname"
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          id="signup-email"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          id="signup-password"
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
          id="signup-confirm-password"
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full py-3"
          id="signup-submit"
        >
          Create Account
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-slate-400 text-sm mt-6">
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="text-blue-400 hover:text-blue-300 font-medium transition"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md text-center text-slate-400">Loading...</div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
