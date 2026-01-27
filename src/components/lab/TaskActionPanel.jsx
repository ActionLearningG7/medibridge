/**
 * TaskActionPanel Component
 * Shows allowed state transitions for phlebotomist tasks
 */

import React from 'react';
import { CheckCircle, Navigation, MapPin, Beaker, Truck, Clock } from 'lucide-react';
import { Button } from '../../ui';

const WORKFLOW_STEPS = [
  { id: 'accept', label: 'Accept Task', icon: CheckCircle, color: 'bg-blue-100 text-blue-700', allowed: ['ASSIGNED'] },
  { id: 'en_route', label: 'Mark En Route', icon: Navigation, color: 'bg-purple-100 text-purple-700', allowed: ['ACCEPTED'] },
  { id: 'arrive', label: 'Mark Arrived', icon: MapPin, color: 'bg-green-100 text-green-700', allowed: ['EN_ROUTE'] },
  { id: 'collect_samples', label: 'Collect Samples', icon: Beaker, color: 'bg-yellow-100 text-yellow-700', allowed: ['ARRIVED'] },
  { id: 'deliver_to_lab', label: 'Deliver to Lab', icon: Truck, color: 'bg-indigo-100 text-indigo-700', allowed: ['SAMPLES_COLLECTED'] },
  { id: 'complete', label: 'Mark Complete', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700', allowed: ['DELIVERED_TO_LAB'] },
];

export const TaskActionPanel = ({
  currentStatus,
  isLoading,
  onAction,
}) => {
  // Get allowed actions for current status
  const allowedActions = WORKFLOW_STEPS.filter(step => step.allowed.includes(currentStatus));

  // Determine if we can show location update (for en-route and arrived)
  const canUpdateLocation = ['EN_ROUTE', 'ARRIVED'].includes(currentStatus);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Available Actions</h3>

      {allowedActions.length === 0 && currentStatus !== 'COMPLETED' && currentStatus !== 'FAILED' && currentStatus !== 'CANCELLED' ? (
        <p className="text-sm text-gray-600">No actions available for this task status</p>
      ) : currentStatus === 'COMPLETED' ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">✓ Task completed successfully</p>
        </div>
      ) : (currentStatus === 'FAILED' || currentStatus === 'CANCELLED') ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">✗ Task cancelled</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allowedActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                onClick={() => onAction(action.id)}
                disabled={isLoading}
                loading={isLoading}
                className="w-full justify-start gap-3"
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            );
          })}

          {canUpdateLocation && (
            <Button
              variant="outline"
              onClick={() => onAction('update_location')}
              disabled={isLoading}
              className="w-full justify-start gap-3 text-blue-600 hover:text-blue-700"
            >
              <Clock className="h-4 w-4" />
              Update Location
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
