import React from 'react';

interface WikiFrameProps {
  url: string;
  onClose: () => void;
}

export const WikiFrame: React.FC<WikiFrameProps> = ({ url, onClose }) => {
  return (
    <div className="wiki-frame-modal">
      <div className="wiki-frame-header">
        <button onClick={onClose}>×</button>
      </div>
      <iframe 
        src={url}
        title="Wikipedia Article"
        width="100%"
        height="600px"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}; 