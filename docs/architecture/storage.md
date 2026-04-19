# Storage Architecture

## Overview
Sistem menggunakan **Supabase Storage** untuk file attachments pada dokumen. Bucket `letter-attachments` menyimpan file lampiran surat keluar dengan struktur folder terorganisir.

## Storage Bucket Configuration

### Bucket Setup
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('letter-attachments', 'letter-attachments', true)
ON CONFLICT (id) DO NOTHING;
```

### Security Policies
```sql
-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'letter-attachments');

-- Allow authenticated reads
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'letter-attachments');

-- Allow authenticated deletes
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'letter-attachments');

-- Allow public reads (optional for sharing)
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'letter-attachments');
```

### Bucket Settings
- **Name**: `letter-attachments`
- **Public**: `true` (untuk public URLs)
- **File Size Limit**: 5MB per file
- **Allowed MIME Types**:
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `image/jpeg`
  - `image/png`
  - `image/jpg`

## File Structure
```
letter-attachments/
├── temp-{timestamp}/          # Temporary uploads (before letter created)
│   ├── {timestamp}-file1.pdf
│   └── {timestamp}-file2.docx
└── {letter-id}/               # After letter created
    ├── {timestamp}-file1.pdf
    └── {timestamp}-file2.docx
```

## Implementation

### Storage Utilities (`src/lib/supabase/storage.ts`)

```typescript
// Core functions
validateFile(file: File) // Size & type validation
uploadFile(file: File, letterId?: string) // Single file upload
uploadMultipleFiles(files: File[], letterId?: string) // Bulk upload
deleteFile(filePath: string) // Delete file
getFileDownloadUrl(filePath: string) // Get signed URL
formatFileSize(bytes: number) // Human-readable size
getFileIcon(fileType: string) // Emoji icon based on type
```

### Usage in Components
```typescript
// Upload file
const handleFileSelect = async (event) => {
  const files = event.target.files
  const uploadedFile = await uploadFile(files[0], letterId)
  // Returns: { id, name, size, type, url, path }
}

// Delete file
const handleRemoveFile = async (id, path) => {
  await deleteFile(path)
  // Remove from form state
}
```

## Security

### File Validation
- **Size Limit**: 5MB per file
- **Type Validation**: PDF, DOC, DOCX, JPG, PNG only
- **Filename Sanitization**: Remove special characters
- **Unique Naming**: Timestamp + original filename

### Access Control
- **Upload**: Authenticated users only
- **Read**: Public (signed URLs)
- **Delete**: Authenticated users only
- **Update**: Not allowed (immutable files)

## Database Integration

### Schema Update
```sql
-- attachments column (JSONB array)
[
  {
    "id": "1234567890",
    "name": "document.pdf",
    "size": 1024000,
    "type": "application/pdf",
    "url": "https://xxx.supabase.co/storage/v1/object/public/letter-attachments/...",
    "path": "letter-id/1234567890-document.pdf"
  }
]
```

## Cleanup Strategy

### Temp File Cleanup
```sql
-- Function to delete old temp files
CREATE OR REPLACE FUNCTION cleanup_temp_attachments()
RETURNS void AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'letter-attachments'
    AND name LIKE 'temp-%'
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (if pg_cron available)
SELECT cron.schedule(
  'cleanup-temp-attachments',
  '0 2 * * *', -- Daily at 2 AM
  'SELECT cleanup_temp_attachments()'
);
```

## Migration Path

### Temp to Permanent
Saat letter dibuat (DRAFT → saved):
- Copy files dari `temp-{timestamp}/` ke `{letter-id}/`
- Update attachments array dengan path baru
- Delete temp folder

### Fallback Strategy
- Keep temp files untuk simplicity
- Auto-cleanup files > 24 jam
- Manual cleanup untuk orphaned files

## Performance Considerations

### Upload Optimization
- **Chunked Upload**: Untuk file besar (>10MB)
- **Progress Tracking**: Real-time upload progress
- **Resume Upload**: Jika connection terputus

### Access Optimization
- **CDN Delivery**: Supabase CDN untuk global distribution
- **Caching Headers**: Browser caching untuk repeated access
- **Pre-signed URLs**: Secure temporary access

## Monitoring

### Usage Tracking
- **Storage Quota**: Monitor bucket size
- **Upload Frequency**: Track upload patterns
- **Error Rates**: Monitor failed uploads
- **Access Patterns**: File access analytics

### Alerts
- **Quota Warnings**: 80% capacity alerts
- **Failed Uploads**: Error rate monitoring
- **Security Violations**: Unauthorized access attempts

## Troubleshooting

### Common Issues
- **Upload fails**: Check file size/type limits
- **File not found**: Verify bucket permissions
- **Access denied**: Check RLS policies
- **Temp files accumulate**: Run cleanup function

### Debug Commands
```sql
-- Check bucket contents
SELECT * FROM storage.objects
WHERE bucket_id = 'letter-attachments'
LIMIT 10;

-- Check policies
SELECT * FROM storage.policies
WHERE bucket_id = 'letter-attachments';

-- Check file sizes
SELECT
  name,
  metadata->>'size' as size_bytes,
  (metadata->>'size')::bigint / 1024 / 1024 as size_mb
FROM storage.objects
WHERE bucket_id = 'letter-attachments'
ORDER BY metadata->>'size' DESC;
```

---

*Last Updated: 2026-04-04*
*Status: Production Ready*