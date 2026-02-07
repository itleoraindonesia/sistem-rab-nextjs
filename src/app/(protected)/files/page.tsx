import { FileManager } from '@/components/files/FileManager'

export default function FilesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto lg:p-6">
        <FileManager />
      </div>
    </div>
  )
}