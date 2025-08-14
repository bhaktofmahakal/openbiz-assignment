const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// Validation schemas
const sendOTPSchema = Joi.object({
  aadhaar: Joi.string().pattern(/^[0-9]{12}$/).required().messages({
    'string.pattern.base': 'Aadhaar number must be 12 digits',
    'any.required': 'Aadhaar number is required',
  }),
  entrepreneurName: Joi.string().min(2).max(100).pattern(/^[a-zA-Z\s]+$/).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 100 characters',
    'string.pattern.base': 'Name must contain only letters and spaces',
    'any.required': 'Entrepreneur name is required',
  }),
  mobile: Joi.string().pattern(/^[6-9][0-9]{9}$/).required().messages({
    'string.pattern.base': 'Mobile number must be 10 digits starting with 6-9',
    'any.required': 'Mobile number is required',
  }),
});

const verifyOTPSchema = Joi.object({
  aadhaar: Joi.string().pattern(/^[0-9]{12}$/).required(),
  entrepreneurName: Joi.string().min(2).max(100).pattern(/^[a-zA-Z\s]+$/).required(),
  mobile: Joi.string().pattern(/^[6-9][0-9]{9}$/).required(),
  otp: Joi.string().pattern(/^[0-9]{6}$/).required().messages({
    'string.pattern.base': 'OTP must be 6 digits',
    'any.required': 'OTP is required',
  }),
});

// Generate random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simulate SMS sending (in production, integrate with SMS gateway)
async function sendSMS(mobile, otp) {
  console.log(`📱 Sending OTP ${otp} to mobile ${mobile}`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
}

// Send OTP endpoint
router.post('/send-otp', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = sendOTPSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        errors: error.details.reduce((acc, detail) => {
          acc[detail.path[0]] = detail.message;
          return acc;
        }, {}),
      });
    }

    const { aadhaar, entrepreneurName, mobile } = value;

    // Check rate limiting (max 3 OTPs per mobile per hour)
    const rateLimitKey = `rate_limit_${mobile}`;
    const currentTime = Date.now();
    const hourAgo = currentTime - (60 * 60 * 1000);
    
    let attempts = otpStore.get(rateLimitKey) || [];
    attempts = attempts.filter(timestamp => timestamp > hourAgo);
    
    if (attempts.length >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again after an hour.',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiryTime = currentTime + (10 * 60 * 1000); // 10 minutes

    // Store OTP
    const otpKey = `${aadhaar}_${mobile}`;
    otpStore.set(otpKey, {
      otp,
      aadhaar,
      entrepreneurName,
      mobile,
      expiryTime,
      attempts: 0,
      verified: false,
    });

    // Update rate limiting
    attempts.push(currentTime);
    otpStore.set(rateLimitKey, attempts);

    // Send SMS (simulated)
    await sendSMS(mobile, otp);

    // Log OTP attempt
    try {
      await prisma.otpLog.create({
        data: {
          aadhaar,
          mobile,
          otpHash: otp, // In production, hash the OTP
          expiryTime: new Date(expiryTime),
          status: 'SENT',
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue even if logging fails
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        mobile: `+91 ${mobile}`,
        expiryTime: new Date(expiryTime).toISOString(),
      },
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
    });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = verifyOTPSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        errors: error.details.reduce((acc, detail) => {
          acc[detail.path[0]] = detail.message;
          return acc;
        }, {}),
      });
    }

    const { aadhaar, entrepreneurName, mobile, otp } = value;
    const otpKey = `${aadhaar}_${mobile}`;
    const storedOTPData = otpStore.get(otpKey);

    // Check if OTP exists
    if (!storedOTPData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new OTP.',
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedOTPData.expiryTime) {
      otpStore.delete(otpKey);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
      });
    }

    // Check if already verified
    if (storedOTPData.verified) {
      return res.status(400).json({
        success: false,
        message: 'OTP already verified.',
      });
    }

    // Check attempt limit
    if (storedOTPData.attempts >= 3) {
      otpStore.delete(otpKey);
      return res.status(400).json({
        success: false,
        message: 'Maximum OTP attempts exceeded. Please request a new OTP.',
      });
    }

    // Verify OTP
    if (storedOTPData.otp !== otp) {
      storedOTPData.attempts += 1;
      otpStore.set(otpKey, storedOTPData);
      
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - storedOTPData.attempts} attempts remaining.`,
      });
    }

    // Mark as verified
    storedOTPData.verified = true;
    otpStore.set(otpKey, storedOTPData);

    // Log successful verification
    try {
      await prisma.otpLog.updateMany({
        where: {
          aadhaar,
          mobile,
          status: 'SENT',
        },
        data: {
          status: 'VERIFIED',
          verifiedAt: new Date(),
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        aadhaar,
        mobile,
        verifiedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.',
    });
  }
});

// Get OTP status endpoint (for debugging)
router.get('/otp-status/:aadhaar/:mobile', async (req, res) => {
  try {
    const { aadhaar, mobile } = req.params;
    const otpKey = `${aadhaar}_${mobile}`;
    const storedOTPData = otpStore.get(otpKey);

    if (!storedOTPData) {
      return res.status(404).json({
        success: false,
        message: 'No OTP found for this combination',
      });
    }

    res.json({
      success: true,
      data: {
        exists: true,
        expired: Date.now() > storedOTPData.expiryTime,
        verified: storedOTPData.verified,
        attempts: storedOTPData.attempts,
        expiryTime: new Date(storedOTPData.expiryTime).toISOString(),
      },
    });

  } catch (error) {
    console.error('OTP status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get OTP status',
    });
  }
});

module.exports = router;