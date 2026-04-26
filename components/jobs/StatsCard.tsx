import React from 'react';
import Card, { CardContent } from '@/components/ui/Card';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

export default function StatsCard({ icon, label, value }: StatsCardProps) {
  return (
    <Card hover>
      <CardContent>
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
          {icon}
        </div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
