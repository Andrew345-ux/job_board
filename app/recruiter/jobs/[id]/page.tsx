'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, Clock, DollarSign, Inbox, Eye, CheckCircle, XCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Job, Application } from '@/lib/types';

export default function RecruiterJobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch job details
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobData) setJob(jobData);

      // Fetch applications for this job with seeker info
      const { data: appData } = await supabase
        .from('applications')
        .select('*, users(full_name, email)')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      setApplications(appData || []);
      setLoading(false);
    };

    fetchData();
  }, [jobId]);

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', appId);

    if (error) {
      alert('Failed to update status: ' + error.message);
      return;
    }

    // Update local state
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus as Application['status'] } : a))
    );
  };

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
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="h-48 bg-slate-800 rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-lg mb-4">Job not found</p>
        <Link href="/recruiter/jobs">
          <Button>Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link
        href="/recruiter/jobs"
        className="text-blue-400 hover:text-blue-300 mb-6 inline-flex items-center gap-2 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Jobs
      </Link>

      {/* Job Summary */}
      <Card className="mb-8 mt-4">
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{job.title}</h1>
              <div className="flex flex-wrap gap-3 text-slate-400 text-sm">
                <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.job_type}</span>
                <span className="inline-flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> ${(job.salary_min / 1000).toFixed(0)}k – ${(job.salary_max / 1000).toFixed(0)}k</span>
              </div>
            </div>
            <Badge variant={job.status === 'active' ? 'active' : 'closed'}>
              {job.status === 'active' ? 'Active' : 'Closed'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Applications */}
      <h2 className="text-xl font-bold text-white mb-4">
        Applications ({applications.length})
      </h2>

      {applications.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <Inbox className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No applications received yet</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} hover>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  {/* Applicant info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
                        {app.users?.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {app.users?.full_name || 'Unknown Applicant'}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {app.users?.email || ''}
                        </p>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    {app.cover_letter && (
                      <div className="mt-3 p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                        <p className="text-slate-400 text-xs font-semibold uppercase mb-2">Cover Letter</p>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">{app.cover_letter}</p>
                      </div>
                    )}

                    <p className="text-slate-500 text-xs mt-3">
                      Applied on {new Date(app.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <Badge variant={statusVariant(app.status)}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>

                    <div className="flex flex-wrap gap-2">
                      {app.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(app.id, 'reviewed')}
                          >
                            <Eye className="w-4 h-4" /> Review
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(app.id, 'accepted')}
                          >
                            <CheckCircle className="w-4 h-4" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </Button>
                        </>
                      )}

                      {app.status === 'reviewed' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(app.id, 'accepted')}
                          >
                            <CheckCircle className="w-4 h-4" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </Button>
                        </>
                      )}

                      {(app.status === 'accepted' || app.status === 'rejected') && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdateStatus(app.id, 'pending')}
                        >
                          <RotateCcw className="w-4 h-4" /> Reset
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
