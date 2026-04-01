'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase/client'
import { FileList } from './FileList'
import { FileModal } from './FileModal'
import Button from '../ui/Button'
import { Input } from '../ui/input'
import { Search, Upload, Filter, List, Grid, Folder, ChevronRight, Home } from 'lucide-react'

export interface FileItem {
  name: string
  size: number
  lastModified: Date
  url: string
  path: string
  isFolder: boolean
  fileCount?: number
}

export function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [bucketName] = useState('Leora Files')
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    fetchFiles()
  }, [currentPath])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .list(currentPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        })

      if (error) {
        console.error('Error fetching files:', error)
        return
      }

      if (data) {
        const fileItems: FileItem[] = await Promise.all(
          data.map(async (item) => {
            const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name
            const isFolder = item.id === null
            
            const { data: publicUrl } = supabase
              .storage
              .from(bucketName)
              .getPublicUrl(fullPath)

            let fileCount: number | undefined
            if (isFolder) {
              const { data: folderData } = await supabase
                .storage
                .from(bucketName)
                .list(fullPath, { limit: 1000 })
              fileCount = folderData?.length || 0
            }

            return {
              name: item.name,
              size: item.metadata?.size || 0,
              lastModified: new Date(item.updated_at || Date.now()),
              url: publicUrl.publicUrl,
              path: fullPath,
              isFolder,
              fileCount
            }
          })
        )
        setFiles(fileItems)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileClick = (file: FileItem) => {
    if (file.isFolder) {
      setCurrentPath(file.path)
    } else {
      setSelectedFile(file)
    }
  }

  const handleNavigateUp = () => {
    const pathParts = currentPath.split('/')
    pathParts.pop()
    setCurrentPath(pathParts.join('/'))
  }

  const handleNavigateToRoot = () => {
    setCurrentPath('')
  }

  const getBreadcrumbParts = () => {
    if (!currentPath) return []
    return currentPath.split('/')
  }

  const handleCloseModal = () => {
    setSelectedFile(null)
  }

  const handleDownload = async (file: FileItem) => {
    if (file.isFolder) return
    
    try {
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .download(file.path)

      if (error) {
        console.error('Error downloading file:', error)
        return
      }

      if (data) {
        const url = window.URL.createObjectURL(data)
        const link = document.createElement('a')
        link.href = url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const filteredFiles = files
    .filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1
      if (!a.isFolder && b.isFolder) return 1
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">File Manager</h1>
          <p className="text-gray-600">Kelola dan akses file dari Leora ERP</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-2"
            >
              <Grid className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNavigateToRoot}
          className={currentPath === '' ? 'h-7 px-2 font-semibold text-primary' : 'h-7 px-2 text-gray-500'}
        >
          <Home className="h-4 w-4" />
        </Button>
        
        {getBreadcrumbParts().map((part, index) => {
          const pathToHere = getBreadcrumbParts().slice(0, index + 1).join('/')
          const isLast = index === getBreadcrumbParts().length - 1
          
          return (
            <div key={index} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-300 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPath(pathToHere)}
                className={isLast ? 'font-semibold text-primary h-7 px-2' : 'h-7 px-2 text-gray-500'}
              >
                {part}
              </Button>
            </div>
          )
        })}
      </div>

      {/* File List */}
      <FileList
        files={filteredFiles}
        loading={loading}
        viewMode={viewMode}
        onFileClick={handleFileClick}
        onDownload={handleDownload}
      />

      {/* File Modal */}
      {selectedFile && !selectedFile.isFolder && (
        <FileModal
          file={selectedFile}
          onClose={handleCloseModal}
          onDownload={handleDownload}
        />
      )}
    </div>
  )
}