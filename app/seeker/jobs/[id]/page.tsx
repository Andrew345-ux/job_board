'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import type { Job } from '@/lib/types';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      // Fetch job details
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*, users(full_name)')
        .eq('id', jobId)
        .single();

      if (jobData) setJob(jobData);

      if (user) {
        // Check if saved
        const { data: saved } = await supabase
          .from('saved_jobs')
          .select('id')
          .eq('job_id', jobId)
          .eq('seeker_id', user.id)
          .maybeSingle();

        setIsSaved(!!saved);

        // Check if already applied
        const { data: applied } = await supabase
          .from('applications')
          .select('id')
          .eq('job_id', jobId)
          .eq('seeker_id', user.id)
          .maybeSingle();

        setHasApplied(!!applied);
      }

      setLoading(false);
    };

    fetchData();
  }, [jobId]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('applications').insert({
        job_id: jobId,
        seeker_id: userId,
        cover_letter: coverLetter,
        status: 'pending',
      });

      if (error) throw error;

      setHasApplied(true);
      setIsApplyModalOpen(false);
      setCoverLetter('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to apply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    if (isSaved) {
      await supabase
        .from('saved_jobs')
        .delete()
        .eq('job_id', jobId)
        .eq('seeker_id', userId);
    } else {
      await supabase.from('saved_jobs').insert({
        job_id: jobId,
        seeker_id: userId,
      });
    }
    setIsSaved(!isSaved);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="h-48 bg-slate-800 rounded-xl" />
        <div className="h-64 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-lg mb-4">Job not found</p>
        <Link href="/seeker/jobs">
          <Button>Browse Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <Link
        href="/seeker/jobs"
        className="text-blue-400 hover:text-blue-300 mb-6 inline-flex items-center gap-2 text-sm font-medium"
      >
        ← Back to Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card>
            <CardContent>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{job.title}</h1>
                  <p className="text-cyan-400 text-lg">{job.users?.full_name || 'Company'}</p>
                </div>
                <button
                  onClick={handleSave}
                  className={`p-2 rounded-lg transition ${
                    isSaved
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                  aria-label={isSaved ? 'Unsave' : 'Save'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <span className="text-cyan-400">📍</span>
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <span className="text-cyan-400">⏰</span>
                  <span>{job.job_type}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <span className="text-cyan-400">💰</span>
                  <span>${(job.salary_min / 1000).toFixed(0)}K – ${(job.salary_max / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <span className="text-cyan-400">📂</span>
                  <span>{job.category}</span>
                </div>
              </div>

              {/* CTA */}
              <Button
                onClick={() => setIsApplyModalOpen(true)}
                disabled={hasApplied}
                className="w-full py-3"
                id="apply-btn"
              >
                {hasApplied ? '✓ Already Applied' : 'Apply Now'}
              </Button>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent>
              <h2 className="text-xl font-bold text-white mb-4">Job Description</h2>
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card>
              <CardContent>
                <h2 className="text-xl font-bold text-white mb-4">Requirements</h2>
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {job.requirements}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && (
            <Card>
              <CardContent>
                <h2 className="text-xl font-bold text-white mb-4">Benefits</h2>
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {job.benefits}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent>
              <h3 className="text-lg font-bold text-white mb-4">About This Job</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Job Type</p>
                  <p className="text-white font-semibold">{job.job_type}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Category</p>
                  <p className="text-white font-semibold">{job.category}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Salary Range</p>
                  <p className="text-white font-semibold">
                    ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Status</p>
                  <Badge variant={job.status === 'active' ? 'active' : 'closed'}>
                    {job.status === 'active' ? 'Active' : 'Closed'}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => setIsApplyModalOpen(true)}
                disabled={hasApplied}
                className="w-full py-3"
              >
                {hasApplied ? '✓ Already Applied' : 'Apply Now'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Applying to</p>
            <p className="text-white font-semibold">{job.title}</p>
            <p className="text-sm text-cyan-400">{job.users?.full_name || 'Company'}</p>
          </div>

          <Textarea
            label="Cover Letter (Optional)"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell us why you're interested in this position..."
            rows={5}
            id="cover-letter"
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsApplyModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1" id="submit-application">
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
