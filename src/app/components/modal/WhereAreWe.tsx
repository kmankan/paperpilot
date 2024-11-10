'use client';

import { useEffect, useState, useRef } from 'react';
import { getWhereAreWe } from '@/app/services/generation/getWhereAreWe';
import mermaid from 'mermaid';
import { DEBUG } from '@/app/debug/debug';
import { diagramCache } from '@/app/utils/diagramCache';

interface WhereAreWeProps {
  keyword: string;
  paperContext: string;
  onRegenerate?: () => Promise<void>;
}

// Initialize mermaid config
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  themeVariables: {
    fontFamily: 'inter',
  }
});

export default function WhereAreWe({ keyword, paperContext, onRegenerate }: WhereAreWeProps) {
  const [diagram, setDiagram] = useState<string>('');
  const [editableDiagram, setEditableDiagram] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [isRawTextExpanded, setIsRawTextExpanded] = useState(false);

  // Function to clean diagram text
  const cleanDiagramText = (text: string): string => {
    let cleaned = text;
    // Remove invisible characters and normalize whitespace
    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width spaces
    cleaned = cleaned.replace(/\r\n/g, '\n'); // Normalize line endings
    
    // Remove markdown code block markers
    cleaned = cleaned.replace(/^```(?:mermaid)?\n?/, '');
    cleaned = cleaned.replace(/\n?```$/, '');
    
    // Fix arrow formatting - ensure exactly one space before and after
    cleaned = cleaned.replace(/\s*-->\s*/g, ' --> ');
    
    // Remove trailing whitespace from each line while preserving indentation
    cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n');
    
    // Trim start/end but preserve internal formatting
    return cleaned.trim();
  };

  // Add validation before rendering
  const validateDiagramSyntax = (text: string): void => {
    // Check for invalid characters
    if (/[\u200B-\u200D\uFEFF]/.test(text)) {
      throw new Error('Invalid characters detected in diagram');
    }

    // Check for proper arrow syntax
    const arrowMatches = text.match(/-->/g);
    if (arrowMatches) {
      const invalidArrows = text.match(/\S-->\S|-->\s{2,}|\s{2,}-->/g);
      if (invalidArrows) {
        throw new Error('Invalid arrow formatting: Arrows must have exactly one space before and after');
      }
    }

    // Check for trailing whitespace in node definitions
    const nodeLines = text.split('\n').filter(line => line.includes('['));
    for (const line of nodeLines) {
      if (line.trimEnd() !== line) {
        throw new Error('Invalid node definition: Contains trailing whitespace');
      }
    }
  };

  // Function to render mermaid diagram
  const renderDiagram = async (diagramText: string) => {
    try {
      if (diagramRef.current) {
        diagramRef.current.innerHTML = '';
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const cleanedText = cleanDiagramText(diagramText);
        
        // Validate syntax before rendering
        validateDiagramSyntax(cleanedText);
        
        DEBUG.log('Attempting to render diagram:', { 
          original: diagramText,
          cleaned: cleanedText 
        });

        if (!cleanedText.startsWith('graph TD')) {
          throw new Error('Invalid diagram syntax: Must start with "graph TD"');
        }

        // Add error boundary div for better error reporting
        diagramRef.current.innerHTML = `
          <div class="mermaid-error-boundary">
            <div class="mermaid" id="${id}">${cleanedText}</div>
          </div>
        `;
        
        await mermaid.init({
          startOnLoad: false,
          securityLevel: 'loose'
        }, `#${id}`);

        setError(null);
        DEBUG.log('Mermaid diagram rendered successfully');
      }
    } catch (err) {
      const error = err as Error;
      DEBUG.error('Failed to render mermaid diagram:', error);
      setError(`Failed to render diagram: ${error.message}`);
    }
  };

  // Handle manual diagram updates
  const handleDiagramEdit = async () => {
    if (editorRef.current) {
      try {
        const newDiagram = editorRef.current.value;
        const cleanedDiagram = cleanDiagramText(newDiagram);
        validateDiagramSyntax(cleanedDiagram);
        
        setEditableDiagram(newDiagram);
        setDiagram(newDiagram);
        
        await renderDiagram(newDiagram);
        
        const cacheKey = `${keyword}_${paperContext.slice(0, 100)}`;
        diagramCache.set(cacheKey, newDiagram);
        
        setIsEditing(false);
      } catch (err) {
        const error = err as Error;
        setError(`Failed to update diagram: ${error.message}`);
      }
    }
  };

  // Update regenerateDiagram function
  const regenerateDiagram = async () => {
    const cacheKey = `${keyword}_${paperContext.slice(0, 100)}`;
    diagramCache.clear(cacheKey);

    if (onRegenerate) {
      await onRegenerate();
      return;
    }

    // Fallback to local regeneration if no onRegenerate provided
    try {
      setLoading(true);
      setError(null);
      
      const result = await getWhereAreWe(keyword, paperContext);
      const cleanedDiagram = cleanDiagramText(result.diagram);
      
      setDiagram(result.diagram);
      setEditableDiagram(cleanedDiagram);
      
      await renderDiagram(cleanedDiagram);
      
      // Cache successful render
      diagramCache.set(cacheKey, result.diagram);
    } catch (err) {
      const error = err as Error;
      DEBUG.error('Error regenerating field context diagram:', error);
      setError('Failed to regenerate field context');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadDiagram() {
      if (!keyword) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Try to get cached diagram first
        const cacheKey = `${keyword}_${paperContext.slice(0, 100)}`; // Use combination as key
        const cached = diagramCache.get(cacheKey);
        if (cached) {
          setDiagram(cached);
          setEditableDiagram(cleanDiagramText(cached));
          await renderDiagram(cached);
          setLoading(false);
          return;
        }

        // If no cache, generate new diagram
        const result = await getWhereAreWe(keyword, paperContext);
        const cleanedDiagram = cleanDiagramText(result.diagram);
        
        setDiagram(result.diagram);
        setEditableDiagram(cleanedDiagram);
        
        await renderDiagram(cleanedDiagram);
        
        // Cache successful render
        diagramCache.set(cacheKey, result.diagram);
      } catch (err) {
        const error = err as Error;
        DEBUG.error('Error loading field context diagram:', error);
        setError('Failed to load field context');
      } finally {
        setLoading(false);
      }
    }

    loadDiagram();
  }, [keyword, paperContext]);

  if (!keyword || loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-500 p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">Error Rendering Diagram</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={regenerateDiagram}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
                  title="Regenerate Diagram"
                >
                  ⟳
                </button>
              </div>
              
              <div className="bg-white p-3 rounded border border-red-100 space-y-3">
                <div>
                  <button
                    onClick={() => setIsRawTextExpanded(!isRawTextExpanded)}
                    className="flex items-center justify-between w-full text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    <span>Raw Diagram Text</span>
                    <span className="text-gray-400">
                      {isRawTextExpanded ? '▼' : '▶'}
                    </span>
                  </button>
                  {isRawTextExpanded && (
                    <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                      {diagram || 'No diagram text available'}
                    </pre>
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500">Cleaned Text:</p>
                  <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                    {cleanDiagramText(diagram) || 'No diagram text available'}
                  </pre>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500">Common Issues:</p>
                  <ul className="mt-1 text-xs text-gray-600 list-disc list-inside space-y-1">
                    <li>URLs must be in parentheses after node text</li>
                    <li>Node text must be in square brackets</li>
                    <li>Arrows must be separated by spaces: " --> "</li>
                    <li>Each node needs a unique identifier (A, B, C, etc.)</li>
                    <li>Graph must start with "graph TD"</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="ml-4 text-sm px-3 py-1 rounded bg-white border border-gray-200 hover:bg-gray-50 flex-shrink-0"
            >
              {isEditing ? 'Preview' : 'Edit'}
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="diagram-editor" className="text-sm font-medium text-gray-700">
                Edit Diagram Code
              </label>
              <button
                onClick={handleDiagramEdit}
                className="text-sm px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                Update
              </button>
            </div>
            <textarea
              id="diagram-editor"
              ref={editorRef}
              defaultValue={editableDiagram}
              className="w-full h-48 font-mono text-sm p-3 rounded border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              spellCheck="false"
            />
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">Example Valid Syntax:</p>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
{`graph TD
  A[Astronomy](https://en.wikipedia.org/wiki/Astronomy)
  B[Astrophysics](https://en.wikipedia.org/wiki/Astrophysics)
  C[Gravitational Lensing](https://en.wikipedia.org/wiki/Gravitational_lensing)
  
  A --> B
  B --> C`}
              </pre>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div 
              ref={diagramRef}
              className="mermaid-container overflow-x-auto min-h-[200px]"
            />
            
            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Related Topics</h4>
              <div className="flex flex-wrap gap-2">
                {/* Wiki links will go here */}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Field Context</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm px-3 py-1 rounded bg-white border border-gray-200 hover:bg-gray-50"
        >
          {isEditing ? 'Preview' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="diagram-editor" className="text-sm font-medium text-gray-700">
              Edit Diagram Code
            </label>
            <button
              onClick={handleDiagramEdit}
              className="text-sm px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Update
            </button>
          </div>
          <textarea
            id="diagram-editor"
            ref={editorRef}
            defaultValue={editableDiagram}
            className="w-full h-48 font-mono text-sm p-3 rounded border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            spellCheck="false"
          />
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Example Valid Syntax:</p>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
{`graph TD
  A[Astronomy](https://en.wikipedia.org/wiki/Astronomy)
  B[Astrophysics](https://en.wikipedia.org/wiki/Astrophysics)
  C[Gravitational Lensing](https://en.wikipedia.org/wiki/Gravitational_lensing)
  
  A --> B
  B --> C`}
            </pre>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div 
            ref={diagramRef}
            className="mermaid-container overflow-x-auto min-h-[200px]"
          />
          
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Related Topics</h4>
            <div className="flex flex-wrap gap-2">
              {/* Wiki links will go here */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 