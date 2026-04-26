import React from 'react';

type BadgeVariant = 'active' | 'closed' | 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'info' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  active: 'bg-green-500/20 text-green-300 border-green-500/30',
  closed: 'bg-red-500/20 text-red-300 border-red-500/30',
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  reviewed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  accepted: 'bg-green-500/20 text-green-300 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
  info: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  default: 'bg-slate-700/50 text-slate-300 border-slate-600',
};

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
