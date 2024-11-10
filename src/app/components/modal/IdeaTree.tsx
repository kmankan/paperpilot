'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { DEBUG } from '@/app/debug/debug';
import { diagramCache } from '@/app/utils/diagramCache';

interface IdeaTreeProps {
  relationships: string;
  onNodeClick?: (concept: string) => void;
  onRegenerate?: () => Promise<void>;
}

// Initialize mermaid with basic config
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
});

export default function IdeaTree({ relationships, onNodeClick, onRegenerate }: IdeaTreeProps) {
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableDiagram, setEditableDiagram] = useState<string>('');
  const [isRawTextExpanded, setIsRawTextExpanded] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const cleanDiagramText = (text: string): string => {
    let cleaned = text;
    // Remove markdown markers and normalize whitespace
    cleaned = cleaned.replace(/^```(?:mermaid)?\n?/, '');
    cleaned = cleaned.replace(/\n?```$/, '');
    cleaned = cleaned.replace(/\r\n/g, '\n');
    return cleaned.trim();
  };

  const renderDiagram = async (diagramText: string) => {
    try {
      if (!diagramRef.current) return;

      // Clear previous content
      diagramRef.current.innerHTML = '';
      
      // Create unique ID for this render
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      
      const cleanedText = cleanDiagramText(diagramText);
      
      // Basic validation
      if (!cleanedText) {
        throw new Error('Empty diagram text');
      }

      if (!cleanedText.startsWith('graph LR')) {
        throw new Error('Invalid diagram syntax: Must start with "graph LR"');
      }

      // Check for basic node structure
      const nodeMatches = cleanedText.match(/[A-Z]\[[^\]]+\]/g);
      if (!nodeMatches) {
        throw new Error('Invalid diagram syntax: No valid nodes found');
      }

      // Check for relationships
      const relationshipMatches = cleanedText.match(/-->/g);
      if (!relationshipMatches) {
        throw new Error('Invalid diagram syntax: No relationships found');
      }

      DEBUG.log('Attempting to render idea tree:', { 
        original: diagramText,
        cleaned: cleanedText,
        nodes: nodeMatches.length,
        relationships: relationshipMatches.length
      });

      // Insert the diagram
      diagramRef.current.innerHTML = `
        <div class="mermaid-error-boundary">
          <div class="mermaid" id="${id}">${cleanedText}</div>
        </div>
      `;
      
      // Render the diagram
      await mermaid.init({
        startOnLoad: false,
        securityLevel: 'loose'
      }, `#${id}`);
      
      setError(null);
    } catch (err) {
      const error = err as Error;
      DEBUG.error('Failed to render idea tree:', error);
      setError(error.message || 'Failed to render diagram');
      
      // Re-throw for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Detailed error:', error);
      }
    }
  };

  const handleDiagramEdit = async () => {
    if (editorRef.current) {
      try {
        const newDiagram = editorRef.current.value;
        setEditableDiagram(newDiagram);
        await renderDiagram(newDiagram);
        
        // Cache successful edit
        diagramCache.set(relationships, newDiagram);
        
        setIsEditing(false);
      } catch (err) {
        const error = err as Error;
        setError(error.message || 'Failed to update diagram');
      }
    }
  };

  // Initialize editable diagram when relationships change
  useEffect(() => {
    if (relationships) {
      try {
        // Try to get cached diagram first
        const cached = diagramCache.get(relationships);
        if (cached) {
          setEditableDiagram(cached);
          renderDiagram(cached);
          return;
        }

        // If no cache, process the new diagram
        const cleanedText = cleanDiagramText(relationships);
        if (!cleanedText) {
          throw new Error('Empty diagram text received');
        }
        setEditableDiagram(cleanedText);
        renderDiagram(relationships);
        
        // Cache successful render
        diagramCache.set(relationships, cleanedText);
      } catch (err) {
        const error = err as Error;
        DEBUG.error('Error initializing diagram:', error);
        setError(error.message || 'Failed to initialize diagram');
      }
    }
  }, [relationships]);

  const handleRegenerate = async () => {
    try {
      if (onRegenerate) {
        await onRegenerate();
      } else {
        // Fallback to re-rendering current diagram if no regenerate handler provided
        await renderDiagram(relationships);
      }
    } catch (err) {
      const error = err as Error;
      DEBUG.error('Failed to regenerate diagram:', error);
      setError(error.message || 'Failed to regenerate diagram');
    }
  };

  if (!relationships) {
    return (
      <div className="animate-pulse h-40 bg-gray-200 rounded" />
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
                  <p className="font-medium">Error Rendering Idea Tree</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={handleRegenerate}
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
                      {relationships || 'No diagram text available'}
                    </pre>
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500">Cleaned Text:</p>
                  <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                    {cleanDiagramText(relationships) || 'No diagram text available'}
                  </pre>
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

        {isEditing && (
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
{`graph LR
  A[Main Concept] --> B[Related 1]
  A --> C[Related 2]
  A --> D[Related 3]`}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Idea Tree</h3>
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
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div 
            ref={diagramRef}
            className="mermaid-container overflow-x-auto"
            onClick={(e) => {
              if (onNodeClick && e.target instanceof Element) {
                const text = e.target.textContent?.trim();
                if (text) onNodeClick(text);
              }
            }}
          />
        </div>
      )}
    </div>
  );
} 