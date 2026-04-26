'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Card, { CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Job } from '@/lib/types';

export default function BrowseJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const categories = ['all', 'technology', 'design', 'business', 'marketing', 'sales', 'other'];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      // Fetch active jobs with recruiter name
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*, users(full_name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      setJobs(jobData || []);

      // Fetch saved jobs
      if (user) {
        const { data: saved } = await supabase
          .from('saved_jobs')
          .select('job_id')
          .eq('seeker_id', user.id);

        setSavedJobIds(new Set(saved?.map((s) => s.job_id) || []));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSave = async (jobId: string) => {
    if (!userId) return;

    if (savedJobIds.has(jobId)) {
      await supabase
        .from('saved_jobs')
        .delete()
        .eq('job_id', jobId)
        .eq('seeker_id', userId);

      setSavedJobIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    } else {
      await supabase.from('saved_jobs').insert({
        job_id: jobId,
        seeker_id: userId,
      });

      setSavedJobIds((prev) => new Set(prev).add(jobId));
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.users?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'all' || job.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/3" />
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="h-60 bg-slate-800 rounded-xl" />
          <div className="lg:col-span-3 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-slate-800 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Browse Jobs</h1>
        <p className="text-slate-400">Find your next opportunity</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar / Filters */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent>
              <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>

              {/* Search */}
              <div className="mb-6">
                <label htmlFor="search" className="block text-white text-sm font-medium mb-2">
                  Search
                </label>
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Job title, company, location..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Category</label>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        selectedCategory === cat
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-transparent'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <div className="lg:col-span-3">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-400 text-lg">No jobs found matching your criteria</p>
              {searchQuery || selectedCategory !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 text-blue-400 hover:text-blue-300 font-medium"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm mb-2">{filteredJobs.length} jobs found</p>
              {filteredJobs.map((job) => (
                <Card key={job.id} hover>
                  <CardContent>
                    <div className="flex justify-between items-start mb-3">
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
                      </div>
                      <button
                        onClick={() => handleSave(job.id)}
                        className={`text-2xl transition shrink-0 ml-3 ${
                          savedJobIds.has(job.id) ? 'text-red-400' : 'text-slate-500 hover:text-red-400'
                        }`}
                        aria-label={savedJobIds.has(job.id) ? 'Unsave' : 'Save'}
                      >
                        {savedJobIds.has(job.id) ? '❤️' : '🤍'}
                      </button>
                    </div>

                    {job.description && (
                      <p className="text-slate-300 text-sm line-clamp-2 mb-3">{job.description}</p>
                    )}
                  </CardContent>

                  <CardFooter className="flex flex-wrap gap-2">
                    <Link href={`/seeker/jobs/${job.id}`} className="flex-1 sm:flex-none">
                      <Button className="w-full sm:w-auto">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
