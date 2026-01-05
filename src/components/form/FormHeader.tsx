interface FormHeaderProps {
  isEdit?: boolean;
}

export default function FormHeader({ isEdit = false }: FormHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-primary">
              {isEdit ? "Edit RAB" : "Buat RAB Baru"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit
                ? "Edit dokumen RAB yang sudah ada"
                : "Buat dokumen RAB baru untuk proyek Anda"
              }
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-sm text-gray-500">Sistem RAB</div>
              <div className="text-lg font-semibold text-brand-primary">Leora</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
