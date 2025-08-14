import { validator } from '../src/utils/validation'

describe('Form Validation', () => {
  describe('Aadhaar Validation', () => {
    test('should validate correct Aadhaar number', () => {
      const result = validator.validateAadhaar('123456789012')
      expect(result).toBeNull()
    })

    test('should reject Aadhaar with less than 12 digits', () => {
      const result = validator.validateAadhaar('12345678901')
      expect(result).toBe('Aadhaar number must be 12 digits')
    })

    test('should reject Aadhaar with more than 12 digits', () => {
      const result = validator.validateAadhaar('1234567890123')
      expect(result).toBe('Aadhaar number must be 12 digits')
    })

    test('should reject Aadhaar with non-numeric characters', () => {
      const result = validator.validateAadhaar('12345678901a')
      expect(result).toBe('Aadhaar number must be 12 digits')
    })

    test('should reject empty Aadhaar', () => {
      const result = validator.validateAadhaar('')
      expect(result).toBe('This field is required')
    })

    test('should handle Aadhaar with spaces', () => {
      const result = validator.validateAadhaar('1234 5678 9012')
      expect(result).toBeNull()
    })
  })

  describe('Mobile Validation', () => {
    test('should validate correct mobile number', () => {
      const result = validator.validateMobile('9876543210')
      expect(result).toBeNull()
    })

    test('should reject mobile starting with invalid digit', () => {
      const result = validator.validateMobile('5876543210')
      expect(result).toBe('Mobile number must be 10 digits starting with 6-9')
    })

    test('should reject mobile with less than 10 digits', () => {
      const result = validator.validateMobile('987654321')
      expect(result).toBe('Mobile number must be 10 digits starting with 6-9')
    })

    test('should reject mobile with more than 10 digits', () => {
      const result = validator.validateMobile('98765432101')
      expect(result).toBe('Mobile number must be 10 digits starting with 6-9')
    })

    test('should reject empty mobile', () => {
      const result = validator.validateMobile('')
      expect(result).toBe('This field is required')
    })
  })

  describe('OTP Validation', () => {
    test('should validate correct OTP', () => {
      const result = validator.validateOTP('123456')
      expect(result).toBeNull()
    })

    test('should reject OTP with less than 6 digits', () => {
      const result = validator.validateOTP('12345')
      expect(result).toBe('OTP must be 6 digits')
    })

    test('should reject OTP with more than 6 digits', () => {
      const result = validator.validateOTP('1234567')
      expect(result).toBe('OTP must be 6 digits')
    })

    test('should reject OTP with non-numeric characters', () => {
      const result = validator.validateOTP('12345a')
      expect(result).toBe('OTP must be 6 digits')
    })

    test('should reject empty OTP', () => {
      const result = validator.validateOTP('')
      expect(result).toBe('This field is required')
    })
  })

  describe('PAN Validation', () => {
    test('should validate correct PAN', () => {
      const result = validator.validatePAN('ABCDE1234F')
      expect(result).toBeNull()
    })

    test('should reject PAN with incorrect format', () => {
      const result = validator.validatePAN('ABC1234DEF')
      expect(result).toBe('PAN must be in format: ABCDE1234F (5 letters, 4 numbers, 1 letter)')
    })

    test('should reject PAN with lowercase letters', () => {
      const result = validator.validatePAN('abcde1234f')
      expect(result).toBe('PAN must be in format: ABCDE1234F (5 letters, 4 numbers, 1 letter)')
    })

    test('should reject empty PAN', () => {
      const result = validator.validatePAN('')
      expect(result).toBe('This field is required')
    })

    test('should reject PAN with special characters', () => {
      const result = validator.validatePAN('ABCD@1234F')
      expect(result).toBe('PAN must be in format: ABCDE1234F (5 letters, 4 numbers, 1 letter)')
    })
  })

  describe('Name Validation', () => {
    test('should validate correct name', () => {
      const result = validator.validateName('John Doe')
      expect(result).toBeNull()
    })

    test('should reject name with numbers', () => {
      const result = validator.validateName('John123')
      expect(result).toBe('Name must contain only letters and spaces (2-100 characters)')
    })

    test('should reject name with special characters', () => {
      const result = validator.validateName('John@Doe')
      expect(result).toBe('Name must contain only letters and spaces (2-100 characters)')
    })

    test('should reject name that is too short', () => {
      const result = validator.validateName('J')
      expect(result).toBe('Name must contain only letters and spaces (2-100 characters)')
    })

    test('should reject empty name', () => {
      const result = validator.validateName('')
      expect(result).toBe('This field is required')
    })
  })

  describe('Date of Birth Validation', () => {
    test('should validate correct date of birth', () => {
      const result = validator.validateDateOfBirth('1990-01-01')
      expect(result).toBeNull()
    })

    test('should reject future date', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const result = validator.validateDateOfBirth(futureDate.toISOString().split('T')[0])
      expect(result).toBe('Date of birth cannot be in the future')
    })

    test('should reject age less than 18', () => {
      const recentDate = new Date()
      recentDate.setFullYear(recentDate.getFullYear() - 10)
      const result = validator.validateDateOfBirth(recentDate.toISOString().split('T')[0])
      expect(result).toBe('You must be at least 18 years old')
    })

    test('should reject age more than 100', () => {
      const oldDate = new Date()
      oldDate.setFullYear(oldDate.getFullYear() - 110)
      const result = validator.validateDateOfBirth(oldDate.toISOString().split('T')[0])
      expect(result).toBe('Please enter a valid date of birth')
    })

    test('should reject empty date', () => {
      const result = validator.validateDateOfBirth('')
      expect(result).toBe('This field is required')
    })
  })

  describe('Step Validation', () => {
    test('should validate complete step 1', () => {
      const values = {
        aadhaar: '123456789012',
        mobile: '9876543210',
        otp: '123456'
      }
      const errors = validator.validateStep(values, 1)
      expect(Object.keys(errors)).toHaveLength(0)
    })

    test('should validate complete step 2', () => {
      const values = {
        pan: 'ABCDE1234F',
        panHolderName: 'John Doe',
        dateOfBirth: '1990-01-01'
      }
      const errors = validator.validateStep(values, 2)
      expect(Object.keys(errors)).toHaveLength(0)
    })

    test('should return errors for invalid step 1', () => {
      const values = {
        aadhaar: '123',
        mobile: '123',
        otp: '123'
      }
      const errors = validator.validateStep(values, 1)
      expect(Object.keys(errors)).toHaveLength(3)
      expect(errors.aadhaar).toBeDefined()
      expect(errors.mobile).toBeDefined()
      expect(errors.otp).toBeDefined()
    })
  })

  describe('Formatting Functions', () => {
    test('should format Aadhaar with spaces', () => {
      const formatted = validator.formatAadhaar('123456789012')
      expect(formatted).toBe('1234 5678 9012')
    })

    test('should format mobile number', () => {
      const formatted = validator.formatMobile('9876543210')
      expect(formatted).toBe('98765 43210')
    })

    test('should format PAN to uppercase', () => {
      const formatted = validator.formatPAN('abcde1234f')
      expect(formatted).toBe('ABCDE1234F')
    })
  })
})