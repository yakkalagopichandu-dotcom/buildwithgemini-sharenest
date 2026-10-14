import React from 'react';
import { TimelineEvent } from '../types';
import { CheckCircle2, Clock, Truck, ShieldCheck, AlertCircle } from 'lucide-react';

interface TimelineProps {
  timeline?: TimelineEvent[];
  currentStatus: string;
}

export const DonationTimeline: React.FC<TimelineProps> = ({ timeline = [], currentStatus }) => {
  const steps = [
    { key: 'POSTED', label: 'Posted', icon: Clock },
    { key: 'MATCHED', label: 'Matched', icon: ShieldCheck },
    { key: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
    { key: 'INSPECTED', label: 'Inspected', icon: ShieldCheck },
    { key: 'ACCEPTED', label: 'Completed', icon: CheckCircle2 },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 my-3">
      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
        Lifecycle & Verification Timeline
      </h4>

      <div className="space-y-3">
        {timeline.map((event, idx) => (
          <div key={idx} className="flex items-start gap-3 text-xs">
            <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
              {idx + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">{event.status}</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5">{event.note}</p>
              <span className="text-[10px] text-teal-600 font-medium">By: {event.actor}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
