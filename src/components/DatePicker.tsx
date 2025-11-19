'use client';

interface DatePickerProps {
  id: string;
  name: string;
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  error?: string;
  minAge?: number; // Minimum age in years
  maxAge?: number; // Maximum age in years
  placeholder?: string;
}

export function DatePicker({
  id,
  name,
  value,
  onChange,
  label,
  required = false,
  error,
  minAge,
  maxAge,
  placeholder,
}: DatePickerProps) {
  // Calculate date range based on min/max age
  const today = new Date();
  const maxDate = minAge 
    ? new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate()).toISOString().split('T')[0]
    : today.toISOString().split('T')[0];
  const minDate = maxAge 
    ? new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate()).toISOString().split('T')[0]
    : '1900-01-01';

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-bold text-gray-900 mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      
      <input
        type="date"
        id={id}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        min={minDate}
        max={maxDate}
        className={`w-full px-4 py-3 text-base font-medium text-gray-900 border rounded-lg focus:ring-2 focus:ring-mfc-primary-500 focus:border-transparent transition-all ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        required={required}
      />

      {error && (
        <p className="mt-2 text-sm font-semibold text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
