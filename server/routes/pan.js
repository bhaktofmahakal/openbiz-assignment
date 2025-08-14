const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const verifyPANSchema = Joi.object({
  pan: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required().messages({
    'string.pattern.base': 'PAN must be in format: ABCDE1234F (5 letters, 4 numbers, 1 letter)',
    'any.required': 'PAN number is required',
  }),
  panHolderName: Joi.string().min(2).max(100).pattern(/^[a-zA-Z\s]+$/).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 100 characters',
    'string.pattern.base': 'Name must contain only letters and spaces',
    'any.required': 'PAN holder name is required',
  }),
  dateOfBirth: Joi.date().max('now').required().messages({
    'date.max': 'Date of birth cannot be in the future',
    'any.required': 'Date of birth is required',
  }),
});

// Mock PAN database (in production, integrate with actual PAN verification API)
const mockPANDatabase = [
  {
    pan: 'ABCDE1234F',
    name: 'JOHN DOE',
    dateOfBirth: '1990-01-15',
    status: 'ACTIVE',
  },
  {
    pan: 'FGHIJ5678K',
    name: 'JANE SMITH',
    dateOfBirth: '1985-05-20',
    status: 'ACTIVE',
  },
  {
    pan: 'KLMNO9012P',
    name: 'RAJESH KUMAR',
    dateOfBirth: '1988-12-10',
    status: 'ACTIVE',
  },
  {
    pan: 'QRSTU3456V',
    name: 'PRIYA SHARMA',
    dateOfBirth: '1992-08-25',
    status: 'ACTIVE',
  },
  {
    pan: 'WXYZ7890A',
    name: 'AMIT PATEL',
    dateOfBirth: '1987-03-18',
    status: 'ACTIVE',
  },
];

// Simulate PAN verification API call
async function verifyPANWithAPI(pan, name, dob) {
  console.log(`🔍 Verifying PAN: ${pan} for ${name}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check in mock database
  const panRecord = mockPANDatabase.find(record => 
    record.pan === pan.toUpperCase()
  );
  
  if (!panRecord) {
    return {
      success: false,
      message: 'PAN not found in records',
    };
  }
  
  if (panRecord.status !== 'ACTIVE') {
    return {
      success: false,
      message: 'PAN is not active',
    };
  }
  
  // Check name similarity (simplified matching)
  const normalizedInputName = name.toUpperCase().replace(/\s+/g, ' ').trim();
  const normalizedPANName = panRecord.name.toUpperCase().replace(/\s+/g, ' ').trim();
  
  if (normalizedInputName !== normalizedPANName) {
    // Allow partial matches for common name variations
    const inputWords = normalizedInputName.split(' ');
    const panWords = normalizedPANName.split(' ');
    
    const matchingWords = inputWords.filter(word => 
      panWords.some(panWord => panWord.includes(word) || word.includes(panWord))
    );
    
    if (matchingWords.length < Math.min(inputWords.length, panWords.length) * 0.7) {
      return {
        success: false,
        message: 'Name does not match PAN records',
      };
    }
  }
  
  // Check date of birth
  const inputDOB = new Date(dob).toISOString().split('T')[0];
  if (inputDOB !== panRecord.dateOfBirth) {
    return {
      success: false,
      message: 'Date of birth does not match PAN records',
    };
  }
  
  return {
    success: true,
    message: 'PAN verified successfully',
    data: {
      pan: panRecord.pan,
      name: panRecord.name,
      dateOfBirth: panRecord.dateOfBirth,
      status: panRecord.status,
    },
  };
}

// Calculate age from date of birth
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Verify PAN endpoint
router.post('/verify-pan', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = verifyPANSchema.validate(req.body);
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

    const { pan, panHolderName, dateOfBirth } = value;

    // Additional age validation
    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: 'Applicant must be at least 18 years old',
        errors: {
          dateOfBirth: 'You must be at least 18 years old',
        },
      });
    }

    if (age > 100) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid date of birth',
        errors: {
          dateOfBirth: 'Please enter a valid date of birth',
        },
      });
    }

    // Check if PAN was already verified recently
    try {
      const recentVerification = await prisma.panVerification.findFirst({
        where: {
          pan: pan.toUpperCase(),
          status: 'VERIFIED',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      if (recentVerification) {
        return res.json({
          success: true,
          message: 'PAN already verified',
          data: {
            pan: recentVerification.pan,
            name: recentVerification.panHolderName,
            verifiedAt: recentVerification.createdAt.toISOString(),
            cached: true,
          },
        });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue with verification even if cache check fails
    }

    // Verify PAN with external API (mocked)
    const verificationResult = await verifyPANWithAPI(pan, panHolderName, dateOfBirth);

    if (!verificationResult.success) {
      // Log failed verification
      try {
        await prisma.panVerification.create({
          data: {
            pan: pan.toUpperCase(),
            panHolderName,
            dateOfBirth: new Date(dateOfBirth),
            status: 'FAILED',
            errorMessage: verificationResult.message,
          },
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
      }

      return res.status(400).json({
        success: false,
        message: verificationResult.message,
        errors: {
          pan: verificationResult.message,
        },
      });
    }

    // Log successful verification
    try {
      await prisma.panVerification.create({
        data: {
          pan: pan.toUpperCase(),
          panHolderName,
          dateOfBirth: new Date(dateOfBirth),
          status: 'VERIFIED',
          verificationData: JSON.stringify(verificationResult.data),
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue even if logging fails
    }

    res.json({
      success: true,
      message: 'PAN verified successfully',
      data: {
        pan: verificationResult.data.pan,
        name: verificationResult.data.name,
        dateOfBirth: verificationResult.data.dateOfBirth,
        status: verificationResult.data.status,
        verifiedAt: new Date().toISOString(),
        age,
      },
    });

  } catch (error) {
    console.error('Verify PAN error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify PAN. Please try again.',
    });
  }
});

// Get PAN verification status endpoint
router.get('/pan-status/:pan', async (req, res) => {
  try {
    const { pan } = req.params;

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN format',
      });
    }

    const verification = await prisma.panVerification.findFirst({
      where: {
        pan: pan.toUpperCase(),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'No verification found for this PAN',
      });
    }

    res.json({
      success: true,
      data: {
        pan: verification.pan,
        status: verification.status,
        verifiedAt: verification.createdAt.toISOString(),
        name: verification.panHolderName,
        ...(verification.status === 'FAILED' && {
          errorMessage: verification.errorMessage,
        }),
      },
    });

  } catch (error) {
    console.error('PAN status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get PAN status',
    });
  }
});

// Get mock PAN data for testing
router.get('/mock-pan-data', (req, res) => {
  res.json({
    success: true,
    message: 'Mock PAN data for testing',
    data: mockPANDatabase.map(record => ({
      pan: record.pan,
      name: record.name,
      dateOfBirth: record.dateOfBirth,
    })),
  });
});

module.exports = router;