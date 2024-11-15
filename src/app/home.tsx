'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isValidUrl } from '@/app/utils/urlcheck';
import { useUrlStore } from '@/app/store/UrlStore';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const { setFileName, url, setUrl } = useUrlStore();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSubmit = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      setIsNavigating(true);
      console.log('Checking if URL is accessible');
      const response = await fetch('/api/check-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('URL is not accessible');
      }

      setUrl(url);
      router.push(`/pdf-viewer?url=${url}`);
    } catch (error) {
      toast.error('Unable to access this URL. Please check if it exists and try again.');
      setIsNavigating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set dragging true if dragging over our dropzone
    if (e.currentTarget === dropZoneRef.current) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setIsDragging(true);
      } else if (e.type === 'dragleave') {
        setIsDragging(false);
      }
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 10MB');
      return false;
    }

    return true;
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer?.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setFileName(data.filename);
      toast.success('File uploaded successfully!');
      setSelectedFile(null);
    } catch (error) {
      toast.error('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-700">
          Integrated Research Environment
        </h1>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 items-center justify-center">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter URL of PDF"
              aria-label="URL input"
              className="w-full sm:w-96 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
            <button
              onClick={handleSubmit}
              disabled={isNavigating}
              aria-label="Submit URL"
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-red-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isNavigating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                'Submit'
              )}
            </button>
          </div>

          <div className="flex flex-col items-center">
            <div
              ref={dropZoneRef}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`w-full max-w-xl p-8 border-2 border-dashed rounded-lg transition-colors ${isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  {selectedFile
                    ? `Selected: ${selectedFile.name}`
                    : 'Drag and drop your PDF here, or'}
                </p>
                <div className="flex flex-col items-center gap-4">
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-blue-100 transition-colors">
                      Choose file
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  {selectedFile && (
                    <button
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Upload PDF'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};