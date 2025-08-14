import { FormValues, FormErrors, ValidationRule } from '@/types/form';

export class FormValidator {
  private static instance: FormValidator;
  
  public static getInstance(): FormValidator {
    if (!FormValidator.instance) {
      FormValidator.instance = new FormValidator();
    }
    return FormValidator.instance;
  }

  // Validation patterns
  private patterns = {
    aadhaar: /^[0-9]{12}$/,
    mobile: /^[6-9][0-9]{9}$/,
    otp: /^[0-9]{6}$/,
    pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    name: /^[a-zA-Z\s]{2,100}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  };

  // Validation messages
  private messages = {
    required: 'This field is required',
    aadhaar: 'Aadhaar number must be 12 digits',
    mobile: 'Mobile number must be 10 digits starting with 6-9',
    otp: 'OTP must be 6 digits',
    pan: 'PAN must be in format: ABCDE1234F (5 letters, 4 numbers, 1 letter)',
    name: 'Name must contain only letters and spaces (2-100 characters)',
    email: 'Please enter a valid email address',
    minLength: (min: number) => `Minimum ${min} characters required`,
    maxLength: (max: number) => `Maximum ${max} characters allowed`,
  };

  /**
   * Validate a single field
   */
  validateField(name: string, value: string, rule: ValidationRule): string | null {
    // Check if required
    if (rule.required && (!value || value.trim() === '')) {
      return this.messages.required;
    }

    // If field is empty and not required, skip validation
    if (!value || value.trim() === '') {
      return null;
    }

    // Check pattern
    if (rule.pattern) {
      const regex = new RegExp(rule.pattern);
      if (!regex.test(value)) {
        return rule.message || `Invalid ${name} format`;
      }
    }

    // Check min length
    if (rule.minLength && value.length < rule.minLength) {
      return this.messages.minLength(rule.minLength);
    }

    // Check max length
    if (rule.maxLength && value.length > rule.maxLength) {
      return this.messages.maxLength(rule.maxLength);
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      return rule.message;
    }

    return null;
  }

  /**
   * Validate Aadhaar number
   */
  validateAadhaar(aadhaar: string): string | null {
    if (!aadhaar) return this.messages.required;
    
    // Remove spaces and hyphens
    const cleanAadhaar = aadhaar.replace(/[\s-]/g, '');
    
    if (!this.patterns.aadhaar.test(cleanAadhaar)) {
      return this.messages.aadhaar;
    }

    // Verhoeff algorithm check (simplified)
    if (!this.verhoeffCheck(cleanAadhaar)) {
      return 'Invalid Aadhaar number';
    }

    return null;
  }

  /**
   * Validate mobile number
   */
  validateMobile(mobile: string): string | null {
    if (!mobile) return this.messages.required;
    
    const cleanMobile = mobile.replace(/[\s-+()]/g, '');
    
    if (!this.patterns.mobile.test(cleanMobile)) {
      return this.messages.mobile;
    }

    return null;
  }

  /**
   * Validate OTP
   */
  validateOTP(otp: string): string | null {
    if (!otp) return this.messages.required;
    
    if (!this.patterns.otp.test(otp)) {
      return this.messages.otp;
    }

    return null;
  }

  /**
   * Validate PAN number
   */
  validatePAN(pan: string): string | null {
    if (!pan) return this.messages.required;
    
    const cleanPAN = pan.toUpperCase().replace(/\s/g, '');
    
    // Check if it contains lowercase letters (before conversion)
    if (/[a-z]/.test(pan)) {
      return this.messages.pan;
    }
    
    if (!this.patterns.pan.test(cleanPAN)) {
      return this.messages.pan;
    }

    return null;
  }

  /**
   * Validate name
   */
  validateName(name: string): string | null {
    if (!name) return this.messages.required;
    
    if (!this.patterns.name.test(name.trim())) {
      return this.messages.name;
    }

    return null;
  }

  /**
   * Validate entrepreneur name
   */
  validateEntrepreneurName(name: string): string | null {
    if (!name) return this.messages.required;
    
    if (!this.patterns.name.test(name.trim())) {
      return this.messages.name;
    }

    return null;
  }

  /**
   * Validate date of birth
   */
  validateDateOfBirth(dob: string): string | null {
    if (!dob) return this.messages.required;
    
    const date = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date';
    }
    
    if (date > today) {
      return 'Date of birth cannot be in the future';
    }
    
    if (age < 18) {
      return 'You must be at least 18 years old';
    }
    
    if (age > 100) {
      return 'Please enter a valid date of birth';
    }

    return null;
  }

  /**
   * Validate entire form step
   */
  validateStep(values: FormValues, step: number): FormErrors {
    const errors: FormErrors = {};

    if (step === 1) {
      // Step 1: Aadhaar + OTP validation
      if (values.aadhaar) {
        const aadhaarError = this.validateAadhaar(values.aadhaar);
        if (aadhaarError) errors.aadhaar = aadhaarError;
      } else {
        errors.aadhaar = this.messages.required;
      }

      if (values.entrepreneurName) {
        const nameError = this.validateEntrepreneurName(values.entrepreneurName);
        if (nameError) errors.entrepreneurName = nameError;
      }

      if (values.mobile) {
        const mobileError = this.validateMobile(values.mobile);
        if (mobileError) errors.mobile = mobileError;
      } else {
        errors.mobile = this.messages.required;
      }

      // OTP is only validated if provided
      if (values.otp) {
        const otpError = this.validateOTP(values.otp);
        if (otpError) errors.otp = otpError;
      }
    } else if (step === 2) {
      // Step 2: PAN validation
      if (values.pan) {
        const panError = this.validatePAN(values.pan);
        if (panError) errors.pan = panError;
      } else {
        errors.pan = this.messages.required;
      }

      if (values.panHolderName) {
        const nameError = this.validateName(values.panHolderName);
        if (nameError) errors.panHolderName = nameError;
      } else {
        errors.panHolderName = this.messages.required;
      }

      if (values.dateOfBirth) {
        const dobError = this.validateDateOfBirth(values.dateOfBirth);
        if (dobError) errors.dateOfBirth = dobError;
      } else {
        errors.dateOfBirth = this.messages.required;
      }
    }

    return errors;
  }

  /**
   * Check if form step is valid
   */
  isStepValid(values: FormValues, step: number): boolean {
    const errors = this.validateStep(values, step);
    return Object.keys(errors).length === 0;
  }

  /**
   * Simplified Verhoeff algorithm for Aadhaar validation
   */
  private verhoeffCheck(aadhaar: string): boolean {
    // For testing purposes, we'll accept any valid 12-digit number
    // In production, implement the full Verhoeff algorithm
    return aadhaar.length === 12 && /^\d{12}$/.test(aadhaar);
  }

  /**
   * Format Aadhaar number with spaces
   */
  formatAadhaar(aadhaar: string): string {
    const clean = aadhaar.replace(/\D/g, '');
    return clean.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  }

  /**
   * Format mobile number
   */
  formatMobile(mobile: string): string {
    const clean = mobile.replace(/\D/g, '');
    if (clean.length === 10) {
      return clean.replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    return clean;
  }

  /**
   * Format PAN number
   */
  formatPAN(pan: string): string {
    return pan.toUpperCase().replace(/\s/g, '');
  }
}

// Export singleton instance
export const validator = FormValidator.getInstance();