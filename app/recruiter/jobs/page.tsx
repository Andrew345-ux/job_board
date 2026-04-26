'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardContent, CardFooter } from '@/components/ui/Card';
import type { Job } from '@/lib/types';

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false });

      // Get application counts
      if (data && data.length > 0) {
        const jobIds = data.map((j) => j.id);
        const { data: appCounts } = await supabase
          .from('applications')
          .select('job_id')
          .in('job_id', jobIds);

        const countMap: Record<string, number> = {};
        appCounts?.forEach((a) => {
          countMap[a.job_id] = (countMap[a.job_id] || 0) + 1;
        });

        data.forEach((j) => {
          j.application_count = countMap[j.id] || 0;
        });
      }

      setJobs(data || []);
      setLoading(false);
    };

    fetchJobs();
  }, []);

  const filteredJobs =
    filterStatus === 'all' ? jobs : jobs.filter((job) => job.status === filterStatus);

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    await supabase.from('jobs').update({ status: newStatus }).eq('id', jobId);
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus as 'active' | 'closed' } : j))
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/3" />
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 w-20 bg-slate-800 rounded-lg" />)}
        </div>
        {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-slate-800 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">My Job Postings</h1>
        <Link href="/recruiter/jobs/create">
          <Button>+ Post New Job</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'active', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
              filterStatus === status
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Jobs */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg mb-4">
            {filterStatus === 'all' ? 'No jobs posted yet' : `No ${filterStatus} jobs`}
          </p>
          <Link href="/recruiter/jobs/create">
            <Button>Post Your First Job</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} hover>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-white mb-1">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 text-slate-400 text-sm">
                      <span>📍 {job.location}</span>
                      <span>⏰ {job.job_type}</span>
                      <span>💰 ${(job.salary_min / 1000).toFixed(0)}k – ${(job.salary_max / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                  <Badge variant={job.status === 'active' ? 'active' : 'closed'}>
                    {job.status === 'active' ? 'Active' : 'Closed'}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-white font-semibold">
                    {job.application_count || 0} applications
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/recruiter/jobs/${job.id}`}
                    className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition"
                  >
                    View Applications
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(job.id, job.status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      job.status === 'active'
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                    }`}
                  >
                    {job.status === 'active' ? 'Close Job' : 'Reopen'}
                  </button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
