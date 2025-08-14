import React, { useState } from 'react';
import { FormField } from './FormField';
import { FormValues, FormErrors } from '@/types/form';

interface Step2Props {
  values: FormValues;
  errors: FormErrors;
  isLoading: boolean;
  isSubmitting: boolean;
  panVerified: boolean;
  onUpdateValue: (name: string, value: string) => void;
  onVerifyPAN: () => Promise<boolean>;
  onSubmit: () => Promise<boolean>;
  onPrevious: () => void;
}

export const Step2: React.FC<Step2Props> = ({
  values,
  errors,
  isLoading,
  isSubmitting,
  panVerified,
  onUpdateValue,
  onVerifyPAN,
  onSubmit,
  onPrevious,
}) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleVerifyPAN = async () => {
    const success = await onVerifyPAN();
    if (success) {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  };

  const handleSubmit = async () => {
    const success = await onSubmit();
    if (success) {
      // Handle successful submission (redirect, show success page, etc.)
      alert('Form submitted successfully!');
    }
  };

  const panField = {
    id: 'pan_number',
    name: 'pan',
    type: 'text',
    label: 'PAN Number',
    placeholder: 'Enter 10-character PAN number',
    required: true,
    maxLength: 10,
    pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$',
  };

  const nameField = {
    id: 'pan_holder_name',
    name: 'panHolderName',
    type: 'text',
    label: 'Name as per PAN',
    placeholder: 'Enter name as mentioned in PAN card',
    required: true,
    maxLength: 100,
  };

  const dobField = {
    id: 'date_of_birth',
    name: 'dateOfBirth',
    type: 'date',
    label: 'Date of Birth',
    required: true,
  };

  const isPANValid = values.pan && values.pan.length === 10 && !errors.pan;
  const isNameValid = values.panHolderName && values.panHolderName.trim().length >= 2 && !errors.panHolderName;
  const isDOBValid = values.dateOfBirth && !errors.dateOfBirth;
  const canVerifyPAN = isPANValid && isNameValid && isDOBValid && !isLoading;
  const canSubmit = panVerified && !isSubmitting;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          PAN Verification
        </h2>
        <p className="text-gray-600">
          Please enter your PAN details for verification
        </p>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-slide-up">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-green-800">
              PAN verified successfully!
            </span>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-6">
        {/* PAN Number */}
        <FormField
          field={panField}
          value={values.pan || ''}
          error={errors.pan}
          onChange={onUpdateValue}
          disabled={isLoading || panVerified}
        />

        {/* Name as per PAN */}
        <FormField
          field={nameField}
          value={values.panHolderName || ''}
          error={errors.panHolderName}
          onChange={onUpdateValue}
          disabled={isLoading || panVerified}
        />

        {/* Date of Birth */}
        <FormField
          field={dobField}
          value={values.dateOfBirth || ''}
          error={errors.dateOfBirth}
          onChange={onUpdateValue}
          disabled={isLoading || panVerified}
        />

        {/* Verify PAN Button */}
        {!panVerified && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleVerifyPAN}
              disabled={!canVerifyPAN}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all duration-200
                ${canVerifyPAN
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
                ${isLoading ? 'opacity-50' : ''}
              `}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="spinner w-4 h-4 mr-2"></div>
                  Verifying PAN...
                </div>
              ) : (
                'Verify PAN'
              )}
            </button>
          </div>
        )}

        {/* PAN Verified Status */}
        {panVerified && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-medium text-green-800">
                PAN Verified Successfully
              </span>
            </div>
            <p className="text-sm text-green-700 text-center mt-2">
              Your PAN details have been verified. You can now submit the form.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isLoading || isSubmitting}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`
            px-8 py-3 rounded-lg font-medium transition-all duration-200
            ${canSubmit
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
            ${isSubmitting ? 'opacity-50' : ''}
          `}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="spinner w-4 h-4 mr-2"></div>
              Submitting...
            </div>
          ) : (
            'Submit Application'
          )}
        </button>
      </div>

      {/* PAN Information */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-800">PAN Format Information</h4>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• PAN should be 10 characters long</li>
              <li>• Format: ABCDE1234F (5 letters + 4 numbers + 1 letter)</li>
              <li>• All letters should be in uppercase</li>
              <li>• Name should match exactly as per PAN card</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm font-medium text-red-800">
              {errors.submit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};