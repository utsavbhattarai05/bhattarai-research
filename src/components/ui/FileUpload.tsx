'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { FiUploadCloud, FiFile, FiX, FiCheck, FiLoader } from 'react-icons/fi';

export interface UploadedFile {
  key:      string;   // R2 object key
  fileName: string;   // original file name
}

interface FileUploadProps {
  value:     UploadedFile | null;
  onChange:  (file: UploadedFile | null) => void;
  accept?:   string;
  maxSizeMB?: number;
}

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

function formatBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({
  value,
  onChange,
  accept = '.pdf,.doc,.docx',
  maxSizeMB = 50,
}: FileUploadProps) {
  const [status, setStatus]   = useState<UploadStatus>('idle');
  const [error, setError]     = useState('');
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError('');

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB`);
      return;
    }

    setStatus('uploading');
    setProgress(0);

    try {
      // Step 1 — get presigned upload URL
      const res = await fetch('/api/upload', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          fileName: file.name,
          fileType: file.type || 'application/pdf',
          fileSize: file.size,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Failed to get upload URL');
      }

      const { uploadUrl, key, fileName } = await res.json();

      // Step 2 — upload directly to R2 via XMLHttpRequest (tracks progress)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload  = () => xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`));
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'application/pdf');
        xhr.send(file);
      });

      setStatus('done');
      setProgress(100);
      onChange({ key, fileName });
    } catch (err: any) {
      setStatus('error');
      setError(err.message ?? 'Upload failed');
    }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    upload(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const remove = () => {
    onChange(null);
    setStatus('idle');
    setProgress(0);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  // ── Uploaded state ──────────────────────────────────────────────
  if (value) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl">
        <FiCheck size={16} className="text-green-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value.fileName}</p>
          <p className="text-[11px] text-green-600 dark:text-green-400">Uploaded to R2</p>
        </div>
        <button
          type="button"
          onClick={remove}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Remove file"
        >
          <FiX size={15} />
        </button>
      </div>
    );
  }

  // ── Drop zone ───────────────────────────────────────────────────
  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center gap-2 px-6 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
          dragging
            ? 'border-maroon-400 bg-maroon-50 dark:bg-maroon-950/30'
            : 'border-gray-300 dark:border-gray-700 hover:border-maroon-400 dark:hover:border-maroon-500 bg-[var(--surface)]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0])}
        />

        {status === 'uploading' ? (
          <>
            <FiLoader size={28} className="text-maroon-600 dark:text-maroon-400 animate-spin" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading… {progress}%</p>
            <div className="w-full max-w-xs h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-maroon-600 dark:bg-maroon-400 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <FiUploadCloud size={28} className="text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drop file here or <span className="text-maroon-700 dark:text-maroon-400">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">PDF or Word · max {maxSizeMB}MB</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <FiFile size={11} /> {error}
        </p>
      )}
    </div>
  );
}
