import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full mx-4 p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-slate-600 dark:text-slate-300" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Anda Sedang Offline
        </h1>
        
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Tidak dapat terhubung ke internet. Silakan periksa koneksi Anda dan coba lagi.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => window.location.reload()}
            className="w-full"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full"
          >
            Kembali
          </Button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Beberapa fitur mungkin tidak tersedia saat offline
          </p>
        </div>
      </div>
    </div>
  );
}
