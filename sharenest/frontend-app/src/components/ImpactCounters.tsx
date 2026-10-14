import React from 'react';
import { DashboardMetrics } from '../types';
import { Utensils, Leaf, Building2, Gift, TrendingUp } from 'lucide-react';

interface ImpactCountersProps {
  metrics: DashboardMetrics;
  t: any;
}

export const ImpactCounters: React.FC<ImpactCountersProps> = ({ metrics, t }) => {
  const cards = [
    {
      title: t.mealsServed || "Nutritious Meals Served",
      value: metrics.meals_served.toLocaleString(),
      icon: Utensils,
      color: "bg-emerald-600",
      lightBg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      badge: "+18% this week",
      desc: "Delivered to verified shelters & children homes",
    },
    {
      title: t.co2Saved || "kg CO₂ Prevented",
      value: `${metrics.co2_saved_kg.toLocaleString()} kg`,
      icon: Leaf,
      color: "bg-teal-600",
      lightBg: "bg-teal-50 text-teal-700 border-teal-200/60",
      badge: "Landfill diverted",
      desc: "Methane & organic footprint reduced",
    },
    {
      title: t.verifiedHomes || "Authorized Care Homes",
      value: metrics.verified_care_homes.toLocaleString(),
      icon: Building2,
      color: "bg-indigo-600",
      lightBg: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
      badge: "FSSAI checked",
      desc: "Orphanages, senior homes & night shelters",
    },
    {
      title: t.activeDonations || "Active Surplus Listings",
      value: metrics.total_donations.toLocaleString(),
      icon: Gift,
      color: "bg-amber-600",
      lightBg: "bg-amber-50 text-amber-800 border-amber-200/60",
      badge: "Live pickup",
      desc: "Available for authorized shelter claims",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-card hover:shadow-premium transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group"
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${card.lightBg} transition-transform group-hover:scale-105 duration-200`}>
                <Icon className="w-5 h-5" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>{card.badge}</span>
              </span>
            </div>

            {/* Value & Title */}
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">
                {card.value}
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-700">
                {card.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {card.desc}
              </p>
            </div>

            {/* Bottom accent bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent group-hover:via-emerald-500 transition-colors" />
          </div>
        );
      })}
    </div>
  );
};
