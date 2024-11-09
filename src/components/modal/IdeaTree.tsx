import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { getIdeaTree } from '../../services/generation/getIdeaTree';

interface IdeaTreeProps {
  keyword: string;
  paperContext: string;
}

export const IdeaTree: React.FC<IdeaTreeProps> = ({
  keyword,
  paperContext
}) => {
  const [graph, setGraph] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagramId] = useState(`idea-tree-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const initializeMermaid = async () => {
      try {
        await mermaid.initialize({
          startOnLoad: true,
          theme: 'neutral',
          flowchart: {
            curve: 'basis',
            padding: 15,
            nodeSpacing: 50,
            rankSpacing: 50,
            htmlLabels: true
          }
        });
      } catch (err) {
        console.error('Mermaid initialization error:', err);
      }
    };

    initializeMermaid();
  }, []);

  useEffect(() => {
    const fetchAndRenderGraph = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get graph definition from service
        const graphDefinition = await getIdeaTree(keyword, paperContext);
        setGraph(graphDefinition);

        // Render the graph
        if (graphDefinition) {
          await mermaid.render(diagramId, graphDefinition);
        }
      } catch (err) {
        setError('Failed to generate idea tree');
        console.error('Idea tree error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndRenderGraph();
  }, [keyword, paperContext, diagramId]);

  if (loading) {
    return (
      <div className="idea-tree loading">
        <div className="loading-spinner">
          Generating concept tree...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="idea-tree error">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="idea-tree">
      <div className="idea-tree-header">
        <h3>Concept Breakdown</h3>
      </div>
      <div className="idea-tree-container">
        {graph && (
          <div 
            className="mermaid" 
            dangerouslySetInnerHTML={{ 
              __html: document.getElementById(diagramId)?.innerHTML || '' 
            }}
          />
        )}
      </div>
      <div className="idea-tree-legend">
        <div className="legend-item">
          <span className="legend-dot root"></span>
          <span>Root Concept</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot related"></span>
          <span>Related Concepts</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot implication"></span>
          <span>Implications</span>
        </div>
      </div>
    </div>
  );
}; 