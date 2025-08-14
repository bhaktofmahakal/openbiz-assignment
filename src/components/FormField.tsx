import React, { useState } from 'react';
import { FormField as FormFieldType } from '@/types/form';

interface FormFieldProps {
  field: FormFieldType;
  value: string;
  error?: string;
  onChange: (name: string, value: string) => void;
  onBlur?: (name: string, value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur,
  disabled = false,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    // Apply input formatting based on field type
    if (field.name === 'aadhaar') {
      // Remove non-digits and limit to 12 characters
      newValue = newValue.replace(/\D/g, '').slice(0, 12);
    } else if (field.name === 'mobile') {
      // Remove non-digits and limit to 10 characters
      newValue = newValue.replace(/\D/g, '').slice(0, 10);
    } else if (field.name === 'otp') {
      // Remove non-digits and limit to 6 characters
      newValue = newValue.replace(/\D/g, '').slice(0, 6);
    } else if (field.name === 'pan') {
      // Convert to uppercase and limit to 10 characters
      newValue = newValue.toUpperCase().slice(0, 10);
    } else if (field.maxLength) {
      newValue = newValue.slice(0, field.maxLength);
    }

    onChange(field.name, newValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(field.name, value);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const getInputClassName = () => {
    const baseClasses = `
      w-full px-4 py-3 border rounded-lg transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      disabled:bg-gray-100 disabled:cursor-not-allowed
      ${field.className || ''}
    `;

    if (error) {
      return `${baseClasses} border-red-500 ring-2 ring-red-500 ring-opacity-50 bg-red-50`;
    }

    if (isFocused) {
      return `${baseClasses} border-blue-500 ring-2 ring-blue-500 ring-opacity-50`;
    }

    if (value && !error) {
      return `${baseClasses} border-green-500 bg-green-50`;
    }

    return `${baseClasses} border-gray-300 hover:border-gray-400`;
  };

  const renderInput = () => {
    const commonProps = {
      id: field.id,
      name: field.name,
      value: value || '',
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      disabled,
      required: field.required,
      className: getInputClassName(),
      placeholder: field.placeholder || '',
    };

    switch (field.type) {
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            maxLength={field.maxLength}
          />
        );

      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
          />
        );

      case 'tel':
        return (
          <input
            {...commonProps}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={field.maxLength}
          />
        );

      case 'text':
      case 'email':
      case 'password':
      default:
        return (
          <input
            {...commonProps}
            type={field.type}
            maxLength={field.maxLength}
            pattern={field.pattern}
            autoComplete={getAutoComplete()}
          />
        );
    }
  };

  const getAutoComplete = () => {
    switch (field.name) {
      case 'aadhaar':
        return 'off';
      case 'mobile':
        return 'tel';
      case 'pan':
        return 'off';
      case 'panHolderName':
        return 'name';
      case 'dateOfBirth':
        return 'bday';
      default:
        return 'off';
    }
  };

  const getFieldIcon = () => {
    switch (field.name) {
      case 'aadhaar':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-6 0" />
          </svg>
        );
      case 'mobile':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'otp':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'pan':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`form-field-container ${className}`}>
      {/* Label */}
      <label
        htmlFor={field.id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {getFieldIcon() && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {getFieldIcon()}
          </div>
        )}

        {/* Input Field */}
        <div className={getFieldIcon() ? 'pl-10' : ''}>
          {renderInput()}
        </div>

        {/* Success Icon */}
        {value && !error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* Error Icon */}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 animate-fade-in">
          {error}
        </p>
      )}

      {/* Help Text */}
      {!error && field.placeholder && (
        <p className="mt-1 text-xs text-gray-500">
          {getHelpText()}
        </p>
      )}
    </div>
  );

  function getHelpText(): string {
    switch (field.name) {
      case 'aadhaar':
        return 'Enter your 12-digit Aadhaar number';
      case 'mobile':
        return 'Enter your 10-digit mobile number';
      case 'otp':
        return 'Enter the 6-digit OTP sent to your mobile';
      case 'pan':
        return 'Enter your 10-character PAN number (e.g., ABCDE1234F)';
      case 'panHolderName':
        return 'Enter name exactly as mentioned in PAN card';
      case 'dateOfBirth':
        return 'Select your date of birth';
      default:
        return field.placeholder || '';
    }
  }
};