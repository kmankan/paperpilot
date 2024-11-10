'use client';

interface PaperContextDefinitionProps {
  context: string;
  relatedConcepts: string[];
}

export default function PaperContextDefinition({ context, relatedConcepts }: PaperContextDefinitionProps) {
  return (
    <section>
      <h3 className="text-lg font-semibold mb-2">Paper Context</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="prose">{context}</div>
        {relatedConcepts.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Related Concepts:</h4>
            <ul className="list-disc list-inside">
              {relatedConcepts.map((concept, index) => (
                <li key={index}>{concept}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
} 