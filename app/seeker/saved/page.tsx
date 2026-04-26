'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Card, { CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Job } from '@/lib/types';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<(Job & { saved_id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('saved_jobs')
        .select('id, job_id, jobs(*, users(full_name))')
        .eq('seeker_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const jobs = data
          .filter((item: Record<string, unknown>) => item.jobs)
          .map((item: Record<string, unknown>) => ({
            ...(item.jobs as Job),
            saved_id: item.id as string,
          }));
        setSavedJobs(jobs);
      }

      setLoading(false);
    };

    fetchSaved();
  }, []);

  const handleUnsave = async (savedId: string) => {
    await supabase.from('saved_jobs').delete().eq('id', savedId);
    setSavedJobs((prev) => prev.filter((j) => j.saved_id !== savedId));
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-slate-800 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Saved Jobs ❤️</h1>
        <p className="text-slate-400">Jobs you&apos;ve bookmarked for later</p>
      </div>

      {savedJobs.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-4xl mb-4">🤍</p>
              <p className="text-slate-400 text-lg mb-4">No saved jobs yet</p>
              <p className="text-slate-500 text-sm mb-6">
                Browse jobs and click the heart icon to save them here
              </p>
              <Link href="/seeker/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">{savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}</p>

          {savedJobs.map((job) => (
            <Card key={job.saved_id} hover>
              <CardContent>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/seeker/jobs/${job.id}`}>
                      <h3 className="text-xl font-semibold text-white mb-1 hover:text-blue-400 transition cursor-pointer">
                        {job.title}
                      </h3>
                    </Link>
                    <p className="text-slate-400 text-sm mb-3">
                      {job.users?.full_name || 'Company'}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="default">📍 {job.location}</Badge>
                      <Badge variant="default">⏰ {job.job_type}</Badge>
                      <Badge variant="default">
                        💰 ${(job.salary_min / 1000).toFixed(0)}k – ${(job.salary_max / 1000).toFixed(0)}k
                      </Badge>
                    </div>
                    {job.description && (
                      <p className="text-slate-300 text-sm line-clamp-2">{job.description}</p>
                    )}
                  </div>

                  <Badge variant={job.status === 'active' ? 'active' : 'closed'}>
                    {job.status === 'active' ? 'Active' : 'Closed'}
                  </Badge>
                </div>
              </CardContent>

              <CardFooter className="flex flex-wrap items-center justify-between gap-3">
                <Link href={`/seeker/jobs/${job.id}`}>
                  <Button size="sm">View Details</Button>
                </Link>
                <button
                  onClick={() => handleUnsave(job.saved_id)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
                >
                  ❤️ Remove from Saved
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
