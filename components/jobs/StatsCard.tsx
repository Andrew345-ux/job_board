import React from 'react';
import Card, { CardContent } from '@/components/ui/Card';

interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
}

export default function StatsCard({ icon, label, value }: StatsCardProps) {
  return (
    <Card hover>
      <CardContent>
        <div className="text-3xl mb-2">{icon}</div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
