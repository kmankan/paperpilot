'use client';

import { useEffect, useRef, useState } from 'react';
import {
  WhereAreWe,
  DictionaryDefinition,
  PaperContextDefinition,
  IdeaTree,
  WikiFrame
} from '@/app/components/modal';
import {
  getWhereAreWe,
  getDictionaryDefinition,
  getPaperContextDefinition,
  getIdeaTree
} from '@/app/services/generation';
import { DEBUG } from '@/app/debug/debug';
import type { Annotation } from '@/app/types/annotations';
import type { ModalContent } from '@/app/types/modal';

interface PaperPilotPanelProps {
  keyword: string;
  context: string;
}

export default function PaperPilotPanel({ keyword, context }: PaperPilotPanelProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWikiLink, setSelectedWikiLink] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'definition' | 'context' | 'tree' | 'whereAreWe'>('definition');
  const [loading, setLoading] = useState({
    definition: false,
    context: false,
    tree: false,
    whereAreWe: false
  });
  const [content, setContent] = useState<ModalContent>({
    whereAreWe: null,
    definition: null,
    context: null,
    ideaTree: null
  });

  const tabs = [
    { id: 'definition' as const, label: 'Definition' },
    { id: 'context' as const, label: 'Context' },
    { id: 'tree' as const, label: 'Idea Tree' },
    { id: 'whereAreWe' as const, label: 'Where Are We' }
  ];

  // Load content when keyword changes
  useEffect(() => {
    if (!keyword) return;
    setIsModalOpen(true);

    const loadContent = async () => {
      try {
        // Load WhereAreWe with wiki links
        setLoading(prev => ({ ...prev, whereAreWe: true }));
        const whereAreWeData = await getWhereAreWe(keyword, context).catch(error => {
          DEBUG.error('Failed to load WhereAreWe:', error);
          return null;
        });
        
        if (whereAreWeData) {
          setContent(prev => ({ ...prev, whereAreWe: whereAreWeData }));
        }
        setLoading(prev => ({ ...prev, whereAreWe: false }));

        // Load Definition
        setLoading(prev => ({ ...prev, definition: true }));
        const defData = await getDictionaryDefinition(keyword);
        setContent(prev => ({ 
          ...prev, 
          definition: defData.definition,
          sources: defData.sources 
        }));
        setLoading(prev => ({ ...prev, definition: false }));

        // Load Context
        setLoading(prev => ({ ...prev, context: true }));
        const contextData = await getPaperContextDefinition(keyword, context);
        setContent(prev => ({ 
          ...prev, 
          context: {
            significance: contextData.significance,
            paperContext: contextData.paperContext,
            relatedTerms: contextData.relatedTerms
          }
        }));
        setLoading(prev => ({ ...prev, context: false }));

        // Load Tree
        setLoading(prev => ({ ...prev, tree: true }));
        const treeData = await getIdeaTree(keyword, context);
        setContent(prev => ({ 
          ...prev, 
          ideaTree: {
            diagram: treeData.diagram,
            nodes: treeData.nodes
          }
        }));
        setLoading(prev => ({ ...prev, tree: false }));
      } catch (error) {
        DEBUG.error('Error loading content:', error);
        setContent(prev => ({
          ...prev,
          error: {
            whereAreWe: 'Failed to load domain context',
            definition: 'Failed to load definition',
            context: 'Failed to load context',
            tree: 'Failed to load idea tree'
          }
        }));
      }
    };

    loadContent();
  }, [keyword, context]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWikiLink(null);
    setActiveTab('definition');
  };

  if (!keyword) return null;

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{keyword}</h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 mb-4 border-b">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 ${
                    activeTab === tab.id 
                      ? 'border-b-2 border-blue-500 text-blue-500' 
                      : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                  {loading[tab.id] && '...'}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {activeTab === 'whereAreWe' && (
                <WhereAreWe 
                  keyword={keyword}
                  paperContext={context}
                />
              )}
              
              {activeTab === 'definition' && (
                <DictionaryDefinition 
                  definition={content.definition?.text || ''}
                  sources={content.sources || []}
                />
              )}
              
              {activeTab === 'context' && (
                <PaperContextDefinition 
                  context={content.context?.significance || ''}
                  relatedConcepts={content.context?.relatedTerms || []}
                />
              )}
              
              {activeTab === 'tree' && (
                <IdeaTree 
                  relationships={content.ideaTree?.diagram || ''}
                  onNodeClick={(concept) => console.log('Clicked concept:', concept)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {selectedWikiLink && (
        <WikiFrame
          url={selectedWikiLink}
          onClose={() => setSelectedWikiLink(null)}
        />
      )}
    </>
  );
} 