import React, { useState } from 'react';
import { FormField } from './FormField';
import { FormValues, FormErrors } from '@/types/form';

interface Step1Props {
  values: FormValues;
  errors: FormErrors;
  isLoading: boolean;
  otpSent: boolean;
  onUpdateValue: (name: string, value: string) => void;
  onSendOTP: () => Promise<boolean>;
  onVerifyOTP: () => Promise<boolean>;
  onNext: () => boolean;
}

export const Step1: React.FC<Step1Props> = ({
  values,
  errors,
  isLoading,
  otpSent,
  onUpdateValue,
  onSendOTP,
  onVerifyOTP,
  onNext,
}) => {
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOTP, setCanResendOTP] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);

  const handleSendOTP = async () => {
    if (!consentGiven) {
      alert('Please provide consent to proceed with Aadhaar verification');
      return;
    }
    const success = await onSendOTP();
    if (success) {
      setOtpTimer(30);
      setCanResendOTP(false);
      
      // Start countdown timer
      const timer = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResendOTP(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleVerifyOTP = async () => {
    const success = await onVerifyOTP();
    if (success) {
      // OTP verified, form will automatically proceed to next step
    }
  };

  const aadhaarField = {
    id: 'ctl00_ContentPlaceHolder1_txtadharno',
    name: 'aadhaar',
    type: 'text',
    label: '1. Aadhaar Number/ आधार संख्या',
    placeholder: 'Enter 12-digit Aadhaar number',
    required: true,
    maxLength: 12,
    pattern: '^[0-9]{12}$',
  };

  const entrepreneurNameField = {
    id: 'ctl00_ContentPlaceHolder1_txtownername',
    name: 'entrepreneurName',
    type: 'text',
    label: '2. Name of Entrepreneur / उद्यमी का नाम',
    placeholder: 'Enter name as per Aadhaar',
    required: true,
    maxLength: 100,
    pattern: '^[a-zA-Z\\s]{2,100}$',
  };

  const mobileField = {
    id: 'mobile_number',
    name: 'mobile',
    type: 'tel',
    label: 'Mobile Number / मोबाइल नंबर',
    placeholder: 'Enter 10-digit mobile number',
    required: true,
    maxLength: 10,
    pattern: '^[6-9][0-9]{9}$',
  };

  const otpField = {
    id: 'otp_field',
    name: 'otp',
    type: 'text',
    label: 'OTP / ओटीपी',
    placeholder: 'Enter 6-digit OTP',
    required: true,
    maxLength: 6,
    pattern: '^[0-9]{6}$',
  };

  const isAadhaarValid = values.aadhaar && values.aadhaar.length === 12 && !errors.aadhaar;
  const isNameValid = values.entrepreneurName && values.entrepreneurName.length >= 2 && !errors.entrepreneurName;
  const isMobileValid = values.mobile && values.mobile.length === 10 && !errors.mobile;
  const canSendOTP = isAadhaarValid && isNameValid && isMobileValid && canResendOTP && !isLoading && consentGiven;
  const isOTPValid = values.otp && values.otp.length === 6 && !errors.otp;
  const canVerifyOTP = isOTPValid && otpSent && !isLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center border-b pb-6 mb-8">
        <h1 className="text-xl font-bold text-blue-800 mb-2">
          UDYAM REGISTRATION FORM
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          For New Enterprise who are not Registered yet as MSME
        </p>
        <h2 className="text-lg font-semibold text-gray-900">
          Aadhaar Verification With OTP
        </h2>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Aadhaar Number */}
        <FormField
          field={aadhaarField}
          value={values.aadhaar || ''}
          error={errors.aadhaar}
          onChange={onUpdateValue}
          disabled={isLoading}
        />

        {/* Entrepreneur Name */}
        <FormField
          field={entrepreneurNameField}
          value={values.entrepreneurName || ''}
          error={errors.entrepreneurName}
          onChange={onUpdateValue}
          disabled={isLoading}
        />

        {/* Mobile Number */}
        <FormField
          field={mobileField}
          value={values.mobile || ''}
          error={errors.mobile}
          onChange={onUpdateValue}
          disabled={isLoading}
        />

        {/* Aadhaar Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Aadhaar number shall be required for Udyam Registration.</p>
            <ul className="space-y-1 text-xs">
              <li>• The Aadhaar number shall be of the proprietor in the case of a proprietorship firm, of the managing partner in the case of a partnership firm and of a karta in the case of a Hindu Undivided Family (HUF).</li>
              <li>• In case of a Company or a Limited Liability Partnership or a Cooperative Society or a Society or a Trust, the organisation or its authorised signatory shall provide its GSTIN(As per applicablity of CGST Act 2017 and as notified by the ministry of MSME vide S.O. 1055(E) dated 05th March 2021) and PAN along with its Aadhaar number.</li>
            </ul>
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-xs text-gray-700 leading-relaxed">
              I, the holder of the above Aadhaar, hereby give my consent to Ministry of MSME, Government of India, for using my Aadhaar number as alloted by UIDAI for Udyam Registration. NIC / Ministry of MSME, Government of India, have informed me that my aadhaar data will not be stored/shared. / मैं, आधार धारक, इस प्रकार उद्यम पंजीकरण के लिए यूआईडीएआई के साथ अपने आधार संख्या का उपयोग करने के लिए सू0ल0म0उ0 मंत्रालय, भारत सरकार को अपनी सहमति देता हूं। एनआईसी / सू0ल0म0उ0 मंत्रालय, भारत सरकार ने मुझे सूचित किया है कि मेरा आधार डेटा संग्रहीत / साझा नहीं किया जाएगा।
            </span>
          </label>
        </div>

        {/* Send OTP Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSendOTP}
            disabled={!canSendOTP}
            className={`
              px-8 py-3 rounded-lg font-medium transition-all duration-200 text-sm
              ${canSendOTP
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
              ${isLoading ? 'opacity-50' : ''}
            `}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="spinner w-4 h-4 mr-2"></div>
                Sending OTP...
              </div>
            ) : otpSent ? (
              canResendOTP ? 'Resend OTP' : `Resend OTP (${otpTimer}s)`
            ) : (
              'Validate & Generate OTP'
            )}
          </button>
        </div>

        {/* OTP Field - Only show after OTP is sent */}
        {otpSent && (
          <div className="animate-slide-up">
            <FormField
              field={otpField}
              value={values.otp || ''}
              error={errors.otp}
              onChange={onUpdateValue}
              disabled={isLoading}
            />

            {/* OTP Info */}
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-blue-700">
                  OTP sent to {values.mobile ? `+91 ${values.mobile}` : 'your mobile number'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <div></div> {/* Empty div for spacing */}
        
        <div className="flex space-x-4">
          {otpSent && (
            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={!canVerifyOTP}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all duration-200
                ${canVerifyOTP
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
                ${isLoading ? 'opacity-50' : ''}
              `}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="spinner w-4 h-4 mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify OTP & Continue'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Your Aadhaar and mobile number are encrypted and stored securely. 
              We never share your personal information with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};