/**
 * TaskStatusStepper Component
 * Visual stepper showing phlebotomist task progression
 */

import React from 'react';
import { Check, Circle, AlertCircle } from 'lucide-react';

const TASK_STEPS = [
  { id: 'assigned', label: 'Assigned', value: 'assigned' },
  { id: 'en_route', label: 'En Route', value: 'en_route' },
  { id: 'arrived', label: 'Arrived', value: 'arrived' },
  { id: 'collected', label: 'Sample Collected', value: 'collect_samples' },
  { id: 'in_transit', label: 'In Transit', value: 'in_transit' },
  { id: 'completed', label: 'Completed', value: 'completed' },
];

export const TaskStatusStepper = ({ currentStatus, failedStatus }) => {
  const currentIndex = TASK_STEPS.findIndex((s) => s.value === currentStatus);
  const isFailed = failedStatus ? TASK_STEPS.findIndex((s) => s.value === failedStatus) : -1;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-6">Collection Progress</h3>

      <div className="flex items-center justify-between">
        {TASK_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFailed_ = index === isFailed;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              {/* Step marker */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm mb-2 ${
                  isFailed_
                    ? 'bg-red-100 text-red-700'
                    : isCompleted
                    ? 'bg-green-100 text-green-700'
                    : isCurrent
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isFailed_ ? (
                  <AlertCircle className="h-5 w-5" />
                ) : isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>

              {/* Step label */}
              <p
                className={`text-xs font-medium text-center ${
                  isFailed_
                    ? 'text-red-700'
                    : isCurrent
                    ? 'text-primary-600'
                    : isCompleted
                    ? 'text-gray-900'
                    : 'text-gray-600'
                }`}
              >
                {step.label}
              </p>

              {/* Connector line */}
              {index < TASK_STEPS.length - 1 && (
                <div
                  className={`h-1 w-full mx-1 mt-8 ${
                    isCompleted ? 'bg-green-200' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
