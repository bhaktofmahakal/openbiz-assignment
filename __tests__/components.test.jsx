import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormField } from '../src/components/FormField'
import { ProgressTracker } from '../src/components/ProgressTracker'
import { Step1 } from '../src/components/Step1'
import { Step2 } from '../src/components/Step2'

describe('FormField Component', () => {
  const mockField = {
    id: 'test-field',
    name: 'testField',
    type: 'text',
    label: 'Test Field',
    placeholder: 'Enter test value',
    required: true,
    maxLength: 10
  }

  const mockOnChange = jest.fn()
  const mockOnBlur = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
    mockOnBlur.mockClear()
  })

  test('renders field with label and input', () => {
    render(
      <FormField
        field={mockField}
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    )

    expect(screen.getByLabelText('Test Field')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter test value')).toBeInTheDocument()
  })

  test('calls onChange when input value changes', async () => {
    const user = userEvent.setup()
    
    render(
      <FormField
        field={mockField}
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    )

    const input = screen.getByPlaceholderText('Enter test value')
    await user.type(input, 'test')

    expect(mockOnChange).toHaveBeenLastCalledWith('testField', 'test')
  })

  test('calls onBlur when input loses focus', async () => {
    const user = userEvent.setup()
    
    render(
      <FormField
        field={mockField}
        value="test"
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    )

    const input = screen.getByPlaceholderText('Enter test value')
    await user.click(input)
    await user.tab()

    expect(mockOnBlur).toHaveBeenCalledWith('testField', 'test')
  })

  test('displays error message when error prop is provided', () => {
    render(
      <FormField
        field={mockField}
        value=""
        error="This field is required"
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    )

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  test('applies error styling when error is present', () => {
    render(
      <FormField
        field={mockField}
        value=""
        error="This field is required"
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    )

    const input = screen.getByPlaceholderText('Enter test value')
    expect(input).toHaveClass('border-red-500')
  })

  test('handles Aadhaar field formatting', async () => {
    const aadhaarField = {
      ...mockField,
      name: 'aadhaar',
      type: 'text',
      maxLength: 12
    }

    const user = userEvent.setup()
    
    render(
      <FormField
        field={aadhaarField}
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    )

    const input = screen.getByPlaceholderText('Enter test value')
    
    // Test that non-digits are filtered out
    await user.clear(input)
    await user.type(input, 'abc123456789012')

    // Should only allow digits and limit to 12 characters
    expect(mockOnChange).toHaveBeenCalledWith('aadhaar', '1')
    expect(mockOnChange).toHaveBeenCalledWith('aadhaar', '12')
    expect(mockOnChange).toHaveBeenCalledWith('aadhaar', '123')
  })

  test('handles PAN field formatting', async () => {
    const panField = {
      ...mockField,
      name: 'pan',
      type: 'text',
      maxLength: 10
    }

    const user = userEvent.setup()
    
    render(
      <FormField
        field={panField}
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    )

    const input = screen.getByPlaceholderText('Enter test value')
    await user.type(input, 'abcde1234f')

    // Should convert to uppercase
    expect(mockOnChange).toHaveBeenLastCalledWith('pan', 'ABCDE1234F')
  })

  test('renders select field with options', () => {
    const selectField = {
      ...mockField,
      type: 'select',
      options: [
        { value: 'option1', text: 'Option 1' },
        { value: 'option2', text: 'Option 2' }
      ]
    }

    render(
      <FormField
        field={selectField}
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  test('disables input when disabled prop is true', () => {
    render(
      <FormField
        field={mockField}
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
        disabled={true}
      />
    )

    const input = screen.getByPlaceholderText('Enter test value')
    expect(input).toBeDisabled()
  })
})

describe('ProgressTracker Component', () => {
  const mockSteps = [
    { title: 'Step 1', description: 'First step' },
    { title: 'Step 2', description: 'Second step' }
  ]

  test('renders progress tracker with correct steps', () => {
    render(
      <ProgressTracker
        currentStep={1}
        totalSteps={2}
        steps={mockSteps}
      />
    )

    expect(screen.getByText('Step 1')).toBeInTheDocument()
    expect(screen.getByText('Step 2')).toBeInTheDocument()
    expect(screen.getByText('First step')).toBeInTheDocument()
    expect(screen.getByText('Second step')).toBeInTheDocument()
  })

  test('shows correct progress percentage', () => {
    render(
      <ProgressTracker
        currentStep={1}
        totalSteps={2}
        steps={mockSteps}
      />
    )

    const progressBar = document.querySelector('.progress-fill')
    expect(progressBar).toHaveStyle('width: 50%')
  })

  test('highlights current step', () => {
    render(
      <ProgressTracker
        currentStep={2}
        totalSteps={2}
        steps={mockSteps}
      />
    )

    // Check if step 2 is highlighted (current)
    const stepIndicators = document.querySelectorAll('.w-4.h-4.rounded-full')
    expect(stepIndicators[1]).toHaveClass('bg-blue-500')
  })

  test('shows completed steps', () => {
    render(
      <ProgressTracker
        currentStep={2}
        totalSteps={2}
        steps={mockSteps}
      />
    )

    // Step 1 should be completed (green)
    const stepIndicators = document.querySelectorAll('.w-4.h-4.rounded-full')
    expect(stepIndicators[0]).toHaveClass('bg-green-500')
  })
})

describe('Step1 Component', () => {
  const mockProps = {
    values: {},
    errors: {},
    isLoading: false,
    otpSent: false,
    onUpdateValue: jest.fn(),
    onSendOTP: jest.fn(),
    onVerifyOTP: jest.fn(),
    onNext: jest.fn()
  }

  beforeEach(() => {
    Object.values(mockProps).forEach(fn => {
      if (typeof fn === 'function') fn.mockClear()
    })
  })

  test('renders step 1 form fields', () => {
    render(<Step1 {...mockProps} />)

    expect(screen.getByLabelText('Aadhaar Number *')).toBeInTheDocument()
    expect(screen.getByLabelText('Mobile Number *')).toBeInTheDocument()
    expect(screen.getByText('Send OTP')).toBeInTheDocument()
  })

  test('shows OTP field after OTP is sent', () => {
    render(<Step1 {...mockProps} otpSent={true} />)

    expect(screen.getByLabelText('OTP *')).toBeInTheDocument()
    expect(screen.getByText('Verify OTP & Continue')).toBeInTheDocument()
  })

  test('calls onSendOTP when Send OTP button is clicked', async () => {
    mockProps.onSendOTP.mockResolvedValue(true)
    const user = userEvent.setup()

    render(
      <Step1 
        {...mockProps} 
        values={{ aadhaar: '123456789012', mobile: '9876543210' }}
      />
    )

    const sendOTPButton = screen.getByText('Send OTP')
    await user.click(sendOTPButton)

    expect(mockProps.onSendOTP).toHaveBeenCalled()
  })

  test('disables Send OTP button when data is invalid', () => {
    render(
      <Step1 
        {...mockProps} 
        values={{ aadhaar: '123', mobile: '123' }}
      />
    )

    const sendOTPButton = screen.getByText('Send OTP')
    expect(sendOTPButton).toBeDisabled()
  })

  test('shows loading state', () => {
    render(<Step1 {...mockProps} isLoading={true} />)

    expect(screen.getByText('Sending OTP...')).toBeInTheDocument()
  })

  test('displays security notice', () => {
    render(<Step1 {...mockProps} />)

    expect(screen.getByText('Security Notice')).toBeInTheDocument()
    expect(screen.getByText(/Your Aadhaar and mobile number are encrypted/)).toBeInTheDocument()
  })
})

describe('Step2 Component', () => {
  const mockProps = {
    values: {},
    errors: {},
    isLoading: false,
    isSubmitting: false,
    panVerified: false,
    onUpdateValue: jest.fn(),
    onVerifyPAN: jest.fn(),
    onSubmit: jest.fn(),
    onPrevious: jest.fn()
  }

  beforeEach(() => {
    Object.values(mockProps).forEach(fn => {
      if (typeof fn === 'function') fn.mockClear()
    })
  })

  test('renders step 2 form fields', () => {
    render(<Step2 {...mockProps} />)

    expect(screen.getByLabelText('PAN Number *')).toBeInTheDocument()
    expect(screen.getByLabelText('Name as per PAN *')).toBeInTheDocument()
    expect(screen.getByLabelText('Date of Birth *')).toBeInTheDocument()
    expect(screen.getByText('Verify PAN')).toBeInTheDocument()
  })

  test('shows submit button when PAN is verified', () => {
    render(<Step2 {...mockProps} panVerified={true} />)

    expect(screen.getByText('Submit Application')).toBeInTheDocument()
  })

  test('calls onVerifyPAN when Verify PAN button is clicked', async () => {
    mockProps.onVerifyPAN.mockResolvedValue(true)
    const user = userEvent.setup()

    render(
      <Step2 
        {...mockProps} 
        values={{ 
          pan: 'ABCDE1234F', 
          panHolderName: 'John Doe',
          dateOfBirth: '1990-01-01'
        }}
      />
    )

    const verifyPANButton = screen.getByText('Verify PAN')
    await user.click(verifyPANButton)

    expect(mockProps.onVerifyPAN).toHaveBeenCalled()
  })

  test('calls onPrevious when Previous button is clicked', async () => {
    const user = userEvent.setup()

    render(<Step2 {...mockProps} />)

    const previousButton = screen.getByText('Previous')
    await user.click(previousButton)

    expect(mockProps.onPrevious).toHaveBeenCalled()
  })

  test('disables Verify PAN button when data is invalid', () => {
    render(
      <Step2 
        {...mockProps} 
        values={{ pan: 'INVALID', panHolderName: '', dateOfBirth: '' }}
      />
    )

    const verifyPANButton = screen.getByText('Verify PAN')
    expect(verifyPANButton).toBeDisabled()
  })

  test('shows PAN format information', () => {
    render(<Step2 {...mockProps} />)

    expect(screen.getByText('PAN Format Information')).toBeInTheDocument()
    expect(screen.getByText(/Format: ABCDE1234F/)).toBeInTheDocument()
  })

  test('shows verified status when PAN is verified', () => {
    render(<Step2 {...mockProps} panVerified={true} />)

    expect(screen.getByText('PAN Verified Successfully')).toBeInTheDocument()
  })
})