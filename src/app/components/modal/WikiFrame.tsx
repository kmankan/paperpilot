'use client';

interface WikiFrameProps {
  url: string;
  onClose: () => void;
}

export default function WikiFrame({ url, onClose }: WikiFrameProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white p-4 rounded-lg w-[80vw] h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Wikipedia Article</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <iframe 
          src={url}
          className="w-full flex-grow rounded-lg border border-gray-200"
          title="Wikipedia Article"
        />
      </div>
    </div>
  );
} 