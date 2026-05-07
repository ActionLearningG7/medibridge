import React from 'react';
import { AlertCircle, Clock, Navigation, MapPin, CheckCircle, Loader2, Sparkles, Zap, PackageOpen, FlaskConical } from 'lucide-react';

const STATUS_CONFIGS = {
  ASSIGNED: {
    icon: <Clock className="h-6 w-6 stroke-[2.5]" />,
    title: 'Deployment Confirmed',
    message: 'A clinical specialist has been assigned to your case',
    theme: 'bg-amber-500/10 border-amber-500/20 text-amber-700',
    accent: 'bg-amber-500',
  },
  EN_ROUTE_TO_PATIENT: {
    icon: <Navigation className="h-6 w-6 stroke-[2.5]" />,
    title: 'In Transit',
    message: 'Specialist is navigating to your designated location',
    theme: 'bg-blue-600/10 border-blue-600/20 text-blue-700',
    accent: 'bg-blue-600',
  },
  ARRIVED_AT_PATIENT: {
    icon: <MapPin className="h-6 w-6 stroke-[2.5]" />,
    title: 'On Site',
    message: 'Specialist has arrived and is preparing for collection',
    theme: 'bg-indigo-600/10 border-indigo-600/20 text-indigo-700',
    accent: 'bg-indigo-600',
  },
  SAMPLE_COLLECTED: {
    icon: <PackageOpen className="h-6 w-6 stroke-[2.5]" />,
    title: 'Collection Verified',
    message: 'Specimen secured and ready for laboratory transit',
    theme: 'bg-emerald-600/10 border-emerald-600/20 text-emerald-700',
    accent: 'bg-emerald-600',
  },
  EN_ROUTE_TO_LAB: {
    icon: <Zap className="h-6 w-6 stroke-[2.5]" />,
    title: 'Priority Transit',
    message: 'Samples en route to the pathology laboratory',
    theme: 'bg-violet-600/10 border-violet-600/20 text-violet-700',
    accent: 'bg-violet-600',
  },
  SAMPLES_RECEIVED_AT_LAB: {
    icon: <FlaskConical className="h-6 w-6 stroke-[2.5]" />,
    title: 'Laboratory Intake',
    message: 'Analysis in progress at our central facility',
    theme: 'bg-emerald-600/10 border-emerald-600/20 text-emerald-700',
    accent: 'bg-emerald-600',
  },
};

export const StatusBanner = ({ status, eta, className = '' }) => {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.ASSIGNED;

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] border-2 p-8 ${config.theme} ${className}`}>
      {/* Decorative background element */}
      <div className={`absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full translate-x-20 -translate-y-20 ${config.accent}`} />

      <div className="relative flex flex-col md:flex-row md:items-center gap-8">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${config.accent} text-white`}>
          {config.icon}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Real-Time Status</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          </div>
          <h3 className="text-2xl font-black tracking-tight leading-none">{config.title}</h3>
          <p className="font-medium opacity-80">{config.message}</p>
        </div>

        {eta && (
          <div className={`px-8 py-4 rounded-3xl bg-white/40 backdrop-blur-md border border-white/50 text-right shrink-0`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 leading-none">Intelligence ETA</p>
            <p className="text-2xl font-black tracking-tight leading-none whitespace-nowrap">{eta}</p>
          </div>
        )}
      </div>
    </div>
  );
};
