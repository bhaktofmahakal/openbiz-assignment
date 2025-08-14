export interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  maxLength?: number;
  pattern?: string;
  className?: string;
  value?: string;
  options?: Array<{ value: string; text: string }>;
}

export interface ValidationRule {
  pattern?: string;
  message: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  custom?: (value: string) => boolean;
}

export interface UIComponent {
  type: 'button' | 'select' | 'text' | 'checkbox';
  text?: string;
  className?: string;
  id: string;
  name?: string;
  options?: Array<{ value: string; text: string }>;
}

export interface FormStep {
  title: string;
  fields: FormField[];
  validationRules: Record<string, ValidationRule>;
  uiComponents: UIComponent[];
}

export interface FormData {
  step1: FormStep;
  step2: FormStep;
}

export interface FormValues {
  // Step 1 - Aadhaar + OTP
  aadhaar?: string;
  entrepreneurName?: string;
  mobile?: string;
  otp?: string;
  
  // Step 2 - PAN
  pan?: string;
  panHolderName?: string;
  dateOfBirth?: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormState {
  currentStep: number;
  values: FormValues;
  errors: FormErrors;
  isLoading: boolean;
  isSubmitting: boolean;
  otpSent: boolean;
  panVerified: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface SubmissionData {
  step: number;
  formData: FormValues;
  timestamp: string;
  userAgent?: string;
}