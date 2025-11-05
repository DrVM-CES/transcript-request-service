interface Step {
  id: string;
  title: string;
  description: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: string;
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  const getStepStatus = (stepId: string) => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    const stepIndex = steps.findIndex(step => step.id === stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                  ${status === 'completed' 
                    ? 'bg-success-600 text-white' 
                    : status === 'active'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-200 text-neutral-600'
                  }
                `}>
                  {status === 'completed' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    status === 'active' ? 'text-primary-600' : 'text-neutral-900'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-neutral-600">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-px mx-4 transition-colors
                  ${status === 'completed' ? 'bg-success-600' : 'bg-neutral-200'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}