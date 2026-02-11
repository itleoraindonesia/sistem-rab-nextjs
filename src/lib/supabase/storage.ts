/**
 * File Upload Utilities for Supabase Storage
 * Handles file uploads for outgoing letters attachments
 */

import { supabase } from './client'

const STORAGE_BUCKET = 'letter-attachments'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/jpg',
]

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  path: string
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File terlalu besar. Maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    }
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipe file tidak didukung. Gunakan PDF, DOC, DOCX, JPG, atau PNG',
    }
  }

  return { valid: true }
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  letterId: string
): Promise<UploadedFile> {
  // Validate file
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Generate unique file path
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const fileName = `${letterId}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  try {
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      throw new Error(`Gagal upload file: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)

    return {
      id: timestamp.toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: urlData.publicUrl,
      path: fileName,
    }
  } catch (err: any) {
    console.error('Upload error:', err)
    throw new Error(err.message || 'Gagal upload file')
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  letterId: string
): Promise<UploadedFile[]> {
  const uploadPromises = files.map((file) => uploadFile(file, letterId))
  return Promise.all(uploadPromises)
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      throw new Error(`Gagal hapus file: ${error.message}`)
    }
  } catch (err: any) {
    console.error('Delete error:', err)
    throw new Error(err.message || 'Gagal hapus file')
  }
}

/**
 * Delete multiple files
 */
export async function deleteMultipleFiles(filePaths: string[]): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(filePaths)

    if (error) {
      console.error('Delete error:', error)
      throw new Error(`Gagal hapus files: ${error.message}`)
    }
  } catch (err: any) {
    console.error('Delete error:', err)
    throw new Error(err.message || 'Gagal hapus files')
  }
}

/**
 * Get file download URL
 */
export async function getFileDownloadUrl(filePath: string): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (error) {
      throw new Error(`Gagal mendapatkan URL: ${error.message}`)
    }

    return data.signedUrl
  } catch (err: any) {
    console.error('Get URL error:', err)
    throw new Error(err.message || 'Gagal mendapatkan URL download')
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get file icon based on type
 */
export function getFileIcon(fileType: string): string {
  if (fileType.includes('pdf')) return '📄'
  if (fileType.includes('word') || fileType.includes('document')) return '📝'
  if (fileType.includes('image')) return '🖼️'
  return '📎'
}
