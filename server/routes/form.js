const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema for form submission
const submitFormSchema = Joi.object({
  formData: Joi.object({
    aadhaar: Joi.string().pattern(/^[0-9]{12}$/).required(),
    mobile: Joi.string().pattern(/^[6-9][0-9]{9}$/).required(),
    otp: Joi.string().pattern(/^[0-9]{6}$/).required(),
    pan: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required(),
    panHolderName: Joi.string().min(2).max(100).required(),
    dateOfBirth: Joi.date().max('now').required(),
  }).required(),
  timestamp: Joi.string().isoDate().required(),
  userAgent: Joi.string().optional(),
  ipAddress: Joi.string().ip().optional(),
});

// Generate unique application ID
function generateApplicationId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `UDYAM${timestamp}${random}`.toUpperCase();
}

// Validate form data integrity
async function validateFormIntegrity(formData) {
  const errors = {};

  // Check if OTP was verified for this Aadhaar-Mobile combination
  try {
    const otpVerification = await prisma.otpLog.findFirst({
      where: {
        aadhaar: formData.aadhaar,
        mobile: formData.mobile,
        status: 'VERIFIED',
        verifiedAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes
        },
      },
    });

    if (!otpVerification) {
      errors.otp = 'OTP verification not found or expired';
    }
  } catch (error) {
    console.error('OTP verification check error:', error);
    errors.otp = 'Unable to verify OTP status';
  }

  // Check if PAN was verified
  try {
    const panVerification = await prisma.panVerification.findFirst({
      where: {
        pan: formData.pan.toUpperCase(),
        status: 'VERIFIED',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (!panVerification) {
      errors.pan = 'PAN verification not found or expired';
    } else {
      // Verify name and DOB match
      const inputDOB = new Date(formData.dateOfBirth).toISOString().split('T')[0];
      const verifiedDOB = new Date(panVerification.dateOfBirth).toISOString().split('T')[0];
      
      if (inputDOB !== verifiedDOB) {
        errors.dateOfBirth = 'Date of birth does not match verified PAN data';
      }
      
      const normalizedInputName = formData.panHolderName.toUpperCase().trim();
      const normalizedVerifiedName = panVerification.panHolderName.toUpperCase().trim();
      
      if (normalizedInputName !== normalizedVerifiedName) {
        errors.panHolderName = 'Name does not match verified PAN data';
      }
    }
  } catch (error) {
    console.error('PAN verification check error:', error);
    errors.pan = 'Unable to verify PAN status';
  }

  return errors;
}

// Submit form endpoint
router.post('/submit-form', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = submitFormSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        errors: error.details.reduce((acc, detail) => {
          const path = detail.path.join('.');
          acc[path] = detail.message;
          return acc;
        }, {}),
      });
    }

    const { formData, timestamp, userAgent } = value;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Validate form data integrity
    const integrityErrors = await validateFormIntegrity(formData);
    if (Object.keys(integrityErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Form validation failed',
        errors: integrityErrors,
      });
    }

    // Check for duplicate submissions
    try {
      const existingSubmission = await prisma.formSubmission.findFirst({
        where: {
          aadhaar: formData.aadhaar,
          pan: formData.pan.toUpperCase(),
          status: {
            in: ['SUBMITTED', 'PROCESSING', 'APPROVED'],
          },
        },
      });

      if (existingSubmission) {
        return res.status(409).json({
          success: false,
          message: 'A submission already exists for this Aadhaar-PAN combination',
          data: {
            applicationId: existingSubmission.applicationId,
            submittedAt: existingSubmission.createdAt.toISOString(),
            status: existingSubmission.status,
          },
        });
      }
    } catch (error) {
      console.error('Duplicate check error:', error);
      // Continue with submission even if duplicate check fails
    }

    // Generate application ID
    const applicationId = generateApplicationId();

    // Create form submission record
    const submission = await prisma.formSubmission.create({
      data: {
        applicationId,
        aadhaar: formData.aadhaar,
        mobile: formData.mobile,
        pan: formData.pan.toUpperCase(),
        panHolderName: formData.panHolderName,
        dateOfBirth: new Date(formData.dateOfBirth),
        status: 'SUBMITTED',
        submissionData: JSON.stringify(formData),
        submittedAt: new Date(timestamp),
        ipAddress,
        userAgent,
      },
    });

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          applicationId,
          action: 'FORM_SUBMITTED',
          details: JSON.stringify({
            aadhaar: formData.aadhaar,
            mobile: formData.mobile,
            pan: formData.pan,
            ipAddress,
            userAgent,
          }),
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Audit log error:', error);
      // Continue even if audit logging fails
    }

    // Simulate processing workflow
    setTimeout(async () => {
      try {
        await prisma.formSubmission.update({
          where: { id: submission.id },
          data: { status: 'PROCESSING' },
        });

        // Simulate approval after 30 seconds
        setTimeout(async () => {
          try {
            await prisma.formSubmission.update({
              where: { id: submission.id },
              data: { 
                status: 'APPROVED',
                approvedAt: new Date(),
              },
            });
          } catch (error) {
            console.error('Auto-approval error:', error);
          }
        }, 30000);
      } catch (error) {
        console.error('Status update error:', error);
      }
    }, 5000);

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      data: {
        applicationId,
        status: 'SUBMITTED',
        submittedAt: submission.createdAt.toISOString(),
        estimatedProcessingTime: '2-3 business days',
      },
    });

  } catch (error) {
    console.error('Submit form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit form. Please try again.',
    });
  }
});

