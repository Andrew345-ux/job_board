'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Input, { Textarea, Select } from '@/components/ui/Input';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'full-time',
    salaryMin: '',
    salaryMax: '',
    category: 'technology',
    requirements: '',
    benefits: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: job, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('recruiter_id', user.id)
        .single();

      if (fetchError || !job) {
        setError('Job not found or you don\'t have permission to edit it.');
        setFetching(false);
        return;
      }

      setFormData({
        title: job.title || '',
        description: job.description || '',
        location: job.location || '',
        type: job.job_type || 'full-time',
        salaryMin: String(job.salary_min || ''),
        salaryMax: String(job.salary_max || ''),
        category: job.category || 'technology',
        requirements: job.requirements || '',
        benefits: job.benefits || '',
      });
      setFetching(false);
    };

    fetchJob();
  }, [jobId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          job_type: formData.type,
          salary_min: parseInt(formData.salaryMin),
          salary_max: parseInt(formData.salaryMax),
          category: formData.category,
          requirements: formData.requirements,
          benefits: formData.benefits,
        })
        .eq('id', jobId)
        .eq('recruiter_id', user.id);

      if (updateError) throw updateError;

      router.push('/recruiter/jobs');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update job';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-4 animate-pulse max-w-2xl mx-auto">
        <div className="h-6 bg-slate-800 rounded w-1/4" />
        <div className="h-10 bg-slate-800 rounded w-2/3" />
        <div className="h-[600px] bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (error && fetching === false && formData.title === '') {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 text-lg mb-4">{error}</p>
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
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Edit Job</h1>
        <p className="text-slate-400 mb-8">Update the details of your job posting</p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-slate-800 p-6 sm:p-8 rounded-xl border border-slate-700"
          id="edit-job-form"
        >
          {error && (
            <div className="p-4 rounded-lg bg-red-900/20 border border-red-700 text-red-300 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <Input
            label="Job Title *"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Senior React Developer"
            required
            id="job-title"
          />

          <Textarea
            label="Description *"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the role, responsibilities, and what you're looking for..."
            required
            rows={6}
            id="job-description"
          />

          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              label="Location *"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Remote or New York, NY"
              required
              id="job-location"
            />

            <Select
              label="Job Type *"
              name="type"
              value={formData.type}
              onChange={handleChange}
              id="job-type"
              options={[
                { value: 'full-time', label: 'Full-time' },
                { value: 'part-time', label: 'Part-time' },
                { value: 'contract', label: 'Contract' },
                { value: 'internship', label: 'Internship' },
              ]}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              label="Salary (Min) *"
              type="number"
              name="salaryMin"
              value={formData.salaryMin}
              onChange={handleChange}
              placeholder="e.g., 50000"
              required
              id="salary-min"
            />

            <Input
              label="Salary (Max) *"
              type="number"
              name="salaryMax"
              value={formData.salaryMax}
              onChange={handleChange}
              placeholder="e.g., 120000"
              required
              id="salary-max"
            />
          </div>

          <Select
            label="Category *"
            name="category"
            value={formData.category}
            onChange={handleChange}
            id="job-category"
            options={[
              { value: 'technology', label: 'Technology' },
              { value: 'marketing', label: 'Marketing' },
              { value: 'sales', label: 'Sales' },
              { value: 'design', label: 'Design' },
              { value: 'business', label: 'Business' },
              { value: 'other', label: 'Other' },
            ]}
          />

          <Textarea
            label="Requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="List key requirements for this position..."
            rows={4}
            id="job-requirements"
          />

          <Textarea
            label="Benefits"
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
            placeholder="List benefits and perks..."
            rows={4}
            id="job-benefits"
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="submit" loading={loading} className="flex-1 py-3" id="update-job">
              Save Changes
            </Button>
            <Link href="/recruiter/jobs" className="flex-1">
              <Button variant="secondary" type="button" className="w-full py-3">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
