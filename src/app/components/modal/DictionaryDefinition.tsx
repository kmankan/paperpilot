'use client';

interface DictionaryDefinitionProps {
  definition: string;
  sources: string[];
}

export default function DictionaryDefinition({ definition, sources }: DictionaryDefinitionProps) {
  return (
    <section>
      <h3 className="text-lg font-semibold mb-2">Dictionary Definition</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="prose">{definition}</div>
        {sources.length > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            Sources: {sources.join(', ')}
          </div>
        )}
      </div>
    </section>
  );
} 