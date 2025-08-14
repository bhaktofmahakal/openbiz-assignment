import { useState, useCallback, useEffect } from 'react';
import { FormState, FormValues, FormErrors } from '@/types/form';
import { validator } from '@/utils/validation';

const initialState: FormState = {
  currentStep: 1,
  values: {},
  errors: {},
  isLoading: false,
  isSubmitting: false,
  otpSent: false,
  panVerified: false,
};

export const useForm = () => {
  const [state, setState] = useState<FormState>(initialState);

  /**
   * Update form values
   */
  const updateValue = useCallback((name: string, value: string) => {
    setState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [name]: value,
      },
      // Clear error for this field when user starts typing
      errors: {
        ...prev.errors,
        [name]: '',
      },
    }));
  }, []);

  /**
   * Set form errors
   */
  const setErrors = useCallback((errors: FormErrors) => {
    setState(prev => ({
      ...prev,
      errors,
    }));
  }, []);

  /**
   * Set loading state
   */
  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading,
    }));
  }, []);

  /**
   * Set submitting state
   */
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({
      ...prev,
      isSubmitting,
    }));
  }, []);

  /**
   * Validate current step
   */
  const validateCurrentStep = useCallback(() => {
    const errors = validator.validateStep(state.values, state.currentStep);
    setErrors(errors);
    return Object.keys(errors).length === 0;
  }, [state.values, state.currentStep, setErrors]);

  /**
   * Validate single field
   */
  const validateField = useCallback((name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'aadhaar':
        error = validator.validateAadhaar(value) || '';
        break;
      case 'mobile':
        error = validator.validateMobile(value) || '';
        break;
      case 'otp':
        error = validator.validateOTP(value) || '';
        break;
      case 'pan':
        error = validator.validatePAN(value) || '';
        break;
      case 'panHolderName':
        error = validator.validateName(value) || '';
        break;
      case 'dateOfBirth':
        error = validator.validateDateOfBirth(value) || '';
        break;
    }

    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [name]: error,
      },
    }));

    return !error;
  }, []);

  /**
   * Go to next step
   */
  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setState(prev => ({
        ...prev,
        currentStep: Math.min(prev.currentStep + 1, 2),
      }));
      return true;
    }
    return false;
  }, [validateCurrentStep]);

  /**
   * Go to previous step
   */
  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  }, []);

  /**
   * Send OTP
   */
  const sendOTP = useCallback(async () => {
    const aadhaarValid = validateField('aadhaar', state.values.aadhaar || '');
    const mobileValid = validateField('mobile', state.values.mobile || '');

    if (!aadhaarValid || !mobileValid) {
      return false;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aadhaar: state.values.aadhaar,
          mobile: state.values.mobile,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          otpSent: true,
        }));
        return true;
      } else {
        setErrors({ otp: data.message || 'Failed to send OTP' });
        return false;
      }
    } catch (error) {
      setErrors({ otp: 'Network error. Please try again.' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [state.values.aadhaar, state.values.mobile, validateField, setLoading, setErrors]);

  /**
   * Verify OTP
   */
  const verifyOTP = useCallback(async () => {
    const otpValid = validateField('otp', state.values.otp || '');

    if (!otpValid) {
      return false;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aadhaar: state.values.aadhaar,
          mobile: state.values.mobile,
          otp: state.values.otp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return nextStep();
      } else {
        setErrors({ otp: data.message || 'Invalid OTP' });
        return false;
      }
    } catch (error) {
      setErrors({ otp: 'Network error. Please try again.' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [state.values, validateField, setLoading, setErrors, nextStep]);

  /**
   * Verify PAN
   */
  const verifyPAN = useCallback(async () => {
    const panValid = validateField('pan', state.values.pan || '');
    const nameValid = validateField('panHolderName', state.values.panHolderName || '');
    const dobValid = validateField('dateOfBirth', state.values.dateOfBirth || '');

    if (!panValid || !nameValid || !dobValid) {
      return false;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/verify-pan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pan: state.values.pan,
          panHolderName: state.values.panHolderName,
          dateOfBirth: state.values.dateOfBirth,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          panVerified: true,
        }));
        return true;
      } else {
        setErrors({ pan: data.message || 'PAN verification failed' });
        return false;
      }
    } catch (error) {
      setErrors({ pan: 'Network error. Please try again.' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [state.values, validateField, setLoading, setErrors]);

  /**
   * Submit form
   */
  const submitForm = useCallback(async () => {
    if (!validateCurrentStep()) {
      return false;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: state.values,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Reset form or redirect
        setState(initialState);
        return true;
      } else {
        setErrors(data.errors || { submit: data.message || 'Submission failed' });
        return false;
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [state.values, validateCurrentStep, setSubmitting, setErrors]);

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setState(initialState);
  }, []);

  /**
   * Auto-format values on change
   */
  useEffect(() => {
    const { values } = state;
    const newValues: FormValues = { ...values };
    let hasChanges = false;

    // Format Aadhaar
    if (values.aadhaar && values.aadhaar !== validator.formatAadhaar(values.aadhaar)) {
      newValues.aadhaar = validator.formatAadhaar(values.aadhaar);
      hasChanges = true;
    }

    // Format mobile
    if (values.mobile && values.mobile !== validator.formatMobile(values.mobile)) {
      newValues.mobile = validator.formatMobile(values.mobile);
      hasChanges = true;
    }

    // Format PAN
    if (values.pan && values.pan !== validator.formatPAN(values.pan)) {
      newValues.pan = validator.formatPAN(values.pan);
      hasChanges = true;
    }

    if (hasChanges) {
      setState(prev => ({
        ...prev,
        values: newValues,
      }));
    }
  }, [state.values]);

  return {
    // State
    ...state,
    
    // Actions
    updateValue,
    setErrors,
    setLoading,
    setSubmitting,
    validateField,
    validateCurrentStep,
    nextStep,
    prevStep,
    sendOTP,
    verifyOTP,
    verifyPAN,
    submitForm,
    resetForm,
    
    // Computed
    canProceed: validator.isStepValid(state.values, state.currentStep),
    progress: (state.currentStep / 2) * 100,
  };
};