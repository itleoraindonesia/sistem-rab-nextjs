import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { FileItem } from './FileManager'
import Button from '../ui/Button'
import { X, Download, Eye, File, FileText, FileImage, FileVideo, FileAudio, FileArchive } from 'lucide-react'
import { supabase } from '@/lib/supabase/client';

interface FileModalProps {
  file: FileItem
  onClose: () => void
  onDownload: (file: FileItem) => void
}

export function FileModal({ file, onClose, onDownload }: FileModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase()
    
    if (!extension) return File

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf']
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac']
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz']

    if (imageExtensions.includes(extension)) return FileImage
    if (documentExtensions.includes(extension)) return FileText
    if (videoExtensions.includes(extension)) return FileVideo
    if (audioExtensions.includes(extension)) return FileAudio
    if (archiveExtensions.includes(extension)) return FileArchive
    
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const FileIcon = getFileIcon(file.name)
  const extension = file.name.split('.').pop()?.toUpperCase() || 'Unknown'
  const isImage = ['JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'SVG', 'WEBP'].includes(extension)

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity h-full w-full" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 mx-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-primary/10 p-2 rounded-lg shrink-0">
              <FileIcon className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 truncate" title={file.name}>
              {file.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Main Content - Preview */}
          <div className="flex-1 overflow-y-auto bg-gray-50 flex items-center justify-center p-8 lg:border-r border-gray-100 min-h-[300px]">
            {isImage ? (
              <img 
                src={file.url} 
                alt={file.name}
                className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
              />
            ) : (
              <div className="text-center">
                <div className="bg-white p-6 rounded-2xl shadow-sm inline-flex flex-col items-center">
                  <FileIcon className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">Preview tidak tersedia</p>
                  <p className="text-sm text-gray-400 mt-1">{extension} file</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Details */}
          <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Informasi File
              </h3>
              
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Tipe File</dt>
                  <dd className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <span className="uppercase bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {extension}
                    </span>
                  </dd>
                </div>
                
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Ukuran</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatFileSize(file.size)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-gray-500 mb-1">Terakhir Diubah</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatDate(file.lastModified)}
                  </dd>
                </div>


              </dl>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-2">
              <Button
                onClick={() => onDownload(file)}
                className="w-full flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download File
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(file.url, '_blank')}
                className="w-full flex items-center justify-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Buka di Tab Baru
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}