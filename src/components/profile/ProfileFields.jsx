/**
 * Profile Field Components
 * Reusable components for displaying profile information
 */

// Field Row Component
export const ProfileField = ({ label, value, icon, className = '' }) => (
  <div className={`py-4 sm:grid sm:grid-cols-3 sm:gap-4 ${className}`}>
    <dt className="text-sm font-medium text-gray-500 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
      {value || <span className="text-gray-400 italic">Not provided</span>}
    </dd>
  </div>
);

// Editable Field Component
export const EditableField = ({
  label,
  value,
  name,
  type = 'text',
  placeholder,
  onChange,
  error,
  required = false,
  disabled = false,
  icon,
}) => (
  <div className="py-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {icon && <span className="mr-2 inline-block">{icon}</span>}
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        mt-1 block w-full rounded-md border-gray-300 shadow-sm
        focus:border-primary-500 focus:ring-primary-500 sm:text-sm
        ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        ${error ? 'border-red-500' : ''}
      `}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
);

// Section Header
export const ProfileSection = ({ title, subtitle, children, className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    <div className="border-b border-gray-200 pb-4">
      <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
    <dl className="divide-y divide-gray-200">{children}</dl>
  </div>
);

// Status Badge
export const StatusBadge = ({ status }) => {
  const statusStyles = {
    // User statuses
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    VERIFIED: 'bg-blue-100 text-blue-800',
    // Appointment statuses (backend values)
    REQUESTED: 'bg-blue-100 text-blue-800',
    QUEUED: 'bg-yellow-100 text-yellow-800',
    CALLED: 'bg-indigo-100 text-indigo-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    NO_SHOW: 'bg-gray-100 text-gray-800',
    // Legacy appointment statuses
    SCHEDULED: 'bg-blue-100 text-blue-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    PAYMENT_PENDING: 'bg-orange-100 text-orange-800',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// Info Card Component
export const InfoCard = ({ title, value, icon, color = 'primary' }) => {
  const colorStyles = {
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorStyles[color]}`}>
      <div className="flex items-center">
        {icon && <div className="flex-shrink-0 mr-3">{icon}</div>}
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Action Button
export const ActionButton = ({
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
}) => {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-md font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors
        ${variants[variant]} ${sizes[size]}
      `}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default {
  ProfileField,
  EditableField,
  ProfileSection,
  StatusBadge,
  InfoCard,
  ActionButton,
};
