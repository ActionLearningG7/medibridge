/**
 * Queue Data Normalization
 * Converts backend DTOs to frontend-friendly models
 */

import { parseDate, computeWaitMinutes } from '../../utils/date';

/**
 * Mask patient ID for privacy
 * Shows only last 4 characters
 * @param {string} patientId - Full patient ID (UUID)
 * @returns {string} Masked ID (e.g., "P-****-abc123")
 */
export const maskPatientId = (patientId) => {
  if (!patientId) return '--';

  const idStr = String(patientId);
  if (idStr.length <= 8) {
    return `P-${idStr}`;
  }

  // Show last 8 characters
  const lastPart = idStr.slice(-8);
  return `P-****-${lastPart}`;
};

/**
 * Normalize a single queue entry from backend DTO
 * @param {Object} dto - Backend QueueEntryResponse DTO
 * @returns {Object} Normalized queue entry for UI
 */
export const normalizeQueueEntry = (dto) => {
  if (!dto) return null;

  // Parse all dates
  const joinedAt = parseDate(dto.joinedAt);
  const calledAt = parseDate(dto.calledAt);
  const startedAt = parseDate(dto.startedAt);
  const endedAt = parseDate(dto.endedAt);
  const estimatedStartTime = parseDate(dto.estimatedStartTime);

  // Compute actual wait time based on status
  let waitMinutes = null;
  if (joinedAt) {
    if (dto.status === 'WAITING') {
      // Still waiting - compute from joined to now
      waitMinutes = computeWaitMinutes(joinedAt);
    } else if (dto.status === 'CALLED' && calledAt) {
      // Was called - compute from joined to called
      waitMinutes = computeWaitMinutes(joinedAt, calledAt);
    } else if (dto.status === 'IN_PROGRESS' && startedAt) {
      // In progress - compute from joined to started
      waitMinutes = computeWaitMinutes(joinedAt, startedAt);
    } else if ((dto.status === 'COMPLETED' || dto.status === 'NO_SHOW') && endedAt) {
      // Completed - compute from joined to ended
      waitMinutes = computeWaitMinutes(joinedAt, endedAt);
    } else {
      // Fallback - compute from joined to now
      waitMinutes = computeWaitMinutes(joinedAt);
    }
  }

  return {
    // IDs
    id: dto.id,
    queueId: dto.queueId,
    appointmentId: dto.appointmentId,
    patientId: dto.patientId,
    doctorId: dto.doctorId,

    // Display fields
    tokenNumber: dto.tokenNumber || '--',
    patientIdMasked: maskPatientId(dto.patientId),
    // Use patientName from DTO if available, otherwise create display name from token
    patientName: dto.patientName || `Patient #${dto.tokenNumber || '?'}`,

    // Status & Priority
    status: dto.status || 'UNKNOWN',
    priority: dto.priority || 'NORMAL',

    // Timestamps (parsed)
    joinedAt,
    calledAt,
    startedAt,
    endedAt,
    estimatedStartTime,

    // Computed fields
    waitMinutes,
    position: dto.position,

    // Additional data
    notes: dto.notes,

    // Keep raw DTO for debugging
    _raw: dto,
  };
};

/**
 * Normalize array of queue entries
 * @param {Array} dtos - Array of backend DTOs
 * @returns {Array} Normalized queue entries
 */
export const normalizeQueueEntries = (dtos) => {
  if (!Array.isArray(dtos)) return [];

  return dtos.map(normalizeQueueEntry).filter(Boolean);
};

/**
 * Normalize queue response (for getTodayQueue)
 * @param {Object} response - Backend response
 * @returns {Object} Normalized queue data
 */
export const normalizeQueueResponse = (response) => {
  if (!response) return null;

  // Response might be wrapped or direct
  const data = response.data || response;

  console.log('🔄 Normalizing queue response:', {
    hasData: !!data,
    isObject: typeof data === 'object',
    keys: data ? Object.keys(data) : [],
  });

  // If response is the queue object itself
  if (data.id && data.doctorId) {
    return {
      ...data,
      _normalized: true,
    };
  }

  return data;
};

/**
 * Get status display info
 * @param {string} status - Queue entry status
 * @returns {Object} Display config for status
 */
export const getStatusConfig = (status) => {
  const configs = {
    WAITING: {
      label: 'Waiting',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: 'clock',
    },
    CALLED: {
      label: 'Called',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: 'bell',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: 'activity',
    },
    SERVING: {
      label: 'Serving',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: 'user',
    },
    COMPLETED: {
      label: 'Completed',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: 'check',
    },
    NO_SHOW: {
      label: 'No Show',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: 'x',
    },
    SKIPPED: {
      label: 'Skipped',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: 'skip',
    },
    CANCELLED: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: 'x-circle',
    },
  };

  return configs[status] || {
    label: status || 'Unknown',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: 'help',
  };
};

/**
 * Get priority display info
 * @param {string} priority - Priority level
 * @returns {Object} Display config for priority
 */
export const getPriorityConfig = (priority) => {
  const configs = {
    EMERGENCY: {
      label: 'Emergency',
      color: 'bg-red-100 text-red-800 border-red-200',
      showIcon: true,
    },
    NORMAL: {
      label: 'Normal',
      color: 'bg-gray-100 text-gray-600 border-gray-200',
      showIcon: false,
    },
  };

  return configs[priority] || configs.NORMAL;
};
