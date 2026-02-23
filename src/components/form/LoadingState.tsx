import { RefreshCw } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="h-10 w-10 animate-spin text-brand-primary mx-auto" />
        <p className="mt-3 text-sm text-gray-500">Memuat data...</p>
      </div>
    </div>
  );
}
