'use client';

interface WikiBrowserModalProps {
  content: string;
  onNavigate: (link: string) => void;
}

export default function WikiBrowserModal({ content, onNavigate }: WikiBrowserModalProps) {
  return (
    <section>
      <h3 className="text-lg font-semibold mb-2">Where Are We?</h3>
      <div className="prose max-w-none">
        {content}
      </div>
    </section>
  );
} 