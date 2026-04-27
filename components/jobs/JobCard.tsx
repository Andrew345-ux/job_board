import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, DollarSign, Heart } from 'lucide-react';
import Card, { CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { Job } from '@/lib/types';

interface JobCardProps {
  job: Job;
  role: 'recruiter' | 'seeker';
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
}

export default function JobCard({ job, role, onSave, isSaved = false }: JobCardProps) {
  const salaryDisplay =
    job.salary_min && job.salary_max
      ? `$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max / 1000).toFixed(0)}k`
      : 'Salary not specified';

  const timeAgo = getTimeAgo(job.created_at);

  return (
    <Card hover>
      <CardContent>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1 truncate">{job.title}</h3>
            {job.users?.full_name && (
              <p className="text-slate-400 text-sm">{job.users.full_name}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            <Badge variant={job.status === 'active' ? 'active' : 'closed'}>
              {job.status === 'active' ? 'Active' : 'Closed'}
            </Badge>
            {role === 'seeker' && onSave && (
              <button
                onClick={() => onSave(job.id)}
                className={`text-xl transition ${isSaved ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`}
                aria-label={isSaved ? 'Unsave job' : 'Save job'}
              >
                <Heart className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="default"><MapPin className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />{job.location}</Badge>
          <Badge variant="default"><Clock className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />{job.job_type}</Badge>
          <Badge variant="default"><DollarSign className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />{salaryDisplay}</Badge>
        </div>

        {job.description && (
          <p className="text-slate-300 text-sm line-clamp-2 mb-3">{job.description}</p>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-400">
          <span>Posted {timeAgo}</span>
          {typeof job.application_count === 'number' && (
            <span className="ml-3 font-medium text-white">{job.application_count} applications</span>
          )}
        </div>
        <div className="flex gap-2">
          {role === 'seeker' ? (
            <Link
              href={`/seeker/jobs/${job.id}`}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition"
            >
              View Details
            </Link>
          ) : (
            <>
              <Link
                href={`/recruiter/jobs/${job.id}`}
                className="px-4 py-2 bg-blue-500/20 text-blue-300 text-sm rounded-lg hover:bg-blue-500/30 transition font-medium"
              >
                View Applications
              </Link>
              <Link
                href={`/recruiter/jobs/${job.id}/edit`}
                className="px-4 py-2 bg-slate-700 text-slate-300 text-sm rounded-lg hover:bg-slate-600 transition font-medium"
              >
                Edit
              </Link>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}
