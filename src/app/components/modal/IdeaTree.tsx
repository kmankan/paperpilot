'use client';

interface IdeaTreeProps {
  relationships: string;
  onNodeClick: (concept: string) => void;
}

export default function IdeaTree({ relationships, onNodeClick }: IdeaTreeProps) {
  if (!relationships) {
    return <div className="animate-pulse h-40 bg-gray-200 rounded" />;
  }

  return (
    <section>
      <h3 className="text-lg font-semibold mb-2">Idea Tree</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="mermaid">
          {relationships}
        </div>
      </div>
    </section>
  );
} 