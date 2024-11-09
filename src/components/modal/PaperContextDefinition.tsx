import React, { useEffect, useState } from 'react';
import { getPaperContextDefinition } from '../../services/generation/getPaperContextDefinition';

interface PaperContextDefinitionProps {
  keyword: string;
  paperContext: string;
}

interface ParsedContext {
  role: string;
  methodology: string;
  significance: string;
  implications: string;
}

export const PaperContextDefinition: React.FC<PaperContextDefinitionProps> = ({
  keyword,
  paperContext
}) => {
  const [context, setContext] = useState<ParsedContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        setLoading(true);
        const rawContext = await getPaperContextDefinition(keyword, paperContext);
        const parsed = parseContext(rawContext);
        setContext(parsed);
        setError(null);
      } catch (err) {
        setError('Failed to load paper context');
        console.error('Context error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContext();
  }, [keyword, paperContext]);

  // Parse the raw context into structured sections
  const parseContext = (raw: string): ParsedContext => {
    const sections = raw.split('\n\n').filter(Boolean);
    
    return {
      role: sections[0] || '',
      methodology: sections[1] || '',
      significance: sections[2] || '',
      implications: sections[3] || ''
    };
  };

  if (loading) {
    return (
      <div className="paper-context loading">
        <div className="loading-spinner">
          Analyzing paper context...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="paper-context error">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!context) {
    return null;
  }

  return (
    <div className="paper-context">
      <div className="context-section">
        <h3>Role in Paper</h3>
        <p className="role-text">{context.role}</p>
      </div>

      {context.methodology && (
        <div className="context-section">
          <h3>Methodological Context</h3>
          <p className="methodology-text">{context.methodology}</p>
        </div>
      )}

      <div className="context-section">
        <h3>Significance</h3>
        <p className="significance-text">{context.significance}</p>
      </div>

      {context.implications && (
        <div className="context-section">
          <h3>Broader Implications</h3>
          <p className="implications-text">{context.implications}</p>
        </div>
      )}
    </div>
  );
}; 