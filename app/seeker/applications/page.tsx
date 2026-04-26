'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Card, { CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Application } from '@/lib/types';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('applications')
        .select('*, jobs(title, location, job_type, salary_min, salary_max, users(full_name))')
        .eq('seeker_id', user.id)
        .order('created_at', { ascending: false });

      setApplications(data || []);
      setLoading(false);
    };

    fetchApps();
  }, []);

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    await supabase.from('applications').delete().eq('id', appId);
    setApplications((prev) => prev.filter((a) => a.id !== appId));
  };

  const filteredApplications =
    filterStatus === 'all'
      ? applications
      : applications.filter((app) => app.status === filterStatus);

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
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/3" />
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 w-20 bg-slate-800 rounded-lg" />)}
        </div>
        {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-slate-800 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Applications</h1>
        <p className="text-slate-400">Track the status of your job applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'reviewed', 'accepted', 'rejected'].map((status) => (
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

      {/* Applications */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg">
            {filterStatus === 'all'
              ? 'No applications yet'
              : `No ${filterStatus} applications`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <Card key={app.id} hover>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {app.jobs?.title || 'Unknown Job'}
                    </h3>
                    <p className="text-slate-400 text-sm mb-2">
                      {app.jobs?.users?.full_name || 'Unknown Company'}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {app.jobs?.salary_min && app.jobs?.salary_max && (
                        <span className="text-slate-300">
                          💰 ${(app.jobs.salary_min / 1000).toFixed(0)}k – ${(app.jobs.salary_max / 1000).toFixed(0)}k
                        </span>
                      )}
                      <span className="text-slate-300">
                        📅 Applied {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge variant={statusVariant(app.status)}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                {app.status === 'pending' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleWithdraw(app.id)}
                  >
                    Withdraw
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
