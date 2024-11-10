'use client';

import { useEffect, useState } from 'react';
import { getWhereAreWe } from '@/app/services/generation/getWhereAreWe';

interface WhereAreWeProps {
  keyword: string;
  paperContext: string;
}

export default function WhereAreWe({ keyword, paperContext }: WhereAreWeProps) {
  const [diagram, setDiagram] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDiagram() {
      if (!keyword) return;
      
      try {
        setLoading(true);
        const result = await getWhereAreWe(keyword, paperContext);
        setDiagram(result.diagram);
      } catch (error) {
        console.error('Error loading field context diagram:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDiagram();
  }, [keyword, paperContext]);

  if (!keyword || loading) {
    return <div className="animate-pulse h-40 bg-gray-200 rounded" />;
  }

  return (
    <section>
      <h3 className="text-lg font-semibold mb-2">Field Context</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="mermaid">
          {diagram}
        </div>
      </div>
    </section>
  );
} 