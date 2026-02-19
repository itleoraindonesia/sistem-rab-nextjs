"use client";

interface ErrorStateProps {
  error: string;
  loadExistingData?: (id: string) => void;
  id?: string;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export default function ErrorState({ 
  error, 
  loadExistingData, 
  id,
  onRetry,
  title = "Error Memuat Data",
  description
}: ErrorStateProps) {
  return (
    <div className='max-w-4xl mx-auto p-10'>
      <div className='bg-error-surface border border-error rounded-lg p-6 text-center'>
        <div className='text-error text-5xl mb-4'>⚠️</div>
        <h3 className='text-lg font-medium text-error-darker mb-2'>
          {title}
        </h3>
        {description && <p className='text-error-dark mb-2'>{description}</p>}
        <p className='text-error mb-4'>{error}</p>
        {(loadExistingData && id) || onRetry ? (
          <button
            onClick={() => {
              if (onRetry) {
                onRetry();
              } else if (loadExistingData && id) {
                loadExistingData(id);
              }
            }}
            className='bg-error text-inverse px-4 py-2 rounded-lg hover:bg-error-dark transition-colors'
          >
            Coba Lagi
          </button>
        ) : null}
      </div>
    </div>
  );
}
