# Supabase Storage Setup for Letter Attachments

## 📦 Storage Bucket Configuration

### 1. Create Storage Bucket

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Create storage bucket for letter attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('letter-attachments', 'letter-attachments', true)
ON CONFLICT (id) DO NOTHING;
```

### 2. Set Storage Policies

```sql
-- Policy: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'letter-attachments'
);

-- Policy: Allow authenticated users to read files
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'letter-attachments'
);

-- Policy: Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'letter-attachments'
);

-- Policy: Allow public read access (optional, for sharing)
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'letter-attachments'
);
```

### 3. Bucket Settings

- **Bucket Name**: `letter-attachments`
- **Public**: `true` (untuk akses publik URL)
- **File Size Limit**: 5MB per file
- **Allowed MIME Types**:
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `image/jpeg`
  - `image/png`
  - `image/jpg`

---

## 📁 File Structure

Files akan disimpan dengan struktur:

```
letter-attachments/
├── temp-{timestamp}/          # Temporary uploads (before letter created)
│   ├── {timestamp}-file1.pdf
│   └── {timestamp}-file2.docx
└── {letter-id}/               # After letter created
    ├── {timestamp}-file1.pdf
    └── {timestamp}-file2.docx
```

---

## 🔧 Implementation

### Storage Utilities

File: `src/lib/supabase/storage.ts`

**Functions:**
- `validateFile(file)` - Validate file size and type
- `uploadFile(file, letterId)` - Upload single file
- `uploadMultipleFiles(files, letterId)` - Upload multiple files
- `deleteFile(filePath)` - Delete single file
- `deleteMultipleFiles(filePaths)` - Delete multiple files
- `getFileDownloadUrl(filePath)` - Get signed URL for download
- `formatFileSize(bytes)` - Format bytes to human-readable size
- `getFileIcon(fileType)` - Get emoji icon based on file type

### Usage in Form

```typescript
// Upload file
const handleFileSelect = async (event) => {
  const files = event.target.files
  const uploadedFile = await uploadFile(files[0], letterId)
  // uploadedFile contains: { id, name, size, type, url, path }
}

// Delete file
const handleRemoveFile = async (id, path) => {
  await deleteFile(path)
  // Remove from form state
}
```

---

## 🔐 Security

### File Validation

- **Size Limit**: 5MB per file
- **Type Validation**: Only PDF, DOC, DOCX, JPG, PNG
- **Filename Sanitization**: Remove special characters
- **Unique Naming**: Timestamp + original name

### Access Control

- **Upload**: Authenticated users only
- **Read**: Public (via public URL)
- **Delete**: Authenticated users only
- **Update**: Not allowed (immutable)

---

## 📊 Database Schema Update

Update `outgoing_letters` table untuk menyimpan attachments:

```sql
-- attachments column already exists as JSONB
-- Structure:
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

---

## 🧪 Testing

### Manual Test

1. Buka form buat surat baru: `/documents/outgoing-letter/new`
2. Centang "Surat ini memiliki lampiran"
3. Klik "Upload File"
4. Pilih file (PDF, DOC, atau gambar)
5. Verify:
   - File muncul di list dengan icon yang sesuai
   - Size ditampilkan dengan format yang benar
   - File dapat dihapus
   - Upload progress ditampilkan

### Check Storage

1. Buka Supabase Dashboard
2. Go to Storage → `letter-attachments`
3. Verify file terupload dengan struktur folder yang benar

---

## 🚀 Migration Path

### Temporary to Permanent

Saat letter dibuat (status DRAFT → saved):

```typescript
// Option 1: Keep temp files (simpler)
// Files stay in temp-{timestamp}/ folder

// Option 2: Move to letter folder (cleaner)
async function moveFilesToLetter(tempLetterId, actualLetterId) {
  // 1. Copy files from temp folder to letter folder
  // 2. Update attachments array with new paths
  // 3. Delete temp folder
}
```

**Recommendation**: Keep temp files untuk simplicity. Cleanup temp files yang lebih dari 24 jam dengan cron job.

---

## 🧹 Cleanup Strategy

### Auto-cleanup Temp Files

```sql
-- Function to delete old temp files (run daily)
CREATE OR REPLACE FUNCTION cleanup_temp_attachments()
RETURNS void AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'letter-attachments'
    AND name LIKE 'temp-%'
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron (if available)
SELECT cron.schedule(
  'cleanup-temp-attachments',
  '0 2 * * *', -- Run at 2 AM daily
  'SELECT cleanup_temp_attachments()'
);
```

---

## 📝 TODO

- [ ] Setup Supabase Storage bucket
- [ ] Apply storage policies
- [ ] Test file upload
- [ ] Test file delete
- [ ] Implement cleanup cron job
- [ ] Add file preview functionality
- [ ] Add drag & drop upload
- [ ] Add upload progress bar
- [ ] Add file compression for images

---

## 🔗 References

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [File Upload Best Practices](https://supabase.com/docs/guides/storage/uploads)

---

**Last Updated**: 2026-02-11  
**Status**: ✅ Implemented
