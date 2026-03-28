/**
 * File Upload Utilities for Meeting Attachments
 * Handles file uploads to 'Leora Files' bucket
 */

import { supabase } from './client'

const STORAGE_BUCKET = 'Leora Files'
const MEETING_FOLDER = 'meetings'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/jpg',
]

export interface MeetingAttachment {
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
export function validateMeetingFile(file: File): { valid: boolean; error?: string } {
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
      error: 'Tipe file tidak didukung. Gunakan PDF, DOC, DOCX, XLS, XLSX, JPG, atau PNG',
    }
  }

  return { valid: true }
}

/**
 * Upload file to Supabase Storage for meetings
 * Naming format: meetings/{meeting-number}_{filename}
 */
export async function uploadMeetingFile(
  file: File,
  meetingId: string,
  meetingNumber?: string
): Promise<MeetingAttachment> {
  // Validate file
  const validation = validateMeetingFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Generate unique file path with meeting number for readability
  // Format: meetings/{meeting-number}_{filename}
  // If meetingNumber not available (new meeting), use temp-{meetingId}
  const prefix = meetingNumber ? meetingNumber.replace(/\//g, '-') : `temp-${meetingId.substring(0, 8)}`
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileName = `${MEETING_FOLDER}/${prefix}_${sanitizedName}`

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
      id: Date.now().toString(),
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
 * Upload multiple files for meetings
 */
export async function uploadMultipleMeetingFiles(
  files: File[],
  meetingId: string,
  meetingNumber?: string
): Promise<MeetingAttachment[]> {
  const uploadPromises = files.map((file) => uploadMeetingFile(file, meetingId, meetingNumber))
  return Promise.all(uploadPromises)
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteMeetingFile(filePath: string): Promise<void> {
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
export async function deleteMultipleMeetingFiles(filePaths: string[]): Promise<void> {
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
 * Rename files from temp to actual meeting number
 * Used when meeting is created after file uploads
 * Format change: meetings/temp-{id}_{filename} → meetings/{meeting-number}_{filename}
 */
export async function moveMeetingFiles(
  files: { path: string; name: string; size: number; type: string }[],
  tempMeetingId: string,
  actualMeetingId: string,
  meetingNumber: string
): Promise<MeetingAttachment[]> {
  const movedFiles: MeetingAttachment[] = []
  const normalizedMeetingNumber = meetingNumber.replace(/\//g, '-')

  for (const file of files) {
    // Check if file has temp prefix (format: meetings/temp-{id}_{filename})
    const tempPattern = new RegExp(`^${MEETING_FOLDER}/temp-([a-zA-Z0-9]+)_(.+)$`)
    const match = file.path.match(tempPattern)
    
    if (!match) {
      // File doesn't have temp prefix, already has meeting number
      movedFiles.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.path,
        path: file.path,
      })
      continue
    }

    const [, tempId, originalFilename] = match
    const oldPath = file.path
    const newPath = `${MEETING_FOLDER}/${normalizedMeetingNumber}_${originalFilename}`

    try {
      // Copy file to new location with meeting number
      const { error: copyError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .copy(oldPath, newPath)

      if (copyError) {
        console.error('Copy error:', copyError)
        throw new Error(`Gagal copy file: ${copyError.message}`)
      }

      // Delete old file
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([oldPath])

      if (deleteError) {
        console.warn('Failed to delete temp file:', deleteError)
        // Continue anyway, file was copied successfully
      }

      // Get new public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(newPath)

      movedFiles.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: urlData.publicUrl,
        path: newPath,
      })
    } catch (err: any) {
      console.error('Move file error:', err)
      throw new Error(err.message || 'Gagal memindahkan file')
    }
  }

  return movedFiles
}

/**
 * Get file download URL
 */
export async function getMeetingFileDownloadUrl(filePath: string): Promise<string> {
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
export function getMeetingFileIcon(fileType: string): string {
  if (fileType.includes('pdf')) return '📄'
  if (fileType.includes('word') || fileType.includes('document')) return '📝'
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📊'
  if (fileType.includes('image')) return '🖼️'
  return '📎'
}
