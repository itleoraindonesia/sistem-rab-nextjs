import { FileItem } from './FileManager'
import Button from '../ui/Button'
import { Download, File, FileText, FileImage, FileVideo, FileAudio, FileArchive, Folder, ChevronRight } from 'lucide-react'

interface FileListItemProps {
  file: FileItem
  onClick: () => void
  onDownload: () => void
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

export function FileListItem({ file, onClick, onDownload }: FileListItemProps) {
  if (file.isFolder) {
    const itemCount = file.fileCount || 0
    const countText = itemCount === 1 ? '1 item' : `${itemCount} items`
    
    return (
      <div 
        className="group p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex flex-col items-center">
              <Folder className="h-8 w-8 text-primary fill-primary" />
              {itemCount > 0 && (
                <div className="absolute -bottom-1 -right-1 bg-secondary text-secondary-foreground text-[8px] font-medium px-1 rounded-full">
                  {itemCount}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 text-sm">{file.name}</h3>
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                {itemCount > 0 && <span>{countText}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    )
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf']
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac']
  const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz']
  
  let FileIcon = File
  if (imageExtensions.includes(extension)) FileIcon = FileImage
  else if (documentExtensions.includes(extension)) FileIcon = FileText
  else if (videoExtensions.includes(extension)) FileIcon = FileVideo
  else if (audioExtensions.includes(extension)) FileIcon = FileAudio
  else if (archiveExtensions.includes(extension)) FileIcon = FileArchive

  return (
    <div 
      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100"
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