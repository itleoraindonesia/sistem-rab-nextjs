export default function KalkulatorHargaPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Kalkulator Harga</h1>
          <p className="text-gray-600">Tools perhitungan otomatis biaya proyek</p>
        </div>

        {/* Coming Soon Content */}
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dalam Pengembangan</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Fitur Kalkulator Harga sedang dalam tahap pengembangan.
              Fitur ini akan memungkinkan Anda untuk menghitung estimasi biaya proyek secara otomatis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
