'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import StatsCard from '@/components/jobs/StatsCard';
import Card, { CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Application } from '@/lib/types';

export default function SeekerDashboard() {
  const [stats, setStats] = useState({ applications: 0, saved: 0, pending: 0 });
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch applications with job details
      const { data: apps } = await supabase
        .from('applications')
        .select('*, jobs(title, location, job_type, salary_min, salary_max, users(full_name))')
        .eq('seeker_id', user.id)
        .order('created_at', { ascending: false });

      const appList = apps || [];
      const pendingApps = appList.filter((a) => a.status === 'pending');

      // Saved jobs count
      const { count: savedCount } = await supabase
        .from('saved_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('seeker_id', user.id);

      setStats({
        applications: appList.length,
        saved: savedCount || 0,
        pending: pendingApps.length,
      });
      setRecentApps(appList.slice(0, 5));
      setLoading(false);
    };

    fetchData();
  }, []);

  const statusVariant = (status: string) => {
    const map: Record<string, 'pending' | 'reviewed' | 'accepted' | 'rejected'> = {
      pending: 'pending',
      reviewed: 'reviewed',
      accepted: 'accepted',
      rejected: 'rejected',
    };
    return map[status] || 'pending';
  };

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
          <h1 className="text-3xl font-bold text-white">Welcome back! 👋</h1>
          <p className="text-slate-400 mt-1">Track your applications and find new opportunities</p>
        </div>
        <Link href="/seeker/jobs">
          <Button>Browse Jobs</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatsCard icon="📮" label="Applications" value={stats.applications} />
        <StatsCard icon="❤️" label="Saved Jobs" value={stats.saved} />
        <StatsCard icon="⏳" label="Pending" value={stats.pending} />
      </div>

      {/* Recent Applications */}
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold text-white mb-4">Recent Applications</h2>

          {recentApps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">You haven&apos;t applied to any jobs yet</p>
              <Link href="/seeker/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-lg bg-slate-700/30 border border-slate-700 hover:border-slate-600 transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {app.jobs?.title || 'Unknown Job'}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {app.jobs?.users?.full_name || 'Unknown Company'}
                      </p>
                    </div>
                    <Badge variant={statusVariant(app.status)}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {recentApps.length > 0 && (
          <CardFooter>
            <Link href="/seeker/applications" className="text-blue-400 hover:text-blue-300 font-medium text-sm">
              View all applications →
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
