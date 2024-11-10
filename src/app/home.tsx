import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isValidUrl } from '@/app/utils/urlcheck';

export default function Home() {
  const [url, setUrl] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    // Early return if URL is empty
    if (!url.trim()) {
      alert('Please enter a URL');
      return;
    }

    // Check if URL is valid format
    if (!isValidUrl(url)) {
      alert('Please enter a valid URL');
      return;
    }

    try {
      // Check if URL is accessible
      const response = await fetch('/api/check-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('URL is not accessible');
      }

      // If all checks pass, navigate to PDF viewer
      router.push(`/pdf-viewer?url=${encodeURIComponent(url)}`);
    } catch (error) {
      alert('Unable to access this URL. Please check if it exists and try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Integrated Research Environment
        </h1>

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
            aria-label="Submit URL"
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </main>
  );
};