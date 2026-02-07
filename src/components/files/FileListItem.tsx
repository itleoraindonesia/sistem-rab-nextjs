import { FileItem } from './FileManager'
import Button from '../ui/Button'
import { Download, File, FileText, FileImage, FileVideo, FileAudio, FileArchive } from 'lucide-react'

interface FileListItemProps {
  file: FileItem
  onClick: () => void
  onDownload: () => void
}

export function FileListItem({ file, onClick, onDownload }: FileListItemProps) {
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

  return (
    <div 
      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <FileIcon className="h-8 w-8 text-gray-400" />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm">
              {file.name}
            </h3>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
              <span>{formatFileSize(file.size)}</span>
              <span>{formatDate(file.lastModified)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDownload()
            }}
            className="text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}