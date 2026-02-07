'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase/client'
import { FileList } from './FileList'
import { FileModal } from './FileModal'
import Button from '../ui/Button'
import { Input } from '../ui/input'
import { Search, Upload, Filter, List, Grid } from 'lucide-react'

interface FileItem {
  name: string
  size: number
  lastModified: Date
  url: string

}

export function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [bucketName] = useState('Leora Files') // User-specified bucket name

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        })

      if (error) {
        console.error('Error fetching files:', error)
        return
      }

      if (data) {
        const fileItems = await Promise.all(
          data.map(async (file) => {
            const { data: publicUrl } = supabase
              .storage
              .from(bucketName)
              .getPublicUrl(file.name)

            return {
              name: file.name,
              size: file.metadata?.size || 0,
              lastModified: new Date(file.updated_at),
              url: publicUrl.publicUrl
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
    setSelectedFile(file)
  }

  const handleCloseModal = () => {
    setSelectedFile(null)
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .download(file.name)

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

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

      {/* File List */}
      <FileList
        files={filteredFiles}
        loading={loading}
        viewMode={viewMode}
        onFileClick={handleFileClick}
        onDownload={handleDownload}
      />

      {/* File Modal */}
      {selectedFile && (
        <FileModal
          file={selectedFile}
          onClose={handleCloseModal}
          onDownload={handleDownload}
        />
      )}
    </div>
  )
}