'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ClipboardList, Inbox, CheckCircle, ArrowRight } from 'lucide-react';
import StatsCard from '@/components/jobs/StatsCard';
import Card, { CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Job } from '@/lib/types';

export default function RecruiterDashboard() {
  const [stats, setStats] = useState({ jobs: 0, applications: 0, active: 0 });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch recruiter's jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false });

      const jobList = jobs || [];
      const activeJobs = jobList.filter((j) => j.status === 'active');

      // Count applications for this recruiter's jobs
      const jobIds = jobList.map((j) => j.id);
      let appCount = 0;
      if (jobIds.length > 0) {
        const { count } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .in('job_id', jobIds);
        appCount = count || 0;
      }

      setStats({
        jobs: jobList.length,
        applications: appCount,
        active: activeJobs.length,
      });
      setRecentJobs(jobList.slice(0, 5));
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-slate-800 rounded-lg w-1/3" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Recruiter Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your job postings and review applications</p>
        </div>
        <Link href="/recruiter/jobs/create">
          <Button>+ Post New Job</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatsCard icon={<ClipboardList className="w-5 h-5" />} label="Total Jobs" value={stats.jobs} />
        <StatsCard icon={<Inbox className="w-5 h-5" />} label="Applications" value={stats.applications} />
        <StatsCard icon={<CheckCircle className="w-5 h-5" />} label="Active Jobs" value={stats.active} />
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold text-white mb-4">Recent Job Postings</h2>

          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">You haven&apos;t posted any jobs yet</p>
              <Link href="/recruiter/jobs/create">
                <Button>Post Your First Job</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-lg bg-slate-700/30 border border-slate-700 hover:border-slate-600 transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                      <p className="text-slate-400 text-sm">
                        {job.location} • {job.job_type} • ${(job.salary_min / 1000).toFixed(0)}k – ${(job.salary_max / 1000).toFixed(0)}k
                      </p>
                    </div>
                    <Badge variant={job.status === 'active' ? 'active' : 'closed'}>
                      {job.status === 'active' ? 'Active' : 'Closed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {recentJobs.length > 0 && (
          <CardFooter>
            <Link href="/recruiter/jobs" className="text-blue-400 hover:text-blue-300 font-medium text-sm">
              View all jobs <ArrowRight className="w-4 h-4 inline" />
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
