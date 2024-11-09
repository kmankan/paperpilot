import React from 'react';
import { WhereAreWe } from './WhereAreWe';
import { DictionaryDefinition } from './DictionaryDefinition';
import { PaperContextDefinition } from './PaperContextDefinition';
import { IdeaTree } from './IdeaTree';

interface PaperPilotModalProps {
  keyword: string;
  paperContext: string;
  onClose: () => void;
}

export const PaperPilotModal: React.FC<PaperPilotModalProps> = ({
  keyword,
  paperContext,
  onClose
}) => {
  return (
    <div className="paper-pilot-modal">
      <div className="modal-header">
        <h2>{keyword}</h2>
        <button onClick={onClose}>×</button>
      </div>
      
      <div className="modal-content">
        <div className="modal-section">
          <WhereAreWe keyword={keyword} paperContext={paperContext} />
        </div>
        
        <div className="modal-section">
          <DictionaryDefinition keyword={keyword} />
        </div>
        
        <div className="modal-section">
          <PaperContextDefinition keyword={keyword} paperContext={paperContext} />
        </div>
        
        <div className="modal-section">
          <IdeaTree keyword={keyword} paperContext={paperContext} />
        </div>
      </div>
    </div>
  );
}; 