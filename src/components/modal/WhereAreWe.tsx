import React, { useEffect, useState } from 'react';
import Mermaid from 'mermaid';
import { getWhereAreWe } from '../../services/generation/getWhereAreWe';
import { WikiFrame } from './WikiFrame';

interface WhereAreWeProps {
  keyword: string;
  paperContext: string;
}

export const WhereAreWe: React.FC<WhereAreWeProps> = ({ keyword, paperContext }) => {
  const [graph, setGraph] = useState<string>('');
  const [showWiki, setShowWiki] = useState(false);
  const [wikiUrl, setWikiUrl] = useState('');

  useEffect(() => {
    const loadGraph = async () => {
      try {
        const graphDefinition = await getWhereAreWe(keyword, paperContext);
        setGraph(graphDefinition);
        await Mermaid.initialize({ startOnLoad: true });
      } catch (error) {
        console.error('Error loading graph:', error);
      }
    };

    loadGraph();
  }, [keyword, paperContext]);

  const handleNodeClick = (url: string) => {
    setWikiUrl(url);
    setShowWiki(true);
  };

  return (
    <div className="where-are-we">
      <h3>Field Context</h3>
      <div className="mermaid-container">
        <div className="mermaid" onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === 'a') {
            e.preventDefault();
            handleNodeClick(target.getAttribute('href') || '');
          }
        }}>
          {graph}
        </div>
      </div>
      {showWiki && (
        <WikiFrame 
          url={wikiUrl} 
          onClose={() => setShowWiki(false)} 
        />
      )}
    </div>
  );
}; 