// Get application status endpoint
router.get('/application-status/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;

    const submission = await prisma.formSubmission.findUnique({
      where: { applicationId },
      select: {
        applicationId: true,
        status: true,
        createdAt: true,
        submittedAt: true,
        approvedAt: true,
        panHolderName: true,
        pan: true,
      },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.json({
      success: true,
      data: {
        applicationId: submission.applicationId,
        status: submission.status,
        applicantName: submission.panHolderName,
        pan: submission.pan,
        submittedAt: submission.submittedAt.toISOString(),
        ...(submission.approvedAt && {
          approvedAt: submission.approvedAt.toISOString(),
        }),
        statusHistory: await getStatusHistory(applicationId),
      },
    });

  } catch (error) {
    console.error('Application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get application status',
    });
  }
});

// Get status history
async function getStatusHistory(applicationId) {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: { applicationId },
      orderBy: { timestamp: 'asc' },
      select: {
        action: true,
        timestamp: true,
        details: true,
      },
    });

    return auditLogs.map(log => ({
      action: log.action,
      timestamp: log.timestamp.toISOString(),
      details: log.details ? JSON.parse(log.details) : null,
    }));
  } catch (error) {
    console.error('Status history error:', error);
    return [];
  }
}

// Get all submissions (admin endpoint)
router.get('/submissions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [submissions, total] = await Promise.all([
      prisma.formSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          applicationId: true,
          panHolderName: true,
          pan: true,
          mobile: true,
          status: true,
          createdAt: true,
          submittedAt: true,
          approvedAt: true,
        },
      }),
      prisma.formSubmission.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get submissions',
    });
  }
});

// Get form statistics
router.get('/statistics', async (req, res) => {
  try {
    const [
      totalSubmissions,
      submittedCount,
      processingCount,
      approvedCount,
      rejectedCount,
      todaySubmissions,
    ] = await Promise.all([
      prisma.formSubmission.count(),
      prisma.formSubmission.count({ where: { status: 'SUBMITTED' } }),
      prisma.formSubmission.count({ where: { status: 'PROCESSING' } }),
      prisma.formSubmission.count({ where: { status: 'APPROVED' } }),
      prisma.formSubmission.count({ where: { status: 'REJECTED' } }),
      prisma.formSubmission.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total: totalSubmissions,
        byStatus: {
          submitted: submittedCount,
          processing: processingCount,
          approved: approvedCount,
          rejected: rejectedCount,
        },
        today: todaySubmissions,
        approvalRate: totalSubmissions > 0 ? (approvedCount / totalSubmissions * 100).toFixed(2) : 0,
      },
    });

  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
    });
  }
});

module.exports = router;