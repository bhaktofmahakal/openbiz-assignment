import React from 'react';

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    title: string;
    description: string;
  }>;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentStep,
  totalSteps,
  steps,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="progress-bar h-2">
          <div
            className="progress-fill h-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Step Indicators */}
        <div className="absolute top-0 left-0 w-full flex justify-between transform -translate-y-1">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div
                key={stepNumber}
                className={`
                  w-4 h-4 rounded-full border-2 transition-all duration-300
                  ${isCompleted
                    ? 'bg-green-500 border-green-500'
                    : isCurrent
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
                  }
                `}
              >
                {isCompleted && (
                  <svg
                    className="w-3 h-3 text-white ml-0.5 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Labels */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div
              key={stepNumber}
              className={`
                flex-1 text-center transition-all duration-300
                ${index > 0 ? 'ml-4' : ''}
              `}
            >
              <div
                className={`
                  text-sm font-medium transition-colors duration-300
                  ${isCompleted
                    ? 'text-green-600'
                    : isCurrent
                    ? 'text-blue-600'
                    : 'text-gray-400'
                  }
                `}
              >
                Step {stepNumber}
              </div>
              <div
                className={`
                  text-xs mt-1 transition-colors duration-300
                  ${isCompleted
                    ? 'text-green-500'
                    : isCurrent
                    ? 'text-blue-500'
                    : 'text-gray-400'
                  }
                `}
              >
                {step.title}
              </div>
              <div
                className={`
                  text-xs mt-1 transition-colors duration-300
                  ${isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'}
                `}
              >
                {step.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Progress Text */}
      <div className="md:hidden mt-4 text-center">
        <span className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}: {steps[currentStep - 1]?.title}
        </span>
      </div>
    </div>
  );
};