import React from 'react';
import { Check, Circle, AlertCircle, Clock, Navigation, MapPin, PackageOpen, Zap, FlaskConical } from 'lucide-react';

const TASK_STEPS = [
  { id: 'ASSIGNED', label: 'Deployed', icon: Clock },
  { id: 'EN_ROUTE_TO_PATIENT', label: 'En Route', icon: Navigation },
  { id: 'ARRIVED_AT_PATIENT', label: 'On Site', icon: MapPin },
  { id: 'SAMPLE_COLLECTED', label: 'Collected', icon: PackageOpen },
  { id: 'EN_ROUTE_TO_LAB', label: 'Transit', icon: Zap },
  { id: 'SAMPLES_RECEIVED_AT_LAB', label: 'Analyzing', icon: FlaskConical },
];

export const TaskStatusStepper = ({ currentStatus, failedStatus }) => {
  const currentIndex = TASK_STEPS.findIndex((s) => s.id === currentStatus);
  const isFailed = failedStatus ? TASK_STEPS.findIndex((s) => s.id === failedStatus) : -1;

  return (
    <div className="relative">
      {/* Progress Track Background */}
      <div className="absolute top-7 left-0 right-0 h-1 bg-gray-50 rounded-full" />

      {/* Active Progress Track */}
      {currentIndex > 0 && (
        <div
          className="absolute top-7 left-0 h-1 bg-primary-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          style={{ width: `${(currentIndex / (TASK_STEPS.length - 1)) * 100}%` }}
        />
      )}

      <div className="flex justify-between items-start relative px-4">
        {TASK_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFailedStep = index === isFailed;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center group">
              {/* Step Node */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 relative z-10 ${isFailedStep
                    ? 'bg-red-500 text-white shadow-xl shadow-red-200'
                    : isCompleted
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-100'
                      : isCurrent
                        ? 'bg-white border-4 border-primary-500 text-primary-600 shadow-2xl shadow-primary-500/20 scale-125'
                        : 'bg-white border-2 border-gray-100 text-gray-300'
                  }`}
              >
                {isFailedStep ? (
                  <AlertCircle className="w-6 h-6 stroke-[2.5]" />
                ) : isCompleted ? (
                  <Check className="w-6 h-6 stroke-[3]" />
                ) : (
                  <Icon className={`w-6 h-6 ${isCurrent ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                )}

                {/* Pulse effect for current step */}
                {isCurrent && (
                  <span className="absolute inset-0 rounded-2xl bg-primary-500 animate-ping opacity-20" />
                )}
              </div>

              {/* Step Metadata */}
              <div className="mt-8 text-center max-w-[80px]">
                <p
                  className={`text-[9px] font-black uppercase tracking-widest leading-tight transition-colors duration-500 ${isFailedStep
                      ? 'text-red-600'
                      : isCurrent
                        ? 'text-primary-600'
                        : isCompleted
                          ? 'text-gray-900'
                          : 'text-gray-400'
                    }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-600 text-[8px] font-black rounded-md animate-bounce">
                    LIVE
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
