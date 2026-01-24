/**
 * Queue Entry Actions Component
 * Action buttons for each queue entry (Call, Start, Complete, No-show, Skip)
 */

import { PhoneCall, PlayCircle, CheckCircle, XCircle, SkipForward } from 'lucide-react';
import { cn } from '../../utils/cn';

const QueueEntryActions = ({
  entry,
  onCall,
  onStart,
  onComplete,
  onNoShow,
  onSkip,
  isLoading = false,
  isCurrentPatient = false,
}) => {
  const getActions = () => {
    switch (entry.status) {
      case 'WAITING':
        return [
          {
            id: 'call',
            label: 'Call',
            icon: PhoneCall,
            onClick: onCall,
            color: 'text-blue-600 hover:bg-blue-50',
            show: isCurrentPatient,
          },
          {
            id: 'skip',
            label: 'Skip',
            icon: SkipForward,
            onClick: onSkip,
            color: 'text-gray-600 hover:bg-gray-50',
            show: true,
          },
        ];

      case 'CALLED':
        return [
          {
            id: 'start',
            label: 'Start',
            icon: PlayCircle,
            onClick: onStart,
            color: 'text-green-600 hover:bg-green-50',
            show: true,
          },
          {
            id: 'noshow',
            label: 'No Show',
            icon: XCircle,
            onClick: onNoShow,
            color: 'text-red-600 hover:bg-red-50',
            show: true,
          },
        ];

      case 'IN_CONSULTATION':
        return [
          {
            id: 'complete',
            label: 'Complete',
            icon: CheckCircle,
            onClick: onComplete,
            color: 'text-green-600 hover:bg-green-50',
            show: true,
          },
        ];

      case 'COMPLETED':
      case 'NO_SHOW':
      case 'SKIPPED':
        return [];

      default:
        return [];
    }
  };

  const actions = getActions().filter((action) => action.show);

  if (actions.length === 0) {
    return (
      <span className="text-xs text-gray-500 italic">
        {entry.status === 'COMPLETED' && 'Completed'}
        {entry.status === 'NO_SHOW' && 'No Show'}
        {entry.status === 'SKIPPED' && 'Skipped'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => action.onClick(entry)}
            disabled={isLoading}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
              action.color
            )}
            title={action.label}
          >
            <Icon className="h-4 w-4" />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QueueEntryActions;
