/* ── Database row types ── */

export type UserRole = 'recruiter' | 'seeker';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  created_at: string;
}

export type JobStatus = 'active' | 'closed';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type JobCategory = 'technology' | 'marketing' | 'sales' | 'design' | 'business' | 'other';

export interface Job {
  id: string;
  recruiter_id: string;
  title: string;
  description: string;
  location: string;
  job_type: string;
  salary_min: number;
  salary_max: number;
  category: string;
  requirements: string;
  benefits: string;
  status: JobStatus;
  created_at: string;
  /* joined fields */
  users?: Pick<UserProfile, 'full_name'>;
  application_count?: number;
}

export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

export interface Application {
  id: string;
  job_id: string;
  seeker_id: string;
  cover_letter: string;
  status: ApplicationStatus;
  created_at: string;
  /* joined */
  jobs?: Pick<Job, 'title' | 'location' | 'job_type' | 'salary_min' | 'salary_max'> & {
    users?: Pick<UserProfile, 'full_name'>;
  };
  users?: Pick<UserProfile, 'full_name' | 'email'>;
}

export interface SavedJob {
  id: string;
  job_id: string;
  seeker_id: string;
  created_at: string;
}
