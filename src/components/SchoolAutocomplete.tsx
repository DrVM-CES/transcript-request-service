'use client';

import { useState, useEffect, useRef } from 'react';

interface School {
  id: number;
  schoolName: string;
  schoolType: string;
  city: string;
  state: string;
  address?: string | null;
  zip?: string | null;
  phone?: string | null;
  ceebCode: string | null;
  federalSchoolCode: string | null;
  displayName: string;
}

interface SchoolAutocompleteProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string, school?: School) => void;
  onSchoolSelect?: (school: School) => void;
  label: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  schoolType?: 'High School' | 'University';
  disabled?: boolean;
}

export function SchoolAutocomplete({
  id,
  name,
  value,
  onChange,
  onSchoolSelect,
  label,
  required = false,
  error,
  placeholder = 'Start typing school name...',
  schoolType,
  disabled = false,
}: SchoolAutocompleteProps) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<School[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update local query when value prop changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const searchSchools = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '20',
      });

      if (schoolType) {
        params.append('type', schoolType);
      }

      const response = await fetch(`/api/schools/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.results || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } else {
        console.error('Search error:', data.error);
        setResults([]);
      }
    } catch (error) {
      console.error('Failed to search schools:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (newValue: string) => {
    setQuery(newValue);
    onChange(newValue);

    // Debounce search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchSchools(newValue);
    }, 300);
  };

  const handleSelectSchool = (school: School) => {
    setQuery(school.schoolName);
    onChange(school.schoolName, school);
    setIsOpen(false);
    setResults([]);
    
    if (onSchoolSelect) {
      onSchoolSelect(school);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectSchool(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          id={id}
          name={name}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 2 && results.length > 0) {
              setIsOpen(true);
            }
          }}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 rounded-lg border-2
            ${error ? 'border-red-500' : 'border-gray-300'}
            focus:outline-none focus:ring-2 focus:ring-mfc-primary-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-colors
          `}
          placeholder={placeholder}
          autoComplete="off"
          required={required}
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-mfc-primary-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border-2 border-gray-200 max-h-80 overflow-y-auto">
          {results.map((school, index) => (
            <button
              key={school.id}
              type="button"
              onClick={() => handleSelectSchool(school)}
              className={`
                w-full px-4 py-3 text-left hover:bg-mfc-primary-50 transition-colors
                ${index === selectedIndex ? 'bg-mfc-primary-50' : ''}
                ${index > 0 ? 'border-t border-gray-100' : ''}
              `}
            >
              <div className="font-medium text-gray-900">{school.schoolName}</div>
              <div className="text-sm text-gray-600 mt-0.5">
                {school.city}, {school.state}
                {school.ceebCode && (
                  <span className="ml-2 text-mfc-primary-500">
                    • CEEB: {school.ceebCode}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {school.schoolType}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && !isLoading && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border-2 border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-600">
            No schools found matching "{query}". Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}
