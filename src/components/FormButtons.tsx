interface FormButtonsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  nextLabel?: string;
  submitLabel?: string;
}

export function FormButtons({
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting = false,
  submitDisabled = false,
  nextLabel = "Continue",
  submitLabel = "Submit Request"
}: FormButtonsProps) {
  return (
    <div className="flex justify-between items-center gap-4 pt-6">
      {onPrevious ? (
        <button
          type="button"
          onClick={onPrevious}
          className="inline-flex items-center px-6 py-3 text-base font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
      ) : (
        <div />
      )}

      {onNext && (
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center px-8 py-3 text-base font-semibold text-white bg-mfc-primary-500 rounded-lg hover:bg-mfc-primary-600 transition-all shadow-lg hover:shadow-xl"
        >
          {nextLabel}
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {onSubmit && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || submitDisabled}
          className={`inline-flex items-center px-8 py-3 text-base font-semibold text-white rounded-lg transition-all disabled:cursor-not-allowed ${
            submitDisabled 
              ? 'bg-gray-400 opacity-50 shadow-lg' 
              : 'bg-mfc-green-600 hover:bg-mfc-green-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              {submitLabel}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}
