interface ErrorStateProps {
  error: string;
  loadExistingData?: (id: string) => void;
  id?: string;
}

export default function ErrorState({ error, loadExistingData, id }: ErrorStateProps) {
  return (
    <div className='max-w-4xl mx-auto p-10'>
      <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
        <div className='text-red-600 text-5xl mb-4'>⚠️</div>
        <h3 className='text-lg font-medium text-red-900 mb-2'>
          Error Memuat Data
        </h3>
        <p className='text-red-700 mb-4'>{error}</p>
        {loadExistingData && id && (
          <button
            onClick={() => loadExistingData(id)}
            className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg'
          >
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}
