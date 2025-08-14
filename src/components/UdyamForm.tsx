import React from 'react';
import { ProgressTracker } from './ProgressTracker';
import { Step1 } from './Step1';
import { Step2 } from './Step2';
import { UdyamHeader } from './UdyamHeader';
import { UdyamFooter } from './UdyamFooter';
import { AccessibilityWidget } from './AccessibilityWidget';
import { useForm } from '@/hooks/useForm';

export const UdyamForm: React.FC = () => {
  const {
    currentStep,
    values,
    errors,
    isLoading,
    isSubmitting,
    otpSent,
    panVerified,
    updateValue,
    sendOTP,
    verifyOTP,
    verifyPAN,
    submitForm,
    nextStep,
    prevStep,
    progress,
  } = useForm();

  const steps = [
    {
      title: 'Aadhaar Verification',
      description: 'Verify your identity with OTP',
    },
    {
      title: 'PAN Verification',
      description: 'Validate PAN details',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <UdyamHeader />
      
      {/* Accessibility Widget */}
      <AccessibilityWidget />

      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Form Container */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Progress Tracker */}
            <div className="bg-blue-50 px-6 py-4 border-b">
              <ProgressTracker
                currentStep={currentStep}
                totalSteps={2}
                steps={steps}
              />
            </div>

            {/* Form Content */}
            <div className="p-6">
              {/* Step Content */}
              {currentStep === 1 && (
                <Step1
                  values={values}
                  errors={errors}
                  isLoading={isLoading}
                  otpSent={otpSent}
                  onUpdateValue={updateValue}
                  onSendOTP={sendOTP}
                  onVerifyOTP={verifyOTP}
                  onNext={nextStep}
                />
              )}

              {currentStep === 2 && (
                <Step2
                  values={values}
                  errors={errors}
                  isLoading={isLoading}
                  isSubmitting={isSubmitting}
                  panVerified={panVerified}
                  onUpdateValue={updateValue}
                  onVerifyPAN={verifyPAN}
                  onSubmit={submitForm}
                  onPrevious={prevStep}
                />
              )}
            </div>

            {/* Progress Indicator */}
            <div className="bg-gray-50 px-6 py-3 border-t text-center">
              <div className="text-sm text-gray-600">
                Step {currentStep} of 2 ({Math.round(progress)}% complete)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <UdyamFooter />
    </div>
  );
};