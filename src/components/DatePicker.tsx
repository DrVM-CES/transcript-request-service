'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';
import 'react-day-picker/dist/style.css';

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
  placeholder = 'MM/DD/YYYY',
}: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [inputValue, setInputValue] = useState(() => {
    if (value) {
      const date = parse(value, 'yyyy-MM-dd', new Date());
      return isValid(date) ? format(date, 'MM/dd/yyyy') : '';
    }
    return '';
  });

  // Calculate date range based on min/max age
  const today = new Date();
  const fromDate = maxAge ? new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate()) : undefined;
  const toDate = minAge ? new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate()) : today;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Try to parse the date
    const parsed = parse(newValue, 'MM/dd/yyyy', new Date());
    if (isValid(parsed)) {
      const formatted = format(parsed, 'yyyy-MM-dd');
      onChange(formatted);
    }
  };

  const handleDaySelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, 'yyyy-MM-dd');
      const displayFormatted = format(date, 'MM/dd/yyyy');
      setInputValue(displayFormatted);
      onChange(formatted);
      setShowCalendar(false);
    }
  };

  // Default to 18 years ago for better UX
  const defaultMonth = minAge ? new Date(today.getFullYear() - minAge, today.getMonth()) : today;

  const handleInputBlur = () => {
    // Delay closing to allow calendar clicks
    setTimeout(() => {
      setShowCalendar(false);
    }, 200);
  };

  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          id={id}
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowCalendar(true)}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-mfc-primary-500 focus:border-transparent transition-all ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          required={required}
          autoComplete="off"
        />
        
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-mfc-primary-500 transition-colors"
          tabIndex={-1}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {showCalendar && (
        <div 
          className="absolute z-50 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 p-4"
          onMouseDown={(e) => e.preventDefault()} // Prevent input blur
        >
          <style jsx global>{`
            .rdp {
              --rdp-cell-size: 40px;
              --rdp-accent-color: #5B5FF5;
              --rdp-background-color: #EDEFFF;
              margin: 0;
            }
            .rdp-day_selected {
              background-color: #5B5FF5;
              color: white;
            }
            .rdp-day_selected:hover {
              background-color: #4B4FDB;
            }
            .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
              background-color: #F5F5F0;
            }
            .rdp-caption {
              margin-bottom: 1rem;
            }
            .rdp-head_cell {
              color: #6B7280;
              font-weight: 600;
              font-size: 0.875rem;
            }
          `}</style>
          
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
            fromDate={fromDate}
            toDate={toDate}
            captionLayout="dropdown-buttons"
            defaultMonth={selectedDate || defaultMonth}
            fromYear={fromDate?.getFullYear()}
            toYear={toDate?.getFullYear()}
          />
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
