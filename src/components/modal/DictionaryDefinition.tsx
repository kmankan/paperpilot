import React, { useEffect, useState } from 'react';
import { getDictionaryDefinition } from '../../services/generation/getDictionaryDefinition';

interface DictionaryDefinitionProps {
  keyword: string;
}

interface ParsedDefinition {
  word: string;
  pronunciation?: string;
  partOfSpeech?: string;
  definition: string;
  examples?: string[];
}

export const DictionaryDefinition: React.FC<DictionaryDefinitionProps> = ({ keyword }) => {
  const [definition, setDefinition] = useState<ParsedDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parseDefinition = (raw: string): ParsedDefinition => {
      const parts = raw.split(' ');
      const result: ParsedDefinition = {
        word: keyword,
        definition: ''
      };

      let currentIndex = 0;

      if (parts[currentIndex] && parts[currentIndex].startsWith('/')) {
        result.pronunciation = parts[currentIndex];
        currentIndex++;
      }

      if (parts[currentIndex] && parts[currentIndex].startsWith('(')) {
        result.partOfSpeech = parts[currentIndex].replace(/[()]/g, '');
        currentIndex++;
      }

      result.definition = parts.slice(currentIndex).join(' ');
      return result;
    };

    const fetchDefinition = async () => {
      try {
        setLoading(true);
        const rawDefinition = await getDictionaryDefinition(keyword);
        const parsed = parseDefinition(rawDefinition);
        setDefinition(parsed);
        setError(null);
      } catch (err) {
        setError('Failed to load definition');
        console.error('Definition error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDefinition();
  }, [keyword]);

  if (loading) {
    return (
      <div className="dictionary-definition loading">
        <div className="loading-spinner">Loading definition...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dictionary-definition error">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!definition) {
    return null;
  }

  return (
    <div className="dictionary-definition">
      <div className="definition-header">
        <span className="word">{definition.word}</span>
        {definition.pronunciation && (
          <span className="pronunciation">{definition.pronunciation}</span>
        )}
        {definition.partOfSpeech && (
          <span className="part-of-speech">{definition.partOfSpeech}</span>
        )}
      </div>
      
      <div className="definition-body">
        <p className="definition-text">{definition.definition}</p>
        {definition.examples && definition.examples.length > 0 && (
          <ul className="examples">
            {definition.examples.map((example, index) => (
              <li key={index} className="example">
                &ldquo;{example}&rdquo;
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}; 