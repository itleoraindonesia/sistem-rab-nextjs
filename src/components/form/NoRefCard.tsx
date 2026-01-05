interface NoRefCardProps {
  noRef?: string;
}

export default function NoRefCard({ noRef }: NoRefCardProps) {
  if (!noRef) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 border-l-4 border-brand-primary">
      <div className="flex items-center gap-3">
        <div className="bg-brand-primary text-white px-3 py-1 rounded font-mono text-sm font-semibold">
          {noRef}
        </div>
        <div>
          <div className="text-sm text-gray-600">Nomor Referensi</div>
          <div className="text-xs text-gray-500">Dokumen RAB ini</div>
        </div>
      </div>
    </div>
  );
}
