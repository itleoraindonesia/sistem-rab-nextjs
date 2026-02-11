import { FileItem } from './FileManager'
import { FileCard } from './FileCard'
import { FileListItem } from './FileListItem'
import { supabase } from '@/lib/supabase/client';


interface FileListProps {
  files: FileItem[]
  loading: boolean
  viewMode: 'grid' | 'list'
  onFileClick: (file: FileItem) => void
  onDownload: (file: FileItem) => void
}

export function FileList({ files, loading, viewMode, onFileClick, onDownload }: FileListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
        <p className="mt-4 text-sm text-gray-500 animate-pulse">Memuat file...</p>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Tidak ada file ditemukan</div>
        <div className="text-gray-400 text-sm mt-2">Coba ubah kata kunci pencarian Anda</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {files.map((file) => (
            <FileCard
              key={file.name}
              file={file}
              onClick={() => onFileClick(file)}
              onDownload={() => onDownload(file)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {files.map((file) => (
              <FileListItem
                key={file.name}
                file={file}
                onClick={() => onFileClick(file)}
                onDownload={() => onDownload(file)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}