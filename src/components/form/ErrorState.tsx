interface ErrorStateProps {
  error: string;
  loadExistingData?: (id: string) => void;
  id?: string;
}

export default function ErrorState({ error, loadExistingData, id }: ErrorStateProps) {
  return (
    <div className='max-w-4xl mx-auto p-10'>
      <div className='bg-error-surface border border-error rounded-lg p-6 text-center'>
        <div className='text-error text-5xl mb-4'>⚠️</div>
        <h3 className='text-lg font-medium text-error-darker mb-2'>
          Error Memuat Data
        </h3>
        <p className='text-error-dark mb-4'>{error}</p>
        {loadExistingData && id && (
          <button
            onClick={() => loadExistingData(id)}
            className='bg-error text-inverse px-4 py-2 rounded-lg hover:bg-error'
          >
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}
