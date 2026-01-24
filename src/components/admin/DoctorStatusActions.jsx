/**
 * Doctor Status Actions Component
 * Action buttons for doctor status changes (verify, activate, deactivate, delete)
 */

import { CheckCircle, XCircle, Trash2, UserCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

const DoctorStatusActions = ({
  doctor,
  onVerify,
  onActivate,
  onDeactivate,
  onDelete,
  isLoading = false,
}) => {
  const canVerify = doctor.verificationStatus === 'PENDING';
  const canActivate = doctor.status === 'INACTIVE' && doctor.verificationStatus === 'VERIFIED';
  const canDeactivate = doctor.status === 'ACTIVE';

  return (
    <div className="flex items-center gap-2">
      {/* Verify Button */}
      {canVerify && (
        <button
          onClick={() => onVerify(doctor)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
          title="Verify Doctor"
        >
          <UserCheck className="h-4 w-4" />
          <span>Verify</span>
        </button>
      )}

      {/* Activate Button */}
      {canActivate && (
        <button
          onClick={() => onActivate(doctor)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50"
          title="Activate Doctor"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Activate</span>
        </button>
      )}

      {/* Deactivate Button */}
      {canDeactivate && (
        <button
          onClick={() => onDeactivate(doctor)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-yellow-700 hover:bg-yellow-50 transition-colors disabled:opacity-50"
          title="Deactivate Doctor"
        >
          <XCircle className="h-4 w-4" />
          <span>Deactivate</span>
        </button>
      )}

      {/* Delete Button */}
      <button
        onClick={() => onDelete(doctor)}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
        title="Delete Doctor"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete</span>
      </button>
    </div>
  );
};

export default DoctorStatusActions;
