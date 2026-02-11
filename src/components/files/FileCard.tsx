import { FileItem } from './FileManager'
import { cn } from '../../lib/utils'
import { 
  File, FileText, FileImage, FileVideo, FileAudio, FileArchive, 
  Download, FileSpreadsheet, FileCode
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client';

interface FileCardProps {
  file: FileItem
  onClick: () => void
  onDownload: () => void
}

export function FileCard({ file, onClick, onDownload }: FileCardProps) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'unknown'

  const getFileIcon = (ext: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']
    const docExtensions = ['doc', 'docx', 'txt', 'rtf']
    const sheetExtensions = ['xls', 'xlsx', 'csv']
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac']
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz']
    const codeExtensions = ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'php']
    
    if (ext === 'pdf') return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' }
    if (imageExtensions.includes(ext)) return { icon: FileImage, color: 'text-purple-500', bg: 'bg-purple-50' }
    if (docExtensions.includes(ext)) return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' }
    if (sheetExtensions.includes(ext)) return { icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-50' }
    if (videoExtensions.includes(ext)) return { icon: FileVideo, color: 'text-pink-500', bg: 'bg-pink-50' }
    if (audioExtensions.includes(ext)) return { icon: FileAudio, color: 'text-yellow-500', bg: 'bg-yellow-50' }
    if (archiveExtensions.includes(ext)) return { icon: FileArchive, color: 'text-orange-500', bg: 'bg-orange-50' }
    if (codeExtensions.includes(ext)) return { icon: FileCode, color: 'text-slate-500', bg: 'bg-slate-50' }
    
    return { icon: File, color: 'text-gray-500', bg: 'bg-gray-50' }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    })
  }

  const { icon: FileIcon, color, bg } = getFileIcon(extension)
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)

  return (
    <div 
      className="group relative flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Preview Area */}
      <div className={cn("relative aspect-[4/3] w-full overflow-hidden flex items-center justify-center", !isImage && bg)}>
        {isImage ? (
          <img 
            src={file.url} 
            alt={file.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none select-none"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center transform transition-transform duration-300 group-hover:scale-110">
            <FileIcon className={cn("h-12 w-12 mb-2", color)} />
            <span className={cn("text-xs font-medium uppercase tracking-wider opacity-70", color)}>
              {extension}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
        
        {/* Quick Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDownload()
          }}
          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white text-gray-600 hover:text-primary transform translate-y-2 group-hover:translate-y-0"
          title="Download File"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* Info Area */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm truncate leading-tight mb-1" title={file.name}>
              {file.name}
            </h3>
            <div className="flex items-center text-xs text-gray-500 gap-2">
              <span>{formatFileSize(file.size)}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{formatDate(file.lastModified)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
